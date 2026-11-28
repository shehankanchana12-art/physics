import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Extra dev-server hostnames are supplied per process through the environment,
// so no preview hostname needs to be committed to the repository.
const extraHosts = (
  globalThis as { process?: { env: Record<string, string | undefined> } }
).process?.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS?.split(",").filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: extraHosts?.length ? extraHosts : undefined,
  },
});
