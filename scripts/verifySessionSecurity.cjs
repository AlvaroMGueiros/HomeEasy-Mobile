const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

async function verifySessionSecurity() {
  const storedValues = new Map();
  let resolveRefresh;
  let refreshStarted;
  const started = new Promise(resolve => { refreshStarted = resolve; });
  const revokedTokens = [];
  let revocationFails = false;
  const exports = {};
  const source = fs.readFileSync(require.resolve('../src/api/api-client.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  vm.runInNewContext(compiled.outputText, {
    exports, Headers, AbortController, setTimeout, clearTimeout,
    require: name => {
      if (name === 'expo-secure-store') return {
        getItemAsync: async key => storedValues.get(key) || null,
        setItemAsync: async (key, value) => { storedValues.set(key, value); },
        deleteItemAsync: async key => { storedValues.delete(key); }
      };
      if (name === '../config/environment') return { environment: { apiUrl: 'https://api.example.test' } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    fetch: async (url, options) => {
      if (url.endsWith('/auth/logout')) {
        revokedTokens.push(JSON.parse(options.body).refreshToken);
        if (revocationFails) throw new Error('Network unavailable');
        return { ok: true };
      }
      if (url.endsWith('/auth/refresh')) {
        refreshStarted();
        return new Promise(resolve => { resolveRefresh = resolve; });
      }
      return { status: 401, ok: false, json: async () => ({ message: 'Sessão expirada.' }) };
    }
  });
  await exports.storeSession({ accessToken: 'oldAccess', refreshToken: 'oldRefresh', user: { id: 'firstUser' } });
  const pendingRequest = exports.apiRequest('/users/me');
  await started;
  await exports.endSession();
  assert.equal(storedValues.size, 0);
  await exports.storeSession({ accessToken: 'newAccess', refreshToken: 'newRefresh', user: { id: 'secondUser' } });
  resolveRefresh({ ok: true, json: async () => ({ accessToken: 'staleAccess', refreshToken: 'staleRefresh', user: { id: 'firstUser' } }) });
  await assert.rejects(pendingRequest);
  assert.equal(storedValues.get('homeEasyAccessToken'), 'newAccess');
  assert.equal(JSON.parse(storedValues.get('homeEasyUser')).id, 'secondUser');
  assert.deepEqual(revokedTokens, ['oldRefresh', 'staleRefresh']);
  await exports.clearSession();
  assert.equal(storedValues.size, 0);
  await exports.storeSession({ accessToken: 'offlineAccess', refreshToken: 'offlineRefresh', user: { id: 'offlineUser' } });
  revocationFails = true;
  await assert.rejects(exports.endSession());
  assert.equal(storedValues.size, 0, 'logout must clear credentials even when server revocation fails');
  const environmentSource = fs.readFileSync(require.resolve('../src/config/environment.ts'), 'utf8');
  const compiledEnvironment = ts.transpileModule(environmentSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  function loadEnvironment(apiUrl, development) {
    const environmentExports = {};
    vm.runInNewContext(compiledEnvironment.outputText, {
      exports: environmentExports, URL, __DEV__: development,
      process: { env: { EXPO_PUBLIC_API_URL: apiUrl } },
      require: () => ({ Platform: { OS: 'android' } })
    });
    return environmentExports.environment;
  }
  assert.throws(() => loadEnvironment(undefined, false));
  assert.throws(() => loadEnvironment('http://api.example.test/api', false));
  assert.equal(loadEnvironment('https://api.example.test/api', false).apiUrl, 'https://api.example.test/api');
  assert.equal(loadEnvironment(undefined, true).apiUrl, 'http://10.0.2.2:3000/api');
  console.info('PASS: logout revokes tokens; stale refresh cannot restore or replace a session.');
}

verifySessionSecurity().catch(failure => { console.error(failure); process.exitCode = 1; });
