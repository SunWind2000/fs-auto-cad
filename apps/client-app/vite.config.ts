import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [dts()],
    build: {
        outDir: "lib",
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["@fs/core"],
        },
    },
    resolve: {
        alias: {
            "@client-app": fileURLToPath(new URL("./src", import.meta.url)),
        },
    }
});
