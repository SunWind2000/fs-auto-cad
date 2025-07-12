import { IConstructorFunction, AppLogger } from "@fs/shared";
import { ICommand } from "./types";
import { CommandManager } from "./manager";

export abstract class Command implements ICommand {

    protected _mgr: CommandManager | null = null;
    private _name: string;
    private _args: unknown[] = [];

    constructor(mgr: CommandManager, name: string) {
        this._mgr = mgr;
        this._name = name;

        // 拦截onExecute方法调用，在执行时将执行参数保存在args中
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (prop === "onExecute") {
                    return (...args: unknown[]) => {
                        this._args = args;

                        return target.onExecute(...args);
                    };
                }

                return Reflect.get(target, prop, receiver);
            }
        });
    }

    public get name(): string {
        return this._name;
    }

    public get args(): unknown[] {
        return this._args;
    }

    public get autoComplete(): boolean {
        return true; // 默认是自动结束命令
    }

    public abstract onExecute(...args: unknown[]): void | Promise<void>;

    public onReceive(type: string, data: any): boolean {
        AppLogger.log(this.name, `Received message of type ${type} with data: ${JSON.stringify(data)}`);

        return false;
    }

    public onCleanup() {
        AppLogger.log(this.name, `Command is being cleaned up.`);
    };

    public onComplete() {
        AppLogger.log(this.name, `Command completed.`);
    }

    public onCancel() {
        AppLogger.log(this.name, `Command cancelled.`);
    };

    public onUndo(): void | Promise<void> {
        AppLogger.log(this.name, `Command undoing.`);
    }

    public commit() {
        if (!this._mgr) {
            AppLogger.error(`Command ${this.name}`, `Command is created not properly.`);
        }

        this._mgr!.terminate(this, "commit");
        this._mgr = null;
    }

    public cancel() {
        if (!this._mgr) {
            AppLogger.error(`Command ${this.name}`, `Command is created not properly.`);
        }

        this._mgr!.terminate(this, "cancel");
        this._mgr = null;
    }
}

export type ICommandCtor = IConstructorFunction<Command>;
