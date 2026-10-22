const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (sourceModule, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  sourceModule._compile(compiled.outputText, filename);
};
const { resolveHighlightLocation, buildHighlightsQuery, mergeHighlights, buildHighlightCategoryOptions } = require('../src/utils/highlights.ts');
assert.deepEqual(resolveHighlightLocation('Recife, pe'), { city: 'Recife', state: 'PE' });
assert.deepEqual(resolveHighlightLocation('Localização atual', { city: 'Garanhuns', state: 'PE' }), { city: 'Garanhuns', state: 'PE' });
assert.equal(resolveHighlightLocation(undefined, { city: null, state: null }), null);
assert.throws(() => buildHighlightsQuery({ city: '', state: 'PE' }), /cidade/);
const query = new URLSearchParams(buildHighlightsQuery({ city: 'São José', state: 'pe' }, 'a&b', 2));
assert.equal(query.get('city'), 'São José');
assert.equal(query.get('state'), 'PE');
assert.equal(query.get('serviceId'), 'a&b');
assert.equal(query.get('page'), '2');
const original = [{ id: 'one', title: 'Before' }];
assert.deepEqual(mergeHighlights(original, [{ id: 'one', title: 'After' }, { id: 'two' }]), [{ id: 'one', title: 'After' }, { id: 'two' }]);
assert.equal(original[0].title, 'Before');
const filteredQuery = new URLSearchParams(buildHighlightsQuery({ city: 'Recife', state: 'PE' }, '', 1, 10, { search: 'pintura & reforma', category: 'Construção' }));
assert.equal(filteredQuery.get('search'), 'pintura & reforma');
assert.equal(filteredQuery.get('category'), 'Construção');
assert.deepEqual(buildHighlightCategoryOptions([{ id: 'a', name: 'Pintura', category: 'Reformas' }, { id: 'b', name: 'Piso', category: 'Reformas' }]).map(option => option.value), ['', 'Reformas']);
process.stdout.write('Highlight location, query encoding and pagination deduplication checks passed.\n');
