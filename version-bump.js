const fs = require("fs");

// get information which type of version bump should be applied
const type = process.argv[2];

const types = ["major", "minor", "patch"];
let toUpdate = types.findIndex(t => type === t);
if (toUpdate < 0) {
  toUpdate = 2;
}

const packagePath = "package.json";

// get current version
const packageFileString = fs.readFileSync(packagePath).toString();
const packageJson = JSON.parse(packageFileString);
const { version } = packageJson;

// gengerate new version
const versionArray = version.split(".");
const newVersion = versionArray
  .map((v, i) => {
    if (i < toUpdate) {
      return v;
    }
    if (i === toUpdate) {
      return parseInt(v, 10) + 1;
    }
    return 0;
  })
  .join(".");

// update version in each package
packageJson.version = newVersion;
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 3)}\n`);
