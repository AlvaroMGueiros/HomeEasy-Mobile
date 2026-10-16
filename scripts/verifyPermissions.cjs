const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadUtility(filename, dependencies) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '../src/utils', filename), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  vm.runInNewContext(compiled.outputText, { exports, require: name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}

async function verifyPermissions() {
  let permissionRequests = 0;
  let permissionReads = 0;
  let granted = false;
  let canAskAgain = true;
  const location = loadUtility('location-permission.ts', { 'expo-location': {
    getForegroundPermissionsAsync: async () => { permissionReads += 1; return { granted, canAskAgain }; },
    requestForegroundPermissionsAsync: async () => { permissionRequests += 1; return { granted }; },
    hasServicesEnabledAsync: async () => true
  } });
  const firstRequest = location.requestLocationAccess();
  const concurrentRequest = location.requestLocationAccess();
  assert.equal(firstRequest, concurrentRequest);
  assert.equal(await firstRequest, false);
  assert.equal(permissionReads, 1);
  assert.equal(permissionRequests, 1);
  assert.equal(await location.requestLocationAccess(), false);
  assert.equal(permissionRequests, 1, 'denial must not cause repeated automatic prompts');
  assert.equal(await location.requestLocationAccess(true), false);
  assert.equal(permissionRequests, 2, 'an explicit retry may ask again');
  canAskAgain = false;
  await location.requestLocationAccess(true);
  assert.equal(permissionRequests, 2, 'permanent denial must not prompt again');
  granted = true;
  assert.equal(await location.requestLocationAccess(), true);
  assert.equal(permissionRequests, 2, 'already granted access must not prompt again');

  let allowed = false;
  let photoPickerCalls = 0;
  let selectedMediaTypes;
  const photos = loadUtility('photo-picker.ts', {
    'react-native': { Alert: { alert: (title, message, buttons) => buttons[allowed ? 1 : 0].onPress() } },
    'expo-image-picker': { launchImageLibraryAsync: async options => {
      photoPickerCalls += 1; selectedMediaTypes = options.mediaTypes;
      return { canceled: false, assets: [{ uri: 'selectedPhoto' }] };
    } }
  });
  assert.equal((await photos.choosePhotos()).canceled, true);
  assert.equal(photoPickerCalls, 0, 'declining must not open the picker');
  allowed = true;
  assert.equal((await photos.choosePhotos()).assets[0].uri, 'selectedPhoto');
  assert.equal(photoPickerCalls, 1);
  assert.equal(selectedMediaTypes.join(','), 'images', 'only photos may be selected');
  process.stdout.write('Permission timing, denial, retry and photo consent checks passed.\n');
}

verifyPermissions().catch(error => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; });
