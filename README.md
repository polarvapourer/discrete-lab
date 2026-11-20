# Discrete Lab

[Open the interactive workbook](https://polarvapourer.github.io/discrete-lab/)

A student-built practice app for the sets and discrete structures part of ECS407U. It covers the Week 8 sets material and Week 9 relations, functions, trees and directed graphs.

Choose **Practice** for 23 original exercises with diagrams, hints and worked answers. **Explore** lets you edit two sets, toggle relation pairs, reroute a function or change the edges of a graph. The topic guide points to relevant pages in the module materials. Correct answers count towards progress stored in the current browser.

## Question generator

Open the [question generator](https://polarvapourer.github.io/discrete-lab/?generator=1) to make 1–100 new questions on a topic or in mixed revision. The accessible, moderate and stretch levels change the mathematical task. A mixed set of ten has three accessible, five moderate and two stretch questions. The generator varies the sets, relations, function rules, graphs and requested calculations. It derives the answers from those inputs and rejects repeated question instances within a set.

You can type numerical answers, select elements, check partial attempts and reveal solutions one step at a time. Moving between questions or refreshing keeps your saved answers on this browser. Use **Copy question link** or **Copy set link** to share the same questions without sharing answers or progress. Printing questions and printing worked solutions produce separate sheets.

## Run locally

From the repository root, run `python -m http.server 8000` and open `http://localhost:8000/`. GitHub Pages serves the same files directly. No dependencies or build step are needed.

## Course references

The exercises follow the topics and conventions in Søren Riis’s ECS407U Week 8 and 9 handouts, lab sheets and lecture notes, the supplied revision notes, Schaum’s *Outline of Discrete Mathematics* (Lipschutz and Lipson), and David Liben-Nowell’s *Discrete Mathematics for Computer Science*, §2.3. The guided practice format was inspired by the lecturer’s [Box proofs](https://sr123.github.io/box-proofs/) app. This is an independent student project.
