// Run with node --test tests/term-test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {makePaper} from '../term-questions.js';

test('every seed produces a repeatable 14 + 6 paper with one keyed option per item',()=>{
  const unique=new Set();
  const requiredLogic=['Truth tables','Equivalence','Counterexamples','Box proofs','Negation','Proof by cases','Classical reasoning'];
  const requiredDiscrete=['Sets','Relations','Functions','Graphs','Trees','Directed graphs'];
  for(let seed=0;seed<1500;seed++){
    const paper=makePaper(seed);
    assert.equal(paper.length,20);
    assert.deepEqual(new Set(paper.slice(0,14).map(q=>q.topic)),new Set(requiredLogic));
    assert.deepEqual(new Set(paper.slice(14).map(q=>q.topic)),new Set(requiredDiscrete));
    unique.add(JSON.stringify(paper));
    for(const q of paper){
      assert.equal(new Set(q.choices).size,4);
      assert.ok(q.answer>=0 && q.answer<4 && q.choices[q.answer]);
      assert.ok(q.explanation && q.reading && !q.choices.includes('undefined'));
      if(q.topic==='Functions' && q.data.startsWith('Domain')) {
        const values=[...q.data.matchAll(/(\d+) ↦ (\d+)/g)].map(m=>+m[2]);
        const size=Number(q.data.match(/codomain \{1, …, (\d+)\}/)[1]), outputs=new Set(values);
        assert.equal(q.choices[q.answer],outputs.size===values.length?(outputs.size===size?'Injective and surjective':'Injective only'):(outputs.size===size?'Surjective only':'Neither injective nor surjective'));
      }
    }
  }
  assert.equal(unique.size,1500);
  assert.deepEqual(makePaper(725),makePaper(725));
});

test('attempt resumes, feedback waits for submission, expiry locks answers and a second paper starts fresh',async()=>{
  const handlers={},storage=new Map(),navItems=Array.from({length:20},()=>({}));
  const elements={examView:{addEventListener:(k,v)=>{handlers[k]=v;},querySelector:()=>null},
    examTime:{},answeredCount:{},examNav:{children:navItems}};
  const view=elements.examView;
  const fakeDate=Date.now;
  let time=fakeDate(),tick;
  const globals={document:{getElementById:id=>elements[id],addEventListener(){}},window:{addEventListener(){}},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
    FormData:class { get(){return '50';} },setInterval:fn=>{tick=fn;}};
  const originals=new Map(Object.keys(globals).map(k=>[k,globalThis[k]]));
  const current=()=>JSON.parse([...storage.values()][0]);
  function start(){handlers.submit({target:{id:'startExam'},preventDefault(){}});}
  function click(act){handlers.click({target:{closest:()=>({dataset:{act}})}});}
  function answer(n){handlers.change({target:{name:'answer',value:String(n)}});}
  function hidden(){assert.doesNotMatch(view.innerHTML,/Correct answer|Reasoning<|exam-review|\/20 answered correctly/);}
  try{
    Object.assign(globalThis,globals);
    Date.now=()=>time;
    await import('../term-test.js?session=1');
    assert.match(view.innerHTML,/Generate practice paper/);
    start();
    const seed=current().seed;
    assert.equal(current().deadline,time+50*60000);
    answer(0);answer(2);click('next');answer(1);
    await import('../term-test.js?session=2');
    assert.equal(current().at,1);assert.deepEqual(current().answers.slice(0,2),[2,1]);hidden();
    click('finish');hidden();assert.match(view.innerHTML,/18 unanswered/);click('back');
    handlers.change({target:{id:'flagQuestion',checked:true}});
    assert.equal(current().flags[1],true);
    click('finish');click('submit');
    assert.match(view.innerHTML,/Review your paper/);assert.equal(current().phase,'submitted');
    assert.equal((view.innerHTML.match(/<strong>Reasoning/g)||[]).length,20);
    click('new');start();assert.notEqual(current().seed,seed);assert.ok(current().answers.every(x=>x===null));hidden();
    time+=50*60000+100;
    answer(3);tick();assert.equal(current().phase,'expired');assert.equal(current().answers[0],null);assert.match(view.innerHTML,/Time is up/);
  }finally{
    Date.now=fakeDate;
    for(const [k,v] of originals){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
  }
});
