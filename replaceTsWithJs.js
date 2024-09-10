import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "dist");

// List of import paths to exclude from modification
const exclusions = [
  "./config/cloudinary-config",
  "./db",
  "./routes/userRoute.js",
  "./routes/categoryRoute.js",
  "./routes/productRoute.js",
  "./routes/cartItemsRoute.js",
  "./routes/washlistRoute.js",
  "./routes/orderRoute.js",
  "./routes/mailsRoute.js",
  "./routes/adminDashboardRoute.js"
];

function ensureRelativeJsImportsInFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      ensureRelativeJsImportsInFiles(filePath); // Recursively process directories
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf-8");
      content = content.replace(
        /import\s+[^'"]+\s+from\s+['"](\.\/|\.\.\/.*?)([^'"]*)['"]/g,
        (match, prefix, p1) => {
          const importPath = `${prefix}${p1}`;
          
          // Debugging log to check captured paths
          console.log(`Original: ${match}`);
          console.log(`Import Path: ${importPath}`);
          
          if (exclusions.some((exclusion) => importPath.startsWith(exclusion))) {
            return match; // Don't modify these imports
          }

          // Modify import paths that are relative but do not end with .js
          if (!importPath.endsWith(".js") && !importPath.includes('.')) {
            return `${match.split("from")[0].trim()} from '${prefix}${p1}.js'`;
          }
          
          return match;
        }
      );
      fs.writeFileSync(filePath, content, "utf-8");
    }
  });
}

ensureRelativeJsImportsInFiles(distDir);
console.log(
  "Ensured all relative import paths end with .js for all .js files, excluding specific cases."
);
