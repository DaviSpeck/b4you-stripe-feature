module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            for (const rule of webpackConfig.module.rules) {
                if (Array.isArray(rule.oneOf)) {
                    for (const one of rule.oneOf) {
                        if (one.loader && one.loader.includes('babel-loader')) {
                            if (!one.include) one.include = [];
                            if (!Array.isArray(one.include)) one.include = [one.include];
                            one.include.push(/node_modules[\\/]+react-onesignal/);
                        }
                    }
                }
            }
            return webpackConfig;
        },
    },
};