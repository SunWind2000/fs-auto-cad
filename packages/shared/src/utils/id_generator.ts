import { AppLogger, Singleton } from ".";

/**
 * class IdGenerator
 * Generates unique IDs based on a prefix and a counter.
 * * @example
 * ```typescript
 * import { IdGenerator } from '@fs/shared';
 * const generator = IdGenerator.getInstance();
 * // Generate a unique ID with a prefix
 * const id = generator.generate('user');
 * // Generate a unique ID without a prefix
 * const idWithoutPrefix = generator.generate();
 * console.log(id); // e.g., 13245
 * ```
 */
@Singleton
export class IdGenerator {
    private static _instance: IdGenerator;
    // 维护一个全局对象，用于存储生成的id，检查去重
    private _ids: Set<number> = new Set();

    public static getInstance(): IdGenerator {
        if (!this._instance) {
            this._instance = new IdGenerator();
        }

        return this._instance;
    }

    /**
     * 生成一个全局唯一id，并返回。
     * 如果传入了seed，则使用seed作为随机数种子。
     * 如果没有传入seed，则使用当前时间戳作为随机数种子。
     * @param seed 
     */
    public generate(seed?: number): number {
        if (seed === void 0) {
            seed = Date.now();
        }

        // 使用种子生成一个随机数
        let random = Math.floor(Math.random() * 1000000);
        // 确保生成的id是唯一的
        while (this._ids.has(seed + random)) {
            // 如果生成的id已经存在，则重新生成
            random = Math.floor(Math.random() * 1000000);
        }
        // 将生成的id添加到全局对象中
        this._ids.add(seed + random);

        // 返回生成的id
        return seed + random;
    }

    /**
     * 释放一个id，使其可以被重新使用。
     * 如果传入的id不存在，则不做任何操作。
     * @param id 
     */
    public release(id: number): void {
        if (this._ids.has(id)) {
            this._ids.delete(id);
        } else {
            AppLogger.warn("IdGenerator", `Attempted to release an ID that does not exist: ${id}`);
        }
    }

    /**
     * 检查一个id是否已经被使用。
     * 如果已经被使用，则返回true，并输出警告信息。
     * @param id 
     * @returns 
     */
    public check(id: number): boolean {
        const hasUsed = this._ids.has(id);

        if (hasUsed) {
            AppLogger.warn("IdGenerator", `ID ${id} has already been used.`);
        }

        return hasUsed;
    }
}
