const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

require.extensions['.ts'] = (sourceModule, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  sourceModule._compile(compiled.outputText, filename);
};

const { brazilianStates } = require('../src/config/brazilianStates.ts');
const { ServiceRequestFieldType } = require('../src/types/api.ts');
const { prepareServiceAnswers, resolveServiceQuestion } = require('../src/utils/serviceRequestForm.ts');
const { parseOptionalNumber } = require('../src/utils/number.ts');
const { groupOrdersByUserRole, resolveOrderAnswerDetails, summarizeOrders } = require('../src/utils/orderDetails.ts');
const { isValidEmailAddress } = require('../src/utils/formValidation.ts');

async function verifyForms() {
  assert.deepEqual(summarizeOrders([
    { status: 'completed' }, { status: 'disputed' }, { status: 'accepted' },
    { status: 'scheduled' }, { status: 'in_progress' },
    { status: 'cancelled_by_client' }, { status: 'cancelled_by_professional' }
  ]), { attentionCount: 4, completedCount: 1 });
  assert.deepEqual(summarizeOrders([]), { attentionCount: 0, completedCount: 0 });
  const hiredOrder = { id: 'hired', clientId: 'currentUser', professionalId: 'professional' };
  const acceptedJob = { id: 'job', clientId: 'client', professionalId: 'currentUser' };
  const unrelatedOrder = { id: 'unrelated', clientId: 'client', professionalId: 'professional' };
  assert.deepEqual(groupOrdersByUserRole([hiredOrder, acceptedJob, acceptedJob, unrelatedOrder], 'currentUser'), {
    hiredOrders: [hiredOrder], acceptedJobs: [acceptedJob]
  });
  assert.deepEqual(groupOrdersByUserRole([hiredOrder, acceptedJob]), { hiredOrders: [], acceptedJobs: [] });
  assert.equal(brazilianStates.length, 27);
  assert.equal(new Set(brazilianStates.map(state => state.value)).size, 27);
  assert.equal(brazilianStates.find(state => state.value === 'PE').label, 'Pernambuco');
  assert.equal(parseOptionalNumber('1.500,50'), 1500.5);
  assert.equal(parseOptionalNumber('1.500'), 1500);
  assert.equal(parseOptionalNumber('150,50'), 150.5);
  assert.equal(parseOptionalNumber('150.50'), 150.5);
  assert.equal(parseOptionalNumber('0'), 0);
  for (const invalidAmount of ['', '1.2.3', '1,2,3', 'NaN', 'Infinity', '0x10', '1e3']) {
    assert.equal(parseOptionalNumber(invalidAmount), undefined);
  }
  assert.equal(isValidEmailAddress(' maria@example.com '), true);
  assert.equal(isValidEmailAddress('maria@'), false);
  const fields = [
    { key: 'propertySize', label: 'Metragem do imóvel', type: ServiceRequestFieldType.Number, required: true, minimum: 1, unit: 'm²' },
    { key: 'bedroomCount', label: 'Quartos', type: ServiceRequestFieldType.Number, required: true, minimum: 0 },
    { key: 'cleaningSupplies', label: 'Materiais', type: ServiceRequestFieldType.Select, required: true, options: [{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }] },
    { key: 'extraDetails', label: 'Informações adicionais', type: ServiceRequestFieldType.Text, required: false }
  ];
  const validAnswers = { propertySize: '60,5', bedroomCount: '0', cleaningSupplies: 'no' };
  assert.deepEqual(prepareServiceAnswers(fields, validAnswers), { propertySize: 60.5, bedroomCount: 0, cleaningSupplies: 'no' });
  assert.throws(() => prepareServiceAnswers(fields, { ...validAnswers, cleaningSupplies: 'Não' }), /Escolha uma das opções/);
  assert.throws(() => prepareServiceAnswers(fields, { ...validAnswers, bedroomCount: '-1' }), /número válido/);
  assert.throws(() => prepareServiceAnswers(fields, { ...validAnswers, propertySize: '' }), /Responda à pergunta/);
  assert.match(resolveServiceQuestion(fields[0]).label, /m²/);
  const answerDetails = resolveOrderAnswerDetails({ request: { answers: validAnswers, service: { requestForm: fields } } });
  assert.equal(answerDetails.find(answer => answer.key === 'cleaningSupplies').value, 'Não');
  assert.equal(answerDetails.find(answer => answer.key === 'bedroomCount').value, '0');

  const preferences = new Map();
  const filename = path.resolve(__dirname, '../src/utils/welcomeGuide.ts');
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => {
    assert.equal(name, 'expo-secure-store');
    return { getItemAsync: async key => preferences.get(key), setItemAsync: async (key, value) => { preferences.set(key, value); } };
  } }, { filename });
  assert.equal(await exports.hasSeenWelcomeGuide('firstUser'), false);
  await exports.markWelcomeGuideSeen('firstUser');
  assert.equal(await exports.hasSeenWelcomeGuide('firstUser'), true);
  assert.equal(await exports.hasSeenWelcomeGuide('secondUser'), false);
  process.stdout.write('Form values, service questions and per-account welcome checks passed.\n');
}

verifyForms().catch(failure => { process.stderr.write(`${failure.stack}\n`); process.exitCode = 1; });
