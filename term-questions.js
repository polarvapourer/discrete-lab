// Keep version 1 deterministic so a saved attempt restores exactly the same paper.
export const paperVersion = 1;
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function shuffled(items, rng) {
  const out = [...items];
  for (let i=out.length-1; i>0; i--) {
    const j = Math.floor(rng()*(i+1));
    [out[i],out[j]] = [out[j],out[i]];
  }
  return out;
}
const rows = [[true,true],[true,false],[false,true],[false,false]];
const tf = value => value?'T':'F';
const rowName = ([a,b],p,q) => p+' = '+tf(a)+', '+q+' = '+tf(b);
const mask = evaluate => rows.map(([x,y])=>tf(evaluate(x,y))).join('');
const columns = [
  ['p → q', (x,y)=>!x||y], ['q → p',(x,y)=>!y||x],
  ['p ∧ ¬q',(x,y)=>x&&!y], ['¬p ∧ q',(x,y)=>!x&&y],
  ['p ↔ q',(x,y)=>x===y], ['¬(p ∧ q)',(x,y)=>!(x&&y)],
  ['¬(p ∨ q)',(x,y)=>!(x||y)], ['p ∨ q',(x,y)=>x||y],
  ['p ∧ q',(x,y)=>x&&y], ['¬(p ↔ q)',(x,y)=>x!==y],
];
const equivalent = [
  ['¬(p → q)','p ∧ ¬q','An implication fails only with a true antecedent and a false consequent.'],
  ['¬(p ∨ q)','¬p ∧ ¬q','For an or-statement to be false, both alternatives must be false.'],
  ['¬(p ∧ q)','¬p ∨ ¬q','A conjunction fails as soon as either conjunct is false.'],
  ['p → q','¬q → ¬p','The implication and its contrapositive fail on precisely the same row.'],
  ['p ↔ q','(p → q) ∧ (q → p)','The two implications together require the letters to have equal truth values.'],
];
const references = {
  'Truth tables':'Weeks 1–2 lecture slides · truth tables and implication',
  'Equivalence':'Weeks 2–3 lecture slides · equivalence and comparing truth-table columns',
  'Counterexamples':'Weeks 2–3 lecture slides · arguments and counterexamples',
  'Box proofs':'Weeks 3–4 box-proof and implication-game slides · Week 6 handout, slides 4–10',
  'Negation':'Week 4 not-game slides · Week 6 handout, slides 14–19',
  'Proof by cases':'Week 5 or-game slides · Week 6 handout, slides 11–16',
  'Classical reasoning':'Week 5 classical logic slides · Week 6 handout, slides 18–21',
  'Sets':'Week 8 lecture slides, slides 27–44 · course notes, sections 2–3',
  'Relations':'Week 9 lecture slides, slides 4–26 · course notes, section 4',
  'Functions':'Week 9 lecture slides, slides 27–37 · course notes, section 5',
  'Graphs':'Week 9 lecture slides, slides 38–47 · course notes, section 6',
  'Trees':'Week 9 lecture slides, slides 48–53 · course notes, section 6',
  'Directed graphs':'Week 9 lecture slides, slides 55–60 · course notes, section 6',
};
export function makePaper(seed) {
  const rng = random(seed);
  const pick = items => items[Math.floor(rng()*items.length)];
  const integer = (low,high) => low+Math.floor(rng()*(high-low+1));
  const logic = [], discrete = [];
  let target = logic;
  function add(topic, prompt, data, correct, distractors, explanation, proof=[]) {
    const wrong = [...new Set(distractors.map(String))].filter(v=>v!==String(correct));
    if (wrong.length<3) throw Error('Too few distinct choices for '+topic);
    const choices = shuffled([String(correct),...shuffled(wrong,rng).slice(0,3)],rng);
    target.push({topic,prompt,data,choices,answer:choices.indexOf(String(correct)),explanation,proof,reading:references[topic]});
  }
  const [p,q,r] = shuffled(pick([['A','B','C'],['P','Q','R'],['X','Y','Z']]),rng);
  const names = {p,q,r};
  const f = template => template.replace(/[pqr]/g,ch=>names[ch]);
  const assignment = row => rowName(row,p,q);
  const rv = rows.map(assignment);
  const order = 'Rows in order ('+p+', '+q+'): TT, TF, FT, FF.';
  const col = v=>v.split('').join(', ');
  const [first,second] = shuffled(columns,rng);
  const table = mask(first[1]);
  const tableRule = first[0].includes('→')?'An implication is false only when its left side is true and its right side is false.':
    first[0].includes('↔')?'A biconditional is true when both sides agree. Reverse that value if the whole formula is negated.':
    first[0].includes('∧')?'A conjunction is true only when both conjuncts hold. Apply each negation to the letter or bracket it precedes.':
    'A disjunction is true when at least one disjunct holds. A negation outside the brackets reverses the result.';
  add('Truth tables','Which is the final column of '+f(first[0])+'?',order,col(table),
    columns.map(x=>col(mask(x[1]))),tableRule+' '+rows.map((row,i)=>assignment(row)+' gives '+table[i]).join('. ')+'.');
  const complex = pick([
    ['(p → q) ∧ ¬q',(a,b)=>(!a||b)&&!b,'p → q', (a,b)=>!a||b,'¬q',(a,b)=>!b,'∧'],
    ['(p ∨ q) → ¬p',(a,b)=>!(a||b)||!a,'p ∨ q',(a,b)=>a||b,'¬p',a=>!a,'→'],
    ['¬(p ∧ q) ↔ q',(a,b)=>!(a&&b)===b,'¬(p ∧ q)',(a,b)=>!(a&&b),'q',(a,b)=>b,'↔'],
  ]);
  const [a,b]=pick(rows), inner=complex[3](a,b), final=complex[1](a,b);
  add('Truth tables','Which pair gives the intermediate value and then the final value?',
    assignment([a,b])+'. First evaluate '+f(complex[2])+', then '+f(complex[0])+'.',
    tf(inner)+', '+tf(final),rows.map(v=>v.map(tf).join(', ')),
    f(complex[2])+' is '+tf(inner)+' and '+f(complex[4])+' is '+tf(complex[5](a,b))+'. Combining them with '+complex[6]+' gives '+tf(final)+'.');
  const classType=integer(0,2);
  const classParts=[['(p ∧ q) → p','p ∨ ¬p'],['p ∧ ¬p','(p → q) ∧ (p ∧ ¬q)'],[second[0]]];
  const classTitles=['True on every row','False on every row','True on some rows and false on others'];
  const classified=pick(classParts[classType]);
  const pattern=classType===0?'TTTT':classType===1?'FFFF':mask(second[1]);
  add('Truth tables','Which description fits '+f(classified)+'?',order,classTitles[classType],
    [...classTitles,'Its truth value depends on how the rows are ordered.'],
    'The final column is '+col(pattern)+'. '+['This makes the formula a tautology.','This makes it a contradiction.','Both values occur, so the formula is contingent.'][classType]);
  const law=pick(equivalent);
  const badEquivs={'¬(p → q)':['¬p ∨ q','¬p ∧ q','p ∧ q'],'¬(p ∨ q)':['¬p ∨ ¬q','p ∧ q','¬p ∧ q'],'¬(p ∧ q)':['¬p ∧ ¬q','p ∨ q','p ∧ ¬q'],'p → q':['q → p','p ∧ q','p ∧ ¬q'],'p ↔ q':['p → q','p ∨ q','p ∧ ¬q']};
  add('Equivalence','Which formula is classically equivalent to '+f(law[0])+'?','',f(law[1]),badEquivs[law[0]].map(f),law[2]+' This gives '+f(law[1])+'.');
  const diff=pick([
    ['p ∨ q','p → q',(x,y)=>x||y,(x,y)=>!x||y],
    ['p ∧ q','q',(x,y)=>x&&y,(x,y)=>y],
    ['q → p','p ∨ ¬q',(x,y)=>!y||x,(x,y)=>x||!y],
    ['p → q','¬p ∨ q',(x,y)=>!x||y,(x,y)=>!x||y],
    ['p ∨ q','p',(x,y)=>x||y,x=>x],
  ]);
  const col1=mask(diff[2]),col2=mask(diff[3]),witness=rows.find(row=>diff[2](...row)!==diff[3](...row));
  // Use only agreeing rows as distractors so every displayed witness question has one answer.
  const noRow='They agree on every row.';
  add('Equivalence','Which statement about these two columns is correct?',f(diff[0])+'   and   '+f(diff[1]),
    witness?'They differ when '+assignment(witness)+'.':noRow,
    [...rows.filter(row=>diff[2](...row)===diff[3](...row)).map(row=>'They differ when '+assignment(row)+'.'),noRow,'The order of the columns changes whether the formulas are equivalent.'],
    order+' The columns are '+col(col1)+' and '+col(col2)+'. '+(witness?'One disagreement is enough to disprove equivalence.':'They match row by row.'));
  const invalidArguments=[
    ['p → q, q ⊢ p',[false,true],'The implication is true with a false antecedent. The consequent is true, but the antecedent is false.'],
    ['p ∨ q ⊢ q',[true,false],'The first disjunct makes the premise true while the second disjunct is false.'],
    ['p → q, ¬p ⊢ ¬q',[false,true],'A false antecedent leaves the consequent free to be true. Both premises hold while the negated conclusion fails.'],
    ['p ⊢ p ∧ q',[true,false],'The premise holds, but the other conjunct is false, so the conclusion fails.'],
  ];
  const invalid=pick(invalidArguments);
  add('Counterexamples','Which row is a counterexample to this argument?',f(invalid[0]),assignment(invalid[1]),rv,assignment(invalid[1])+'. '+invalid[2]);
  const argument=pick([
    ['p ∨ q, ¬p ⊢ q','The second premise rules out the first disjunct, leaving the second.'],
    ['p → q, ¬q ⊢ ¬p','If the antecedent were true, the implication would force the consequent to be true, contradicting the second premise.'],
    ['p, ¬p ⊢ q','No row makes both premises true, so a counterexample is impossible.'],
  ]);
  if(rng()<.5) {
    const proposed=pick(invalidArguments.filter(item=>item!==invalid));
    const candidate=pick(rows.filter(row=>row[0]!==proposed[1][0] || row[1]!==proposed[1][1]));
    const trueRow=rng()<.5;
    const sample=trueRow?proposed[1]:candidate;
    add('Counterexamples','Does the proposed row disprove the argument?',
      f(proposed[0])+'. Proposed row: '+assignment(sample)+'.',
      trueRow?'Yes. All premises are true and the conclusion is false.':'No. This row fails the counterexample test, although another row disproves the argument.',
      [trueRow?'No. The argument is valid on every row.':'Yes. All premises are true and the conclusion is false.',
        'Every valuation disproves this argument.','A truth table cannot test the validity of an argument.'],
      'Check all the premises and the conclusion on the same row. The counterexample is '+assignment(proposed[1])+'. '+proposed[2]);
  } else add('Counterexamples','Which assessment of the argument is correct?',f(argument[0]),'Valid. There is no row with all premises true and the conclusion false.',
    ['Invalid. Any row with a false conclusion is a counterexample.','Invalid. One false premise suffices for a counterexample.','Valid only if each premise is itself a tautology.'],argument[1]);
  // The fourth field is the depth of an open box. Named assumptions start a new box.
  const line=(formula,reason,depth=0,start=false)=>({formula:f(formula),reason,depth,start});
  const conj=pick(['p ∧ (q ∧ r)','(q ∧ r) ∧ p']);
  if(rng()<.5) {
    const disjunction=rng()<.5;
    const goal=disjunction?f('q ∨ r'):f('q ∧ p');
    add('Box proofs','Which single step establishes the goal?', 'Goal: '+goal,
      disjunction?'∨ intro 2':'∧ intro 2,1',
      [disjunction?'∨ elim 2':'∧ elim 2,1',disjunction?'∨ intro 1':'∧ intro 1,2','→ elim 1,2'],
      disjunction?'Line 2 establishes the left disjunct, which suffices for ∨ introduction.':'Use line 2 for the left conjunct and line 1 for the right conjunct. The order must match the goal.',
      [line('p','premise'),line('q','premise')]);
  } else add('Box proofs','Which formula can you obtain from line 1 with one application of ∧ elim?','',f('q ∧ r'),
    ['q','p ∧ q','r'].map(f),'The two outer conjuncts are '+p+' and '+f('q ∧ r')+'. Extracting '+q+' or '+r+' alone takes a second elimination.',[line(conj,'premise')]);
  const chain=pick([['p','q','r'],['q','r','p'],['r','p','q']]);
  const [x,y,z]=chain;
  add('Box proofs','Which justification completes the last line?','', '→ intro 3–5',
    ['→ elim 3,5','→ intro 1–5','line 5'],
    'The box begins at line 3 by assuming '+f(x)+' and ends at line 5 with '+f(z)+'. Discharging the whole box gives '+f(x+' → '+z)+'.',
    [line(x+' → '+y,'premise'),line(y+' → '+z,'premise'),line(x,'assumption',1,true),line(y,'→ elim 3,1',1),line(z,'→ elim 4,2',1),line(x+' → '+z,'?')]);
  const scopeRule=pick(['p','q ∨ r','p ∧ r']);
  if (rng()<.5) {
    add('Box proofs','At line 5 inside the second case, which earlier lines are still in scope?',
      'The first case ended on line 3. Each marked assumption starts a new box.','Lines 1 and 4 only',
      ['Lines 1, 2, 3 and 4','Lines 2 and 3 only','Line 4 only'],
      'Line 1 is an outer premise. Line 4 opens the current case. Lines 2 and 3 belong to the closed first case.',
      [line('p ∨ q','premise'),line('p','assumption',1,true),line('q ∨ p','∨ intro 2',1),line('q','assumption',1,true),line('q ∨ p','?',1)]);
  } else add('Box proofs','Which is the first unjustified line?','Each indented block is a separate box.','Line 4',['Line 2','Line 3','Every line is justified.'],
    'Line 3 closes the box. Line 2 depended on its temporary assumption, so copying line 2 outside the box at line 4 is invalid.',
    [line(scopeRule,'assumption',1,true),line(scopeRule,'line 1',1),line('('+scopeRule+') → ('+scopeRule+')','→ intro 1–2'),line(scopeRule,'line 2')]);
  const neg=pick([['p','q'],['r','p'],['q','r']]),[u,v]=neg;
  add('Negation','Which formula and justification belong after the box?','',f('¬'+u)+' by ¬ intro 3–5',
    [f(u)+' by contra 5',f('¬'+v)+' by ¬ intro 3–5',f('¬'+u)+' by ¬ elim 4,2'],
    'Assuming '+f(u)+' produced both '+f(v)+' and '+f('¬'+v)+', hence ⊥. Negation introduction discharges that assumption.',
    [line(u+' → '+v,'premise'),line('¬'+v,'premise'),line(u,'assumption',1,true),line(v,'→ elim 3,1',1),line('⊥','¬ elim 4,2',1)]);
  const common=pick(['r','r ∧ p','¬r']);
  if(rng()<.5) {
    add('Proof by cases','What must the missing last line of the second case establish?',
      'Goal outside both boxes: '+f(common),f(common),[f('q'),f('p ∨ q'),f('p → ('+common+')')],
      'The first case ends in '+f(common)+'. To apply ∨ elim, the other case must end in exactly that same formula. Use its implication premise with its own assumption.',
      [line('p ∨ q','premise'),line('p → ('+common+')','premise'),line('q → ('+common+')','premise'),line('p','assumption',1,true),line(common,'→ elim 4,2',1),line('q','assumption',1,true),line('?','?',1)]);
  } else add('Proof by cases','Which justification completes the proof by cases?','', '∨ elim 1,4–5,6–7',
    ['∨ intro 5,7','∨ elim 1,5,7','→ intro 4–7'],
    'Line 1 gives two alternatives. Lines 4–5 handle the first and lines 6–7 handle the second. Both end in '+f(common)+', so cite the disjunction and both complete boxes.',
    [line('p ∨ q','premise'),line('p → ('+common+')','premise'),line('q → ('+common+')','premise'),line('p','assumption',1,true),line(common,'→ elim 4,2',1),line('q','assumption',1,true),line(common,'→ elim 6,3',1),line(common,'?')]);
  const surviving=pick([['p','q'],['q','p']]),[lost,kept]=surviving;
  add('Proof by cases','You have reached ⊥ in the first case. Which move lets both cases reach the goal constructively?',
    f(lost+' ∨ '+kept+', ¬'+lost+' ⊢ '+kept), 'Use contra on ⊥ to obtain '+f(kept)+' inside the first case.',
    ['Close the first case with ⊥ and the other with '+f(kept)+', then use ∨ elim.','Copy the assumption from the second case into the first case.','Use ∨ elim to select the true disjunct immediately.'],
    'Ordinary contra derives any formula from ⊥, including '+f(kept)+'. In the second case, copy its assumption '+f(kept)+'. Now both boxes end with the same goal.');
  const classical=pick(['p','(p ∨ q)','(q ∧ r)']),reverse=rng()<.5;
  const premise=reverse?'¬¬'+classical:classical,assumption='¬'+classical;
  if(rng()<.35) {
    const atom=pick([p,q,r]);
    add('Classical reasoning','Which plan applies the classical rule to prove excluded middle?',
      'Goal with no premises: '+atom+' ∨ ¬'+atom,
      'Assume ¬('+atom+' ∨ ¬'+atom+'), derive ⊥, then discharge that box.',
      ['Assume '+atom+', introduce the disjunction and copy it outside the box.',
       'Use ∨ elim directly on the goal to choose the true disjunct.',
       'Assume the goal and finish by copying your assumption outside the box.'],
      'In the outer box assume the negation of the goal. Temporarily assume '+atom+' and use ∨ intro to contradict the outer assumption. Closing the inner box gives ¬'+atom+'. That also gives the disjunction by ∨ intro, hence ⊥ again. Close the outer box with contra (classical).');
  } else add('Classical reasoning','Which rule discharges the box to obtain the displayed goal?',
    'Goal: '+f(reverse?classical:'¬¬'+classical),reverse?'contra (classical) 2–3':'¬ intro 2–3',
    [reverse?'¬ intro 2–3':'contra (classical) 2–3','contra 3','¬ elim 2,1'],
    reverse?'The box assumes the negation of the goal and reaches ⊥. Recovering the positive goal by discharging that box uses the classical rule.':'The box assumes '+f(assumption)+' and reaches ⊥. Negating that assumption gives '+f('¬¬'+classical)+' constructively.',
    [line(premise,'premise'),line(assumption,'assumption',1,true),line('⊥',reverse?'¬ elim 2,1':'¬ elim 1,2',1)]);
  target = discrete;
  const elems = shuffled([1,2,3,4,5,6,7,8,9],rng);
  const setText=arr=>'{'+[...arr].sort((a,b)=>a-b).join(', ')+'}';
  const A=elems.slice(0,4),B=elems.slice(2,6),C=elems.slice(3,7);
  const setOps=[['A ∩ B',elems.slice(2,4),'Keep the members that appear in both A and B.'],['A ∖ B',elems.slice(0,2),'Start in A and cross out every member of B.'],['B ∖ A',elems.slice(4,6),'Start in B and cross out every member of A.'],['(A ∪ B) ∩ C',elems.slice(3,6),'First collect A and B, then keep the members also in C.']];
  const op=pick(setOps);
  add('Sets','What is '+op[0]+'?', 'A = '+setText(A)+', B = '+setText(B)+(op[0].includes('C')?', C = '+setText(C):''),setText(op[1]),setOps.map(item=>setText(item[1])),op[2]+' This gives '+setText(op[1])+'.');
  const [i,j,k]=shuffled([1,2,3],rng), loops=[[i,i],[j,j],[k,k]], bilateral=rng()<.5;
  const pairs=[...loops,[i,j],[j,k],...(bilateral?[[j,i],[k,j]]:[])];
  const prop=bilateral?'Reflexive and symmetric only':'Reflexive and antisymmetric only';
  if(rng()<.4){
    const modulus=integer(2,4),maximum=integer(6,10),rep=integer(0,modulus-1);
    const domain=Array.from({length:maximum+1},(_,v)=>v);
    const members=domain.filter(v=>v%modulus===rep);
    add('Relations','Which is the equivalence class of '+rep+'?', 'On {0, …, '+maximum+'}, two numbers are related when they have the same remainder modulo '+modulus+'.',
      setText(members),[setText(members.slice(1)),setText([rep]),setText(domain),setText(domain.filter(v=>v%modulus===(rep+1)%modulus))],
      'Start with '+rep+' and keep adding '+modulus+' while you remain in the domain. These are exactly the numbers with remainder '+rep+', giving '+setText(members)+'.');
  } else add('Relations','Which complete list of properties holds for R on {1, 2, 3}?','R = {'+shuffled(pairs,rng).map(pair=>'('+pair.join(', ')+')').join(', ')+'}',prop,
    ['Reflexive and symmetric only','Reflexive and antisymmetric only','Reflexive, symmetric and transitive only','All four properties hold.','Transitive and antisymmetric only'],
    'All loops occur. '+(bilateral?'Each pair has its reverse. Opposite pairs on distinct elements break antisymmetry.':'No distinct pair has its reverse, so antisymmetry holds and symmetry fails.')+' The chain '+i+' R '+j+' R '+k+' lacks ('+i+', '+k+'), so transitivity fails.');
  const slope=integer(2,5),offset=integer(1,5),n=integer(2,7),gf=rng()<.5;
  const at=slope*n+offset,one=at**2,two=slope*(n**2)+offset;
  if(rng()<.4){
    const nInputs=integer(3,5),onto=rng()<.5,injective=rng()<.5;
    const destinations=Array.from({length:nInputs},(_,i)=>i+1);
    if(!injective)destinations[nInputs-1]=1;
    const imageSize=new Set(destinations).size,codomainSize=imageSize+(onto?0:1);
    const values=shuffled(destinations,rng);
    const labels=['Injective and surjective','Injective only','Surjective only','Neither injective nor surjective'];
    add('Functions','How is this function classified?',
      'Domain {1, …, '+nInputs+'}, codomain {1, …, '+codomainSize+'}. Mappings: '+values.map((v,i)=>(i+1)+' ↦ '+v).join(', ')+'.',labels[injective?(onto?0:1):(onto?2:3)],labels,
      (injective?'All outputs are distinct, so the function is injective.':'Inputs '+values.map((v,i)=>v===1?i+1:null).filter(Boolean).join(' and ')+' both map to 1, so injectivity fails.')+' '+(onto?'Every codomain element is reached, so it is surjective.':'The codomain includes '+codomainSize+', which no input reaches. Surjectivity fails.'));
  } else add('Functions','What is ('+(gf?'g ∘ f':'f ∘ g')+')('+n+')?','For integer inputs, f(x) = '+slope+'x + '+offset+' and g(x) = x².',gf?one:two,
    [gf?two:one,at,n**2,one+1,two+1,one+two],
    gf?'Apply f first: f('+n+') = '+at+'. Then g('+at+') = '+one+'.':'Apply g first: g('+n+') = '+n**2+'. Then f('+n**2+') = '+two+'.');
  const verts=shuffled(['A','B','C','D','E'],rng),[h,l,m,o,t]=verts;
  const edges=[h+l,l+m,m+h,m+o,o+t], isBridge=rng()<.5;
  if(isBridge) add('Graphs','Which pair lists all the bridges?','Undirected edges: '+shuffled(edges,rng).join(', ')+'.',m+o+' and '+o+t,[edges[0]+' and '+edges[1],edges[1]+' and '+edges[4],edges[2]+' and '+edges[3]],
    'The triangle '+h+l+m+' provides a second route around each of its edges. Deleting '+m+o+' separates the tail from the triangle, and deleting '+o+t+' isolates '+t+'.');
  else add('Graphs','What is the degree of '+m+'?','Undirected edges: '+shuffled(edges,rng).join(', ')+'.',3,[1,2,4,5],
    'The edges '+l+m+', '+m+h+' and '+m+o+' each meet '+m+' once, giving degree 3.');
  const total=integer(12,25),small=integer(3,6),rest=total-small,degree=rng()<.5;
  add('Trees',degree?'What is the degree sum of the remaining component?':'How many edges are in the remaining component?',
    'A tree has '+total+' vertices. Removing one edge splits off a component of '+small+' vertices.',degree?2*(rest-1):rest-1,
    [rest,2*rest,rest-2,2*rest-1,total-1,2*(rest-1),rest-1],
    'The other component has '+total+' − '+small+' = '+rest+' vertices. It is a tree, so it has '+(rest-1)+' edges.'+(degree?' Each edge has two ends, giving a degree sum of '+2*(rest-1)+'.':''));
  const dig=shuffled(['J','K','L','M','N'],rng),[a1,b1,c1,d1,e1]=dig;
  const forward=rng()<.5, arrows=[a1+' → '+b1,b1+' → '+c1,c1+' → '+a1,c1+' → '+d1,forward?d1+' → '+e1:e1+' → '+d1];
  const letters=vs=>'{'+[...vs].sort().join(', ')+'}';
  add('Directed graphs','Which vertices are reachable from '+b1+', counting a path of length zero?','Arrows: '+shuffled(arrows,rng).join(', ')+'.',letters(forward?dig:dig.slice(0,4)),
    [letters(forward?dig.slice(0,4):dig),letters(dig.slice(0,3)),letters([c1,d1]),letters([b1,c1])],
    'Follow '+b1+' → '+c1+'. From '+c1+' you reach '+a1+' and '+d1+'. '+(forward?'The arrow '+d1+' → '+e1+' also reaches '+e1+'.':'The arrow '+e1+' → '+d1+' points into '+d1+', so you cannot follow it back to '+e1+'.')+' Include the starting vertex.');
  return [...shuffled(logic,rng),...shuffled(discrete,rng)];
}
