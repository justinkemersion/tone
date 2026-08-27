import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const RULES = [
  { glob: "components", ext: ".tsx", max: 250 },
  { glob: "app", ext: ".tsx", max: 300, skip: (p) => p.endsWith("layout.tsx") && readLines(p) < 80 },
  { glob: "app", ext: "/route.ts", max: 300 },
  { glob: "lib", ext: ".ts", max: 400, skip: (p) => p.includes("lib/flux/types.ts") },
];

function readLines(file) {
  return readFileSync(file, "utf8").split("\n").length;
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const failures = [];

for (const rule of RULES) {
  const base = join(ROOT, rule.glob);
  try {
    const files = walk(base);
    for (const file of files) {
      if (rule.ext.startsWith("/")) {
        if (!file.endsWith("route.ts")) continue;
      } else if (!file.endsWith(rule.ext)) {
        continue;
      }
      if (rule.skip?.(file)) continue;
      const lines = readLines(file);
      if (lines > rule.max) {
        failures.push(`${relative(ROOT, file)}: ${lines} lines (max ${rule.max})`);
      }
    }
  } catch {
    /* directory may not exist yet */
  }
}

if (failures.length > 0) {
  console.error("File size limits exceeded:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("File size checks passed.");
