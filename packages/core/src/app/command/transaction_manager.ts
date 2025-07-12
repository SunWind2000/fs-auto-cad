import { AppLogger, isAsyncFunction } from "@fs/shared";
import { Command } from "./command";
import { Stack } from "./utils";
import { ILogRecord, LogLevelEnum, LogTypeEnum } from "./types";

export type ICmdLogFormatter = (name: string, args: unknown[]) => string;

export type ITransactionManagerOptions = {
    /** 撤销重做栈的最大次数限制 */
    stackLimit?: number;
    /** 
     * 命令执行日志格式化函数
     * @param name 命令名称
     * @param args 命令参数
     * @return 格式化后的日志消息
     */
    logFormatter?: ICmdLogFormatter;
    /**
     * 撤销命令日志格式化函数
     * @param name 命令名称
     * @param args 命令参数
     * @return 格式化后的日志消息
     */
    undoLogFormatter?: ICmdLogFormatter;
    /**
     * 重做命令日志格式化函数
     * @param name 命令名称
     * @param args 命令参数
     * @return 格式化后的日志消息
     */
    redoLogFormatter?: ICmdLogFormatter;
}

/**
 * 事务管理器，用于管理命令的撤销和重做,并记录命令执行日志
 */
export class TransactionManager {
    private _logList: ILogRecord[] = [];
    private _logLevel: LogLevelEnum = LogLevelEnum.NORMAL;
    private _logFormatter: ICmdLogFormatter;
    private _undoLogFormatter: ICmdLogFormatter;
    private _redoLogFormatter: ICmdLogFormatter;

    private _undoStack: Stack<Command>;
    private _redoStack: Stack<Command>;
    
    constructor(options: ITransactionManagerOptions) {
        this._undoStack = new Stack<Command>(options.stackLimit ?? 100);
        this._redoStack = new Stack<Command>(options.stackLimit ?? 100);
        this._logFormatter = options.logFormatter || ((name, args) => `Executed command: <${name}> with args: ${JSON.stringify(args)}`);
        this._undoLogFormatter = options.undoLogFormatter || ((name, args) => `Undone command: <${name}> with args: ${JSON.stringify(args)}`);
        this._redoLogFormatter = options.redoLogFormatter || ((name, args) => `Redone command: <${name}> with args: ${JSON.stringify(args)}`);
    }

    /** 获取日志列表 */
    public get logList(): ILogRecord[] {
        return this._logList.filter(log => {
            return log.type & this._logLevel;
        });
    }

    /** 是否可以撤销 */
    public get canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    /** 是否可以重做 */
    public get canRedo(): boolean {
        return this._redoStack.length > 0;
    }

    /**
     * 记录一个命令执行日志
     * @param cmd 执行的命令
     * @param level 日志级别
     */
    public record(cmd: Command, type: LogTypeEnum = LogTypeEnum.INFO): void {
        this._undoStack.push(cmd);
        this._redoStack.clear();

        const log: ILogRecord = {
            type,
            message: this._logFormatter(cmd.name, cmd.args),
            scope: cmd.name,
            timestamp: new Date().toLocaleString()
        };
        this._logList.push(log);
    }

    /**
     * 撤销上一个命令
     */
    public undo() {
        if (!this.canUndo) {
            AppLogger.warn("CommandHistory", "No commands to undo.");

            return;
        }

        const cmd = this._undoStack.pop() as Command;

        const onExecuteUndoDone = () => {
            // 将命令推入重做栈
            this._redoStack.push(cmd);
            this._logList.push({
                type: LogTypeEnum.INFO,
                message: this._undoLogFormatter(cmd.name, cmd.args),
                scope: cmd.name,
                timestamp: new Date().toLocaleString()
            });
        };

        if (isAsyncFunction(cmd.onInverse)) {
            (cmd.onInverse() as Promise<void>).then(() => {
                onExecuteUndoDone();
            });
        } else {
            cmd.onInverse();
            onExecuteUndoDone();
        }
    }

    /**
     * 重做一个命令
     */
    public redo() {
        if (!this.canRedo) {
            AppLogger.warn("CommandHistory", "No commands to redo.");

            return;
        }

        const cmd = this._redoStack.pop() as Command;

        const onExecuteRedoDone = () => {
            // 将命令推入撤销栈
            this._undoStack.push(cmd);
            this._logList.push({
                type: LogTypeEnum.INFO,
                message: this._redoLogFormatter(cmd.name, cmd.args),
                scope: cmd.name,
                timestamp: new Date().toLocaleString()
            });
        };

        if (isAsyncFunction(cmd.onExecute)) {
            (cmd.onExecute(...cmd.args) as Promise<void>).then(() => {
                onExecuteRedoDone();
            });
        } else {
            cmd.onExecute(...cmd.args);
            onExecuteRedoDone();
        }
    }

    /**
     * 写入日志
     * @param level 日志级别
     * @param message 日志消息
     */
    public writeLog(type: LogTypeEnum, message: string, scope: string): void {
        const log: ILogRecord = {
            type,
            message,
            timestamp: new Date().toLocaleString(),
            scope
        };
        this._logList.push(log);
    }

    /**
     * 设置日志筛选级别
     */
    public setLogLevel(level: LogLevelEnum): void {
        this._logLevel = level;
    }

    /**
     * 清空历史记录
     */
    public clear() {
        this._undoStack.clear();
        this._redoStack.clear();
        this._logList = [];
        AppLogger.log("CommandHistory", "Command history cleared.");
    }
}
