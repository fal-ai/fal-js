"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNx = void 0;
const tslib_1 = require("tslib");
function regexEqual(x, y) {
    return (x instanceof RegExp &&
        y instanceof RegExp &&
        x.source === y.source &&
        x.global === y.global &&
        x.ignoreCase === y.ignoreCase &&
        x.multiline === y.multiline);
}
/**
 * Do not remove or rename this function. Production builds inline `with-nx.js` file with a replacement
 * To this function that hard-codes the libsDir.
 */
function getWithNxContext() {
return {
workspaceRoot: '/home/drochetti/dev/fal-ai/koldstart-javascript',
libsDir: 'libs'
}
}
function withNx(nextConfig = {}, context = getWithNxContext()) {
    var _a;
    // If `next-compose-plugins` is used, the context argument is invalid.
    if (!context.libsDir || !context.workspaceRoot) {
        context = getWithNxContext();
    }
    const userWebpack = nextConfig.webpack || ((x) => x);
    const { nx } = nextConfig, validNextConfig = tslib_1.__rest(nextConfig, ["nx"]);
    return Object.assign(Object.assign({ eslint: Object.assign({ ignoreDuringBuilds: true }, ((_a = validNextConfig.eslint) !== null && _a !== void 0 ? _a : {})) }, validNextConfig), { webpack: (config, options) => {
            /*
             * Update babel to support our monorepo setup.
             * The 'upward' mode allows the root babel.config.json and per-project .babelrc files to be picked up.
             */
            options.defaultLoaders.babel.options.babelrc = true;
            options.defaultLoaders.babel.options.rootMode = 'upward';
            /*
             * Modify the Next.js webpack config to allow workspace libs to use css modules.
             * Note: This would be easier if Next.js exposes css-loader and sass-loader on `defaultLoaders`.
             */
            // Include workspace libs in css/sass loaders
            const includes = [
                require('path').join(context.workspaceRoot, context.libsDir),
            ];
            const nextCssLoaders = config.module.rules.find((rule) => typeof rule.oneOf === 'object');
            // webpack config is not as expected
            if (!nextCssLoaders)
                return config;
            /*
             *  1. Modify css loader to enable module support for workspace libs
             */
            const nextCssLoader = nextCssLoaders.oneOf.find((rule) => rule.sideEffects === false && regexEqual(rule.test, /\.module\.css$/));
            // Might not be found if Next.js webpack config changes in the future
            if (nextCssLoader && nextCssLoader.issuer) {
                nextCssLoader.issuer.or = nextCssLoader.issuer.and
                    ? nextCssLoader.issuer.and.concat(includes)
                    : includes;
                delete nextCssLoader.issuer.and;
            }
            /*
             *  2. Modify sass loader to enable module support for workspace libs
             */
            const nextSassLoader = nextCssLoaders.oneOf.find((rule) => rule.sideEffects === false &&
                regexEqual(rule.test, /\.module\.(scss|sass)$/));
            // Might not be found if Next.js webpack config changes in the future
            if (nextSassLoader && nextSassLoader.issuer) {
                nextSassLoader.issuer.or = nextSassLoader.issuer.and
                    ? nextSassLoader.issuer.and.concat(includes)
                    : includes;
                delete nextSassLoader.issuer.and;
            }
            /*
             *  3. Modify error loader to ignore css modules used by workspace libs
             */
            const nextErrorCssModuleLoader = nextCssLoaders.oneOf.find((rule) => rule.use &&
                rule.use.loader === 'error-loader' &&
                rule.use.options &&
                (rule.use.options.reason ===
                    'CSS Modules \u001b[1mcannot\u001b[22m be imported from within \u001b[1mnode_modules\u001b[22m.\n' +
                        'Read more: https://err.sh/next.js/css-modules-npm' ||
                    rule.use.options.reason ===
                        'CSS Modules cannot be imported from within node_modules.\nRead more: https://err.sh/next.js/css-modules-npm'));
            // Might not be found if Next.js webpack config changes in the future
            if (nextErrorCssModuleLoader) {
                nextErrorCssModuleLoader.exclude = includes;
            }
            /**
             * 4. Modify css loader to allow global css from node_modules to be imported from workspace libs
             */
            const nextGlobalCssLoader = nextCssLoaders.oneOf.find((rule) => {
                var _a, _b;
                return (_b = (_a = rule.include) === null || _a === void 0 ? void 0 : _a.and) === null || _b === void 0 ? void 0 : _b.find((include) => regexEqual(include, /node_modules/));
            });
            // Might not be found if Next.js webpack config changes in the future
            if (nextGlobalCssLoader && nextGlobalCssLoader.issuer) {
                nextGlobalCssLoader.issuer.or = nextGlobalCssLoader.issuer.and
                    ? nextGlobalCssLoader.issuer.and.concat(includes)
                    : includes;
                delete nextGlobalCssLoader.issuer.and;
            }
            /**
             * 5. Add env variables prefixed with NX_
             */
            addNxEnvVariables(config);
            /**
             * 6. Add SVGR support if option is on.
             */
            // Default SVGR support to be on for projects.
            if ((nx === null || nx === void 0 ? void 0 : nx.svgr) !== false) {
                config.module.rules.push({
                    test: /\.svg$/,
                    oneOf: [
                        // If coming from JS/TS file, then transform into React component using SVGR.
                        {
                            issuer: /\.[jt]sx?$/,
                            use: [
                                {
                                    loader: require.resolve('@svgr/webpack'),
                                    options: {
                                        svgo: false,
                                        titleProp: true,
                                        ref: true,
                                    },
                                },
                                {
                                    loader: require.resolve('url-loader'),
                                    options: {
                                        limit: 10000,
                                        name: '[name].[hash:7].[ext]',
                                    },
                                },
                            ],
                        },
                        // Fallback to plain URL loader if someone just imports the SVG and references it on the <img src> tag
                        {
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: '[name].[hash:7].[ext]',
                            },
                        },
                    ],
                });
            }
            return userWebpack(config, options);
        } });
}
exports.withNx = withNx;
function getNxEnvironmentVariables() {
    return Object.keys(process.env)
        .filter((env) => /^NX_/i.test(env))
        .reduce((env, key) => {
        env[key] = process.env[key];
        return env;
    }, {});
}
function addNxEnvVariables(config) {
    var _a;
    const maybeDefinePlugin = (_a = config.plugins) === null || _a === void 0 ? void 0 : _a.find((plugin) => {
        var _a;
        return (_a = plugin.definitions) === null || _a === void 0 ? void 0 : _a['process.env.NODE_ENV'];
    });
    if (maybeDefinePlugin) {
        const env = getNxEnvironmentVariables();
        Object.entries(env)
            .map(([name, value]) => [`process.env.${name}`, `"${value}"`])
            .filter(([name]) => !maybeDefinePlugin.definitions[name])
            .forEach(([name, value]) => (maybeDefinePlugin.definitions[name] = value));
    }
}
// Support for older generated code: `const withNx = require('@nrwl/next/plugins/with-nx');`
module.exports = withNx;
// Support for newer generated code: `const { withNx } = require(...);`
module.exports.withNx = withNx;
//# sourceMappingURL=with-nx.js.map