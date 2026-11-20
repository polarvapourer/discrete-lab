// Each member is an integer or an unquoted word. Sets use value equality.
export function readSet(text) {
  let value = text.trim();
  if (!value || value === '∅') return new Set();
  if (value.startsWith('{') && value.endsWith('}')) value = value.slice(1,-1).trim();
  if (!value) return new Set();
  if (value.length > 1500) throw Error('Use at most 1,500 characters per set.');
  const members = value.split(',').map(part => {
    const token = part.trim();
    if (/^[+-]?\d+$/.test(token) && Number.isSafeInteger(Number(token))) return Number(token);
    if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(token)) return token;
    throw Error('Use integers or single words separated by commas, for example {2, 3, red}.');
  });
  return new Set(members);
}

export function showSet(set) {
  const members = [...set].sort((a,b) => typeof a !== typeof b ? (typeof a==='number'?-1:1)
    : typeof a==='number' ? a-b : a.localeCompare(b, 'en'));
  return members.length ? '{'+members.join(', ')+'}' : '∅';
}

export function pySet(set) {
  return set.size ? '{'+[...set].map(x=>JSON.stringify(x)).join(', ')+'}' : 'set()';
}

const operations = {
  '∩': {python:'&', order:2, explain:'Keep the members in both sets.', apply:(a,b)=>[...a].filter(x=>b.has(x))},
  '∖': {python:'-', order:2, explain:'Start with the left set and remove members of the right set.', apply:(a,b)=>[...a].filter(x=>!b.has(x))},
  '∪': {python:'|', order:1, explain:'Collect the members of either set, counting each once.', apply:(a,b)=>[...a,...b]},
  '△': {python:'^', order:1, explain:'Keep the members that occur in exactly one of the two sets.', apply:(a,b)=>[...[...a].filter(x=>!b.has(x)), ...[...b].filter(x=>!a.has(x))]},
};
const aliases = new Map(Object.entries({'n':'∩','&':'∩','u':'∪','|':'∪','-':'∖','\\':'∖','^':'△','∆':'△','Δ':'△',"'":'ᶜ','′':'ᶜ'}));

export function workExpression(source, sets) {
  if (!source.trim() || source.length > 200) throw Error('Enter an expression of 1 to 200 characters, for example A n B.');
  const pattern = /\s+|\{[^{}]*\}|[ABCUnu∅∩∖∪△∆Δ&|\\^'′ᶜ()\-]/gy;
  const tokens = [];
  let position = 0;
  while (position < source.length) {
    const match = pattern.exec(source);
    if (!match) throw Error('Unrecognised symbol at character '+(position+1)+'. Use A, B, C, U, a set in braces or a listed operation.');
    if (match[0].trim()) tokens.push(aliases.get(match[0]) ?? match[0]);
    position = pattern.lastIndex;
  }
  const steps = [];
  let cursor = 0;
  function parse(minimum) {
    const token = tokens[cursor++];
    let node;
    if (token === '(') {
      node = parse(1);
      if (tokens[cursor++] !== ')') throw Error('Add a closing parenthesis to match the opening one.');
    } else if (['A','B','C','U'].includes(token)) {
      if (token === 'U' && !sets.U) throw Error('Enter the universe U to use it in this expression.');
      node = {value:sets[token], label:token, python:token};
    } else if (token === '∅' || token?.startsWith('{')) {
      const value = readSet(token);
      for (const x of value) if (sets.U && !sets.U.has(x)) throw Error('Add '+x+' to U before using it in a set literal.');
      node = {value, label:showSet(value), python:pySet(value)};
    } else throw Error('Expected a set such as A or B, or an opening parenthesis.');
    while (tokens[cursor] === 'ᶜ') {
      cursor++;
      if (!sets.U) throw Error('Enter the universe U to take a complement.');
      node = {value:new Set([...sets.U].filter(x=>!node.value.has(x))), label:node.label+'ᶜ', python:'(U - '+node.python+')'};
      steps.push({...node, why:'Keep the members of U outside this set.'});
    }
    while (operations[tokens[cursor]]?.order >= minimum) {
      const op = tokens[cursor++], rule = operations[op];
      const right = parse(rule.order+1);
      node = {value:new Set(rule.apply(node.value,right.value)), label:'('+node.label+' '+op+' '+right.label+')', python:'('+node.python+' '+rule.python+' '+right.python+')'};
      steps.push({...node, why:rule.explain});
    }
    return node;
  }
  const result = parse(1);
  if (cursor !== tokens.length) throw Error('Check for a missing operation or an extra closing parenthesis.');
  return {...result, steps};
}

export function setProblem(inputs, expression) {
  const sets = {};
  for (const name of ['A','B','C','U']) {
    try { sets[name] = readSet(inputs[name] ?? ''); }
    catch(e) { throw Error(name+' — '+e.message); }
  }
  if (!(inputs.U ?? '').trim()) sets.U = null;
  for (const name of ['A','B','C']) {
    for (const x of sets[name]) if (sets.U && !sets.U.has(x)) throw Error(name+' contains '+x+'. Add it to U or remove it from '+name+'.');
  }
  const result = workExpression(expression, sets);
  const code = ['# Define the sets from your question.', ...Object.entries(sets).filter(([,v])=>v !== null).map(([k,v])=>k+' = '+pySet(v)), '',
    '# & is intersection, | is union, - is difference and ^ is symmetric difference.',
    'result = '+result.python, 'print(result)'].join('\n');
  return {...result, code};
}
