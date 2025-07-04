/**
 * @description Checks if the given value is a string.
 * @param value The value to check.
 * @returns True if the value is a string, false otherwise.
 */
export const isString = (value: unknown): value is string => {
    return typeof value === "string" || value instanceof String;
};

/**
 * @description Checks if the given value is a number.
 * @param value The value to check.
 * @returns True if the value is a number, false otherwise.
 */
export const isNumber = (value: unknown): value is number => {
    return typeof value === "number" || value instanceof Number;
};

/**
 * @description Checks if the given value is a boolean.
 * @param value The value to check.
 * @returns True if the value is a boolean, false otherwise.
 */
export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === "boolean" || value instanceof Boolean;
};

/**
 * @description Checks if the given value is undefined.
 * @param value The value to check.
 * @returns True if the value is an undefined, false otherwise.
 */
export const isUndefined = (value: unknown): value is undefined => {
    return typeof value === "undefined" || value === void 0;
};

/**
 * @description Checks if the given value is object.
 * @param value The value to check.
 * @returns True if the value is object, false otherwise.
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * @description Checks if the given value is an array.
 * @param value The value to check.
 * @returns True if the value is an array, false otherwise.
 */
export const isArray = <T = unknown>(value: unknown): value is T[] => {
    return Array.isArray(value);
};

/**
 * @description Checks if the given value is a function.
 * @param value The value to check.
 * @returns True if the value is a function, false otherwise.
 */
export const isFunction = (value: unknown): value is ((...args: unknown[]) => unknown) => {
    return typeof value === "function" || value instanceof Function;
};

/**
 * @description Checks if the given value is a async function.
 * @param value The value to check.
 * @returns True if the value is a symbol, false otherwise.
 */
export const isAsyncFunction = (value: unknown): value is (...args: unknown[]) => Promise<unknown> => {
    return Object.prototype.toString.call(value) === "[object AsyncFunction]";
};

/**
 * @description Checks if the given value is empty.
 * @param value The value to check.
 * @returns True if the value is empty, false otherwise.
 */
export const isEmpty = (value: unknown): boolean => {
    if (isUndefined(value) || value === null) {
        return true;
    }

    if (isString(value) || isArray(value)) {
        return value.length === 0;
    }

    if (isObject(value)) {
        return Object.keys(value).length === 0;
    }

    return false; // For other types, we consider them non-empty
};

