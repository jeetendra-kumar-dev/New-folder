import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const apps = [
  { name: "backend", args: ["--prefix", "backend", "run", "dev"] },
  { name: "frontend", args: ["--prefix", "frontend", "run", "dev"] },
];

const children = apps.map((app) => {
  const child = spawn(npmCommand, app.args, {
    cwd: new URL("..", import.meta.url),
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${app.name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${app.name}] ${chunk}`));
  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
