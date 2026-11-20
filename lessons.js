// Answer indices refer to the choices in display order.
const question = (title, prompt, figure, choices, correct, hint, solution, note) =>
  ({ title, prompt, figure, choices, correct, hint, solution, note });
const math = (body, caption) => ({ type: 'math', body, caption });
const venn = {type:'venn'};
const digits = ['1','2','3','4','5','6','7','8'];
const relation = (pairs) => ({type:'relation', pairs});
const mapping = (values, targets) => ({type:'mapping', values, targets});
const props = ['Reflexive','Symmetric','Antisymmetric','Transitive'];
const graph = {type:'graph', edges:['AB','BC','CA','CD','DE'], directed:false};
const digraph = {type:'graph', edges:['AB','BC','CA','CD','ED'], directed:true};
export const topics = [
{ name:'Sets', heading:'Set operations', week:8, icon:'sets', reading:'Week 8 lecture slides, pp. 5–47. In the course notes “Sets, relations, functions and graphs”, read sections 1–3 on membership, set operations, Venn diagrams and counting.',
notes:[
['Intersection','A ∩ B','An element belongs to the intersection when it belongs to both sets. Look for the part where the circles overlap.'],
['Union and difference','A ∪ B     A ∖ B','Union includes everything in either set. For A ∖ B, start in A and remove anything also in B.'],
['Complement','Aᶜ = U ∖ A','Fix the universe first. Keep each member of U that is outside A.'],
['Membership and subsets','x ∈ S     T ⊆ S','Membership checks one whole object. A subset test checks each element of T separately. The empty set is a subset of every set.'],
['Power sets','|P(S)| = 2ⁿ, where n = |S|','Each element can be included or left out independently. The power set contains every possible subset, including ∅ and S.'],
['Distributivity','A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)','For an arbitrary x, “in A and in B or C” expands to “in both A and B, or in both A and C”.'],
['Inclusion–exclusion','|A ∪ B| = |A| + |B| − |A ∩ B|','Adding the two totals counts the overlap twice. Subtract it once to count everyone in either group.'],
['Cartesian products','|A × B| = |A| × |B|','Choose the first coordinate from A and the second from B. Each different ordered pair is one element.']],
questions:[
question('Find the intersection','Select every element that belongs to A ∩ B.',venn,digits,[2,3],'Trace the boundary of A, then of B. Which numbers lie inside both?','3 and 4 lie inside both circles, so A ∩ B = {3, 4}.',0),
question('Take the difference','Select every element of B ∖ A.',venn,digits,[4,5],'Start in the right-hand circle. Cross out the overlap.','B contains 3, 4, 5 and 6. Removing the members of A leaves {5, 6}.',1),
question('Read a complement','Within U, select every element of (A ∪ B)ᶜ.',venn,digits,[6,7],'The rectangle is the universe. Which numbers are outside both circles?','The union contains 1 through 6. Only 7 and 8 remain in U.',2),
question('Read nested braces','Which statements are true for S? Select all that apply.',math('S = {∅, {2}, 5}','Read the three members from left to right.'),['∅ ∈ S','{2} ⊆ S','{2} ∈ S','{5} ⊆ S'],[0,2,3],'For {2} ⊆ S, test whether the number 2 itself is a member.','The three members are ∅, the set {2}, and 5. Since 5 ∈ S, its singleton is a subset. The number 2 itself is absent.',3),
question('Count the subsets','How many subsets of S contain p?',math('S = {p, q, r, s, t}','One member is fixed.'),['4','8','16','32'],[2],'Fix p as included. How many independent in-or-out choices remain?','Four elements remain free, giving 2⁴ = 16 subsets that contain p.',4),
question('Choose the next proof step','Which statement follows by distributing “and” over “or”?',math('x ∈ A and (x ∈ B or x ∈ C)','Prove the identity one element at a time.'),['(x ∈ A and x ∈ B) or (x ∈ A and x ∈ C)','(x ∈ A or x ∈ B) and x ∈ C','x ∈ A and x ∈ B and x ∈ C'],[0],'Keep the condition x ∈ A in each of the two alternatives.','Either x belongs to both A and B, or it belongs to both A and C. This gives membership in (A ∩ B) ∪ (A ∩ C).',5),
question('Count the students outside','How many students chose neither activity?',math('30 students · 17 code · 14 draw\n6 do both','Each count includes students who do both.'),['1','5','6','11'],[1],'Find the size of the union, then subtract it from the class total.','17 + 14 − 6 = 25 students chose at least one activity. That leaves 30 − 25 = 5.',6),
question('Count possible relations','How many different relations from A to B can you form?',math('A = {p, q}     B = {0, 1}','Each relation is a subset of A × B.'),['4','8','16','32'],[2],'First count possible pairs. Each pair can then be included or excluded.','There are 2 × 2 = 4 ordered pairs, giving 2⁴ = 16 different relations, including the empty relation.',7)]},
{ name:'Relations', heading:'Properties of relations',week:9,icon:'relations',reading:'Week 9 lecture slides, pp. 4–26. In the course notes “Sets, relations, functions and graphs”, read section 4 on ordered pairs and relations.',
notes:[
['Reading a relation','x R y ⇔ (x, y) ∈ R','Start at row x and read across to column y. A tick means the ordered pair is present.'],
['Symmetry and antisymmetry','x R y and y R x ⇒ x = y  (antisymmetry)','Symmetry requires a reverse for every pair. Antisymmetry forbids a two-way connection between distinct elements. Loops are allowed.'],
['Transitivity','x R y and y R z ⇒ x R z','Follow two links in order. If the direct shortcut is missing, those three elements disprove transitivity.'],
['Equivalence classes','[x] = {y : x R y}','An equivalence relation is reflexive, symmetric and transitive. Its classes partition the underlying set.'],
['Partial orders','Reflexive + antisymmetric + transitive','A total order also compares every pair. In a divisibility order, ask whether either number divides the other.']],
questions:[
question('Classify a relation','Which properties hold on {1, 2, 3}? Select all that apply.',relation(['11','22','33','12','23']),props,[0,2],'Inspect the diagonal, then check reverse pairs and two-link chains.','All three loops are present. No two distinct elements are related both ways. The missing (2,1) breaks symmetry and the missing (1,3) breaks transitivity.',0),
question('Find the missing shortcut','Which missing pair is required by transitivity?',relation(['11','22','33','12','23']),['(1, 3)','(3, 1)','(2, 1)','(3, 2)'],[0],'Start with 1 R 2 and 2 R 3.','The chain 1 R 2 R 3 requires 1 R 3. Adding (1,3) supplies the only missing shortcut.',2),
question('Test antisymmetry','Which two pairs together disprove antisymmetry?',relation(['11','12','21','22','33']),['(1, 1)','(1, 2)','(2, 1)','(3, 3)'],[1,2],'Look for two different elements connected in both directions.','1 R 2 and 2 R 1 both hold, yet 1 ≠ 2. A loop alone never breaks antisymmetry.',1),
question('Find an equivalence class','Select every member of [2].',math('X = {1, 2, 3, 4, 5, 6}\nx R y iff x and y have the same parity','Parity means evenness or oddness.'),['1','2','3','4','5','6'],[1,3,5],'Which elements are related to 2 by the given rule?','2 is even, so its class consists of all even members of X: {2, 4, 6}.',3),
question('Find incomparable elements','Which pair is incomparable under divisibility?',math('D = {1, 2, 3, 6, 9, 18}\nx ≤ᴅ y iff x divides y','Test divisibility in both directions.'),['1 and 6','2 and 9','3 and 18','6 and 18'],[1],'A pair is incomparable if neither number divides the other.','2 does not divide 9, and 9 does not divide 2. This divisibility order is therefore partial and fails to be total.',4)]},
{ name:'Functions', heading:'Function mappings',week:9,icon:'functions',reading:'Week 9 lecture slides, pp. 27–37. In the course notes “Sets, relations, functions and graphs”, read section 5 on functions.',
notes:[
['Injective and surjective','Injective: at most one input per output','Surjective requires every member of the codomain to be reached. A bijection satisfies both tests.'],
['Codomain and image','image(f) = {f(x) : x ∈ A}','The codomain is the declared target set. The image contains just the outputs actually reached.'],
['Composition','(g ∘ f)(x) = g(f(x))','Apply the right-hand function first. Feed its output into the function on the left.'],
['Inverse functions','f⁻¹(y) = the unique x with f(x) = y','A bijection has a two-sided inverse. Reverse its arrows to recover the input from each output.']],
questions:[
question('Classify the mapping','Which description fits this function?',mapping([1,1,2],2),['Injective only','Surjective only','Bijective','Neither'],[1],'Count incoming arrows at each target.','All targets are reached, so the function is surjective. Both a and b map to 1, so injectivity fails.',0),
question('Find the image','Select every member of the image.',mapping([1,3,1],4),['1','2','3','4'],[0,2],'Follow all arrows and record each distinct endpoint.','The arrows land at 1 and 3. The codomain also contains 2 and 4, but neither has a preimage.',1),
question('Change the domain','Which description fits this function on the positive integers?',math('f : ℕ → ℕ     f(n) = n + 2','In ECS407U, ℕ = {1, 2, 3, …}.'),['Injective only','Surjective only','Bijective','Neither'],[0],'Can equal outputs come from different inputs? Can 1 be reached?','If x + 2 = y + 2, subtracting 2 gives x = y. But 1 and 2 cannot be outputs for a positive input.',0),
question('Compose two functions','Evaluate (g ∘ f)(3).',math('f(x) = x + 2     g(x) = x²','Both functions map integers to integers.'),['11','15','25','36'],[2],'Evaluate f(3) first.','f(3) = 5, then g(5) = 25. Working in the opposite order would give 11.',2),
question('Read the inverse','Find f⁻¹(2).',mapping([3,1,2],3),['a','b','c'],[2],'Start at 2 on the right and trace the arrow backwards.','The arrow from c ends at 2, so f⁻¹(2) = c. Each target has exactly one incoming arrow.',3)]},
{ name:'Graphs', heading:'Graphs and paths',week:9,icon:'graphs',reading:'Week 9 lecture slides, pp. 38–60. In the course notes “Sets, relations, functions and graphs”, read sections 6–7 on graphs and directed graphs.',
notes:[
['Degree','Σ deg(v) = 2|E|','In an undirected graph, each edge contributes one end at each of its endpoints. Count the edges touching the chosen vertex.'],
['Bridges','Removing a bridge increases the component count','If an edge lies on a cycle, the rest of the cycle gives an alternative route around it.'],
['Trees','|E| = |V| − 1 for a finite tree','A tree is connected and has no cycle. Removing any one of its edges splits it into two smaller trees.'],
['Directed reachability','u ↝ v','Follow each arrow in its stated direction. A route of length zero allows a vertex to reach itself.'],
['In-degree and out-degree','deg⁻(v) counts arrivals; deg⁺(v) counts departures','Count arrowheads at v for in-degree and arrows leaving v for out-degree.']],
questions:[
question('Count the degree','What is the degree of vertex C?',graph,['1','2','3','4'],[2],'List every edge with C as an endpoint.','CA, CB and CD meet at C. Each contributes one, giving degree 3.',0),
question('Identify the bridges','Select every bridge in this undirected graph.',graph,['AB','BC','CA','CD','DE'],[3,4],'Imagine erasing each edge in turn. Can you still reach all vertices?','Deleting CD separates D and E from the triangle. Deleting DE isolates E. Each triangle edge has a route around it.',1),
question('Split a tree','A tree has 11 vertices. Deleting one edge leaves a component with 4 vertices. How many edges are in the other component?',math('11 vertices → two components\nOne component has 4 vertices.','Deleting one tree edge creates two trees.'),['5','6','7','10'],[1],'Find how many vertices remain for the other tree, then subtract one.','The other component has 11 − 4 = 7 vertices. A tree with 7 vertices has 6 edges.',2),
question('Follow directed paths','Select every vertex reachable from B. Include a path of length zero.',digraph,['A','B','C','D','E'],[0,1,2,3],'Start with B, follow B → C, then check every outgoing arrow from C.','B reaches itself, C, A via C, and D via C. The arrow E → D cannot be followed backwards to E.',3),
question('Read the arrowheads','Which ordered pair gives (in-degree, out-degree) for C?',digraph,['(1, 2)','(2, 1)','(2, 2)','(1, 1)'],[0],'Count arrivals and departures separately.','B → C arrives at C. C → A and C → D leave it, giving (1, 2).',4)]}
];
