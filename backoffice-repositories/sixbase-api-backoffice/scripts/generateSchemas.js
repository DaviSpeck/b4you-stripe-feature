const fs = require("fs");
const path = require("path");

const modulesDir = path.resolve(__dirname, "../docs/modulos");
const outputFile = path.resolve(__dirname, "../docs/schemas.yaml");

let result = "components:\n  schemas:\n";

fs.readdirSync(modulesDir).forEach((module) => {
  const schemaFile = path.join(modulesDir, module, "schemas.yaml");
  if (fs.existsSync(schemaFile)) {
    result += `  # Schemas do módulo ${module}\n`;
    result += `  ${module}:\n`;
    result += `    $ref: "./modulos/${module}/schemas.yaml#/components/schemas"\n\n`;
  }
});

fs.writeFileSync(outputFile, result);
console.log("schemas.yaml gerado com sucesso!");
