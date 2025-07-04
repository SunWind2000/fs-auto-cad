export type IFunction = (...args: unknown[]) => unknown;
export type IAsyncFunction = (...args: unknown[]) => Promise<unknown>;
export type IFunctionWithContext<T = unknown> = (this: T, ...args: unknown[]) => unknown;
export type IAsyncFunctionWithContext<T = unknown> = (this: T, ...args: unknown[]) => Promise<unknown>;
export type IConstructorFunction<T = unknown> = new (...args: any[]) => T;
