const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { openBrowser } = require('../motion/node_modules/@remotion/renderer');

require.extensions['.ts'] = (sourceModule, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  sourceModule._compile(compiled.outputText, filename);
};
const { buildRegionalMapHtml } = require('../src/utils/regional-map-html.ts');
const { parseRegionalMapMessage, RegionalMapMessageType } = require('../src/utils/regional-map-message.ts');
const region = { latitude: -8.05, longitude: -34.88, latitudeDelta: 1.2, longitudeDelta: 1.2 };
const city = "Olho d'Água <teste>";
const html = buildRegionalMapHtml(region, [{ key: 'city', city, state: 'PE', professionalCount: 5, latitude: -8.05, longitude: -34.88 }]);
assert.doesNotMatch(html, /<script[^>]+src=/);
assert.doesNotMatch(html, /<link[^>]+href=/);
assert.equal(parseRegionalMapMessage('invalid'), null);
assert.equal(parseRegionalMapMessage('{"type":"selectCity","city":42,"state":"PE"}'), null);

async function evaluatePage(page, expression) {
  const response = await page._client().send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.value.exceptionDetails) throw new Error(response.value.exceptionDetails.text);
  return response.value.result.value;
}

async function waitForMessage(page, type) {
  const deadline = Date.now() + 22000;
  while (Date.now() < deadline) {
    const messages = await evaluatePage(page, 'window.mapMessages');
    if (messages?.some(message => message.type === type)) return;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Map did not report ${type}: ${JSON.stringify(await evaluatePage(page, 'window.mapMessages'))}`);
}

async function verifyRegionalMap() {
  const browser = await openBrowser('chrome');
  try {
    const page = await browser.newPage({ context: () => null, logLevel: 'error', indent: false, pageIndex: 0, onBrowserLog: null, onLog: () => {} });
    await page.setViewport({ width: 390, height: 600, deviceScaleFactor: 1 });
    await page._client().send('Network.enable');
    await page._client().send('Network.setBlockedURLs', { urls: ['*unpkg.com*', '*jsdelivr.net*'] });
    const instrumentedHtml = html.replace('<head>', '<head><script>window.mapMessages=[];window.ReactNativeWebView={postMessage:function(value){window.mapMessages.push(JSON.parse(value));}};</script>');
    const url = `data:text/html;charset=utf-8,${encodeURIComponent(instrumentedHtml)}`;
    await page.goto({ url, timeout: 30000 });
    await waitForMessage(page, RegionalMapMessageType.Ready);
    assert.equal(await evaluatePage(page, 'L.version'), '1.9.4');
    assert.equal(await evaluatePage(page, 'document.querySelectorAll(".professional-marker").length'), 1);
    await evaluatePage(page, 'document.querySelector(".professional-marker").click()');
    assert.equal(await evaluatePage(page, 'document.querySelector(".popup-title").textContent'), `${city}, PE`);
    await evaluatePage(page, 'document.querySelector(".popup-button").click()');
    const selection = await evaluatePage(page, 'window.mapMessages.find(message => message.type === "selectCity")');
    assert.deepEqual(selection, { type: RegionalMapMessageType.SelectCity, city, state: 'PE' });
    const previousZoom = await evaluatePage(page, 'map.getZoom()');
    await evaluatePage(page, 'new Promise(resolve => { map.once("zoomend", () => resolve(true)); map.zoomIn(); })');
    assert.equal(await evaluatePage(page, 'map.getZoom()'), previousZoom + 1);
    const screenshot = await page._client().send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.resolve(__dirname, '../.expo'), { recursive: true });
    fs.writeFileSync(path.resolve(__dirname, '../.expo/mapBundledVerified.png'), Buffer.from(screenshot.value.data, 'base64'));
    process.stdout.write('PASS: local Leaflet works with CDN blocked; tiles, markers, zoom, safe city labels and navigation verified.\n');
    await page._client().send('Network.setBlockedURLs', { urls: ['*tile.openstreetmap.org*', '*unpkg.com*', '*jsdelivr.net*'] });
    await page._client().send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.goto({ url, timeout: 30000 });
    await waitForMessage(page, RegionalMapMessageType.Error);
    process.stdout.write('PASS: blocked map tiles report a recoverable error.\n');
    await page._client().send('Network.setBlockedURLs', { urls: ['*unpkg.com*', '*jsdelivr.net*'] });
    await page.goto({ url, timeout: 30000 });
    await waitForMessage(page, RegionalMapMessageType.Ready);
    process.stdout.write('PASS: retry loads the map after network recovery.\n');
  } finally {
    await browser.close({ silent: true });
  }
}

verifyRegionalMap().catch(error => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; });
