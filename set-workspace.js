import {esc} from './diagrams.js';
import {readSet, showSet, setProblem} from './set-expression.js';
import {pythonPanel} from './python-panel.js';

const form = document.getElementById('setForm');
const expression = form.elements.expression;
const status = document.getElementById('status');
const working = document.getElementById('working');
const params = new URLSearchParams(location.search);
for (const name of ['A','B','C','U','expression']) {
  if (params.has(name)) form.elements[name].value = params.get(name);
}
const names = {'∩':'intersection','∪':'union','∖':'difference','ᶜ':'complement','△':'symmetric difference','(':'opening parenthesis',')':'closing parenthesis'};
for (const [symbol,name] of Object.entries(names)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = symbol;
  button.setAttribute('aria-label','Insert '+name);
  button.addEventListener('click', () => {
    expression.setRangeText(symbol,expression.selectionStart,expression.selectionEnd,'end');
    expression.dispatchEvent(new Event('input', {bubbles:true}));
    expression.focus();
  });
  document.getElementById('symbols').append(button);
}
function showCheck(reportError=true) {
  working.replaceChildren();
  try {
    const inputs = Object.fromEntries(new FormData(form));
    const problem = setProblem(inputs, expression.value);
    working.innerHTML = pythonPanel(problem.code);
    return problem;
  } catch (e) {
    if (reportError) status.textContent = e.message;
    return null;
  }
}
form.addEventListener('input', event => {
  status.textContent = '';
  if (event.target.name === 'answer') {
    working.querySelector('.set-steps')?.remove();
  } else {
    showCheck(false);
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = '';
  const problem = showCheck();
  if (!problem) return;
  if (event.submitter?.value !== 'solve') {
    if (!form.elements.answer.value.trim()) {
      status.textContent = 'Enter your answer first. For the empty set type {} or ∅.';
      form.elements.answer.focus();
      return;
    }
    try {
      const guess = readSet(form.elements.answer.value);
      const extra = [...guess].find(x=>!problem.value.has(x));
      if (extra !== undefined) status.textContent = 'Check '+extra+' again. It does not belong in this result.';
      else if (guess.size < problem.value.size) status.textContent = 'Your members are correct so far. At least one is missing.';
      else status.textContent = 'Correct. The result is '+showSet(problem.value)+'.';
    } catch(e) {status.textContent = e.message;}
    return;
  }
  status.textContent = problem.label+' = '+showSet(problem.value);
  const steps = problem.steps.map(s=>'<li>'+esc(s.why)+'<br><code>'+esc(s.label+' = '+showSet(s.value))+'</code></li>').join('');
  working.insertAdjacentHTML('afterbegin','<section class="set-steps"><h3>Working</h3>'+(steps?'<ol>'+steps+'</ol>':'<p>Read the members of the set directly.</p>')+'</section>');
});
showCheck();
