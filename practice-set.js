import {defaultConfig,subjects,levels,generate,VERSION,configOK} from './generator.js';
import {figure,esc,icon} from './diagrams.js';
import {guidanceCheckbox, guidanceEnabled} from './guided.js';
const prefix='discrete-generated-v'+VERSION;
const saved=(k)=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
const persist=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
const configKey=c=>JSON.stringify([c.subject,c.level,c.count,c.seed]);
const blank=()=>({picks:[],input:'',solved:false,feedback:'',hint:false,steps:0,open:false});
let cfg, deck=[],index=0,attempts=[],setup=false,notice='',pending=null,playing=null,formDraft=null;
let refresh=()=>{};
export const stopPlayback=()=>{if(playing)clearInterval(playing);playing=null;};
function save(){if(cfg)persist(prefix+configKey(cfg),{index,attempts});}
function load(c,position){
 const generated=generate(c),old=saved(prefix+configKey(c));
 stopPlayback();cfg=c;deck=generated;attempts=deck.map((_,i)=>({...blank(),...old?.attempts?.[i]}));index=Math.max(0,Math.min(deck.length-1,Number.isInteger(position)?position:old?.index||0));setup=false;pending=null;notice='';formDraft=null;persist(prefix+'-last',c);save();
}
const params=new URLSearchParams(location.search);
let linked=false;
if(params.get('gen')===String(VERSION)){const c={subject:params.get('topic'),level:params.get('level'),count:Number(params.get('n')),seed:params.get('seed')};if(configOK(c)){load(c,(Number(params.get('q'))||1)-1);linked=true;}}
if(!cfg){const c=saved(prefix+'-last');if(configOK(c))load(c);}
export const hasSharedSet=linked||params.get('generator')==='1';

export function openGeneratorSetup(){
 stopPlayback();
 setup=true;
 formDraft=null;
 pending=null;
 notice='';
}

if(!linked && params.get('generator')==='1')openGeneratorSetup();
function shareURL(at){const u=new URL(location.href);u.search='';u.hash='';for(const [k,v] of Object.entries({gen:VERSION,topic:cfg.subject,level:cfg.level,n:cfg.count,seed:cfg.seed,q:at+1}))u.searchParams.set(k,v);return u.href;}
function syncUrl(){if(cfg)history.replaceState(null,'',shareURL(index));}
function nativeSeed(){return Array.from(crypto.getRandomValues(new Uint32Array(2)),x=>x.toString(36)).join('-');}
function optionList(values,v){return values.map(x=>'<option '+(x===v?'selected':'')+'>'+esc(x)+'</option>').join('');}
function form(){const d=formDraft??(cfg?{...cfg,seed:''}:defaultConfig);
 return `<form id="generatorForm" class="generatorform"><h2 tabindex="-1" id="generatorTitle">Generate a practice set</h2><p class="prompt">Choose what to practise. Leave the seed blank for a fresh set.</p><div class="formgrid"><label>Topic<select name="subject">${optionList(['Mixed revision',...subjects],d.subject)}</select></label><label>Difficulty<select name="level">${optionList(['Mixed difficulty',...levels],d.level)}</select></label><label>Number of questions<input required type="number" name="count" value="${esc(d.count)}" min="1" max="100" step="1"></label><label>Seed <span>(optional)</span><input name="seed" maxlength="64" value="${esc(d.seed)}" placeholder="Random"></label></div><div class="actions"><button class="primary" type="submit">Generate questions</button>${cfg?'<button type="button" class="secondary" data-gen="cancelsetup">Back to my set</button>':''}</div></form>`;}
