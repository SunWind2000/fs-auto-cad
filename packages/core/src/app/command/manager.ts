import { isFunction, isAsyncFunction, AppLogger, Signal } from "@fs/shared";
import { Command, ICommandCtor } from "./command";
import { TransactionManager } from "./transaction_manager";
import { LogTypeEnum, LogLevelEnum } from "./types";

/**
 * @description 命令管理器，用于管理命令的注册、执行和撤销重做。
 * 
 * 单例模式，通过 `CommandManager.getInstance()` 获取实例
 */
export class CommandManager {
    private static _instance: CommandManager | null = null;
    public static getInstance(): CommandManager {
        if (!this._instance) {
            this._instance = new CommandManager();
        }

        return this._instance;
    }

    private _commands: Map<string, ICommandCtor> = new Map();
    private _current: Command | null = null;

    private _history: TransactionManager = new TransactionManager({ stackLimit: 50 });

    /** 命令开始事件 */
    public signalCmdStarted: Signal<Command> = new Signal();
    /** 命令结束事件 */
    public signalCmdTerminated: Signal<Command> = new Signal();

    constructor() {
        this.signalCmdStarted.on((cmd: Command) => {
            AppLogger.log(`CommandManager`, `Execute command: ${cmd.name}.`);
        });
        this.signalCmdTerminated.on((cmd: Command) => {
            AppLogger.log(`CommandManager`, `Complete command: ${cmd.name}.`);
        });
    }

    /**
     * 当前正在执行中的命令
     */
    public get current(): Command | null {
        return this._current;
    }

    /**
     * 命令事务管理器
     */
    public get history(): TransactionManager {
        return this._history;
    }

    /**
     * 注册一个命令
     * @param name 命令名称
     * @param command 命令构造函数
     */
    public register(name: string, command: ICommandCtor): void {
        if (this._commands.has(name)) {
            AppLogger.error(`CommandManager`, `Command ${name} is already registered.`);
        }

        this._commands.set(name, command);
    }

    /**
     * 检查是否注册了一个命令
     * @param name 命令名称
     */
    public hasRegistered(name: string): boolean {
        return this._commands.has(name);
    }

    /**
     * 执行一个命令
     * @param name 命令名称
     * @param args 命令参数
     * @returns 命令构造函数
     */
    public execute(name: string, ...args: unknown[]): void {
        const commandCtor = this._commands.get(name);

        if (!commandCtor) {
            AppLogger.error("CommandManager", `Command ${name} not found.`);

            return;
        }

        const cmd = new commandCtor(this, name);

        // 设置当前命令
        this._current = cmd;

        this.signalCmdStarted.dispatch(this._current);

        if (isAsyncFunction(cmd.onExecute)) {
            (cmd.onExecute(...args) as Promise<void>).then(() => {
                this._postProcess(cmd);
            });
        } else {
            cmd.onExecute(...args);

            this._postProcess(cmd);
        }
    }

    /**
     * 执行一个异步命令
     * @param name 命令名称
     * @param args 命令参数
     */
    public async executeAsync(name: string, ...args: unknown[]): Promise<void> {

        let resolver: ((value: void | PromiseLike<void>)=> void);
        this.signalCmdTerminated.once((cmd: Command) => {
            if (cmd.name !== name) {
                return false;
            }

            resolver?.();

            return true;
        });
        this.execute(name, ...args);

        return new Promise(resolve => {
            resolver = resolve;
        });
    }

    /**
     * 向命令中发送消息
     */
    public receive(type: string, data: any): boolean {
        if (!this._current) {
            AppLogger.error(`CommandManager`, `No command is currently running.`);

            return false;
        }

        return this._current.onReceive(type, data);
    }

    /**
     * 结束一个命令
     * @param cmd 
     * @param actionType 
     */
    public terminate(cmd: Command, actionType: "commit" | "cancel") {
        if (this._current?.name !== cmd.name) {
            AppLogger.error(`CommandManager`, `Command ${cmd.name} is not the current command.`);
        }

        if (actionType === "commit") {
            if (isFunction(cmd.onComplete)) {
                cmd.onComplete.call(cmd);
            }
        } else if (actionType === "cancel") {
            if (isFunction(cmd.onCancel)) {
                cmd.onCancel.call(cmd);
            }
        }

        this.signalCmdTerminated.dispatch(cmd);
        this._current = null;

        if (isFunction(cmd.onCleanup)) {
            cmd.onCleanup.call(cmd);
        }
    }

    /**
     * 写入日志
     * @param level 日志级别
     * @param message 日志消息
     */
    public writeLog(level: LogTypeEnum, message: string, scope = "GLOBAL"): void {
        this._history.writeLog(level, message, scope);
    }

    /**
     * 设置日志等级
     */
    public setLogLevel(level: LogLevelEnum): void {
        this._history.setLogLevel(level);
    }

    /**
     * 销毁方法
     */
    public dispose(): void {
        this._commands.clear();
        this._history.clear();
        this._current = null;
        this.signalCmdStarted.clear();
        this.signalCmdTerminated.clear();
        AppLogger.log(`CommandManager`, `All commands have been cleaned up.`);
    }

    /**
     * 命令执行结束后的后处理方法
     */
    private _postProcess(cmd: Command): void {
        if (cmd.autoComplete) {
            cmd.commit();
        }

        // 记录命令到历史
        this._history.record(cmd);
    }
}
