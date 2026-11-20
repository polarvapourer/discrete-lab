import {pythonPanel} from './python-panel.js';
import {workspacePython} from './workspace-python.js';
import {guidanceCheckbox, guidanceEnabled, saveGuidance} from './guided.js';
import {wireGenerator,generatorView,openGeneratorSetup,hasSharedSet,stopPlayback} from './practice-set.js?v=sets-2';
import {topics} from './lessons.js';
import {esc,icon,figure} from './diagrams.js';
import {explore,changeExplore} from './explore.js?v=sets-2';
const $=id=>document.getElementById(id);
const app=$('app'), modal=$('modal'), key='discrete-lab-progress-v1';
let topic=0, position=topics.map(()=>0),mode='practice',page=hasSharedSet?'generator':'workspace';
let guided = guidanceEnabled();
const attempts=new Map(),allIds=topics.flatMap((t,i)=>t.questions.map((_,j)=>i+'-'+j));
let solved=new Set();
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))solved=new Set(saved.filter(id=>allIds.includes(id)));}catch{}
const id=()=>topic+'-'+position[topic];
const t=()=>topics[topic];
const q=()=>t().questions[position[topic]];
function attempt(){if(!attempts.has(id()))attempts.set(id(),{picks:[],hint:false,feedback:'',good:false,reveal:false});return attempts.get(id());}
function save(){try{localStorage.setItem(key,JSON.stringify([...solved]));}catch{}}
const pad=n=>String(n).padStart(2,'0');
function header(){ $('generate').setAttribute('aria-current',page==='generator'?'page':'false'); $('total').textContent=solved.size+' / '+allIds.length+' solved';$('practice').setAttribute('aria-current',page==='workspace'?'page':'false');$('guide').setAttribute('aria-current',page==='guide'?'page':'false');}
function tabs(){return '<div class="tabs" role="group" aria-label="Choose topic">'+topics.map((v,i)=>`<button class="tab ${topic===i?'active':''}" data-topic="${i}" aria-pressed="${topic===i}"><span class="iconbox">${icon(v.icon)}</span>${v.name}<small>Wk ${v.week}</small></button>`).join('')+'</div>';}
function notes(){const n=t().notes[q().note];return `<div class="notes"><div class="notetitle">${icon('book')} Field notes</div><h3>${esc(n[0])}</h3><div class="formula">${esc(n[1])}</div><p>${esc(n[2])}</p><button class="guidebtn" data-guide>${icon('guide')} Open topic guide</button></div>`;}
function library(){return `<div class="library"><div class="libhead"><h3>Exercise list</h3><small>${t().questions.length} exercises</small></div>${t().questions.map((v,i)=>`<button class="qrow ${position[topic]===i&&mode==='practice'?'active':''}" data-question="${i}"><span class="qnum">${pad(i+1)}</span>${esc(v.title)}<span class="qstate" aria-label="${solved.has(topic+'-'+i)?'solved':'unsolved'}">${solved.has(topic+'-'+i)?'✓':'○'}</span></button>`).join('')}</div>`;}
function exercise(){const x=q(),a=attempt(),many=x.correct.length>1;
 return `<section class="panel"><div class="panelhead"><span class="kicker">${icon('pencil')} Guided exercise</span><div class="practice-controls">${guidanceCheckbox(guided)}<span class="counter">${pad(position[topic]+1)} / ${pad(t().questions.length)}</span></div></div><div class="panelbody">
 <h2 id="questionTitle" tabindex="-1">${esc(x.title)}</h2><p class="prompt">${esc(x.prompt)}</p>
 <div id="diagram">${figure(x.figure,a.picks.map(i=>i+1))}</div>
 ${guided && !a.good ? '<p class="message"><b>Where to start.</b> '+esc(x.hint)+'</p>' : ''}
 <div class="answerlabel" id="answerLabel">${many?'Select all that apply':'Choose one answer'}</div><div class="choices" role="group" aria-labelledby="answerLabel">${x.choices.map((v,i)=>`<button class="choice" data-pick="${i}" aria-pressed="${a.picks.includes(i)}">${esc(v)}</button>`).join('')}</div>
 <div class="actions"><button class="primary" data-check>Check answer</button>${guided ? '' : '<button class="secondary" data-hint aria-expanded="'+a.hint+'">Hint</button>'}<button class="ghost" data-solution aria-expanded="${a.reveal}">${a.reveal?'Hide solution':'Show solution'}</button></div>
 <div id="feedback" aria-live="polite">${a.feedback?`<p class="message ${a.good?'good':''}">${esc(a.feedback)}</p>`:''}</div>
 ${a.hint&&!guided?'<p class="message"><b>Hint.</b> '+esc(x.hint)+'</p>':''}
 ${a.reveal?'<p class="message"><b>Worked solution.</b> '+esc(x.solution)+'</p>':''}
 ${pythonPanel(workspacePython(x))}
 ${a.good||a.reveal?'<div class="actions"><button class="secondary" data-next>'+(position[topic]+1<t().questions.length?'Next exercise':topic+1<topics.length?'Next topic':'View progress')+'</button></div>':''}
 </div></section>`;}
