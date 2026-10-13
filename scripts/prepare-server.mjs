import { existsSync, cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const target = resolve("server-app/public");
if (existsSync(target) && !existsSync(resolve(target, ".findmydup-generated")))
  throw new Error("Refusing to overwrite an unowned server public directory.");
if (existsSync(target)) rmSync(target, { recursive: true });
mkdirSync(target, { recursive: true });
cpSync(resolve("public"), target, { recursive: true });
writeFileSync(
  resolve(target, ".findmydup-generated"),
  "Generated from the shared public directory.\n",
);
