const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { compositeImagesAsync, generateImageAsync, generateImageBackgroundAsync } = require('@expo/image-utils');

const projectRoot = path.resolve(__dirname, '..');
const themeModule = { exports: {} };
const themeSource = fs.readFileSync(path.join(projectRoot, 'src/theme/colors.ts'), 'utf8');
new Function('exports', ts.transpileModule(themeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(themeModule.exports);
const { colors } = themeModule.exports;

async function exportImage(filename, sourceName, size, padding = 0) {
  const { source } = await generateImageAsync({ projectRoot }, {
    src: path.join(projectRoot, 'assets/brand', sourceName), width: size - padding * 2, height: size - padding * 2,
    resizeMode: 'contain',
  });
  let exportedImage = source;
  if (padding) {
    const background = await generateImageBackgroundAsync({ width: size, height: size, resizeMode: 'contain', backgroundColor: colors.transparent });
    exportedImage = await compositeImagesAsync({ foreground: source, background, x: padding, y: padding });
  }
  fs.writeFileSync(path.join(projectRoot, 'assets', filename), exportedImage);
}

async function prepareBrandAssets() {
  await exportImage('icon.png', 'launcherSource.png', 1024);
  await exportImage('android-icon-foreground.png', 'launcherSource.png', 1024, 112);
  await exportImage('android-icon-monochrome.png', 'symbol.png', 1024, 96);
  await exportImage('splash-icon.png', 'symbol.png', 512);
  await exportImage('favicon.png', 'launcherSource.png', 64);
  const background = await generateImageBackgroundAsync({ width: 1024, height: 1024, backgroundColor: colors.primary, resizeMode: 'contain' });
  fs.writeFileSync(path.join(projectRoot, 'assets/android-icon-background.png'), background);
  fs.copyFileSync(path.join(projectRoot, 'assets/brand/symbol.png'), path.join(projectRoot, 'motion/public/brandSymbol.png'));
  fs.copyFileSync(path.join(projectRoot, 'assets/brand/wordmark.png'), path.join(projectRoot, 'motion/public/brandWordmark.png'));
}

prepareBrandAssets().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
