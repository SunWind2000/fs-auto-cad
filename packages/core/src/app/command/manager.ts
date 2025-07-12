import { isFunction, isAsyncFunction, AppLogger, Signal } from "@fs/shared";
import { Command, ICommandCtor } from "./command";
import { Stack } from "./utils";

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
    /** 撤销栈 */
    private _undoStack: Stack<Command> = new Stack();
    /** 重做栈 */
    private _redoStack: Stack<Command> = new Stack();

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
     * 是否可以撤销
     */
    public get canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    /**
     * 是否可以重做
     */
    public get canRedo(): boolean {
        return this._redoStack.length > 0;
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

        const cmd = new commandCtor();

        // 新增命令到撤销栈
        this._undoStack.push(cmd);
        // 清空重做栈
        this._redoStack.clear();
        // 设置当前命令
        this._current = cmd;

        this.signalCmdStarted.dispatch(this._current);

        if (isAsyncFunction(this._current.onExecute)) {
            (this._current.onExecute(...args) as Promise<void>).then(() => {
                if (this._current?.autoComplete) {
                    this._current.commit();
                }
            });
        } else {
            this._current.onExecute(...args);

            if (this._current?.autoComplete) {
                this._current.commit();
            }
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
        if (this._current !== cmd) {
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
     * 撤销上一个命令
     */
    public undo(): void {
        const cmd = this._undoStack.pop();

        if (!cmd) {
            AppLogger.warn(`CommandManager`, `No command to undo.`);

            return;
        }

        cmd.onUndo?.();
        this._redoStack.push(cmd); // 将撤销的命令放入重做栈
    }

    /**
     * 重做上一个撤销的命令
     */
    public redo(): void {
        const cmd = this._redoStack.pop();

        if (!cmd) {
            AppLogger.warn(`CommandManager`, `No command to redo.`);

            return;
        }

        this.execute(cmd.name, ...cmd.args); // 重新执行命令
        this._undoStack.push(cmd); // 将重做的命令放入撤销栈
    }

    /**
     * 销毁方法
     */
    public dispose(): void {
        this._commands.clear();
        this._current = null;
        this.signalCmdStarted.clear();
        this.signalCmdTerminated.clear();
        this._undoStack.clear();
        this._redoStack.clear();
        AppLogger.log(`CommandManager`, `All commands have been cleaned up.`);
    }
}
