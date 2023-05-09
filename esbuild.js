/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { build } = require('esbuild');
const { copy } = require('esbuild-plugin-copy');

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

const args = process.argv.slice(2);

/** @type BuildOptions */
const baseConfig = {
    bundle: true,
    minify: args.includes('--production'),
    sourcemap: !args.includes('--production'),
};

// Config for extension source code (to be run in a Node-based context)
/** @type BuildOptions */
const extensionConfig = {
    ...baseConfig,
    platform: 'node',
    format: 'cjs',
    entryPoints: ['./src/main.ts'],
    outfile: './out/main.js',
    external: ['vscode'],
};

// Config for extension source code (to be run in a Web-based context)
/** @type BuildOptions */
const extensionBrowserConfig = {
    ...baseConfig,
    platform: 'browser',
    format: 'cjs',
    entryPoints: ['./src/main.browser.ts'],
    outfile: './out/main.browser.js',
    external: ['vscode'],
};

// Config for webview source code (to be run in a web-based context)
/** @type BuildOptions */
const webviewConfig = {
    ...baseConfig,
    target: 'es2020',
    format: 'esm',
    tsconfig: 'tsconfig.webview.json',
    entryPoints: ['./src/webview/check-result-view.tsx'],
    outfile: './out/check-result-view.js',
    plugins: [
        // Copy webview css and ttf files to `out` directory unaltered
        copy({
            resolveFrom: 'cwd',
            assets: {
                from: ['./src/webview/*.css'],
                to: ['./out'],
            },
        })
    ]
};

// This watch config adheres to the conventions of the esbuild-problem-matchers
// extension (https://github.com/connor4312/esbuild-problem-matchers#esbuild-via-js)
/** @type BuildOptions */
const watchConfig = {
    watch: {
        onRebuild(error) {
            console.log('[watch] build started');
            if (error) {
                error.errors.forEach((error) =>
                    console.error(
                        `> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`
                    )
                );
            } else {
                console.log('[watch] build finished');
            }
        },
    },
};

// Build script
(async () => {
    try {
        if (args.includes('--watch')) {
            // Build and watch extension
            console.log('[watch] build started');
            await build({
                ...extensionConfig,
                ...watchConfig,
            });
            await build({
                ...extensionBrowserConfig,
                ...watchConfig,
            });
            await build({
                ...webviewConfig,
                ...watchConfig,
            });
            console.log('[watch] build finished');
        } else {
            // Build extension
            await build(extensionConfig);
            await build(extensionBrowserConfig);
            await build(webviewConfig);
            console.log('build complete');
        }
    } catch (err) {
        process.stderr.write(err.stderr);
        process.exit(1);
    }
})();
