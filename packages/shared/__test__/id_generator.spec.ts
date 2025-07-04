// 实现一个测试用例来验证 ID 生成器的功能
import { describe, it, expect } from "vitest";
import { IdGenerator } from "..";

describe("IdGenerator", () => {
    it("should generate unique IDs", () => {
        const generator = IdGenerator.getInstance();
        const id1 = generator.generate();
        const id2 = generator.generate();

        expect(id1).not.toBe(id2);
    });

    it("should generate IDs based on seed", () => {
        const generator = IdGenerator.getInstance();
        const seed = 12345;
        const id1 = generator.generate(seed);
        const id2 = generator.generate(seed);

        expect(id1).toBeGreaterThan(seed);
        expect(id2).toBeGreaterThan(seed);
        expect(id1).not.toBe(id2); // IDs should be unique even with the same seed
    });

    it("should release and reuse IDs", () => {
        const generator = IdGenerator.getInstance();
        const id = generator.generate();
        expect(generator.check(id)).toBe(true); // Check if the ID exists
        generator.release(id);
        expect(generator.check(id)).toBe(false); // Should be able to reuse the released ID
    });
});
