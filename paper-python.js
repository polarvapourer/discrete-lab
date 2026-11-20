import {relationCode, graphCode, bridges} from './python-maths.js';

export const relationProperties = `print("reflexive:", all((x, x) in R for x in X))
print("symmetric:", all((y, x) in R for x, y in R))
print("antisymmetric:", all(x == y or (y, x) not in R for x, y in R))
print("transitive:", all((x, z) in R for x, y in R for u, z in R if y == u))`;

const degreeList = 'print({v: sum(v in edge for edge in edges) for v in "ABCDEF"})';
const powerset = `from itertools import combinations

def powerset(s):
    return {frozenset(t) for n in range(len(s) + 1) for t in combinations(s, n)}
`;
export const proofNote = 'This code tests examples. For a claim about every input, give a general argument on paper. One counterexample is enough to disprove a claim.';

export function paperPython(id, variation=false) {
  switch (id) {
    case 'sets-venn': return `total, french, spanish, both = ${variation?'36, 22, 17, 9':'34, 19, 16, 7'}
french_only = french - both
spanish_only = spanish - both
neither = total - (french_only + spanish_only + both)
print("French only, Spanish only, both, neither:", french_only, spanish_only, both, neither)
print("Exactly one:", french_only + spanish_only)`;
    case 'sets-proof': return `from itertools import product

# For an arbitrary element x, a, b and c describe its membership in A, B and C.
for a, b, c in product((False, True), repeat=3):
    left = ${variation?'(a and b) and not c':'a and not (b or c)'}
    right = ${variation?'(a and not c) and (b and not c)':'(a and not b) and (a and not c)'}
    print(a, b, c, "equal:", left == right)`;
    case 'sets-subsets': return `empty = frozenset()
four = frozenset({4})
S = ${variation?'{empty, 4, frozenset({9})}':'{empty, four, 9}'}
print("{4} is a member:", four in S)
print("{4} is a subset:", four <= S)
print("{empty, 9} is a subset:", {empty, 9} <= S)
print("Size of power set:", 2 ** len(S))`;
    case 'sets-counter': return powerset+`
A, B = {2}, {5}
left = powerset(A ${variation?'&':'|'} B)
right = powerset(A) ${variation?'&':'|'} powerset(B)
print("On left only:", left - right)
print("On right only:", right - left)`;
    case 'relations-properties': return relationCode(['11','22','33','44','12','23','32',...(variation?['13']:[])],'X = range(1, 5)\n'+relationProperties);
    case 'relations-classes': return `X = range(8)
m = ${variation?4:3}
classes = [{x for x in X if x % m == r} for r in range(m)]
print(classes)
R = {(x, y) for x in X for y in X if x % m == y % m}
print("Pairs:", len(R))
${relationProperties}`;
    case 'relations-hasse': return `D = ${variation?'{1, 2, 3, 4, 6, 8, 12, 24}':'{1, 2, 3, 4, 6, 12}'}
covers = [(a, b) for a in D for b in D if a != b and b % a == 0
          and not any(c != a and c != b and c % a == 0 and b % c == 0 for c in D)]
print("Draw upward edges:", sorted(covers))
print("Incomparable:", [(a, b) for a in D for b in D if a < b and b % a])
upper = {x for x in D if x % ${variation?6:3} == 0 and x % ${variation?8:4} == 0}
print("Least upper bound:", [x for x in upper if all(y % x == 0 for y in upper)])`;
    case 'relations-composition': return `R = {("a", 1), ("a", 3), ("b", 2), ("c", 1)}
S = ${variation?'{(1, "p"), (2, "p"), (2, "q"), (3, "p")}':'{(1, "p"), (1, "q"), (2, "q"), (3, "p")}'}
routes = [(a, b, c) for a, b in R for middle, c in S if b == middle]
print("Routes:", sorted(routes))
print("Composition:", {(a, c) for a, b, c in routes})`;
    case 'functions-classification': return `def f(n):
    return ${variation?'3 * n - 1':'2 * n + 1'}

inputs = range(-5, 6)
print([(n, f(n)) for n in inputs])
print("Distinct outputs in sample:", len({f(n) for n in inputs}) == len(inputs))
print("Output remainders:", {f(n) % ${variation?3:2} for n in inputs})
# Can 0 have an integer preimage? Solve f(n) = 0 on paper.`;
    case 'functions-inverse': return `from fractions import Fraction

def f(x):
    return ${variation?'2 - 4 * x':'3 * x - 5'}

def inverse(y):
    return ${variation?'(2 - y) / 4':'(y + 5) / 3'}

for x in [Fraction(-2), Fraction(0), Fraction(3, 2)]:
    print(x, f(inverse(x)) == x, inverse(f(x)) == x)`;
    case 'functions-composition': return `def f(x):
    return x ** 2

def g(x):
    return x ${variation?'+ 2':'- 3'}

x = ${variation?3:4}
print("g after f:", g(f(x)), "f after g:", f(g(x)))
for n in ${variation?'[-3, -1]':'[2, 4]'}:
    print(n, f(g(n)))`;
    case 'functions-proof': return variation ? `f = {"a": 1, "b": 2}
g = {1: "p", 2: "q", 3: "r"}
composite = {a: g[b] for a, b in f.items()}
print(composite)
print("Injective on this domain:", len(set(composite.values())) == len(composite))`
      : `f = {"a": 1, "b": 2, "c": 2}
g = {1: "p", 2: "q"}
C = {"p", "q"}
for target in sorted(C):
    print(target, "has preimages", [a for a in f if g[f[a]] == target])`;
    case 'graphs-bridges': return graphCode(['AB','AC','BC','CD','DE','DF','EF',...(variation?['BE']:[])],degreeList+'\n'+bridges+'\nprint("Bridges:", bridges)',true);
    case 'graphs-tree': return `vertices = 14
print("Original edges:", vertices - 1)
print("Degree sum:", 2 * (vertices - 1))
sizes = ${variation?'[3, 4, 7]':'[5, 9]'}
counts = [n - 1 for n in sizes]
print("Component edges:", counts, "total:", sum(counts))`;
    case 'graphs-directed': return graphCode(['AB','BC','CA','CD',variation?'DE':'ED'],`v = "${variation?'D':'C'}"
print("In-degree:", sum(b == v for a, b in edges))
print("Out-degree:", sum(a == v for a, b in edges))
print("Reachable from B:", reachable("B", edges, directed=True))`+(variation?'':'\n# Removing CA should leave no directed cycle.\nedges.remove("CA")\nprint("Cycle remains:", any(a in reachable(b, edges, directed=True) for a, b in edges))'), true);
    case 'graphs-degree': return (variation?'':'degrees = [4, 3, 3, 2, 2, 1]\nprint("Original degree sum:", sum(degrees), "even:", sum(degrees) % 2 == 0)\n')+
      graphCode(variation?['AB','BC','CD','DE','EF','FA','AD']:['AB','AC','AD','AE','BF','CF','BC','DE'],degreeList+'\nprint("Edges:", len(edges))');
    default: throw Error('Unknown paper question '+id);
  }
}
