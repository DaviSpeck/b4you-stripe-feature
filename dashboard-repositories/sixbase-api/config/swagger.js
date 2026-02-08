const path = require("path");
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require(path.resolve(__dirname, "../docs/bundle.json"));

module.exports = (app) => {
    // Só disponibiliza em desenvolvimento
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
        app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
};

