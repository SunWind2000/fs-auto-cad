import { describe, it, expect } from "vitest";
import { FSApp } from "../src";

describe("Stack Tests", () => {
    it("should create a stack with default size", () => {
        const stack = new FSApp.Command.Stack<number>();
        expect(stack.length).toBe(0);
        expect(stack.maxSize).toBe(Infinity);
    });

    it("should push and pop items correctly", () => {
        const stack = new FSApp.Command.Stack<number>(3);
        stack.push(1);
        stack.push(2);
        expect(stack.length).toBe(2);
        expect(stack.pop()).toBe(2);
        expect(stack.length).toBe(1);
    });

    it("should respect max size", () => {
        const stack = new FSApp.Command.Stack<number>(2);
        stack.push(1);
        stack.push(2);
        stack.push(3); // This should remove 1
        expect(stack.length).toBe(2);
        expect(stack.pop()).toBe(3);
    });

    it("should clear the stack", () => {
        const stack = new FSApp.Command.Stack<number>(5);
        stack.push(1);
        stack.clear();
        expect(stack.isEmpty).toBe(true);
    });
});
