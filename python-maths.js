import {pySet} from './set-expression.js';

export function setCalculation(A,B,C,expression) {
  const operations = {'A ∩ B':'A & B','A ∪ B':'A | B','B ∖ A':'B - A','(A ∪ B)ᶜ':'U - (A | B)','A ∩ (B ∪ C)':'A & (B | C)'};
  return ['A = '+pySet(new Set(A)), 'B = '+pySet(new Set(B)), ...(expression.includes('C')?['C = '+pySet(new Set(C))]:[]),
    ...(expression.includes('ᶜ')?['U = set(range(1, 9))']:[]),'print('+operations[expression]+')'].join('\n');
}

export function setLink(inputs,expression) {
  const params = new URLSearchParams({...inputs, expression});
  return './sets.html?'+params;
}

export function relationCode(pairs, calculation) {
  return 'R = '+(pairs.length ? '{'+pairs.map(([a,b])=>'('+a+', '+b+')').join(', ')+'}' : 'set()')+'\n'+calculation;
}

export const shortcuts = 'shortcuts = {(x, z) for x, y in R for u, z in R if y == u}';
export const closure = `closure = R.copy()
while True:
    new = {(x, z) for x, y in closure for u, z in closure if y == u} - closure
    if not new:
        break
    closure.update(new)
print(len(closure - R))`;

export function graphCode(edges,body,walk=false) {
  const search = `def reachable(start, edges, directed=False):
    seen = {start}
    todo = [start]
    while todo:
        vertex = todo.pop()
        for a, b in edges:
            if a == vertex and b not in seen:
                seen.add(b)
                todo.append(b)
            if not directed and b == vertex and a not in seen:
                seen.add(a)
                todo.append(a)
    return seen
`;
  return 'edges = '+JSON.stringify(edges)+'\n'+(walk?'\n'+search+'\n':'')+body;
}
export const bridges = 'bridges = [edge for edge in edges if edge[1] not in reachable(edge[0], [e for e in edges if e != edge])]';

export function functionCode(k,b,calculation) {
  return 'def f(n):\n    return '+k+' * n + '+b+'\n\n'+calculation;
}
export const square = 'def g(n):\n    return n ** 2\n\n';
