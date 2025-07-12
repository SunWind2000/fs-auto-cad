import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [dts(), tailwindcss()],
    build: {
        outDir: "lib",
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "index",
        }
    }
});
