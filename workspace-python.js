import {baseSets} from './diagrams.js';
import {setCalculation, graphCode, bridges, relationCode, shortcuts} from './python-maths.js';
import {relationProperties} from './paper-python.js';

export function mappingCode(values, targets) {
  return `f = dict(zip("abc", ${JSON.stringify(values)}))
codomain = set(range(1, ${targets+1}))
image = set(f.values())
print("Image:", image)
print("Injective:", len(image) == len(f))
print("Surjective:", image == codomain)`;
}

export function workspacePython(q) {
  const fig = q.figure;
  switch(q.title) {
    case 'Find the intersection': case 'Take the difference': case 'Read a complement':
      return setCalculation(baseSets.A,baseSets.B,[],{'Find the intersection':'A ∩ B','Take the difference':'B ∖ A','Read a complement':'(A ∪ B)ᶜ'}[q.title]);
    case 'Read nested braces': return `empty = frozenset()
two = frozenset({2})
S = {empty, two, 5}
print(empty in S, two <= S, two in S, {5} <= S)`;
    case 'Count the subsets': return `from itertools import combinations

S = "pqrst"
subsets = [t for size in range(len(S) + 1) for t in combinations(S, size)]
print(sum("p" in t for t in subsets))`;
    case 'Choose the next proof step': return `from itertools import product

for a, b, c in product((False, True), repeat=3):
    left = a and (b or c)
    right = (a and b) or (a and c)
    print(a, b, c, "agree:", left == right)`;
    case 'Count the students outside': return 'total, code, draw, both = 30, 17, 14, 6\nprint(total - (code + draw - both))';
    case 'Count possible relations': return 'from itertools import product\n\npairs = list(product(["p", "q"], [0, 1]))\nprint(pairs)\nprint(2 ** len(pairs))';
    case 'Classify a relation': return relationCode(fig.pairs,'X = range(1, 4)\n'+relationProperties);
    case 'Find the missing shortcut': return relationCode(fig.pairs,shortcuts+'\nprint(shortcuts - R)');
    case 'Test antisymmetry': return relationCode(fig.pairs,'print({(x, y) for x, y in R if x != y and (y, x) in R})');
    case 'Find an equivalence class': return 'print({x for x in range(1, 7) if x % 2 == 2 % 2})';
    case 'Find incomparable elements': return 'for a, b in [(1, 6), (2, 9), (3, 18), (6, 18)]:\n    if a % b != 0 and b % a != 0:\n        print(a, b)';
    case 'Classify the mapping': case 'Find the image': return mappingCode(fig.values,fig.targets);
    case 'Change the domain': return 'def f(n):\n    return n + 2\n\n# Check sample outputs, then explain why 1 is unreachable for all positive inputs.\nprint([f(n) for n in range(1, 8)])\nprint("Input required for output 1:", 1 - 2)';
    case 'Compose two functions': return 'def f(x):\n    return x + 2\n\ndef g(x):\n    return x ** 2\n\nprint(g(f(3)))';
    case 'Read the inverse': return 'f = dict(zip("abc", '+JSON.stringify(fig.values)+'))\nprint([x for x in f if f[x] == 2])';
    case 'Count the degree': return graphCode(fig.edges,'print(sum("C" in edge for edge in edges))');
    case 'Identify the bridges': return graphCode(fig.edges,bridges+'\nprint(bridges)',true);
    case 'Split a tree': return 'total, first = 11, 4\nother = total - first\nprint(other - 1)';
    case 'Follow directed paths': return graphCode(fig.edges,'print(reachable("B", edges, directed=True))',true);
    case 'Read the arrowheads': return graphCode(fig.edges,'print(sum(b == "C" for a, b in edges), sum(a == "C" for a, b in edges))');
    default: throw Error('Unknown workspace exercise '+q.title);
  }
}
