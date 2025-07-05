// 实现一个测试用例来验证 单例装饰器 的功能
import { describe, it, expect } from "vitest";
import { Singleton } from "..";

describe("Singleton", () => {
    it("should return the same instance", () => {
        @Singleton
        class TestClass {
            public value: number;

            constructor(value: number) {
                this.value = value;
            }
        }
        const instance1 = new TestClass(41);
        const instance2 = new TestClass(42);  
        expect(instance1).toBe(instance2);
        expect(instance1.value).toBe(41); // The value should be from the first instance
        expect(instance2.value).toBe(41); // The value should be from the first instance
    });

    it("should handle multiple classes", () => {
        @Singleton
        class FirstClass {
            public value: string;
        }

        @Singleton
        class SecondClass {
            public value: number;
        }

        const firstInstance1 = new FirstClass();
        const firstInstance2 = new FirstClass();
        const secondInstance1 = new SecondClass();
        const secondInstance2 = new SecondClass();

        expect(firstInstance1).toBe(firstInstance2);
        expect(secondInstance1).toBe(secondInstance2);
        expect(firstInstance1).not.toBe(secondInstance1);
    });

    // 继承类与基类
    it("should handle inheritance class", () => {
        @Singleton
        class BaseClass {
            public baseValue: string;
        }

        class DerivedClass extends BaseClass {
            public derivedValue: number;

            constructor(baseValue: string, derivedValue: number) {
                super();
                this.baseValue = baseValue;
                this.derivedValue = derivedValue;
            }
        }

        const baseInstance1 = new BaseClass();
        const derivedInstance1 = new DerivedClass("base", 100);
        const derivedInstance2 = new DerivedClass("base", 200); // Should not create a new instance
        expect(derivedInstance1).toBe(derivedInstance2);
        expect(derivedInstance1).toBe(baseInstance1); // Derived class should be the same as base class
    });

    // 直接调用
    it("should allow direct calls", () => {
        class TestClass {
            public value: number;

            constructor(value: number) {
                this.value = value;
            }
        }

        const SingletonTestClass = Singleton(TestClass);
        const instance1 = new SingletonTestClass(10);
        const instance2 = new SingletonTestClass(20); // Should not create a new instance
        expect(instance1).toBe(instance2);
    });
});
