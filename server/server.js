const { spawn } = require("child_process");
const path = require("path");

const serverDir = __dirname;
const port = process.env.PORT || "8000";

console.log("Starting DineMate backend...");
console.log(`Launching FastAPI app from ${serverDir}`);
console.log(`Using port ${port}`);

const pythonCommand = process.platform === "win32" ? "python" : "python3";

const child = spawn(
  pythonCommand,
  [
    "-m",
    "uvicorn",
    "app.main:app",
    "--host",
    "0.0.0.0",
    "--port",
    String(port),
  ],
  {
    cwd: serverDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PYTHONUNBUFFERED: "1",
    },
  }
);

child.on("error", (error) => {
  console.error("Failed to start FastAPI:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Backend stopped with signal ${signal}`);
    process.exit(1);
  }

  if (code !== 0) {
    console.error(`Backend exited with code ${code}`);
    process.exit(code || 1);
  }

  process.exit(0);
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
});