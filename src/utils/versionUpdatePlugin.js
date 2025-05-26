const fs = require("fs");
const path = require("path");

const writeVersion = (versionFileName, content) => {
  fs.writeFile(versionFileName, content, (err) => {
    if (err) throw err;
  });
};

function versionUpdatePlugin(options) {
  this.options = options;
}

versionUpdatePlugin.prototype.apply = function (compiler) {
  compiler.plugin("done", () => {
    let config = { publicDir: compiler.options.output.path };
    const file = config.publicDir + path.sep + "version.json";
    const content = JSON.stringify({ version: this.options.version });
    if (fs.existsSync(config.publicDir)) {
      writeVersion(file, content);
    } else {
      fs.mkdir(config.publicDir, (err) => {
        if (err) throw err;
        writeVersion(file, content);
      });
    }
  });
};

module.exports = versionUpdatePlugin;