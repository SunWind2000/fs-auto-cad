/**
 * 命令的基础定义
 */
export interface ICommand {
  /** 命令名称 */
  name: string;
  /** 生命周期方法：命令运行时 */
  onExecute: () => void;
  /** 生命周期方法：收到消息时 */
  onReceive?: (type: string, data: any) => boolean;
  /** 生命周期方法：命令清理时 */
  onCleanup?: () => void;
  /** 生命周期方法：命令完成时 */
  onComplete?: () => void;
  /** 生命周期方法：命令取消时 */
  onCancel?: () => void;
  /** 撤销本次命令 */
  onUndo: () => void;
  /** 结束一个命令 */
  commit: (data: any) => void;
  /** 取消一个命令 */
  cancel: () => void;
}

/**
 * 日志等级
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL"
}

/**
 * 日志记录
 */
export type ILogRecord = {
  /** 日志等级 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 时间戳 */
  timestamp: string;
}
