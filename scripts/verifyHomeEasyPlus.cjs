const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (sourceModule, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  sourceModule._compile(compiled.outputText, filename);
};
const { canShowPlusOffer, isPurchaseCancelled, plusOfferInterval, resolvePlusBasePlan } = require('../src/utils/homeEasyPlus.ts');
const now = Date.parse('2026-10-22T12:00:00Z');
assert.equal(canShowPlusOffer(null, now), true);
assert.equal(canShowPlusOffer(String(now), now), false);
assert.equal(canShowPlusOffer(String(now - plusOfferInterval), now), true);
assert.equal(canShowPlusOffer(String(now + 1000), now), false);
assert.equal(canShowPlusOffer('invalid', now), false);
assert.equal(isPurchaseCancelled({ userCancelled: true }), true);
assert.equal(isPurchaseCancelled({ message: 'Network unavailable' }), false);
assert.equal(isPurchaseCancelled(null), false);
const basePlan = { isBasePlan: true, isPrepaid: false, billingPeriod: { iso8601: 'P1M' }, fullPricePhase: { price: { formatted: 'R$ 14,90' } } };
assert.equal(resolvePlusBasePlan({ product: { subscriptionOptions: [basePlan] } }), basePlan);
for (const changes of [{ isPrepaid: true }, { installmentsInfo: {} }, { freePhase: {} }, { introPhase: {} }, { billingPeriod: { iso8601: 'P1Y' } }]) {
  assert.equal(resolvePlusBasePlan({ product: { subscriptionOptions: [{ ...basePlan, ...changes }] } }), null);
}
process.stdout.write('HomeEasy+ offer frequency and purchase cancellation checks passed.\n');
