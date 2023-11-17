/* eslint-disable no-console */
import { lstatSync, readdirSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

/**
 * Returns an array of files in a folder
 * @param {string} dir
 * @returns {string[]}
 */
function getTSfiles(dir, baseDir = dir) {
  const files = readdirSync(dir);
  const tsFiles = files.flatMap((file) => {
    const fullPath = join(dir, file);
    if (lstatSync(fullPath).isDirectory()) {
      return getTSfiles(fullPath, baseDir);
    }
    if (file.endsWith('.ts')) {
      return relative(baseDir, fullPath);
    }
    return [];
  });
  return tsFiles
    .filter((file) => !file.includes('_load'))
    .map((file) => file.replace('.ts', ''))
    .sort();
}

/**
 * Generates `_load.ts` file in given location
 * @param {string} dir
 */
function generateVirtualPieceLoader(dir) {
  console.info(`Generating virtual piece loader for ${dir}`);
  const files = getTSfiles(dir);
  console.info(`Found ${files.length} files`);
  const content = `${files.map((file) => `import './${file}';`).join('\n')}\n`;

  writeFileSync(`${dir}/_load.ts`, content, {
    encoding: 'utf-8',
  });
}

const locations = ['./src/commands', './src/listeners'];

locations.forEach((location) => {
  generateVirtualPieceLoader(location);
});
