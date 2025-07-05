// 实现一个测试用例来验证 Signal类 的功能
import { describe, it, expect } from "vitest";
import { Signal, SignalListener } from "..";

describe("Signal", () => {
    it("should create a signal instance", () => {
        const signal = new Signal();
        expect(signal).toBeInstanceOf(Signal);
    });

    it("should allow multiple listeners", () => {
        const signal = new Signal<number>();
        let data1 = 0;
        let data2 = 0;
        const listener1 = (value: number) => {
            data1 = value;
        };
        const listener2 = (value: number) => {
            data2 = value;
        };

        signal.on(listener1);
        signal.on(listener2);

        signal.dispatch(2);
        expect(data1).toBe(2);
        expect(data2).toBe(2);
    });

    it("should unsubscribe listeners", () => {
        const signal = new Signal();
        const listener = () => {};
        
        const handler = signal.on(listener);
        expect(signal.listeners.length).toBe(1);
        handler.off();
        expect(signal.listeners.length).toBe(0);
    });

    it("should clear all listeners", () => {
        const signal = new Signal();
        const listener1 = () => {};
        const listener2 = () => {};
        
        signal.on(listener1);
        signal.on(listener2);
        expect(signal.listeners.length).toBe(2);

        signal.clear();
        expect(signal.listeners.length).toBe(0);
    });

    it("should allow one-time listeners", () => {
        const signal = new Signal<number>();
        let dataOrg = 0;
        const listener = (data: number) => {
            dataOrg = data;
        };

        signal.once(listener);
        signal.dispatch(2);
        expect(dataOrg).toBe(2);
        expect(signal.listeners.length).toBe(0);

        // The listener should not be called again
        signal.dispatch(3);
        expect(dataOrg).toBe(2);
        expect(signal.listeners.length).toBe(0);
    });

    it("should off listener with context", async () => {
        class TestContext {
            public value = 0;
            public signal = new Signal<number>();
            public handler: SignalListener<number>;

            constructor() {
                this.handler = this.signal.on(this.updateValue, this);
            }

            public updateValue(data: number): void {
                this.value = data;
            }

            public dispose() {
                this.handler.off();
            }
        }

        const context = new TestContext();
        context.signal.dispatch(21);
        expect(context.value).toBe(21);
        context.dispose();
        expect(context.signal.listeners.length).toBe(0);
    });
});
