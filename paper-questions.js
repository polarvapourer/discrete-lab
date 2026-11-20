// Each solution step is a separate one-mark self-assessment criterion.
const question = (id, topic, title, data, tasks, hints, marks) =>
  ({id, topic, title, data, tasks, hints, marks});

export const topics = ['Sets', 'Relations', 'Functions', 'Graphs'];

export const questions = [
 question('sets-venn', 'Sets', 'Work from the overlap',
  ['A class has 34 students. 19 study French, 16 study Spanish and 7 study both.'],
  ['Draw and label a Venn diagram, including the students outside both circles.', 'Find how many study exactly one language. Show your calculation.'],
  ['Fill the overlap first.', 'Subtract 7 from each language total to find the two regions outside the overlap.', 'Count the three regions inside the circles before working out how many are outside.'],
  ['Place 7 in the overlap.', 'Put 19 − 7 = 12 in French only and 16 − 7 = 9 in Spanish only.', 'Put 34 − (12 + 7 + 9) = 6 outside both.', 'Write 12 + 9 = 21 for exactly one.']),
 question('sets-proof', 'Sets', 'Prove a set identity',
  ['Let A, B and C be sets.'],
  ['Prove A ∖ (B ∪ C) = (A ∖ B) ∩ (A ∖ C) using an arbitrary element. Name the logical law you use.'],
  ['Pick an arbitrary x and start by translating membership in the left-hand side.', 'Write “x is in A and x is not in B ∪ C”. What must be true about membership in B and in C?', 'Use De Morgan’s law on “not (x is in B or x is in C)”, then regroup the conditions into two set differences.'],
  ['For arbitrary x, x ∈ A ∖ (B ∪ C) iff x ∈ A and ¬(x ∈ B or x ∈ C).', 'By De Morgan’s law this is equivalent to x ∈ A and x ∉ B and x ∉ C.', 'Regroup as (x ∈ A and x ∉ B) and (x ∈ A and x ∉ C). Repeating x ∈ A does not change the condition.', 'This is equivalent to x ∈ (A ∖ B) ∩ (A ∖ C). Since x was arbitrary and every step was an equivalence, the sets are equal.']),
 question('sets-subsets', 'Sets', 'Distinguish elements from subsets',
  ['S = {∅, {4}, 9}.'],
  ['Decide whether {4} ∈ S, {4} ⊆ S and {∅, 9} ⊆ S. Give a reason for each.', 'Find |P(S)| and explain why.'],
  ['Write the three elements of S exactly as they appear.', 'For {4} ⊆ S, check the element inside the braces.', 'Each of the three elements can independently be in or out of a subset.'],
  ['{4} ∈ S is true because the entire object {4} appears in S.', '{4} ⊆ S is false because 4 ∉ S.', '{∅, 9} ⊆ S is true because ∅ ∈ S and 9 ∈ S.', '|P(S)| = 2³ = 8 since each of the three elements can be included or excluded.']),
 question('sets-counter', 'Sets', 'Disprove an equality',
  ['A student claims that P(A ∪ B) = P(A) ∪ P(B) for all sets A and B. P denotes the power set.'],
  ['Choose small sets A and B, write out both sides and identify an element that disproves the equality.'],
  ['Try two different one-element sets.', 'Think of a subset of A ∪ B that takes one element from each set.', 'Use A = {2} and B = {5}. Compare whether {2, 5} is an element of each side.'],
  ['Choose disjoint singletons, for example A = {2} and B = {5}.', 'P(A ∪ B) = {∅, {2}, {5}, {2, 5}}.', 'P(A) ∪ P(B) = {∅, {2}, {5}}.', '{2, 5} belongs to the left-hand side and is absent from the right-hand side. One unequal example disproves the universal claim.']),
 question('relations-properties', 'Relations', 'Classify a relation',
  ['On X = {1, 2, 3, 4}, let R = {(1,1), (2,2), (3,3), (4,4), (1,2), (2,3), (3,2)}.'],
  ['Decide whether R is reflexive, symmetric, antisymmetric and transitive. Give evidence for each answer.'],
  ['Draw a table with source as row and destination as column.', 'Inspect the diagonal and then compare entries reflected across it.', 'For transitivity, try the chain 1 R 2 R 3.'],
  ['Reflexive. All four diagonal pairs are listed.', 'Not symmetric. (1,2) is listed while (2,1) is missing.', 'Not antisymmetric. 2 R 3 and 3 R 2 hold with 2 ≠ 3.', 'Not transitive. 1 R 2 and 2 R 3 hold while (1,3) is missing.']),
 question('relations-classes', 'Relations', 'Find equivalence classes',
  ['On X = {0, 1, 2, 3, 4, 5, 6, 7}, define x R y when x and y have the same remainder after division by 3.'],
  ['Explain why R is an equivalence relation.', 'List the distinct equivalence classes and count the ordered pairs in R.'],
  ['Equality of remainders gives the three properties.', 'Sort the elements into remainder 0, 1 and 2.', 'A class of size k contributes k² ordered pairs, including diagonal pairs.'],
  ['Reflexive: each number has the same remainder as itself. Symmetric: equality of remainders works in either direction.', 'Transitive: if x and y share a remainder and y and z share it, x and z share it.', 'The distinct classes are {0, 3, 6}, {1, 4, 7} and {2, 5}.', 'There are 3² + 3² + 2² = 22 ordered pairs. Within a class any ordered pair is allowed.']),
 question('relations-hasse', 'Relations', 'Draw a Hasse diagram',
  ['Order D = {1, 2, 3, 4, 6, 12} by divisibility. Put the larger elements in the order higher in your diagram.'],
  ['Draw the Hasse diagram and give an incomparable pair.', 'Find the least upper bound of 3 and 4 within D.'],
  ['Start with 1 at the bottom and 12 at the top.', 'Keep a link only when there is no element of D strictly between its endpoints in the order.', 'An upper bound must be divisible by both 3 and 4.'],
  ['Draw upward covers from 1 to 2 and 3, from 2 to 4 and 6, and from 3 to 6.', 'Draw upward covers from 4 and 6 to 12. Omit loops and shortcuts such as 1 directly to 6.', 'For example, 2 and 3 are incomparable because neither divides the other.', '12 is the only common upper bound in D, so it is also the least upper bound.']),
 question('relations-composition', 'Relations', 'Compose two relations',
  ['R = {(a,1), (a,3), (b,2), (c,1)}.', 'S = {(1,p), (1,q), (2,q), (3,p)}.'],
  ['List all ordered pairs in S ∘ R, where you follow R first and S second. Show the intermediate links.'],
  ['Write a three-column table with the letters a, b, c on the left.', 'An intermediate value can lead to more than one endpoint.', 'Two routes from a to p still give only one ordered pair (a,p).'],
  ['From a, follow a → 1 → p and a → 1 → q. Also a → 3 → p gives a duplicate.', 'From b, follow b → 2 → q.', 'From c, follow c → 1 → p and c → 1 → q.', 'S ∘ R = {(a,p), (a,q), (b,q), (c,p), (c,q)}.']),
 question('functions-classification', 'Functions', 'Use the domain and codomain',
  ['f: ℤ → ℤ, f(n) = 2n + 1.'],
  ['Prove or disprove injectivity and surjectivity.', 'Give a codomain that makes this same rule a bijection on the domain ℤ.'],
  ['For injectivity, start with equal outputs and work towards equal inputs.', 'Every output is odd. Can an even integer have a preimage?', 'For any odd integer y, solve for n and check that your result is an integer.'],
  ['If f(a) = f(b), then 2a + 1 = 2b + 1, so a = b. This proves injectivity.', 'The integer 0 has no integer preimage since 2n + 1 is odd for every integer n. Thus f is not surjective onto ℤ.', 'Use the odd integers as the codomain.', 'For each odd y, n = (y − 1)/2 is an integer and f(n) = y. With injectivity, this proves bijectivity.']),
 question('functions-inverse', 'Functions', 'Find and check an inverse',
  ['Define f: ℝ → ℝ by f(x) = 3x − 5.'],
  ['Find f⁻¹(y) by rearranging an equation.', 'Verify the inverse by computing both compositions.'],
  ['Write y = f(x).', 'Add 5 to each side, then divide by 3.', 'In one check substitute into f; in the other substitute into f⁻¹.'],
  ['Rearrange y = 3x − 5 to 3x = y + 5.', 'State f⁻¹(y) = (y + 5)/3 for all real y.', 'f(f⁻¹(y)) = 3((y + 5)/3) − 5 = y.', 'f⁻¹(f(x)) = ((3x − 5) + 5)/3 = x.']),
 question('functions-composition', 'Functions', 'Explain the order of composition',
  ['Let f(x) = x² and g(x) = x − 3, both from ℤ to ℤ.'],
  ['Compute (g ∘ f)(4) and (f ∘ g)(4), showing the order of substitution.', 'Give two different integer inputs showing that f ∘ g is not injective.'],
  ['Apply the function on the right first.', 'The two composite rules are x² − 3 and (x − 3)².', 'Try inputs one step on either side of 3.'],
  ['(g ∘ f)(4) = g(f(4)) = g(16) = 13.', '(f ∘ g)(4) = f(g(4)) = f(1) = 1.', 'For example, choose the distinct inputs 2 and 4.', '(f ∘ g)(2) = (−1)² = 1 and (f ∘ g)(4) = 1, so injectivity fails.']),
 question('functions-proof', 'Functions', 'Prove a composition is surjective',
  ['Let f: A → B and g: B → C both be surjective.'],
  ['Prove that g ∘ f: A → C is surjective.'],
  ['Start with an arbitrary target c in C.', 'Use surjectivity of g first to find a suitable b in B.', 'Now use surjectivity of f on that particular b.'],
  ['Choose arbitrary c ∈ C.', 'Since g is surjective, choose b ∈ B with g(b) = c.', 'Since f is surjective, choose a ∈ A with f(a) = b.', '(g ∘ f)(a) = g(b) = c. Every c therefore has a preimage.']),
 question('graphs-bridges', 'Graphs', 'Draw a graph and find bridges',
  ['Vertices are {A, B, C, D, E, F}. The undirected edges are AB, AC, BC, CD, DE, DF and EF.'],
  ['Sketch the graph and give the degree of each vertex.', 'Identify every bridge and justify why the other edges are not bridges.'],
  ['Look for triangles in the edge list.', 'An edge on a cycle can be removed without breaking connectivity between its endpoints.', 'Check what happens if you erase CD.'],
  ['Draw triangles ABC and DEF joined by CD.', 'Degrees in vertex order A through F are 2, 2, 3, 3, 2, 2.', 'CD is the only bridge. Its deletion leaves components {A, B, C} and {D, E, F}.', 'Every other edge lies in one of the two triangles, whose other two edges give an alternative path.']),
 question('graphs-tree', 'Graphs', 'Reason about a tree',
  ['A tree has 14 vertices. Removing an edge leaves components with 5 and 9 vertices.'],
  ['Find the number of edges and the degree sum of the original tree.', 'Find each component’s edge count and explain why the counts follow.'],
  ['Use the edge formula for a finite tree.', 'Each edge contributes twice to the degree sum.', 'The remaining components are connected and still acyclic.'],
  ['The original tree has 14 − 1 = 13 edges.', 'The degree sum is 2 × 13 = 26.', 'Each component is connected by definition and acyclic because deleting an edge cannot create a cycle.', 'The components therefore have 5 − 1 = 4 and 9 − 1 = 8 edges.']),
 question('graphs-directed', 'Graphs', 'Trace directed reachability',
  ['Vertices are {A, B, C, D, E}. Arrows are A → B, B → C, C → A, C → D and E → D.'],
  ['Draw the digraph. Give the in-degree and out-degree of C.', 'List the vertices reachable from B, including B via a zero-length path.', 'Name an arrow you could remove to make the graph acyclic. Explain.'],
  ['For C, count incoming and outgoing arrows separately.', 'Follow the cycle from B and check for arrows leaving the cycle.', 'Break the only directed cycle by removing one of its arrows.'],
  ['Draw the cycle A → B → C → A, plus C → D and E → D.', 'C has in-degree 1 from B and out-degree 2 to A and D.', 'B reaches {A, B, C, D}. It cannot reach E because the only edge at E points away from it.', 'For example, remove C → A. The only cycle was A → B → C → A; no cycle can include D or E since D has no outgoing arrows and E has no incoming arrows.']),
 question('graphs-degree', 'Graphs', 'Check a proposed degree list',
  ['A simple undirected graph has six vertices. A proposed degree list is 4, 3, 3, 2, 2, 1.'],
  ['Decide whether this list is possible and justify your answer.', 'Someone changes the last degree from 1 to 2. State the number of edges this revised list would require, and give one example or prove it impossible.'],
  ['Use the fact that each edge contributes two to the degree sum.', 'The original list adds to an odd number.', 'For the revised list, start by joining A to B, C, D and E. Try connecting F to B and C.'],
  ['The original sum is 15. An undirected graph has even degree sum, so it is impossible.', 'The revised sum is 16, so any example has 8 edges.', 'One example uses AB, AC, AD, AE, BF, CF, BC and DE.', 'These give A degree 4, B and C degree 3 and D, E and F degree 2, as required.'])
];

