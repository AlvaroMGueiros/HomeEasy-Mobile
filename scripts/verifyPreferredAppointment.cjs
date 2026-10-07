const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (sourceModule, filename) => {
  sourceModule._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
};
const { resolvePreferredAppointment } = require('../src/utils/date.ts');
const now = new Date(2026, 9, 7, 16, 25);
assert.equal(resolvePreferredAppointment('', '', now), undefined);
assert.equal(resolvePreferredAppointment('2026-10-07', '17:00', now), new Date(2026, 9, 7, 17, 0).toISOString());
assert.equal(resolvePreferredAppointment('2026-10-08', '08:00', now), new Date(2026, 9, 8, 8, 0).toISOString());
assert.throws(() => resolvePreferredAppointment('2026-10-07', '16:24', now), /já passou/);
assert.throws(() => resolvePreferredAppointment('2026-10-07', '16:25', now), /já passou/);
assert.throws(() => resolvePreferredAppointment('2026-10-06', '23:59', now), /já passou/);
assert.throws(() => resolvePreferredAppointment('2026-10-07', '', now), /válidos/);
assert.throws(() => resolvePreferredAppointment('2026-10-07', '24:00', now), /válidos/);
assert.throws(() => resolvePreferredAppointment('2026-02-30', '12:00', now), /data válida/);
assert.throws(() => resolvePreferredAppointment('2026-10-07', '17:00', new Date(2026, 9, 7, 17, 1)), /já passou/);
console.info('PASS: today future time, tomorrow, past day/time, exact current minute, stale form and invalid inputs.');
