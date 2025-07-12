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
 * 日志类型
 */
export enum LogTypeEnum {
  DEBUG = 0b00001000,
  INFO = 0b00000100,
  WARN = 0b00000010,
  ERROR = 0b00000001
}

/**
 * 日志等级
 */
export enum LogLevelEnum {
  /** 简略，仅包含错误信息 */
  SIMPLE = 0b00000001,
  /** 正常，包含错误和警告信息 */
  NORMAL = 0b00000011,
  /** 详细，包含除调试信息外的全部信息 */
  DETAILED = 0b00000111,
  /** 完整，包含全部信息 */
  DEBUG = 0b00001111
}

/**
 * 日志记录
 */
export type ILogRecord = {
  /** 日志类型 */
  type: LogTypeEnum;
  /** 日志消息 */
  message: string;
  /** 时间戳 */
  timestamp: string;
}
