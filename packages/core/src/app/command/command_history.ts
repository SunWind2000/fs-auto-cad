import { AppLogger, isAsyncFunction } from "@fs/shared";
import { Command } from "./command";
import { Stack } from "./utils";
import { ILogRecord, LogLevel } from "./types";

export type ICmdLogFormatter = (name: string, args: unknown[]) => string;

export class CommandHistory {
    private _logList: ILogRecord[] = [];
    private _undoStack: Stack<Command>;
    private _redoStack: Stack<Command>;
    private _logFormatter: ICmdLogFormatter;

    constructor(historyLimit: number = 100, logFormatter?: ICmdLogFormatter) {
        this._undoStack = new Stack<Command>(historyLimit);
        this._redoStack = new Stack<Command>(historyLimit);
        this._logFormatter = logFormatter || ((name, args) => `Executed command: ${name} with args: ${JSON.stringify(args)}`);
    }

    /** 获取日志列表 */
    public get logList(): ILogRecord[] {
        return this._logList;
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
    public record(cmd: Command, level: LogLevel = LogLevel.INFO): void {
        this._undoStack.push(cmd);
        this._redoStack.clear();

        const log: ILogRecord = {
            level,
            message: this._logFormatter(cmd.name, cmd.args),
            timestamp: new Date().toLocaleString()
        };
        this._logList.push(log);
    }

    /**
     * 撤销一个命令
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
                level: LogLevel.INFO,
                message: `Undone command: ${cmd.name} with args: ${JSON.stringify(cmd.args)}`,
                timestamp: new Date().toLocaleString()
            });
        };

        if (isAsyncFunction(cmd.onUndo)) {
            (cmd.onUndo() as Promise<void>).then(() => {
                onExecuteUndoDone();
            });
        } else {
            cmd.onUndo();
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
                level: LogLevel.INFO,
                message: `Redone command: ${cmd.name} with args: ${JSON.stringify(cmd.args)}`,
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
                level: LogLevel.INFO,
                message: `Redone command: ${cmd.name} with args: ${JSON.stringify(cmd.args)}`,
                timestamp: new Date().toLocaleString()
            });
        }
    }

    /**
     * 写入日志
     * @param level 日志级别
     * @param message 日志消息
     */
    public writeLog(level: LogLevel, message: string): void {
        const log: ILogRecord = {
            level,
            message,
            timestamp: new Date().toLocaleString()
        };
        this._logList.push(log);
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
