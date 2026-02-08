import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = __dirname;

const modelsPromises = fs.readdirSync(modelsDir).map(async (file) => {
  if (file !== 'index.mjs' && file.endsWith('.mjs')) {
    const module = await import(path.join(modelsDir, file));
    return Object.values(module);
  }
});

export const models = (await Promise.all(modelsPromises)).flat().filter(Boolean);
