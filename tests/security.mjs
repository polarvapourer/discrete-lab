// Run with: node --test tests/security.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setProblem, readSet} from '../set-expression.js';
import {configOK, generate} from '../generator.js';

test('set-expression rejects oversized inputs, code injection payloads, and prototype keys cleanly', () => {
  assert.throws(() => readSet(' '.repeat(2001)), /at most 1,500/);
  for (const badSet of ['1); import os', '"a"', "a'b", '1\nprint(1)', '__proto__, 1']) {
    assert.throws(() => readSet(badSet), undefined, badSet);
  }
  const ctorSet = readSet('constructor, 1');
  assert.ok(ctorSet.has('constructor'));
  assert.match(setProblem({A: 'constructor, 1', B: '1'}, 'A n B').code, /"constructor"/);
  for (const badExpr of ['A; import os', 'A n __import__("os")', '('.repeat(101) + 'A' + ')'.repeat(101)]) {
    assert.throws(() => setProblem({A: '1,2', B: '2,3'}, badExpr), undefined, badExpr);
  }
});

test('generator configOK validates all config fields strictly', () => {
  assert.equal(configOK(null), false);
  assert.equal(configOK({subject: 'Sets', level: 'Accessible', count: 5, seed: 'abc'}), true);
  assert.equal(configOK({subject: '__proto__', level: 'Accessible', count: 5, seed: 'abc'}), false);
  assert.equal(configOK({subject: 'Sets', level: 'constructor', count: 5, seed: 'abc'}), false);
  assert.equal(configOK({subject: 'Sets', level: 'Accessible', count: 0, seed: 'abc'}), false);
  assert.equal(configOK({subject: 'Sets', level: 'Accessible', count: 101, seed: 'abc'}), false);
  assert.equal(configOK({subject: 'Sets', level: 'Accessible', count: 1.5, seed: 'abc'}), false);
  assert.equal(configOK({subject: 'Sets', level: 'Accessible', count: 5, seed: '   '}), false);
  assert.equal(configOK({subject: 'Sets', level: 'Accessible', count: 5, seed: 'a'.repeat(65)}), false);
  assert.equal(generate({subject: 'Sets', level: 'Accessible', count: 2, seed: 'sec-test'}).length, 2);
});

test('explore changeExplore ignores out-of-bounds and invalid inputs without throwing', async () => {
  const prevDoc = globalThis.document;
  globalThis.document = {addEventListener() {}};
  try {
    const {explore, changeExplore} = await import('../explore.js');
    changeExplore('op', '999');
    changeExplore('op', '-1');
    changeExplore('op', '__proto__');
    assert.match(explore(0), /Build your own sets/);

    changeExplore('A', '999');
    changeExplore('A', 'NaN');
    assert.doesNotMatch(explore(0), /999|NaN/);

    changeExplore('pair', '99');
    changeExplore('pair', '<script>');
    assert.doesNotMatch(explore(1), /<script>/);

    changeExplore('map0', '99');
    changeExplore('map__proto__', '1');
    changeExplore('map99', '1');
    assert.match(explore(2), /Rewire a function/);

    changeExplore('edges', 'XX');
    changeExplore('edges', '__proto__');
    assert.match(explore(3), /Build a graph/);
  } finally {
    if (prevDoc === undefined) delete globalThis.document;
    else globalThis.document = prevDoc;
  }
});

test('term-test rejects invalid storage, out-of-bounds jumps, and invalid answer choices', async () => {
  const handlers = {}, storage = new Map(), navItems = Array.from({length: 20}, () => ({}));
  const elements = {
    examView: {addEventListener: (k, v) => { handlers[k] = v; }, querySelector: () => null},
    examTime: {}, answeredCount: {}, examNav: {children: navItems},
  };
  const globals = {
    document: {getElementById: id => elements[id], addEventListener() {}},
    window: {addEventListener() {}},
    localStorage: {getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v)},
    FormData: class { get() { return '50'; } },
    setInterval: () => 0,
  };
  const originals = new Map(Object.keys(globals).map(k => [k, globalThis[k]]));
  try {
    storage.set('discrete-lab-term-test-v1', JSON.stringify({
      seed: 1, minutes: 50, deadline: Date.now() + 300000, phase: 'active', at: 0,
      answers: Array(20).fill(null), flags: Array(20).fill(false),
      __proto__: {polluted: true}, extraField: 'should-strip',
    }));
    Object.assign(globalThis, globals);
    await import('../term-test.js?sec=1');
    assert.equal(({}).polluted, undefined);

    // Out-of-bounds jump should be ignored
    handlers.click({target: {closest: () => ({hasAttribute: a => a === 'data-jump', dataset: {jump: '99'}})}});
    handlers.click({target: {closest: () => ({hasAttribute: a => a === 'data-jump', dataset: {jump: '-1'}})}});

    // Out-of-bounds answer choice should be ignored
    handlers.change({target: {name: 'answer', value: '99'}});
    handlers.change({target: {name: 'answer', value: '-1'}});

    // Valid flag triggers save() with the sanitized state object
    handlers.change({target: {id: 'flagQuestion', checked: true}});
    const saved = JSON.parse(storage.get('discrete-lab-term-test-v1'));
    assert.equal(saved.extraField, undefined);
    assert.equal(saved.at, 0);
    assert.equal(saved.answers[0], null);
    assert.equal(saved.flags[0], true);
  } finally {
    for (const [k, v] of originals) {
      if (v === undefined) delete globalThis[k];
      else globalThis[k] = v;
    }
  }
});

test('HTML pages enforce strict CSP without invalid meta directives and external links use noopener noreferrer', () => {
  for (const htmlFile of ['index.html', 'paper.html', 'sets.html', 'term-test.html']) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    assert.match(html, /http-equiv="Content-Security-Policy"/);
    assert.doesNotMatch(html, /unsafe-inline|unsafe-eval|frame-ancestors|X-Content-Type-Options/);
  }
  for (const jsFile of ['app.js', 'paper.js']) {
    const src = fs.readFileSync(jsFile, 'utf8');
    for (const match of src.matchAll(/<a\s+[^>]*href="https:\/\/[^"]+"[^>]*>/g)) {
      assert.match(match[0], /rel="noopener noreferrer"/, `${jsFile}: ${match[0]}`);
    }
  }
});
