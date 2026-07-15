import assert from 'node:assert/strict';
import { applyLineEdits, parseModelEdits } from './model-edits.mjs';

const allowed = ['app.js', 'styles.css'];
const files = new Map([
  ['app.js', ['first', 'second', 'third', 'fourth', 'fifth'].join('\n')],
  ['styles.css', ['a {}', 'b {}'].join('\n')]
]);

assert.deepEqual(parseModelEdits('```json\n{"edits":[{"path":"app.js","startLine":2,"endLine":2,"replacement":"changed"}]}\n```').length, 1);

const applied = applyLineEdits(files, [
  { path: 'app.js', startLine: 4, endLine: 4, replacement: 'FOURTH' },
  { path: 'app.js', startLine: 2, endLine: 2, replacement: 'SECOND\nINSERTED' }
], allowed);
assert.equal(applied.files.get('app.js'), ['first', 'SECOND', 'INSERTED', 'third', 'FOURTH', 'fifth'].join('\n'));
assert.deepEqual([...applied.changedPaths], ['app.js']);

assert.throws(() => applyLineEdits(files, [
  { path: '.github/workflows/evil.yml', startLine: 1, endLine: 1, replacement: 'bad' }
], allowed), /Otillåten fil/);

assert.throws(() => applyLineEdits(files, [
  { path: 'app.js', startLine: 2, endLine: 3, replacement: 'x' },
  { path: 'app.js', startLine: 3, endLine: 4, replacement: 'y' }
], allowed), /Överlappande edits/);

assert.throws(() => applyLineEdits(files, [
  { path: 'app.js', startLine: 99, endLine: 99, replacement: 'x' }
], allowed), /ogiltigt radintervall/);

assert.throws(() => applyLineEdits(files, [
  { path: 'app.js', startLine: 1, endLine: 1, replacement: 'first' }
], allowed), /ändrar ingenting/);

console.log('model-edits: alla tester passerade');
