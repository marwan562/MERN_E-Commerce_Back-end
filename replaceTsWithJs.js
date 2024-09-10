import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

function ensureRelativeJsImportsInFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      ensureRelativeJsImportsInFiles(filePath); // Recursively process directories
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      // Ensure all relative import paths end with .js
      content = content.replace(/import\s+[^'"]+\s+from\s+['"](\.\/|\.\.\/.*?)([^'"]*)['"]/g, (match, prefix, p1) => {
        // Skip specific imports
        if (match.includes('./config/cloudinary-config') || match.includes('./db')) {
          return match; // Don't modify these imports
        }
        if (!p1.endsWith('.js') && !p1.includes('.')) {
          return `${match.split('from')[0].trim()} from '${prefix}${p1}.js'`;
        }
        return match;
      });
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  });
}

ensureRelativeJsImportsInFiles(distDir);
console.log('Ensured all relative import paths end with .js for all .js files, excluding specific cases.');