// Model drawings only appear during review. The mark criteria give text equivalents.
function drawing(caption, viewBox, contents) {
  return `<figure class="paper-diagram"><svg aria-hidden="true" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${contents}</svg><figcaption>${caption}</figcaption></figure>`;
}

function network(points, links, directed=false) {
  const marker = directed ? '<defs><marker id="paperArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="#264a3e"/></marker></defs>' : '';
  const edges = links.map(([a,b]) => {
    const [x,y] = points[a], [u,v] = points[b];
    const length = Math.hypot(u-x,v-y);
    const dx = (u-x)/length, dy = (v-y)/length;
    return `<line x1="${x+14*dx}" y1="${y+14*dy}" x2="${u-14*dx}" y2="${v-14*dy}" stroke="#264a3e" stroke-width="2" ${directed?'marker-end="url(#paperArrow)"':''}/>`;
  });
  const nodes = Object.entries(points).map(([label,[x,y]]) =>
    `<circle cx="${x}" cy="${y}" r="13" fill="#eef3ec" stroke="#264a3e"/><text x="${x}" y="${y+1}" text-anchor="middle" dominant-baseline="middle" fill="#183f34">${label}</text>`);
  return marker+edges.join('')+nodes.join('');
}

const diagrams = {
  'sets-venn': {
    after:3,
    html:drawing('Venn diagram showing all four regions', '0 0 310 170',
      '<rect x="8" y="8" width="294" height="154" rx="8" fill="#fff" stroke="#183f34"/><circle cx="120" cy="86" r="50" fill="#dceadb" fill-opacity=".8" stroke="#264a3e"/><circle cx="184" cy="86" r="50" fill="#f3dfb0" fill-opacity=".55" stroke="#735d31"/><g fill="#183f34" font-size="14" text-anchor="middle"><text x="99" y="31">French</text><text x="205" y="31">Spanish</text><text x="102" y="90">12</text><text x="152" y="90">7</text><text x="204" y="90">9</text><text x="265" y="135">6</text></g>'),
  },
  'relations-hasse': {
    after:2,
    html:drawing('Hasse diagram for the divisibility order', '0 0 240 190',
      network({1:[120,169],2:[82,119],3:[158,119],4:[67,69],6:[161,69],12:[120,19]},
        [[1,2],[1,3],[2,4],[2,6],[3,6],[4,12],[6,12]])),
  },
  'graphs-bridges': {
    after:1,
    html:drawing('Two triangles joined by edge CD', '0 0 310 128',
      network({A:[56,21],B:[29,101],C:[109,87],D:[201,87],E:[254,21],F:[281,101]},
        [['A','B'],['A','C'],['B','C'],['C','D'],['D','E'],['D','F'],['E','F']])),
  },
  'graphs-directed': {
    after:1,
    html:drawing('Directed cycle with two arrows into D', '0 0 310 128',
      network({A:[70,22],B:[24,101],C:[110,101],D:[207,99],E:[266,27]},
        [['A','B'],['B','C'],['C','A'],['C','D'],['E','D']],true)),
  },
};