function navigation(){return `<div class="library genlist"><div class="libhead"><h3>Your questions</h3><small>${attempts.filter(a=>a.solved).length} / ${deck.length} solved</small></div><div class="listbody">${deck.map((q,i)=>`<button class="qrow ${i===index?'active':''}" data-jump="${i}"><span class="qnum">${i+1}</span>${esc(q.title)}<span class="qstate" aria-label="${attempts[i].solved?'solved':'unsolved'}">${attempts[i].solved?'✓':'○'}</span></button>`).join('')}</div></div>`;}
function model(q,a){if(!a.open)return '';return `<section class="model"><span class="smallcap">Model solution · ${a.steps} / ${q.steps.length}</span><ol>${q.steps.slice(0,a.steps).map(s=>'<li>'+esc(s)+'</li>').join('')}</ol><div class="actions"><button class="secondary" data-gen="backstep" ${a.steps<=1?'disabled':''}>Previous step</button><button class="secondary" data-gen="step" ${a.steps>=q.steps.length?'disabled':''}>Next step</button><button class="ghost" data-gen="play" ${!playing&&a.steps>=q.steps.length?'disabled':''}>${playing?'Pause':'Play'}</button><button class="ghost" data-gen="restart">Restart</button><button class="ghost" data-gen="full">Show all steps</button></div></section>`;}
function question(guided){const q=deck[index],a=attempts[index],picked=a.picks.map(Number).filter(Number.isFinite);
 const controls=q.type==='number'?`<label class="answerlabel" for="generatedAnswer">Your answer</label><input id="generatedAnswer" class="numanswer" type="text" inputmode="text" autocomplete="off" placeholder="Enter a whole number" value="${esc(a.input)}">`:`<div class="answerlabel">Select all that apply</div><div class="choices">${q.choices.map(v=>`<button class="choice" data-gpick="${esc(v)}" aria-pressed="${a.picks.includes(v)}">${esc(v)}</button>`).join('')}</div>`;
 return `<section class="panel"><div class="panelhead"><span class="kicker">${icon('pencil')} ${esc(q.subject)} · ${esc(q.level)}</span><div class="practice-controls">${guidanceCheckbox(guided)}<span class="counter">${index+1} / ${deck.length}</span></div></div><div class="panelbody"><h2 tabindex="-1" id="genQuestion">${esc(q.title)}</h2><p class="prompt">${esc(q.prompt)}</p>${figure(q.figure,picked)}
 ${guided ? '<p class="message"><b>Where to start.</b> '+esc(q.steps[0])+'</p>' : ''}
 ${controls}<div class="actions"><button class="primary" data-gen="check">Check answer</button><button class="secondary" data-gen="hint" aria-expanded="${a.hint}">${guided?'Next hint':'Hint'}</button><button class="ghost" data-gen="model" aria-expanded="${a.open}">${a.open?'Hide model solution':'Show model solution'}</button></div><div aria-live="polite">${a.feedback?'<p class="message '+(a.feedback.startsWith('Correct.')?'good':'')+'">'+esc(a.feedback)+'</p>':''}</div>${a.hint?'<p class="message"><b>Hint.</b> '+esc(q.steps[guided?1:0])+'</p>':''}${model(q,a)}<div class="genpaging"><button class="secondary" data-gen="prev" ${index===0?'disabled':''}>Previous question</button><button class="secondary" data-gen="next" ${index+1===deck.length?'disabled':''}>Next question</button></div></div></section>`;}
export function generatorView(redraw, guided=guidanceEnabled()){
 refresh=redraw;
 if(!cfg||setup){const confirm=pending?`<div class="message">Open the new set? Your current set can be reopened with its seed.<div class="actions"><button class="primary" data-gen="confirm">Open new set</button><button class="secondary" data-gen="keep">Keep working</button></div></div>`:'';
 return '<div class="workspace"><div class="panel"><div class="panelhead"><span class="kicker">'+icon('pencil')+' Question generator</span></div><div class="panelbody">'+form()+confirm+(notice?'<p class="message" role="alert">'+esc(notice)+'</p>':'')+'</div></div><aside class="notes"><div class="notetitle">'+icon('book')+' How it works</div><h3>Mixed revision</h3><p>Topics rotate across sets, relations, functions and graphs. Mixed difficulty starts with shorter questions and moves on to ones with more steps.</p><h3>Practise together</h3><p>Share a seed and settings to get the same questions. Each student keeps their own answers and progress in their browser.</p></aside></div>';}
 return `<div class="sectionhead"><h2>Generated practice</h2><button class="secondary" data-gen="setup">Generate another set</button></div><div class="workspace">${question(guided)}<aside><div class="notes"><div class="notetitle">${icon('book')} Practice set</div><p style="margin-top:12px">${esc(cfg.subject)} · ${esc(cfg.level)}</p><p class="seed">Seed <code>${esc(cfg.seed)}</code></p><div class="switcher"><button data-gen="share">Copy question link</button><button data-gen="shareset">Copy set link</button></div><div class="switcher"><button data-gen="print">Print questions</button><button data-gen="answers">Print solutions</button></div><p id="shareStatus" aria-live="polite">${esc(notice)}</p></div>${navigation()}</aside></div>`;
}
function jump(i){stopPlayback();index=i;notice='';save();syncUrl();refresh();document.getElementById('genQuestion')?.focus({preventScroll:true});document.getElementById('genQuestion')?.scrollIntoView({block:'nearest'});}
function accept(c){
 try { load(c,0); }
 catch(error){
  pending=null;
  setup=true;
  formDraft=c;
  notice=error.message || 'The set could not be generated. Try another seed.';
  refresh();
  return;
 }
 syncUrl();
 refresh();
 document.getElementById('genQuestion')?.focus({preventScroll:true});
}
function togglePick(v){const a=attempts[index];if(a.picks.includes(v))a.picks=a.picks.filter(k=>k!==v);else if(v==='∅')a.picks=['∅'];else a.picks=[...a.picks.filter(x=>x!=='∅'),v];a.feedback='';}
function check(){const q=deck[index],a=attempts[index];let correct=false;
 if(q.type==='number'){
  const raw=a.input.trim();
  if(!/^[+−-]?\d+$/.test(raw)){a.feedback='Enter a whole number first.';return;}
  correct=Number(raw.replace('−','-'))===Number(q.answer);
  if(!correct)a.feedback='Try that calculation again. '+q.steps[0];
 }else{
  if(a.picks.length===0){a.feedback='Select an answer first.';return;}
  const extra=a.picks.find(v=>!q.answers.includes(v));correct=!extra&&a.picks.length===q.answers.length;
  if(!correct)a.feedback=extra?'Recheck '+extra+'. '+q.steps[0]:'Your selections are correct so far. At least one more belongs in the answer.';
 }
 if(correct){a.solved=true;a.feedback='Correct. '+q.steps.at(-1);}
}
function printSet(solutions){const el=document.createElement('section');el.id='printset';el.innerHTML='<h1>Discrete Lab · '+(solutions?'Worked solutions':'Practice questions')+'</h1><p>'+esc(cfg.subject)+' · '+esc(cfg.level)+' · Seed '+esc(cfg.seed)+'</p>'+deck.map((q,i)=>'<article><h2>'+(i+1)+'. '+esc(q.title)+'</h2><p>'+esc(q.prompt)+'</p>'+figure(q.figure)+(q.type==='selection'?'<p>Options: '+q.choices.map(esc).join(' · ')+'</p>':'')+(solutions?'<ol>'+q.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>':'<p>Answer: _____________________________________</p>')+'</article>').join('');document.body.append(el);window.addEventListener('afterprint',()=>el.remove(),{once:true});window.print();}
export function wireGenerator(root){
 root.addEventListener('submit',e=>{if(e.target.id!=='generatorForm')return;e.preventDefault();const fd=new FormData(e.target),c={subject:fd.get('subject'),level:fd.get('level'),count:Number(fd.get('count')),seed:fd.get('seed').trim()||nativeSeed()};if(!configOK(c))return;
 if(cfg&&configKey(cfg)!==configKey(c)){pending=c;formDraft=c;refresh();}else accept(c);});
 root.addEventListener('input',e=>{if(e.target.id==='generatedAnswer'){attempts[index].input=e.target.value;attempts[index].feedback='';root.querySelector('[aria-live="polite"] .message')?.remove();save();}});
 root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='generatedAnswer'){e.preventDefault();root.querySelector('[data-gen="check"]').click();}});
 root.addEventListener('click',async e=>{const b=e.target.closest('button,[data-venn]');if(!b)return;
 if(b.hasAttribute('data-venn')&&document.getElementById('genQuestion')){root.querySelector('[data-gpick="'+b.dataset.venn+'"]')?.click();return;}
 if(b.hasAttribute('data-jump')){jump(Number(b.dataset.jump));return;}
 if(b.hasAttribute('data-gpick')){togglePick(b.dataset.gpick);save();refresh();root.querySelector('[data-gpick="'+b.dataset.gpick+'"]').focus({preventScroll:true});return;}
 const k=b.dataset.gen;if(!k)return;const a=attempts[index],q=deck[index];if(k!=='play')stopPlayback();
 if(k==='setup'){setup=true;formDraft=null;pending=null;}
 else if(k==='keep'||k==='cancelsetup'){setup=false;pending=null;notice='';syncUrl();}
 else if(k==='confirm'){accept(pending);return;}
 else if(k==='prev'||k==='next'){jump(index+(k==='next'?1:-1));return;}
 else if(k==='check')check();
 else if(k==='hint')a.hint=!a.hint;
 else if(k==='model'){a.open=!a.open;if(a.open&&a.steps===0)a.steps=1;}
 else if(k==='step')a.steps=Math.min(q.steps.length,a.steps+1);
 else if(k==='backstep')a.steps=Math.max(1,a.steps-1);
 else if(k==='restart')a.steps=1;
 else if(k==='full')a.steps=q.steps.length;
 else if(k==='play'){if(playing)stopPlayback();else playing=setInterval(()=>{a.steps++;if(a.steps>=q.steps.length)stopPlayback();save();refresh();},2000);}
 else if(k==='share'||k==='shareset'){const url=shareURL(k==='share'?index:0);try{await navigator.clipboard.writeText(url);notice='Link copied.';}catch{notice=url;}}
 else if(k==='print'||k==='answers'){printSet(k==='answers');return;}
 else return;
 save();refresh();root.querySelector('[data-gen="'+k+'"]')?.focus({preventScroll:true});});
}
