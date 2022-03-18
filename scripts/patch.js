const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

spawn("npm", ["version", "patch"], {
  cwd: process.cwd(),
  shell: true,
  stdio: "inherit",
}).on("exit", () => {
  const appPackage = require("../release/app/package.json");
  const package = require("../package.json");

  appPackage.version = package.version;
  fs.writeFileSync(
    path.join(__dirname, "../release/app/package.json"),
    JSON.stringify(appPackage),
    { flag: "w+" }
  );
});