export function modelDiagram(id, visibleSteps) {
  const diagram = diagrams[id];
  return diagram && visibleSteps >= diagram.after ? diagram.html : '';
}

// A short diagnostic and a follow-up prompt for each written method.
export const reviewTips = {
  'sets-venn': ['Each language total already includes the overlap. Counting those totals directly counts the overlap twice.', 'Try again with 36 students, 22 studying French, 17 Spanish and 9 both. Recalculate all four regions.'],
  'sets-proof': ['A numerical example cannot prove an identity for every set. Use an arbitrary element and make each line reversible.', 'Prove (A ∩ B) ∖ C = (A ∖ C) ∩ (B ∖ C) using an arbitrary element.'],
  'sets-subsets': ['Check the object inside the outer braces for a subset claim. For membership, check whether the whole object occurs.', 'Replace S by {∅, 4, {9}} and retest every statement.'],
  'sets-counter': ['Choosing identical sets cannot expose this failure. Choose a subset that needs an element from each of two different sets.', 'Disprove P(A ∩ B) = P(A) ∩ P(B), or prove that it actually holds.'],
  'relations-properties': ['Each property needs its own evidence. A missing reverse breaks symmetry, while two opposite pairs on distinct elements break antisymmetry.', 'Add (1,3) only. Decide which properties change and justify each answer.'],
  'relations-classes': ['Distinct classes must be counted once. Ordered pairs include self-pairs and both directions between different elements.', 'Classify the same eight integers by remainder modulo 4 and recount the pairs.'],
  'relations-hasse': ['A Hasse diagram shows cover relations. A comparison already implied by a chain does not get its own line.', 'Add 8 and 24 to D. Redraw the diagram and find the least upper bound of 6 and 8.'],
  'relations-composition': ['Join pairs through their shared middle entry. Two routes reaching the same endpoint produce just one ordered pair.', 'Add (2,p) to S and remove (1,q). Recompute the composition and trace every change.'],
  'functions-classification': ['Surjectivity depends on the stated codomain. A formula for a preimage must yield a value in the stated domain.', 'Use f(n) = 3n − 1 on ℤ. Prove injectivity, disprove surjectivity onto ℤ and describe the image.'],
  'functions-inverse': ['Solving y = f(x) produces a candidate. The two composition checks establish that it works as an inverse in both directions.', 'Repeat both checks for f(x) = 2 − 4x from ℝ to ℝ.'],
  'functions-composition': ['Write the nested function expression before using the numbers. To disprove injectivity, show both distinct inputs and their common output.', 'Change g to g(x) = x + 2. Evaluate both compositions at 3 and find two inputs with the same output under f ∘ g.'],
  'functions-proof': ['Start at an arbitrary target c. Exhibiting a preimage for one particular target does not prove surjectivity.', 'Prove that g ∘ f is injective when both f and g are injective. Start with equal outputs.'],
  'graphs-bridges': ['Bridge status depends on connectivity after deletion. Show the two components or give an alternative route for an edge on a cycle.', 'Add the edge BE. Find all bridges again and explain what happens to CD.'],
  'graphs-tree': ['A component keeps the absence of cycles after deletion. State why it is still a tree before applying the edge formula.', 'A tree loses two edges and splits into components with 3, 4 and 7 vertices. Find the three edge counts and check their sum.'],
  'graphs-directed': ['Follow arrows in the displayed direction. Explain why a missing vertex cannot be reached or use a labelled path to show that it can.', 'Reverse E → D. Recompute the reachable set from B and the two degrees of D.'],
  'graphs-degree': ['An even degree sum is necessary. A drawing or edge list with verified degrees is evidence that a proposed simple graph exists.', 'On six vertices, give an edge list that realises degrees 3, 3, 2, 2, 2, 2. Verify each vertex.'],
};