function guide(){return `<section class="guide"><div class="guidecard"><span class="smallcap">Week ${t().week} · Study guide</span><h2 style="margin:10px 0 14px">${t().heading}</h2>${t().notes.map((n,i)=>`<details ${q().note===i?'open':''}><summary>${esc(n[0])}</summary><div class="formula">${esc(n[1])}</div><p>${esc(n[2])}</p></details>`).join('')}<h3>Where to read</h3><p>${esc(t().reading)}</p><div class="actions"><button class="primary" data-work>Practise ${t().name.toLowerCase()}</button></div></div><p>For the logic part of ECS407U, use the lecturer’s <a href="https://sr123.github.io/box-proofs/">Box proofs workspace</a>.</p></section>`;}
function render(focus){
 header();if(page==='generator'){app.innerHTML=generatorView(render,guided);if(focus)app.querySelector(focus)?.focus({preventScroll:true});return;}stopPlayback();app.innerHTML=tabs()+(page==='guide'?guide():`<div class="sectionhead"><h2>${t().heading}</h2><div class="minitabs" role="group" aria-label="Workspace mode">${['practice','explore'].map(k=>`<button class="${k===mode?'selected':''}" data-mode="${k}" aria-pressed="${k===mode}">${k==='practice'?'Practice':'Explore'}</button>`).join('')}</div></div><div class="workspace">${mode==='practice'?exercise():explore(topic)}<aside>${notes()}${library()}</aside></div>`);
 if(focus)app.querySelector(focus)?.focus({preventScroll:true});
}
function progress(){ $('modalTitle').textContent='Your progress';$('modalBody').innerHTML='<p class="modalcopy">Exercises you have answered correctly on this browser.</p>'+topics.map((t,i)=>{const n=t.questions.filter((_,j)=>solved.has(i+'-'+j)).length;return `<div class="prow"><strong>${t.name}</strong><span>${n} of ${t.questions.length}</span></div><div class="progressfill"><i style="width:${100*n/t.questions.length}%"></i></div>`;}).join('');modal.showModal();}
function clearSharedURL(){if(location.search)history.replaceState(null,'',location.pathname);}
function openWorkspace(){clearSharedURL();page='workspace';mode='practice';render();}
function goQuestion(i){position[topic]=i;page='workspace';mode='practice';render('#questionTitle');$('questionTitle')?.scrollIntoView({block:'nearest'});}
function check(){const a=attempt(),x=q(),extra=a.picks.find(i=>!x.correct.includes(i));
 a.good=false;
 if(!a.picks.length)a.feedback='Choose an answer first, then check it.';
 else if(extra!==undefined){
  if(x.figure.type==='venn'){const n=extra+1;const region=n<=2?'only in A':n<=4?'in both A and B':n<=6?'only in B':'outside both sets';a.feedback=n+' is '+region+'. Check whether that matches the operation.';}
  else a.feedback='Recheck “'+x.choices[extra]+'”. '+x.hint;
 }else if(a.picks.length<x.correct.length)a.feedback='Every selection so far is correct. There is at least one more to include.';
 else {a.good=true;a.feedback='Correct. '+x.solution;solved.add(id());save();}
 render('[data-check]');
}
app.addEventListener('click',e=>{
 const diagramPick=e.target.closest('[data-venn]');
 if(diagramPick&&page!=='generator'){app.querySelector('[data-pick="'+(Number(diagramPick.dataset.venn)-1)+'"]').click();return;}
 const b=e.target.closest('button');if(!b)return;
 const d=b.dataset;
 if('topic'in d){topic=Number(d.topic);render('[data-topic="'+topic+'"]');}
 else if('question'in d)goQuestion(Number(d.question));
 else if('mode'in d){mode=d.mode;render('[data-mode="'+mode+'"]');}
 else if('pick'in d){const a=attempt(),i=Number(d.pick);a.picks=a.picks.includes(i)?a.picks.filter(x=>x!==i):q().correct.length===1?[i]:[...a.picks,i];a.feedback='';a.good=false;render('[data-pick="'+i+'"]');}
 else if('check'in d)check();
 else if('hint'in d){attempt().hint=!attempt().hint;render('[data-hint]');}
 else if('solution'in d){attempt().reveal=!attempt().reveal;render('[data-solution]');}
 else if('next'in d){if(position[topic]+1<t().questions.length)goQuestion(position[topic]+1);else if(topic+1<topics.length){topic++;goQuestion(0);}else progress();}
 else if('guide'in d){page='guide';render();document.querySelector('.guide').scrollIntoView({block:'start'});}
 else if('work'in d)openWorkspace();
 else if('pair'in d){changeExplore('pair',d.pair);render('[data-pair="'+d.pair+'"]');}
});
app.addEventListener('change',e=>{const c=e.target;
 if(c.hasAttribute('data-guided')){
  guided=c.checked;
  saveGuidance(guided);
  render('[data-guided]');
  return;
 }
 if(!c.dataset.field)return;changeExplore(c.dataset.field,c.value,c.checked);const s='[data-field="'+c.dataset.field+'"]'+(c.type==='checkbox'&&c.hasAttribute('value')?'[value="'+c.value+'"]':'');render(s);});
$('progress').onclick=progress;$('close').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal&&!(e.clientX>=modal.getBoundingClientRect().left&&e.clientX<=modal.getBoundingClientRect().right&&e.clientY>=modal.getBoundingClientRect().top&&e.clientY<=modal.getBoundingClientRect().bottom))modal.close();});
wireGenerator(app);
$('generate').addEventListener('click',event=>{
 if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 openGeneratorSetup();
 page='generator';
 render();
 const target=event.currentTarget.href;
 if(location.href!==target)history.pushState(null,'',target);
 $('generatorTitle').focus();
 event.preventDefault();
});
window.addEventListener('popstate',()=>location.reload());
$('guide').onclick=()=>{clearSharedURL();page='guide';render();};$('practice').onclick=openWorkspace;
render();
