import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const target = resolve("server-app/.next/standalone/server-app");
if (!existsSync(resolve(target, "server.js")))
  throw new Error("Expected standalone Node.js entry point is missing.");
mkdirSync(resolve(target, ".next/static"), { recursive: true });
cpSync(resolve("server-app/.next/static"), resolve(target, ".next/static"), {
  recursive: true,
});
cpSync(resolve("server-app/public"), resolve(target, "public"), {
  recursive: true,
});
console.log("Standalone server and shared public/static assets packaged.");
