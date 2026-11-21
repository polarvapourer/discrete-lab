import {esc} from './diagrams.js';
import {makePaper,paperVersion} from './term-questions.js';

const key = 'discrete-lab-term-test-v'+paperVersion;
const view = document.getElementById('examView');
const size = 20, logicCount = 14;
let storageAvailable = true;
function read() {
  if (!storageAvailable) return null;
  try {
    const s=JSON.parse(localStorage.getItem(key));
    if (s && Number.isSafeInteger(s.seed) && s.seed>=0 && s.seed<=0xffffffff &&
      Number.isFinite(s.deadline) && Number.isInteger(s.minutes) && s.minutes>0 && s.minutes<=240 &&
      Number.isInteger(s.at) && s.at>=0 && s.at<size &&
      Array.isArray(s.answers) && s.answers.length===size && s.answers.every(x=>x===null || (Number.isInteger(x)&&x>=0&&x<4)) &&
      Array.isArray(s.flags) && s.flags.length===size && s.flags.every(x=>typeof x==='boolean') &&
      ['active','submitted','expired'].includes(s.phase)) return s;
  } catch { /* A browser with storage disabled can still run a paper. */ }
  return null;
}
let state=read(), paper=state?makePaper(state.seed):[], confirming=false, configuring=!state;
function save() {
  try {localStorage.setItem(key, JSON.stringify(state));}
  catch {storageAvailable=false;}
}
function focusTitle() {view.querySelector('[data-title]')?.focus();}
function expiry() {
  if (!state || state.phase!=='active' || Date.now()<state.deadline) return false;
  state.phase='expired';confirming=false;configuring=false;save();return true;
}
function clock() {
  if (expiry()) {render(true);return;}
  const el=document.getElementById('examTime');
  if (!el || !state) return;
  const seconds=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  el.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function intro() {
  return `<section class="exam-intro"><span class="kicker">ECS407U · Weeks 1–9</span>
    <h1 data-title tabindex="-1">End-of-term practice paper</h1>
    <p>Generate your own paper with 14 logic questions and six discrete structures questions. Select your answers online, then review the reasoning after you finish.</p></section>
    <div class="exam-layout"><section class="exam-card"><h2>Generate a practice paper</h2>
    <p>Work through truth tables, equivalence, counterexamples and box proofs, followed by sets, relations, functions, graphs, trees and directed graphs. Each practice question has one correct choice.</p>
    <form id="startExam"><label for="examMinutes"><strong>Time allowance in minutes</strong></label>
    <input id="examMinutes" name="minutes" type="number" min="1" max="240" step="1" required value="${state?.minutes??50}" aria-describedby="extraTime">
    <p id="extraTime">The standard test is 50 minutes. If you have approved extra time, enter your total allowance here.</p>
    <button class="primary" type="submit">Generate practice paper</button>
    ${state?'<button class="secondary" type="button" data-act="results">Back to my results</button>':''}</form>
    <p>The timer starts when you generate the paper. Reopening this tab resumes the timer. Generating another paper replaces your previous results on this browser.</p></section>
    <aside class="notes"><div class="notetitle">Test conditions</div><p>Thursday 26 November 2026, in your allocated lab slot. The term test counts for 50% of the module mark.</p><p>Closed book except for one A4 notes/formula sheet. Use pen and paper for working. Jape, truth-table software and AI tools are prohibited. Select answers online. Handwritten proofs are not submitted for marking.</p>
    <p>These are original practice questions covering teaching through Week 9 (19 November). Week 10 is for consolidation.</p></aside></div>`;
}
function problem(q) {
  const proof=q.proof.length?'<ol class="exam-proof" aria-label="Numbered box proof">'+q.proof.map((line,i)=>
    '<li><span>'+ (i+1) +'</span><span class="'+(line.depth?'inside':'')+(line.start?' starts':'')+'">'+esc(line.formula)+'</span><small>'+esc(line.reason)+'</small></li>').join('')+'</ol>':'';
  return (q.data?'<p class="exam-given">'+esc(q.data)+'</p>':'')+proof;
}
const countAnswers = () => state.answers.filter(x=>x!==null).length;
function statusBar() {
  return '<div class="exam-meta"><strong>End-of-term practice paper</strong><span>Time left <span role="timer" class="exam-clock" id="examTime"></span></span></div>';
}
function navButton(i) {
  const answered=state.answers[i]!==null, flagged=state.flags[i];
  return `<button type="button" class="${answered?'answered':''} ${flagged?'flagged':''}" data-jump="${i}" aria-label="Question ${i+1}, ${answered?'answered':'unanswered'}${flagged?', flagged':''}" ${i===state.at?'aria-current="step"':''}>${i+1}${flagged?'*':''}</button>`;
}
function active() {
  if(confirming) return statusBar()+`<section class="exam-card"><h2 data-title tabindex="-1">Submit your paper?</h2><p>You have answered ${countAnswers()} of 20 questions. ${size-countAnswers()} unanswered · ${state.flags.filter(Boolean).length} flagged. Submitting ends this attempt and opens the explanations.</p><div class="actions"><button class="primary" data-act="submit">Submit paper</button><button class="secondary" data-act="back">Keep working</button></div></section>`;
  const i=state.at,q=paper[i];
  return statusBar()+`<div class="exam-layout"><section class="exam-card">
    <span class="kicker">${i<logicCount?'Logic':'Discrete structures'} · Question ${i+1} of 20</span>
    <h2 data-title tabindex="-1">${esc(q.prompt)}</h2>${problem(q)}
    <fieldset><legend>Select one answer</legend>${q.choices.map((choice,j)=>`<label class="exam-option"><input name="answer" type="radio" value="${j}" ${state.answers[i]===j?'checked':''}><span>${esc(choice)}</span></label>`).join('')}</fieldset>
    <label><input type="checkbox" id="flagQuestion" ${state.flags[i]?'checked':''}> Flag for review</label>
    <div class="genpaging"><button class="secondary" data-act="prev" ${i===0?'disabled':''}>Previous</button>${i===size-1?'<button class="primary" data-act="finish">Finish paper</button>':'<button class="primary" data-act="next">Next question</button>'}</div></section>
    <aside class="exam-card"><h3>Your paper</h3><p id="answeredCount">${countAnswers()} of 20 answered</p><div id="examNav" class="exam-index">${paper.map((_,j)=>navButton(j)).join('')}</div>
    <p>Shaded numbers are answered. An asterisk marks a flagged question.</p><button class="secondary" data-act="finish">Finish and review</button>
    ${storageAvailable?'':'<p>This browser cannot save your attempt. Keep this tab open.</p>'}</aside></div>`;
}
function results() {
  const correct=paper.map((q,i)=>q.answer===state.answers[i]),score=correct.filter(Boolean).length;
  const logic=correct.slice(0,logicCount).filter(Boolean).length;
  const missed=paper.map((_,i)=>i).filter(i=>!correct[i]);
  function review(q,i) {
    const answer=state.answers[i];const result=correct[i]?'Correct':answer===null?'Unanswered':'Incorrect';
    return `<details class="exam-card exam-review" ${!correct[i]?'open':''}><summary><strong>Q${i+1} · ${result}</strong> · ${esc(q.topic)}</summary>
      <h3>${esc(q.prompt)}</h3>${problem(q)}
      <p><strong>Your answer</strong> · ${answer===null?'Unanswered':esc(q.choices[answer])}</p>
      ${correct[i]?'':'<p><strong>Correct answer</strong> · '+esc(q.choices[q.answer])+'</p>'}
      <p><strong>Reasoning</strong> · ${esc(q.explanation)}</p><p class="reading">${esc(q.reading)}</p></details>`;
  }
  return `<section class="exam-intro"><span class="kicker">${state.phase==='expired'?'Time is up':'Paper submitted'}</span><h1 data-title tabindex="-1">${score} / 20</h1>
    <p>Logic ${logic}/14 · Discrete structures ${score-logic}/6. Each practice question is worth one point. Unanswered questions score zero.</p></section>
    <div class="sectionhead"><h2>Review your paper</h2><button class="primary" data-act="new">Generate another paper</button></div>
    <p>${missed.length?'Review the reasoning for the questions you missed first. Correct answers are grouped below.':'You answered every question correctly. Open a question to review its reasoning.'}</p>
    ${missed.map(i=>review(paper[i],i)).join('')}${paper.map((q,i)=>correct[i]?review(q,i):'').join('')}
    <p>Optional reading for logic: Huth and Ryan, <i>Logic in Computer Science</i>, chapter 1 on propositional logic.</p>`;
}
function render(focus=false) {
  expiry();
  view.innerHTML=configuring?intro():state.phase==='active'?active():results();
  clock();if(focus)focusTitle();
}
function sync() {
  const latest=read();
  if(latest && JSON.stringify(latest)!==JSON.stringify(state)){
    const changedPaper=latest.seed!==state?.seed;
    state=latest;if(changedPaper)paper=makePaper(state.seed);
    confirming=false;configuring=false;render();return false;
  }
  if(expiry()){render(true);return false;}
  return true;
}
view.addEventListener('submit',event=>{
  if(event.target.id!=='startExam')return;
  event.preventDefault();if(!sync()||state?.phase==='active')return;
  const minutes=Number(new FormData(event.target).get('minutes'));
  if(!Number.isInteger(minutes)||minutes<1||minutes>240)return;
  let seed=crypto.getRandomValues(new Uint32Array(1))[0];
  if(seed===state?.seed)seed=(seed+1)>>>0;
  paper=makePaper(seed);
  state={seed,minutes,deadline:Date.now()+minutes*60000,phase:'active',at:0,answers:Array(size).fill(null),flags:Array(size).fill(false)};
  confirming=false;configuring=false;save();render(true);
});
view.addEventListener('change',event=>{
  if(!state||state.phase!=='active'||!sync())return;
  if(event.target.name==='answer') state.answers[state.at]=Number(event.target.value);
  else if(event.target.id==='flagQuestion')state.flags[state.at]=event.target.checked;
  else return;
  save();document.getElementById('answeredCount').textContent=countAnswers()+' of 20 answered';
  document.getElementById('examNav').children[state.at].outerHTML=navButton(state.at);
});
view.addEventListener('click',event=>{
  const button=event.target.closest('[data-act],[data-jump]');
  if(!button||!state||!sync())return;
  const act=button.dataset.act;
  if(state.phase!=='active'){
    if(act==='new'||act==='results'){configuring=act==='new';render(true);}
    return;
  }
  if(act==='finish')confirming=true;
  else if(act==='back')confirming=false;
  else if(act==='submit'&&confirming){state.phase='submitted';confirming=false;}
  else if(act==='next')state.at=Math.min(size-1,state.at+1);
  else if(act==='prev')state.at=Math.max(0,state.at-1);
  else if(button.hasAttribute('data-jump'))state.at=Number(button.dataset.jump);
  else return;
  save();render(true);
});
window.addEventListener('storage',event=>{if(event.key===key)sync();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync();clock();}});
render();
setInterval(clock,500);
