import {esc} from './diagrams.js';

export function pythonPanel(code, note='Compare the output with your working. Python may list the elements of a set in a different order. It prints an empty set as set().') {
  return `<details class="python-panel"><summary>Check in Python</summary>
    <ol><li>Work out your answer on paper first.</li>
    <li>Open IDLE for Python 3, choose <strong>File → New File</strong> and paste the code below. It uses the values in this question.</li>
    <li>Save as <code>check.py</code>, then choose <strong>Run → Run Module</strong> (F5). In a terminal, run <code>python3 check.py</code> or, on Windows, <code>py check.py</code>.</li></ol>
    <pre tabindex="0" aria-label="Python code"><code>${esc(code.trim()+'\n')}</code></pre>
    <div class="actions"><button type="button" class="secondary" data-copy-python>Copy Python code</button><span role="status"></span></div>
    <p>${esc(note)}</p></details>`;
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy-python]');
  if (!button) return;
  const code = button.closest('details').querySelector('pre code');
  const status = button.nextElementSibling;
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = 'Copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Code selected. Use your device’s Copy command.';
  }
});
