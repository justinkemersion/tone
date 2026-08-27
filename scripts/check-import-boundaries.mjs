import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const failures = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const forbiddenInClient = [/from ["']@\/lib\/flux/, /from ["']@\/auth/, /from ["'].*\/sql\//];

function checkFile(file) {
  const src = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);
  const isClient = src.includes('"use client"') || src.includes("'use client'");
  const underComponents = rel.startsWith("components/");

  if (isClient) {
    for (const re of forbiddenInClient) {
      if (re.test(src)) {
        failures.push(`${rel}: client file imports server-only module`);
      }
    }
  }

  if (underComponents && /from ["']@\/lib\/flux/.test(src)) {
    failures.push(`${rel}: components must not import lib/flux`);
  }
}

for (const dir of ["app", "components", "lib"]) {
  const base = join(ROOT, dir);
  try {
    for (const file of walk(base)) {
      checkFile(file);
    }
  } catch {
    /* missing */
  }
}

if (failures.length > 0) {
  console.error("Import boundary violations:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Import boundary checks passed.");
