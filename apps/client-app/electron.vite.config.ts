import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const alias = {
    "@client-app": fileURLToPath(new URL("./src", import.meta.url)),
    "@client-app-resources": fileURLToPath(new URL("./resources", import.meta.url))
};

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        resolve: {
            alias
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        resolve: {
            alias
        }
    },
    renderer: {
        plugins: [
            tailwindcss()
        ],
        resolve: {
            alias
        }
    }
});
