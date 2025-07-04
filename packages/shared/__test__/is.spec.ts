// 实现一个测试用例来验证 is.ts文件中各个函数的功能
import { describe, it, expect } from "vitest";
import { isFunction, isString, isNumber, isBoolean, isObject, isArray, isEmpty, isUndefined, isAsyncFunction } from "..";

describe("is", () => {
    it("should correctly identify functions", () => {
        const func = () => {};
        expect(isFunction(func)).toBe(true);
        expect(isFunction("not a function")).toBe(false);
    });

    it("should correctly identify strings", () => {
        expect(isString("hello")).toBe(true);
        expect(isString(123)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(null)).toBe(false);
    });

    it("should correctly identify numbers", () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber("123")).toBe(false);
        expect(isNumber(NaN)).toBe(true); // NaN is a number
        expect(isNumber(Infinity)).toBe(true); // Infinity is a number
    });

    it("should correctly identify booleans", () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean("true")).toBe(false);
        expect(isBoolean(1)).toBe(false);
        expect(isBoolean(null)).toBe(false);
        expect(isBoolean(undefined)).toBe(false);
        expect(isBoolean({})).toBe(false);
    });

    it("should correctly identify objects", () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject("string")).toBe(false);
        expect(isObject(undefined)).toBe(false);
    });

    it("should correctly identify arrays", () => {
        expect(isArray([])).toBe(true);
        expect(isArray({})).toBe(false);
    });

    it("should correctly identify empty values", () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty({})).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty("")).toBe(true);
        expect(isEmpty("not empty")).toBe(false);
    });

    it("should correctly identify undefined values", () => {
        let undef;
        expect(isUndefined(undef)).toBe(true);
        expect(isUndefined(null)).toBe(false);
    });

    it("should correctly identify async functions", () => {
        const asyncFunc = async () => {};
        const syncFunc = () => {};
        expect(isAsyncFunction(asyncFunc)).toBe(true);
        expect(isAsyncFunction(syncFunc)).toBe(false);
    });
});
