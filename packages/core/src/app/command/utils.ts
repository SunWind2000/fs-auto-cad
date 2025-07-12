import { CommandManager } from "./manager";

/**
 * 装饰器方法，注册一个命令
 */
export function registerCmd(name: string) {
    return function (target: any) {
        const commandCtor = target.constructor;
        CommandManager.getInstance().register(name, commandCtor);
    };
}

/**
 * 定义一个栈的数据结构
 */
export class Stack<T> {
    private items: T[] = [];

    public get length(): number {
        return this.items.length;
    }

    public push(item: T): void {
        this.items.push(item);
    }

    public pop(): T | undefined {
        return this.items.pop();
    }

    public peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    public isEmpty(): boolean {
        return this.items.length === 0;
    }

    public clear(): void {
        this.items = [];
    }
}
