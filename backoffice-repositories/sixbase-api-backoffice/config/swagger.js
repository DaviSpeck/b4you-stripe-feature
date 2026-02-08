const path = require('path');
const YAML = require('yamljs');
const swaggerJsdoc = require('swagger-jsdoc');

const openapiDoc = YAML.load(
  path.resolve(__dirname, '../docs/bundle.yaml')
);

const swaggerSpec = swaggerJsdoc({
  definition: openapiDoc,
  apis: [path.resolve(__dirname, '../docs/paths/*.yaml')],
});

module.exports = swaggerSpec;
