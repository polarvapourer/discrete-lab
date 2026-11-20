// Versioned so a shared seed always identifies the rules that generated a set.
import {fmt, universe} from './diagrams.js';
export const VERSION = 1;
export const subjects=['Sets','Relations','Functions','Graphs'];
export const levels=['Accessible','Moderate','Stretch'];
export const defaultConfig={subject:'Mixed revision',level:'Mixed difficulty',count:10,seed:''};

function randomSource(seed){
 let x=2166136261;
 for(const c of seed){x=Math.imul(x^c.charCodeAt(0),16777619);}
 if(x===0)x=1;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
function shuffle(list,rng){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const math=(body,caption)=>({type:'math',body,caption});
function numeric(title,prompt,figure,answer,steps){return {title,prompt,figure,type:'number',answer:String(answer),steps};}
function selection(title,prompt,figure,choices,answers,steps){return {title,prompt,figure,type:'selection',choices,answers,steps};}
const sorted=xs=>[...xs].sort((a,b)=>a-b);
function sets(level,variant,rng){
 const randomSet=()=>sorted(shuffle(universe,rng).slice(0,2+Math.floor(rng()*5)));
 const A=randomSet(),B=randomSet(),C=randomSet(),fig={type:'venn',sets:{A,B}};
 if(level===2&&variant===1){const a=3+Math.floor(rng()*25),b=4+Math.floor(rng()*21),both=1+Math.floor(rng()*Math.min(a,b)),neither=1+Math.floor(rng()*13),total=a+b-both+neither;
 return numeric('Count exactly one group','How many students chose exactly one activity?',math(total+' students · '+a+' chose music · '+b+' chose sport\n'+neither+' chose neither','Students can choose both activities.'),a+b-2*both,['Remove the students who chose neither to find the union.',total+' − '+neither+' = '+(total-neither)+' chose at least one. The overlap is '+a+' + '+b+' − '+(total-neither)+' = '+both+'.','Remove the overlap from the union: '+(total-neither)+' − '+both+' = '+(total-neither-both)+'.']);}
 const expressions=[['A ∩ B','A ∪ B'],['B ∖ A','(A ∪ B)ᶜ'],['A ∩ (B ∪ C)']];
 const expression=expressions[level][variant],useC=level===2;
 const test=(n)=>{const a=A.includes(n),b=B.includes(n);return level===0?(variant?a||b:a&&b):level===1?(variant?!a&&!b:b&&!a):a&&(b||C.includes(n));};
 const answer=universe.filter(test),choices=[...universe.map(String),'∅'];
 const step=level===0?(variant?'Collect the members from both sets.':'Start with the members of A.'):(level===1?(variant?'Use U as the starting set.':'Start with the members of B.'):'First take the union of B and C.');
 const mid=level===0?(variant?'Count a member that appears twice only once.':'Keep a member of A only if it also occurs in B.'):(level===1?(variant?'Remove every number inside either circle.':'Remove every member that also appears in A.'):'B ∪ C = '+fmt(universe.filter(n=>B.includes(n)||C.includes(n)))+'. Keep only members also in A.');
 return selection('Evaluate '+expression,'Select every member of '+expression+', or choose ∅ if it is empty.',useC?math('A = '+fmt(A)+'\nB = '+fmt(B)+'\nC = '+fmt(C),'U = {1, …, 8}'):fig,choices,answer.length?answer.map(String):['∅'],[step,mid,expression+' = '+fmt(answer)+'.']);
}
const numbers=[1,2,3],pairs=numbers.flatMap(a=>numbers.map(b=>''+a+b));
const pairText=p=>'('+p[0]+', '+p[1]+')';
function relations(level,variant,rng){
 const r=shuffle(pairs,rng).slice(0,2+Math.floor(rng()*6)).sort(),figure={type:'relation',pairs:r},a=numbers[Math.floor(rng()*3)];
 if(level===0){const links=r.filter(p=>Number(p[variant])===a),out=links.map(p=>p[1-variant]).sort();return selection(variant?'Trace incoming pairs':'Read a matrix row',variant?'Which x satisfy x R '+a+'? Choose ∅ if none.':'Which y satisfy '+a+' R y? Choose ∅ if none.',figure,['1','2','3','∅'],out.length?out:['∅'],[variant?'Fix the second coordinate. Read column '+a+'.':'Fix the first coordinate. Read row '+a+'.','The matching pairs are '+(links.map(pairText).join(', ')||'absent')+'.','The requested set is '+fmt(out)+'.']);}
 if(level===1){const add=variant?r.map(p=>p[1]+p[0]).filter(p=>!r.includes(p)):numbers.map(n=>''+n+n).filter(p=>!r.includes(p));const property=variant?'symmetric':'reflexive';return numeric('Complete the relation','How many pairs must be added at minimum to make R '+property+'?',figure,add.length,[variant?'For each tick, look for its reflection across the diagonal.':'Inspect the three diagonal cells.', 'Missing '+(variant?'reverse pairs':'loops')+': '+(add.map(pairText).join(', ')||'none')+'.','Adding exactly these '+add.length+' pairs is sufficient.']);}
 const composed=new Set();for(const [x,y] of r)for(const [u,z] of r)if(y===u)composed.add(x+z);
 if(variant===0){const missing=[...composed].filter(p=>!r.includes(p));return numeric('Find the missing shortcuts','How many distinct pairs are endpoints of a two-link chain in R but are absent from R?',figure,missing.length,['Join two pairs whenever the end of the first is the start of the second.','The distinct two-link endpoint pairs are '+([...composed].sort().map(pairText).join(', ')||'absent')+'.','Removing pairs already in R leaves '+(missing.map(pairText).join(', ')||'none')+', a total of '+missing.length+'.']);}
 const closure=new Set(r);let before;do{before=closure.size;for(const [x,y] of [...closure])for(const [u,z] of [...closure])if(y===u)closure.add(x+z);}while(before!==closure.size);
 const extra=[...closure].filter(p=>!r.includes(p));return numeric('Build a transitive closure','How many new pairs are needed for the smallest transitive relation containing R?',figure,extra.length,['Follow directed chains of positive length. Each reachable endpoint needs a direct pair.','Add missing shortcuts, including loops reached via cycles. Repeat until no new pair is required.','The added pairs are '+(extra.sort().map(pairText).join(', ')||'none')+'. The minimum is '+extra.length+'.']);
}
function functions(level,variant,rng){
 const rand=(min,max)=>min+Math.floor(rng()*(max-min+1)),k=rand(2,8),b=rand(1,14),x=rand(-6,9);
 const f='f(x) = '+k+'x + '+b,g='g(x) = x²',cap='Functions on the integers.';
 if(level===0){const arg=variant?x+1:x;return numeric('Evaluate a function',variant?'Calculate f('+x+' + 1).':'Calculate f('+x+').',math(f,cap),k*arg+b,[variant?'Evaluate the input first: '+x+' + 1 = '+arg+'.':'Replace x in the rule by '+arg+'.','The multiplication gives '+k+' × ('+arg+') = '+k*arg+'.','Add '+b+' to get '+(k*arg+b)+'.']);}
 if(level===1){const first=variant?x*x:k*x+b,ans=variant?k*first+b:first*first;
 return numeric('Compose two functions','Calculate ('+(variant?'f ∘ g':'g ∘ f')+')('+x+').',math(f+'\n'+g,cap),ans,['Start with the right-hand function.',(variant?'g':'f')+'('+x+') = '+first+'.','Now evaluate '+(variant?'f':'g')+'('+first+') = '+ans+'.']);}
 const target=k*x+b;
 if(variant===0){return numeric('Recover the input','Find the unique integer input n for which f(n) = '+target+'.',math(f,cap),x,['Write the equation '+k+'n + '+b+' = '+target+'.','Subtract '+b+' from both sides to obtain '+k+'n = '+k*x+'.','Divide by '+k+': n = '+x+'. Since the coefficient is nonzero, there is only one solution.']);}
 const u=rand(1,12),parity=rand(0,1),y=k*u*u+b+parity;
 return numeric('Count the preimages','How many integers n satisfy (f ∘ g)(n) = '+y+'?',math(f+'\n'+g,cap),parity?0:2,['Substitute g(n) into f to obtain '+k+'n² + '+b+' = '+y+'.','Subtract '+b+': '+k+'n² = '+(y-b)+'.',parity?'The right side is not divisible by '+k+', so no integer n works.':'Dividing gives n² = '+u*u+'. Both '+u+' and −'+u+' work, giving two preimages.']);}
const vertices=['A','B','C','D','E'];
const edges=vertices.flatMap((a,i)=>vertices.slice(i+1).map(b=>a+b));
function reached(es,start,directed){const seen=new Set([start]),queue=[start];while(queue.length){const n=queue.shift();for(const [u,v] of es){const next=n===u?v:!directed&&n===v?u:null;if(next&&!seen.has(next)){seen.add(next);queue.push(next);}}}return [...seen].sort();}
function graphs(level,variant,rng){
 const directed=level===1||level===0&&variant===1,es=shuffle(edges,rng).slice(0,3+Math.floor(rng()*5)).map(e=>directed&&rng()<.5?e[1]+e[0]:e).sort(),figure={type:'graph',edges:es,directed},a=vertices[Math.floor(rng()*5)];
 if(level===0){const links=es.filter(e=>directed?e[1]===a:e.includes(a));return numeric('Count the '+(directed?'in-degree':'degree'),'Find the '+(directed?'in-degree':'degree')+' of '+a+'.',figure,links.length,[directed?'Count arrows arriving at '+a+'.':'Count the edges touching '+a+'.','The matching edges are '+(links.join(', ')||'absent')+'.','Each contributes one. The total is '+links.length+'.']);}
 if(level===1){const rev=variant?es.map(e=>e[1]+e[0]):es,ans=reached(rev,a,true);return selection('Trace directed reachability',variant?'Which vertices can reach '+a+'? Include a path of length zero.':'Which vertices are reachable from '+a+'? Include a path of length zero.',figure,vertices,ans,['Include '+a+' itself via the zero-length path.',variant?'Start at '+a+' and follow the arrows backwards to identify starting points.':'From '+a+', follow outgoing arrows. Continue from each newly reached vertex.','The complete set is '+fmt(ans)+'.']);}
 if(variant===0){const removed=es[Math.floor(rng()*es.length)],remaining=es.filter(e=>e!==removed),out=reached(remaining,a,false);return selection('Trace a graph after deletion','Remove edge '+removed+'. Which vertices are then in the same component as '+a+'?',figure,vertices,out,['Cross out '+removed+' while keeping all five vertices.','Starting at '+a+', follow only the remaining edges in either direction.','The component containing '+a+' is '+fmt(out)+'.']);}
 const bridges=es.filter(e=>!reached(es.filter(k=>k!==e),e[0],false).includes(e[1]));return numeric('Count the bridges','How many edges are bridges?',figure,bridges.length,['Test one edge at a time. Restore it before testing the next.','If its endpoints still have a route between them after deletion, the edge belongs to a cycle.','The edges with no alternative route are '+(bridges.join(', ')||'absent')+'. There are '+bridges.length+' bridges.']);}
export function configOK(c){return !!c&&[...subjects,'Mixed revision'].includes(c.subject)&&[...levels,'Mixed difficulty'].includes(c.level)&&Number.isInteger(c.count)&&c.count>=1&&c.count<=100&&typeof c.seed==='string'&&c.seed.trim().length>0&&c.seed.length<=64;}
export function generate(c){
 if(!configOK(c))throw Error('Choose a count from 1 to 100 and a seed of 1–64 characters.');
 const rng=randomSource(JSON.stringify([VERSION,c.subject,c.level,c.count,c.seed])),seen=new Set(),deck=[];
 const easy=Math.round(.3*c.count),hard=Math.round(.2*c.count);
 const subjectsByIndex=[];while(subjectsByIndex.length<c.count)subjectsByIndex.push(...shuffle([0,1,2,3],rng));
 const uses=new Map();
 for(let i=0;i<c.count;i++){
  const subject=c.subject==='Mixed revision'?subjectsByIndex[i]:subjects.indexOf(c.subject),level=c.level==='Mixed difficulty'?(i<easy?0:i<c.count-hard?1:2):levels.indexOf(c.level);
  const family=subject+'-'+level;const occurrence=uses.get(family)??Math.floor(rng()*2);uses.set(family,occurrence+1);
  let accepted=false;
  for(let tries=0;tries<1500;tries++){const variant=(occurrence+(tries>50?1:0))%2,q=[sets,relations,functions,graphs][subject](level,variant,rng),key=JSON.stringify([q.prompt,q.figure]);
   if(seen.has(key))continue;seen.add(key);deck.push({...q,subject:subjects[subject],level:levels[level]});accepted=true;break;}
  if(!accepted)throw Error('This seed ran out of distinct questions. Try another seed or a smaller set.');
 }return deck;
}
