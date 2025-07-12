import { ICommandCtor } from "./command";
import { CommandManager } from "./manager";

/**
 * 装饰器方法，注册一个命令
 */
export function registerCmd(name: string) {
    return function (target: ICommandCtor) {
        CommandManager.getInstance().register(name, target);
    };
}

/**
 * 定义一个栈的数据结构
 */
export class Stack<T> {
    private items: T[] = [];
    private _maxSize: number;

    constructor(maxSize: number = Infinity) {
        this.items = [];
        this._maxSize = maxSize;
    }

    public get length(): number {
        return this.items.length;
    }

    public get maxSize(): number {
        return this._maxSize;
    }

    public get isEmpty(): boolean {
        return this.items.length === 0;
    }

    public push(item: T): void {
        if (this.items.length >= this._maxSize) {
            this.items.shift(); // 移除最旧的元素
        }

        this.items.push(item);
    }

    public pop(): T | undefined {
        return this.items.pop();
    }

    public peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    public clear(): void {
        this.items = [];
    }
}
