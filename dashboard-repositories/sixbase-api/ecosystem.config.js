module.exports = {
  apps : [{
    name   : "mango5-api",
    script : "./index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    env_development: {
        NODE_ENV: "dev"
    }
  }]
}