export const variationAnswers = {
  'sets-venn': 'Both 9, French only 13, Spanish only 8, neither 6.',
  'sets-proof': 'For any x, membership in the left side means x ∈ A, x ∈ B and x ∉ C. This is equivalent to (x ∈ A and x ∉ C) and (x ∈ B and x ∉ C), which is membership in the right side.',
  'sets-subsets': '{4} ∈ S is false, {4} ⊆ S is true, and {∅, 9} ⊆ S is false because 9 is absent. The power set still has eight members.',
  'sets-counter': 'The equality holds. T ⊆ A ∩ B iff every element of T lies in both A and B, iff T ⊆ A and T ⊆ B. That is membership in P(A) ∩ P(B).',
  'relations-properties': 'Reflexivity, symmetry and antisymmetry keep their original classifications. Transitivity now holds. Apart from the loops, the chains 1 → 2 → 3 and 1 → 3 → 2 have their shortcuts, as do 2 → 3 → 2 and 3 → 2 → 3.',
  'relations-classes': 'The four classes are {0, 4}, {1, 5}, {2, 6} and {3, 7}. Each contributes four ordered pairs, for 16 altogether.',
  'relations-hasse': 'Keep all of the old covers. Add 4 → 8, 8 → 24 and 12 → 24. The only common upper bound of 6 and 8 is 24.',
  'relations-composition': 'The result is {(a,p), (b,p), (b,q), (c,p)}. Removing (1,q) removes the routes to q from a and c. Adding (2,p) creates the route b → 2 → p.',
  'functions-classification': 'Equal outputs give 3a − 1 = 3b − 1 and then a = b. The image is the integers congruent to 2 modulo 3, so 0 is outside the image.',
  'functions-inverse': 'f⁻¹(y) = (2 − y)/4. Then f(f⁻¹(y)) = 2 − (2 − y) = y and f⁻¹(f(x)) = (2 − (2 − 4x))/4 = x.',
  'functions-composition': '(g ∘ f)(3) = 9 + 2 = 11 and (f ∘ g)(3) = 5² = 25. Inputs −3 and −1 both give 1 under (x + 2)².',
  'functions-proof': 'Assume (g ∘ f)(a) = (g ∘ f)(b). Injectivity of g gives f(a) = f(b), then injectivity of f gives a = b.',
  'graphs-bridges': 'There are no bridges. CD and BE lie on a cycle B → C → D → E → B, and the other edges still lie on their triangles.',
  'graphs-tree': 'The components have 2, 3 and 6 edges. These add to 11, which equals the original 13 edges minus the two removed.',
  'graphs-directed': 'B reaches every vertex via the cycle and the route C → D → E. D has in-degree 1 and out-degree 1.',
  'graphs-degree': 'Draw the six-cycle A–B–C–D–E–F–A and add AD. A and D have degree 3, and B, C, E and F have degree 2.',
};
