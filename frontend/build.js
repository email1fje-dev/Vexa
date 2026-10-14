const fs = require("fs");
const path = require("path");
const root = __dirname;
const out = path.join(root, "build");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "js"), { recursive: true });
for (const name of ["index.html", "app.js", "styles.css"]) {
  fs.copyFileSync(path.join(root, name), path.join(out, name));
}
fs.writeFileSync(path.join(out, "js", ".keep"), "Vexa production build output.\n");
console.log("Vexa web app built successfully into frontend/build");
