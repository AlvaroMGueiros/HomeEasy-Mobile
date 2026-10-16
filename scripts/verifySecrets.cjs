const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const rules = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/g,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s:@]+:[^\s@]+@/g
];
let found = false;
function inspect(source, location) {
  source.split('\n').forEach((line, index) => {
    for (const rule of rules) {
      rule.lastIndex = 0;
      for (const match of line.matchAll(rule)) {
        found = true;
        console.error(`${location}:${index + 1}: ${match[0].slice(0, 4)}****`);
      }
    }
  });
}
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const file of files) {
  if (/\.(png|jpe?g|wav|mp3|mp4|ttf|woff2?|ico)$/i.test(file)) continue;
  if (fs.existsSync(file)) inspect(fs.readFileSync(file, 'utf8'), file);
}
const history = execFileSync('git', ['log', '--all', '--format=COMMIT:%h', '-p', '--no-ext-diff'], {
  encoding: 'utf8', maxBuffer: 128 * 1024 * 1024
});
let commit = '';
let file = '';
let lineNumber = 0;
for (const line of history.split('\n')) {
  if (line.startsWith('COMMIT:')) commit = line;
  if (line.startsWith('+++ b/')) file = line.slice(6);
  const hunk = line.match(/^@@ .*\+(\d+)/);
  if (hunk) { lineNumber = Number(hunk[1]) - 1; continue; }
  if (line.startsWith('+') && !line.startsWith('+++')) {
    lineNumber += 1;
    inspect(line.slice(1), `${commit} ${file}:${lineNumber}`);
  } else if (line.startsWith(' ')) lineNumber += 1;
}
if (found) process.exitCode = 1;
else console.info('PASS: no supported private credential patterns found in tracked files or reachable history.');
