import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// "@/..." as in tsconfig, so tests can import modules the app imports that way.
export default defineConfig({ resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } } });
