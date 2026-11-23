import {pythonPanel} from './python-panel.js';
import {paperPython, proofNote} from './paper-python.js';
import {questions, topics, modelDiagram, reviewTips, variationAnswers} from './paper-questions.js';
import {esc} from './diagrams.js';

const view = document.getElementById('paperView');
const printable = document.getElementById('paperPrint');
const storageKey = 'discrete-lab-paper-v1';
const params = new URLSearchParams(location.search);
const bank = new Map(questions.map(q => [q.id, q]));
const printMode = document.body.classList;
let state = readState();
let setup = !state;
let replacing = false;
let shareMessage = '';
let fileError = '';
let showingReview = false;
let playback = null;

function validIds(ids) {
  return Array.isArray(ids) && ids.length > 0 && ids.length <= questions.length &&
    new Set(ids).size === ids.length && ids.every(id => bank.has(id));
}

function newSession(ids, style='study', guided=false, minutes=null) {
  return {
    ids, index:0, style, guided, minutes, reviewing:false, attempts:{},
    deadline:style === 'timed' ? Date.now() + minutes * 60000 : null,
  };
}

function readState() {
  const linked = params.get('set')?.split(',');
  const ids = validIds(linked) ? linked : null;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (validIds(saved?.ids) && Number.isInteger(saved.index) && saved.index >= 0 &&
        saved.index < saved.ids.length && (!ids || saved.ids.join(',') === ids.join(','))) {
      const timed = saved.style === 'timed';
      if (!timed || (Number.isInteger(saved.minutes) && saved.minutes >= 1 && saved.minutes <= 180 &&
          Number.isSafeInteger(saved.deadline) && saved.deadline > 0)) {
        const attempts = {};
        for (const id of saved.ids) {
          const previous = saved.attempts?.[id];
          if (!previous) continue;
          const q = bank.get(id);
          attempts[id] = {
            done:previous.done === true,
            hints:Number.isInteger(previous.hints) ? Math.max(0, Math.min(previous.hints, q.hints.length - 1)) : 0,
            steps:Number.isInteger(previous.steps) ? Math.max(0, Math.min(previous.steps, q.marks.length)) : 0,
            marks:Array.isArray(previous.marks) ? q.marks.map((_, i) => i).filter(i => previous.marks.includes(i)) : [],
          };
        }
        return {
          ids:saved.ids, index:saved.index, style:timed ? 'timed' : 'study',
          guided:saved.guided === true, reviewing:saved.reviewing === true,
          minutes:timed ? saved.minutes : null, deadline:timed ? saved.deadline : null, attempts,
        };
      }
    }
  } catch {
    // Paper practice can run without browser storage.
  }
  return ids ? newSession(ids) : null;
}

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {
    // Printing and the current attempt still work in this browser session.
  }
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function chooseQuestions(topic, count) {
  if (topic !== 'Mixed revision') return shuffle(questions.filter(q => q.topic === topic)).slice(0, count);
  const groups = shuffle(topics).map(tag => shuffle(questions.filter(q => q.topic === tag)));
  const order = groups[0].flatMap((_, i) => groups.map(group => group[i]));
  return order.slice(0, count);
}

function start(form) {
  const ids = chooseQuestions(form.get('topic'), Number(form.get('count'))).map(q => q.id);
  const style = form.get('style');
  openPaper(newSession(ids, style, form.has('guided'), style === 'timed' ? Number(form.get('minutes')) : null));
}

function openPaper(session) {
  stopPlayback();
  state = session;
  showingReview = false;
  fileError = '';
  setup = false;
  replacing = false;
  shareMessage = '';
  if (location.search) history.replaceState(null, '', location.pathname);
  save();
  render('currentQuestion');
}

function current() {
  const id = state.ids[state.index];
  const attempt = state.attempts[id] ??= {done:false, hints:0, steps:0, marks:[]};
  return {q:bank.get(id), attempt};
}

function options(items) {
  return items.map(item => '<option>'+esc(item)+'</option>').join('');
}

function setupPage() {
  return `<div class="workspace paper-layout">
    <section class="panel paper-page">
      <div class="panelhead"><span class="kicker">Paper setup</span></div>
      <div class="panelbody">
        <h2 id="setupTitle" tabindex="-1">Build a practice paper</h2>
        <form class="paper-form" id="paperForm">
          <label>Topic<select name="topic">${options(['Mixed revision', ...topics])}</select></label>
          <label>Number of questions<select name="count">${options([4,8,12,16])}</select></label>
          <label>Practice type<select name="style"><option value="study">Untimed</option><option value="timed">Timed</option></select></label>
          <label id="paperMinutes" hidden>Time limit in minutes<input name="minutes" type="number" min="1" max="180" value="25" required disabled></label>
          <label id="setupGuided"><input type="checkbox" name="guided" checked> Guided mode</label>
          <p class="prompt" id="setupHelp">Guided mode gives you a starting prompt and optional hints while you work.</p>
          ${replacing ? '<p class="message">Starting a new paper replaces your saved session. Print the paper or copy its link if you want to revisit the questions.</p>' : ''}
          <div class="actions"><button class="primary">Start paper</button>${state ? '<button type="button" class="secondary" data-action="resume">Back to my paper</button>' : ''}</div>
        </form>
        <div class="actions"><button class="secondary" data-action="openfile">Open saved paper</button>
          <input type="file" id="paperFile" accept=".json,application/json" hidden></div>
        ${fileError ? '<p class="message" role="alert">'+esc(fileError)+'</p>' : ''}
      </div>
    </section>
    <aside class="notes"><div class="notetitle">Working by hand</div>
      <h3>Show how you got there</h3><p>Write the rule you use, show intermediate steps and give a specific counterexample when a claim fails. Draw and label any diagram the question asks for.</p>
      <h3>Check after your attempt</h3><p>Use the worked mark scheme to compare your reasoning and tick the criteria you met. These are original revision questions based on the module topics.</p>
      <h3>Practising logic?</h3><p>For propositional logic and natural deduction, use <a href="https://sr123.github.io/box-proofs/">Dr Søren Riis’s Box Proofs app</a>.</p>
    </aside>
  </div>`;
}

function given(q) {
  return '<div class="paper-given">'+q.data.map(line => '<p>'+esc(line)+'</p>').join('')+'</div>';
}

function tasks(q) {
  return '<ol type="a" class="paper-tasks">'+q.tasks.map(task => '<li>'+esc(task)+'</li>').join('')+'</ol>';
}

function hints(q, attempt) {
  const visible = Math.min(attempt.hints + 1, q.hints.length);
  return `<div class="message paper-hint"><strong>Where to start</strong>
    <ol>${q.hints.slice(0, visible).map(step => '<li>'+esc(step)+'</li>').join('')}</ol>
    ${visible < q.hints.length ? '<div class="actions"><button class="secondary" data-action="hint">Next hint</button></div>' : ''}
  </div>`;
}

function markScheme(q, attempt) {
  if (!attempt.steps) return '<div class="actions"><button class="primary" data-action="solution">Show first worked step</button></div>';
  return `<section aria-labelledby="schemeTitle">
    <h3 id="schemeTitle" tabindex="-1">Worked mark scheme</h3>
    <p class="prompt">Tick each criterion your written answer meets. Give yourself credit for equivalent reasoning.</p>
    <ol class="paper-marklist">${q.marks.slice(0, attempt.steps).map((mark, i) =>
      `<li><label><input type="checkbox" data-mark="${i}" ${attempt.marks.includes(i) ? 'checked' : ''}><span>${esc(mark)}</span></label></li>`).join('')}</ol>
    ${modelDiagram(q.id, attempt.steps)}
    ${attempt.steps === q.marks.length ? workedFeedback(q) : ''}
    <div class="actions">
      <button class="secondary" data-action="backstep" ${attempt.steps <= 1 ? 'disabled' : ''}>Previous step</button>
      <button class="primary" data-action="step" ${attempt.steps >= q.marks.length ? 'disabled' : ''}>Next step</button>
      <button class="secondary" data-action="replay" ${attempt.steps <= 1 ? 'disabled' : ''}>Restart solution</button>
      <button class="secondary" data-action="play" ${attempt.steps >= q.marks.length && !playback ? 'disabled' : ''}>${playback ? 'Pause' : 'Play steps'}</button>
      <button class="secondary" data-action="allsteps" ${attempt.steps >= q.marks.length ? 'disabled' : ''}>Show full solution</button>
    </div>
  </section>`;
}

function paperCheck(q, variation=false) {
  const example = ['functions-classification','functions-inverse','functions-proof','sets-counter'].includes(q.id);
  return pythonPanel(paperPython(q.id, variation),example ? proofNote : undefined);
}

function workedFeedback(q) {
  const [mistake, transfer] = reviewTips[q.id];
  return `<div class="notes paper-feedback">
    <h3>Watch for this</h3><p>${esc(mistake)}</p>
    <h3>Try a variation on paper</h3><p>${esc(transfer)}</p>
    <details><summary>Check the variation</summary><p>${esc(variationAnswers[q.id])}</p>${paperCheck(q,true)}</details>
  </div>`;
}

function reviewPage() {
  const ranked = [];
  for (const topic of topics) {
    const ids = state.ids.filter(id => bank.get(id).topic === topic);
    if (!ids.length) continue;
    const checked = ids.filter(id => state.attempts[id]?.steps === bank.get(id).marks.length);
    const earned = checked.reduce((sum, id) => sum + state.attempts[id].marks.length, 0);
    const possible = checked.reduce((sum, id) => sum + bank.get(id).marks.length, 0);
    ranked.push({topic, ids, checked, earned, possible});
  }
  return `<section class="panel paper-page"><div class="panelhead"><span class="kicker">Paper review</span></div>
    <div class="panelbody"><h2 tabindex="-1" id="reviewTitle">Plan your next attempt</h2>
    <p class="prompt">Check every mark against your written work. Open any question below to review a missed step or try its variation.</p>
    <div class="paper-review-grid">${ranked.map(({topic, ids, checked, earned, possible}) => `
      <section class="paper-review-group"><h3>${esc(topic)}</h3>
      <p>${checked.length}/${ids.length} mark schemes opened fully${possible ? ' · '+earned+'/'+possible+' self-awarded marks' : ''}</p>
      <ul>${ids.map(id => {
        const attempt = state.attempts[id];
        const max = bank.get(id).marks.length;
        const status = attempt?.steps === max ? (attempt.marks.length === max ? 'Try a variation' : 'Retry · '+attempt.marks.length+'/'+max) : 'Review pending';
        return `<li><button class="qrow" data-jump="${state.ids.indexOf(id)}">${esc(bank.get(id).title)}<span class="qstate">${status}</span></button></li>`;
      }).join('')}</ul></section>`).join('')}</div>
    <button class="secondary" data-action="close-review">Back to my paper</button></div></section>`;
}

function progressLabel() {
  const attempts = Object.values(state.attempts);
  const completed = attempts.filter(a => a.done).length;
  const marked = attempts.reduce((total, a) => total + a.marks.length, 0);
  return {completed, marked};
}

function paperPage() {
  const {q, attempt} = current();
  const canReview = state.style === 'study' || state.reviewing;
  const {completed, marked} = progressLabel();
  return `<div class="actions paper-header-actions">
      <button class="secondary" data-action="print">Print question paper</button>
      ${canReview ? '<button class="secondary" data-action="printscheme">Print mark scheme</button>' : ''}
      <button class="secondary" data-action="share">Copy paper link</button>
      <button class="secondary" data-action="savefile">Save paper file</button>
      ${canReview ? '<button class="secondary" data-action="review">Review progress</button>' : ''}
      <button class="ghost" data-action="new">New paper</button>
    </div>
    ${shareMessage ? `<p class="message good" role="status">${esc(shareMessage)}</p>` : ''}
    <div class="workspace paper-layout">
      <section class="panel paper-page">
        <div class="panelhead paper-panelhead">
          <span class="kicker">${esc(q.topic)} · Question ${state.index + 1} of ${state.ids.length} · ${q.marks.length} marks</span>
          ${state.style === 'timed' ? '<span class="paper-status" id="paperClock" role="timer" aria-label="Time remaining"></span>' : '<label><input type="checkbox" id="guided" '+(state.guided ? 'checked' : '')+'> Guided mode</label>'}
        </div>
        <div class="panelbody">
          <h2 id="currentQuestion" tabindex="-1">${esc(q.title)}</h2>
          ${given(q)}${tasks(q)}
          ${state.guided && state.style === 'study' && !attempt.done ? hints(q, attempt) : ''}
          <div class="actions">
            <button class="${attempt.done ? 'secondary' : 'primary'}" aria-pressed="${attempt.done}" data-action="done">${attempt.done ? 'Attempted on paper ✓' : 'Mark as attempted'}</button>
            ${!canReview ? '<button class="secondary" data-action="finish">Finish and review</button>' : ''}
          </div>
          ${canReview && (attempt.done || state.reviewing) ? markScheme(q, attempt) + paperCheck(q) : ''}
          <div class="genpaging">
            <button class="secondary" data-action="prev" ${state.index === 0 ? 'disabled' : ''}>Previous question</button>
            <button class="secondary" data-action="next" ${state.index + 1 >= state.ids.length ? 'disabled' : ''}>Next question</button>
          </div>
          <p class="paper-keys">Use the left and right arrow keys to move between questions.</p>
        </div>
      </section>
      <aside class="paper-sidebar">
        <div class="library"><div class="libhead"><h3>Your paper</h3><small id="paperScore">${completed}/${state.ids.length} attempted${canReview ? ' · '+marked+'/'+totalMarks()+' marks' : ''}</small></div>
          ${state.ids.map((id, i) => `<button class="qrow" data-jump="${i}" aria-current="${i === state.index}"><span class="qnum">${i + 1}</span>${esc(bank.get(id).title)}<span class="qstate">${state.attempts[id]?.done ? '✓' : ''}</span></button>`).join('')}
        </div>
        ${state.reviewing ? '<div class="notes"><div class="notetitle">Review your paper</div><p>Compare each written answer with the worked solution and tick the marks you earned.</p></div>' : ''}
      </aside>
    </div>`;
}

function render(focusId) {
  view.innerHTML = setup ? setupPage() : showingReview ? reviewPage() : paperPage();
  updateClock();
  if (focusId) document.getElementById(focusId)?.focus();
}

function updateClock() {
  const clock = document.getElementById('paperClock');
  if (!clock) return;
  if (state.reviewing) {
    clock.outerHTML = '<span class="paper-status">Review mode</span>';
    return;
  }
  const remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  clock.textContent = remaining ? minutes+':'+seconds+' left' : 'Time is up';
}

function totalMarks() {
  return state.ids.reduce((sum, id) => sum + bank.get(id).marks.length, 0);
}

function printSheet(withSolutions) {
  const title = withSolutions ? 'Worked mark scheme' : 'Question paper';
  printable.innerHTML = `<h1>Discrete Lab · ${title}</h1>
    <p>ECS407U practice · ${state.ids.length} questions · ${totalMarks()} marks${state.minutes && !withSolutions ? ' · Suggested time ' + state.minutes + ' minutes' : ''}</p>
    <p>${withSolutions ? 'Award one mark for each criterion met. Accept equivalent reasoning.' : 'Show your working and give reasons. Use separate paper for longer answers or diagrams.'}</p>
    ${state.ids.map((id, i) => {
      const q = bank.get(id);
      return `<article><h2>${i + 1}. ${esc(q.title)} <span class="paper-print-marks">[${q.marks.length} marks]</span></h2>
        ${withSolutions ? '<ol class="paper-tasks">'+q.marks.map(mark => '<li>'+esc(mark)+'</li>').join('')+'</ol>'+modelDiagram(q.id, q.marks.length)
          : given(q)+tasks(q)+'<div class="writing-line"></div>'.repeat(4)}</article>`;
    }).join('')}`;
  printable.hidden = false;
  printMode.add('paper-print');
  window.print();
}

window.addEventListener('afterprint', () => {
  printable.hidden = true;
  printable.replaceChildren();
  printMode.remove('paper-print');
});

function savePaperFile() {
  const file = new Blob([JSON.stringify({format:'discrete-lab-paper', version:1, questions:state.ids}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(file);
  const download = document.createElement('a');
  download.href = url;
  download.download = 'discrete-lab-paper.json';
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function openPaperFile(file) {
  if (!file) return;
  try {
    if (file.size > 4096) throw Error();
    const data = JSON.parse(await file.text());
    if (!setup) return;
    if (data?.format !== 'discrete-lab-paper' || data.version !== 1 || !validIds(data.questions)) throw Error();
    openPaper(newSession(data.questions));
  } catch {
    if (!setup) return;
    fileError = 'Choose a valid Discrete Lab paper file.';
    render('setupTitle');
  }
}

function stopPlayback() {
  clearInterval(playback);
  playback = null;
}

function play(q, attempt) {
  playback = setInterval(() => {
    attempt.steps++;
    if (attempt.steps >= q.marks.length) stopPlayback();
    save();
    const keepFocus = document.activeElement?.dataset.action === 'play';
    render();
    if (keepFocus) (view.querySelector('[data-action="play"]:not(:disabled)') ??
      document.getElementById('schemeTitle')).focus();
  }, 2300);
}

function jump(i) {
  if (i < 0 || i >= state.ids.length) return;
  stopPlayback();
  showingReview = false;
  state.index = i;
  save();
  render('currentQuestion');
}

view.addEventListener('submit', event => {
  if (event.target.id !== 'paperForm') return;
  event.preventDefault();
  start(new FormData(event.target));
});

view.addEventListener('change', event => {
  const control = event.target;
  if (control.id === 'paperFile') return openPaperFile(control.files[0]);
  if (control.form?.id === 'paperForm') {
    if (control.name === 'topic') {
      control.form.elements.count.innerHTML = options(control.value === 'Mixed revision' ? [4,8,12,16] : [1,2,3,4]);
    }
    if (control.name === 'style') {
      const timed = control.value === 'timed';
      document.getElementById('paperMinutes').hidden = !timed;
      control.form.elements.minutes.disabled = !timed;
      document.getElementById('setupGuided').hidden = timed;
      control.form.elements.guided.disabled = timed;
      document.getElementById('setupHelp').textContent = timed
        ? 'The timer starts when you open the paper. Hints and solutions are hidden until you finish and review.'
        : 'Guided mode gives you a starting prompt and optional hints while you work.';
    }
    return;
  }
  if (control.id === 'guided') {
    state.guided = control.checked;
    save();
    render('guided');
  }
  if (control.hasAttribute('data-mark')) {
    const {attempt} = current();
    const i = Number(control.dataset.mark);
    attempt.marks = attempt.marks.filter(mark => mark !== i);
    if (control.checked) attempt.marks.push(i);
    save();
    const {completed, marked} = progressLabel();
    document.getElementById('paperScore').textContent = completed+'/'+state.ids.length+' attempted · '+marked+'/'+totalMarks()+' marks';
  }
});

view.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-jump')) return jump(Number(button.dataset.jump));
  const action = button.dataset.action;
  if (action === 'openfile') return document.getElementById('paperFile').click();
  if (!action || !state) return;
  if (action === 'savefile') return savePaperFile();
  if (action === 'review' || action === 'close-review') {
    stopPlayback();
    showingReview = action === 'review';
    render(showingReview ? 'reviewTitle' : 'currentQuestion');
    return;
  }
  if (action === 'new' || action === 'resume') {
    stopPlayback();
    fileError = '';
    setup = action === 'new';
    replacing = setup;
    render(setup ? 'setupTitle' : 'currentQuestion');
    return;
  }
  if (action === 'share') {
    stopPlayback();
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('set', state.ids.join(','));
    try {
      await navigator.clipboard.writeText(url.href);
      shareMessage = 'Paper link copied. It shares the questions only.';
    } catch {
      shareMessage = url.href;
    }
    render();
    view.querySelector('[data-action="share"]')?.focus();
    return;
  }
  if (action === 'print' || action === 'printscheme') {
    stopPlayback();
    render();
    view.querySelector('[data-action="'+action+'"]')?.focus();
    return printSheet(action === 'printscheme');
  }
  if (action === 'prev' || action === 'next') return jump(state.index + (action === 'next' ? 1 : -1));
  const {q, attempt} = current();
  const wasPlaying = playback !== null;
  stopPlayback();
  if (action === 'done') attempt.done = !attempt.done;
  else if (action === 'finish') {
    if (!confirm('Finish this timed attempt and open the mark scheme?')) return;
    state.reviewing = true;
  } else if (action === 'hint') attempt.hints = Math.min(attempt.hints + 1, q.hints.length - 1);
  else if (action === 'solution') attempt.steps = 1;
  else if (action === 'step') attempt.steps = Math.min(attempt.steps + 1, q.marks.length);
  else if (action === 'backstep') attempt.steps = Math.max(attempt.steps - 1, 1);
  else if (action === 'allsteps') attempt.steps = q.marks.length;
  else if (action === 'replay') attempt.steps = 1;
  else if (action === 'play' && !wasPlaying && attempt.steps < q.marks.length) play(q, attempt);
  save();
  render();
  const replacement = view.querySelector('[data-action="'+action+'"]:not(:disabled)');
  (replacement ?? document.getElementById('schemeTitle') ?? document.getElementById('currentQuestion')).focus();
});

document.addEventListener('keydown', event => {
  if (setup || showingReview || !state || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest('input, select, textarea, [contenteditable]')) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    jump(state.index + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

setInterval(updateClock, 1000);
render();
