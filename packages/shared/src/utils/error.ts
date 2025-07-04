import { isFunction } from ".";
import { IFunction } from "../types";

/**
 * Error class for defining custom errors in the application.
 * This class extends the built-in Error class and allows for additional properties
 */
class AppError extends Error {

    /**
     * Creates an instance of AppError.
     * @param message The error message.
     * @param code The error code.
     * @param status The HTTP status code.
     */
    constructor(module: string, message: string) {
        super(`[${module}] ${message}`);
        this.name = "FsError"; // Set the name of the error

        // Set the prototype explicitly to maintain the correct prototype chain
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class AppLogger {

    public static config = {
        /**
         * @description 是否开启静默模式
         */
        silent: false,
        /**
         * @description 是否屏蔽报错
         */
        silentError: false
    };

    public static log(module: string, message: string): void {
        if (this.config.silent) {
            return; // 如果是静默模式，则不输出日志信息
        }

        console.log(`[${module}] ${message}`);
    }

    public static warn(module: string, message: string): void {
        if (this.config.silent) {
            return; // 如果是静默模式，则不输出警告信息
        }

        console.warn(`[${module}] ${message}`);
    }

    public static error(module: string, message: string): void {
        if (this.config.silentError) {
            return; // 如果是静默错误模式，则不抛出错误
        }
   
        throw new AppError(module, message);
    }
}

/**
 * 方法装饰器，用于捕获方法中的异常并抛出应用程序错误
 */
export function ErrorLogger(module: string) {
    return function (_: unknown, __: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error: unknown) {
                if (error instanceof AppError) {
                    AppLogger.error(module, error.message);
                } else {
                    AppLogger.error(module, "An unexpected error occurred");
                }
            }
        };

        return descriptor;
    };
}

/**
 * 类装饰器，用于捕获类中各个方法的异常并抛出应用程序错误
 */
export function ClassErrorLogger(module: string) {
    return function (constructor: IFunction) {
        const prototype = constructor.prototype;

        // 获取类的所有方法
        const methods = Object.getOwnPropertyNames(prototype).filter(
            (prop) => isFunction(prototype[prop]) && prop !== "constructor"
        );

        // 为每个方法添加错误捕获逻辑
        for (const method of methods) {
            const originalMethod = prototype[method];

            prototype[method] = async function (...args: unknown[]) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error: unknown) {
                    if (error instanceof AppError) {
                        AppLogger.error(module, error.message);
                    } else {
                        AppLogger.error(module, "An unexpected error occurred");
                    }
                }
            };
        }

        return constructor;
    };
}
