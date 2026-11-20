// Run with Node 22+ and Python 3: node --test tests/python-checks.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {setProblem, readSet} from '../set-expression.js';
import {generate,subjects,levels} from '../generator.js';
import {topics} from '../lessons.js';
import {questions} from '../paper-questions.js';
import {workspacePython} from '../workspace-python.js';
import {paperPython} from '../paper-python.js';

const definitions = {A:'1,2,3,red',B:'{2, red, 4}',C:'1',U:'1,2,3,4,5,red'};
test('set operations, grouping, validation and order-independent answers', () => {
  const cases = [
    ['A n B',[2,'red']], ['(A u B) - C',[2,3,4,'red']], ["(A ∪ B)'",[5]],
    ['A ^ B',[1,3,4]], ['A n {2, 5}',[2]], ['∅ ∪ C',[1]],
    ['(A - B)ᶜ', [2,4,5,'red']], ['A n (B u C)',[1,2,'red']],
    ['U - U',[]],['A ∖ B ∩ C',[1]],
  ];
  for (const [source,answer] of cases) assert.deepEqual(setProblem(definitions,source).value,new Set(answer));
  assert.deepEqual(setProblem({A:'10',B:'10'},'A n B').value,new Set([10]));
  assert.throws(()=>setProblem({A:'10'},"A'"),/universe/);
  assert.deepEqual(readSet('{3, 2, 2}'),new Set([2,3]));
  assert.deepEqual(readSet('∅'),new Set());
  for (const source of ['', 'A @ B','A n', 'A B', '(A n B', '{100}', 'A)']) {
    assert.throws(()=>setProblem(definitions,source), undefined, source);
  }
  assert.throws(()=>setProblem({...definitions,U:'1,2'},'A n B'));
});
test('Python snippets run; generated calculations match the answer key for each instance', () => {
  const checks = [];
  for (const subject of subjects) for (const level of levels) {
    const deck = generate({subject,level,count:12,seed:'python-checks'});
    for (const q of deck) {
      checks.push({label:q.title, code:q.python, expected:q.type==='number'?Number(q.answer):q.answers.filter(x=>x!=='∅').sort()});
    }
  }
  for (const topic of topics) for (const q of topic.questions) checks.push({label:q.title,code:workspacePython(q)});
  for (const q of questions) for (const variant of [false,true]) checks.push({label:q.id,code:paperPython(q.id,variant)});
  checks.push({label:'empty custom answer',code:setProblem(definitions,'A ∩ ∅').code,expected:[]});
  const harness = `import json, sys
for item in json.load(sys.stdin):
    output = []
    try:
        exec(item["code"], {"print": lambda *args, **kwargs: output.append(args)})
        assert output
        if "expected" in item:
            value = output[-1][0]
            if isinstance(value, set):
                value = sorted(map(str, value))
            assert value == item["expected"], (value, item["expected"])
    except Exception as exc:
        raise AssertionError((item["label"], item["code"])) from exc`;
  const proc=spawnSync('python3',['-c',harness],{input:JSON.stringify(checks),encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
});
