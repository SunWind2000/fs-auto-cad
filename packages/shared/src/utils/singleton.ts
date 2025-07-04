import { IConstructorFunction } from "../types";
/**
 * 单例装饰器
 * 使用示例：
 * ```typescript
 * import { Singleton } from '@fs/shared';
 * @Singleton
 * class MySingleton {
 * }
 * ```
 */
export function Singleton<T extends IConstructorFunction>(constructor: T): ISingletonConstructor<T> {
    const instanceKey = Symbol("instance");
    
    return new Proxy(constructor, {
        construct(target, args) {
            const st = target as unknown as ISingletonConstructor;

            if (!st[instanceKey]) {
                st[instanceKey] = Reflect.construct(target, args);
            }

            return st[instanceKey] as T;
        }
    }) as unknown as ISingletonConstructor<T>;
}

type ISingletonConstructor<T = unknown> = T & {
    new (...args: unknown[]): T;
    [key: symbol]: T | undefined; // 用于存储单例实例的私有属性
}
