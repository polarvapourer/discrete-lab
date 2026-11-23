const icons = {
 sets:'<circle cx="8.5" cy="12" r="6"/><circle cx="15.5" cy="12" r="6"/>',
 relations:'<rect x="3" y="4" width="5" height="5" rx="1.3"/><rect x="16" y="15" width="5" height="5" rx="1.3"/><path d="M8 6.5h6a4 4 0 0 1 4 4v4M14.5 11.5l3.5 3.5 3.5-3.5"/>',
 functions:'<path d="M5 19c4 3 5-2 6-9s2-9 6-6M6.5 10H16"/>',
 graphs:'<path d="m5 17 6-12 8 12H5"/><g fill="currentColor"><circle cx="5" cy="17" r="2.3"/><circle cx="11" cy="5" r="2.3"/><circle cx="19" cy="17" r="2.3"/></g>',
 book:'<path d="M3 5.5c4-1.5 7-.4 9 1.4 2-1.8 5-2.9 9-1.4v14c-4-1.5-7-.4-9 1.4-2-1.8-5-2.9-9-1.4zM12 7v14"/>',
 pencil:'<path d="m4 16-1 5 5-1L20 8l-4-4zM13.5 6.5l4 4"/>',
 hint:'<path d="M8 16c0-2-3-3-3-7a7 7 0 0 1 14 0c0 4-3 5-3 7zM9 19h6m-5 3h4"/>',
 guide:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8m-8 4h8m-8 4h5"/>'};
export function icon(name){return '<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true">'+icons[name]+'</svg>'}
export const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const textAt=(x,y,value,attr='')=>`<text x="${x}" y="${y}" text-anchor="middle" ${attr}>${esc(value)}</text>`;
function board(name,content,caption){return `<div class="board"><div class="boardtop"><span>${name}</span><span aria-hidden="true">＋</span></div>${content}<div class="legend">${esc(caption)}</div></div>`;}
function svg(view,body,description){return `<svg class="fig" viewBox="${view}" role="img" aria-label="${esc(description)}" fill="#263f30">${body}</svg>`;}
export const baseSets = {A:[1,2,3,4], B:[3,4,5,6]};
export const universe=[1,2,3,4,5,6,7,8];
export const fmt = xs=>xs.length?'{'+xs.join(', ')+'}':'∅';
export function vennFigure(sets=baseSets,selected=[],interactive=false){
 const groups=[[],[],[],[]];
 for(const n of universe){const a=sets.A.includes(n),b=sets.B.includes(n);groups[a?(b?1:0):b?2:3].push(n);}
 // Centre each column within its disjoint Venn region. Compress longer lists into a small grid.
 function numbers(group,cx,cy){
  const cols=group.length>4?2:1,rows=Math.ceil(group.length/cols),dy=Math.min(25,75/Math.max(1,rows-1));
  return group.map((n,i)=>{const x=cx+((i%cols)-(cols-1)/2)*17,y=cy+(Math.floor(i/cols)-(rows-1)/2)*dy;
   return (interactive?`<g data-venn="${n}"><circle cx="${x}" cy="${y-5}" r="12" fill="transparent"/>`:'')+(selected.includes(n)?`<circle cx="${x}" cy="${y-5}" r="10" fill="#345c43"/>`:'')+textAt(x,y,n,`font-size="16" font-family="monospace" fill="${selected.includes(n)?'#fff':'#293e30'}"`)+(interactive?'</g>':'');}).join('');
 }
 const caption='A = '+fmt(sets.A)+'     ·     B = '+fmt(sets.B);
 const content='<circle cx="199" cy="99" r="83" fill="#d0e4cd" fill-opacity=".88" stroke="#699572" stroke-width="1.6"/><circle cx="295" cy="99" r="83" fill="#f4dca9" fill-opacity=".7" stroke="#ae9059" stroke-width="1.6"/>'+textAt(155,45,'A','font-family="Georgia" font-size="21" font-style="italic"')+textAt(338,45,'B','font-family="Georgia" font-size="21" font-style="italic"')+textAt(53,30,'U','font-family="Georgia" font-size="19" font-style="italic"')+numbers(groups[0],182,108)+numbers(groups[1],247,108)+numbers(groups[2],313,108)+numbers(groups[3],414,104);
 return board('Venn diagram',svg('35 0 420 194',content,caption+'; U contains the integers 1 to 8.'),caption+'     ·     U = {1, …, 8}');
}
const marker='<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#4e745e"/></marker></defs>';
export function relationFigure(pairs,editable=false){
 const rows=[1,2,3],header='<tr><th scope="col">R</th>'+rows.map(n=>'<th scope="col">'+n+'</th>').join('')+'</tr>';
 const body=rows.map(a=>'<tr><th scope="row">'+a+'</th>'+rows.map(b=>{const pair=''+a+b,yes=pairs.includes(pair);return '<td>'+(editable?`<button class="matrixbtn" data-pair="${pair}" aria-label="Pair (${a}, ${b})" aria-pressed="${yes}">${yes?'✓':'·'}</button>`:`<span aria-label="${yes?'present':'absent'}">${yes?'✓':'–'}</span>`)+'</td>';}).join('')+'</tr>').join('');
 return board('Relation matrix','<table class="mat" aria-label="Relation on 1, 2 and 3"><thead>'+header+'</thead><tbody>'+body+'</tbody></table>',editable?'Select a cell to add or remove its ordered pair.':'Row = first element   ·   Column = second element');
}
export function mappingFigure(values,targets){
 const letters=['a','b','c'], yy=(i,n)=>n===1?94:48+110*i/(n-1);
 let body=marker+textAt(130,20,'Domain','font-size="14"')+textAt(330,20,'Codomain','font-size="14"');
 values.forEach((v,i)=>{body+=`<path d="M146 ${yy(i,3)} L311 ${yy(v-1,targets)}" stroke="#4e745e" stroke-width="2" marker-end="url(#arrow)"/>`;});
 function node(x,y,v,color){return `<circle cx="${x}" cy="${y}" r="15" fill="${color}" stroke="#80947d"/>`+textAt(x,y+5,v,'font-size="16"');}
 values.forEach((_,i)=>body+=node(130,yy(i,3),letters[i],'#d7e8d2'));
 for(let i=0;i<targets;i++)body+=node(330,yy(i,targets),i+1,'#f6e2b7');
 const caption=values.map((v,i)=>letters[i]+' ↦ '+v).join('     ·     ');
 return board('Mapping diagram',svg('55 0 350 185',body,caption+'. Codomain: 1 to '+targets),caption);
}
export function graphFigure(edges,directed){
 const xy={A:[80,105],B:[164,29],C:[328,46],D:[383,138],E:[204,158]};
 let body=marker;
 for(const [from,to] of edges){const [x,y]=xy[from],[a,b]=xy[to],len=Math.hypot(a-x,b-y),dx=(a-x)/len,dy=(b-y)/len;
 body+=`<line x1="${x+dx*18}" y1="${y+dy*18}" x2="${a-dx*19}" y2="${b-dy*19}" stroke="#4e745e" stroke-width="2.3" ${directed?'marker-end="url(#arrow)"':''}/>`;}
 for(const [k,[x,y]] of Object.entries(xy)){body+=`<circle cx="${x}" cy="${y}" r="17" fill="#d4e5cd" stroke="#708f70" stroke-width="1.7"/>`+textAt(x,y+6,k,'font-size="17"');}
 const caption=edges.map(e=>e[0]+(directed?' → ':'—')+e[1]).join('   ·   ')||'No edges';
 return board(directed?'Directed graph':'Undirected graph',svg('48 0 375 182',body,caption),caption);
}
export function figure(f,selected=[]){switch(f.type){
 case 'venn':return vennFigure(f.sets || baseSets,selected,true);
 case 'relation':return relationFigure(f.pairs);
 case 'mapping':return mappingFigure(f.values,f.targets);
 case 'graph':return graphFigure(f.edges,f.directed);
 default:return board('Given information','<div class="mathcard">'+esc(f.body)+'</div>',f.caption);
}}
