const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
require.extensions['.ts'] = (sourceModule, filename) => {
  sourceModule._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'expo-location') return {};
  return originalLoad.call(this, request, parent, isMain);
};
const { resolveServiceAddress } = require('../src/utils/service-address.ts');
const address = { address: 'Várzea rua major João rebeiro pinheiro', city: 'Recife', state: 'PE' };
const feature = { geometry: { type: 'Point', coordinates: [-34.954062, -8.0399172] }, properties: { name: 'Rua Major João Ribeiro Pinheiro', type: 'street', city: 'Recife', state: 'Pernambuco', countrycode: 'BR' } };
let features = [feature];
let status = 200;
global.fetch = async () => ({ ok: status === 200, status, json: async () => ({ features }) });
async function verify() {
  assert.equal((await resolveServiceAddress(address))[0].latitude, -8.0399172);
  features = [feature, feature];
  assert.equal((await resolveServiceAddress(address)).length, 1);
  features = [feature, { ...feature, geometry: { type: 'Point', coordinates: [-34.95, -8.04] } }];
  assert.equal((await resolveServiceAddress(address)).length, 2);
  for (const properties of [
    { ...feature.properties, city: 'Olinda' },
    { ...feature.properties, state: 'Bahia' },
    { ...feature.properties, countrycode: 'US' },
    { ...feature.properties, name: 'Rua Outra' },
    { ...feature.properties, type: 'city' }
  ]) {
    features = [{ ...feature, properties }];
    await assert.rejects(resolveServiceAddress(address), /Não encontramos/);
  }
  features = [{ ...feature, geometry: { type: 'Point', coordinates: [0, 100] } }];
  await assert.rejects(resolveServiceAddress(address), /Não encontramos/);
  await assert.rejects(resolveServiceAddress({ ...address, address: '' }), /precisa informar/);
  status = 429;
  await assert.rejects(resolveServiceAddress(address), /ocupada/);
  status = 503;
  await assert.rejects(resolveServiceAddress(address), /indisponível/);
  global.fetch = async () => { throw new Error('Network unavailable'); };
  await assert.rejects(resolveServiceAddress(address), /conexão/);
  console.info('PASS: typo, ambiguity, duplicates, location validation and API failures.');
}
verify().catch(failure => { console.error(failure); process.exitCode = 1; });
