import {universe,baseSets,vennFigure,relationFigure,mappingFigure,graphFigure,fmt} from './diagrams.js';
const ops=['A ∩ B','A ∪ B','A ∖ B','B ∖ A','Aᶜ'];
const state={A:[...baseSets.A],B:[...baseSets.B],op:0,pairs:['11','22','33','12','23'],values:[1,1,2],targets:3,edges:['AB','BC','CA','CD','DE'],directed:false};
const graphOptions=['AB','BC','CA','CD','DE','EA','BD'];
const pick=(name,values,selected)=>'<select data-field="'+name+'">'+values.map((v,i)=>'<option value="'+i+'" '+(i===selected?'selected':'')+'>'+v+'</option>').join('')+'</select>';
const check=(name,val,on)=>'<label><input type="checkbox" data-field="'+name+'" value="'+val+'" '+(on?'checked':'')+'> '+val+'</label>';
function fields(label,contents){return '<fieldset class="explorefieldset"><legend>'+label+'</legend>'+contents+'</fieldset>'}
export function analyseRelation(pairs){
 const p=(a,b)=>pairs.includes(''+a+b),xs=[1,2,3];
 let result={Reflexive:'Yes. Every diagonal pair is present.',Symmetric:'Yes. Every present pair has its reverse.',Antisymmetric:'Yes. No distinct elements connect both ways.',Transitive:'Yes. Every two-link chain has its shortcut.'};
 for(const a of xs){
 if(!p(a,a))result.Reflexive='No. ('+a+', '+a+') is missing.';
 for(const b of xs){
 if(p(a,b)&&!p(b,a))result.Symmetric='No. ('+a+', '+b+') has no reverse.';
 if(a!==b&&p(a,b)&&p(b,a))result.Antisymmetric='No. '+a+' and '+b+' are distinct and related both ways.';
 for(const c of xs)if(p(a,b)&&p(b,c)&&!p(a,c))result.Transitive='No. '+a+' R '+b+' and '+b+' R '+c+', but ('+a+', '+c+') is missing.';
 }}return result;
}
function calcGraph(){
 const nodes='ABCDE'.split(''),reached=new Set(['A']),queue=['A'];
 while(queue.length){let n=queue.shift();for(const e of state.edges){const next=e[0]===n?e[1]:!state.directed&&e[1]===n?e[0]:null;if(next&&!reached.has(next)){reached.add(next);queue.push(next);}}}
 if(state.directed)return 'Reachable from A, including A by a zero-length path: '+[...reached].sort().join(', ')+'.';
 const connected=reached.size===nodes.length;
 return (connected?'Connected.':'Disconnected.')+' '+state.edges.length+' edges and 5 vertices. '+(connected&&state.edges.length===4?'This graph is a tree.':'A tree here needs one connected component and exactly 4 edges.');
}
export function explore(topic){
 let body='', controls='', result='',title='',prompt='';
 if(topic===0){
 title='Build your own sets';prompt='Change the members of A and B. The diagram highlights the result of your operation.';
 const tests=[(a,b)=>a&&b,(a,b)=>a||b,(a,b)=>a&&!b,(a,b)=>b&&!a,a=>!a];
 const xs=universe.filter(n=>tests[state.op](state.A.includes(n),state.B.includes(n)));
 body=vennFigure(state,xs);controls=['A','B'].map(k=>fields('Members of '+k,universe.map(n=>check(k,n,state[k].includes(n))).join(''))).join('')+'<label>Operation '+pick('op',ops,state.op)+'</label>';result=ops[state.op]+' = '+fmt(xs);
 }else if(topic===1){
 title='Build a relation';prompt='Toggle ordered pairs in the matrix. Watch which properties change and find the pair responsible.';body=relationFigure(state.pairs,true);
 result=Object.entries(analyseRelation(state.pairs)).map(([k,v])=>'<div><strong>'+k+'</strong> · '+v+'</div>').join('');
 }else if(topic===2){
 title='Rewire a function';prompt='Choose one output for each input. Look for shared targets and targets with no incoming arrow.';
 body=mappingFigure(state.values,state.targets);
 controls=fields('Arrow destinations',state.values.map((v,i)=>'<label>'+['a','b','c'][i]+' maps to '+pick('map'+i,[1,2,3],v-1)+'</label>').join(''));
 const unique=new Set(state.values),missing=[1,2,3].filter(i=>!unique.has(i));
 const duplicate=state.values.find((v,i)=>state.values.indexOf(v)!==i);
 result=duplicate?'Image = '+fmt([...unique].sort())+'. Inputs '+['a','b','c'].filter((_,i)=>state.values[i]===duplicate).join(' and ')+' share target '+duplicate+'. '+missing.join(', ')+' unvisited. This function is neither injective nor surjective.':'Each target receives exactly one arrow. This function is bijective.';
 }else{
 title='Build a graph';prompt='Add or remove edges and switch their direction on. See how the connections change.';
 body=graphFigure(state.edges,state.directed);controls='<label><input type="checkbox" data-field="directed" '+(state.directed?'checked':'')+'> Use directed edges (first vertex to second)</label>'+fields('Edges',graphOptions.map(e=>check('edges',e,state.edges.includes(e))).join(''));result=calcGraph();
 }
 return '<section class="panel explore"><div class="panelhead"><span class="kicker">Exploration</span></div><div class="panelbody"><h2>'+title+'</h2><p class="prompt">'+prompt+'</p>'+body+controls+'<output aria-live="polite" class="message good">'+result+'</output></div></section>';
}
function toggle(list,value){return list.includes(value)?list.filter(v=>v!==value):[...list,value];}
export function changeExplore(field,value,checked){
 if(field==='pair')state.pairs=toggle(state.pairs,value);
 else if(field==='op')state.op=Number(value);
 else if(field==='A'||field==='B')state[field]=toggle(state[field],Number(value)).sort((a,b)=>a-b);
 else if(field==='edges')state.edges=toggle(state.edges,value);
 else if(field==='directed')state.directed=checked;
 else if(field.startsWith('map'))state.values[Number(field.slice(3))]=Number(value)+1;
}
