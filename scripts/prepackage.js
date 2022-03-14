// 删除 config.json
const fs = require("fs");
const path = require("path");

const configurationPath = path.join(process.cwd(), "assets", "config.json");
if (fs.existsSync(configurationPath)) {
  fs.rmSync(configurationPath);
}
