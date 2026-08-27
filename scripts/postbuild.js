import fs from "fs";
import path from "path";

const clientDir = path.resolve("dist/client");
const shellFile = path.join(clientDir, "_shell.html");
const indexFile = path.join(clientDir, "index.html");

if (fs.existsSync(shellFile)) {
  fs.copyFileSync(shellFile, indexFile);
  console.log("Successfully copied dist/client/_shell.html to dist/client/index.html for static hosting!");
} else {
  console.error("Warning: dist/client/_shell.html not found.");
}
