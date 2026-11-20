# Discrete Lab

[Open the interactive workbook](https://polarvapourer.github.io/discrete-lab/)

A student-built practice app for the sets and discrete structures part of ECS407U. It covers the Week 8 sets material and Week 9 relations, functions, trees and directed graphs.

Choose **Practice** for 23 original exercises with diagrams, hints and worked answers. **Explore** lets you edit two sets, toggle relation pairs, reroute a function or change the edges of a graph. The topic guide points to relevant pages in the module materials. Correct answers count towards progress stored in the current browser.

## Question generator

Open the [question generator](https://polarvapourer.github.io/discrete-lab/?generator=1) to make 1–100 new questions on a topic or in mixed revision. The accessible, moderate and stretch levels change the mathematical task. A mixed set of ten has three accessible, five moderate and two stretch questions. The generator varies the sets, relations, function rules, graphs and requested calculations. It derives the answers from those inputs and rejects repeated question instances within a set.

You can type numerical answers, select elements, check partial attempts and reveal solutions one step at a time. Moving between questions or refreshing keeps your saved answers on this browser. Use **Copy question link** or **Copy set link** to share the same questions without sharing answers or progress. Printing questions and printing worked solutions produce separate sheets.

## Paper practice

[Open Paper practice](https://polarvapourer.github.io/discrete-lab/paper.html) for written questions on sets, relations, functions and graphs. Build a mixed or single-topic paper from 16 original questions based on the Week 8 and 9 material. Questions ask for diagrams, working, proofs or counterexamples. This is a student revision resource.

Use the **Guided mode** checkbox in untimed practice, the Workspace exercises or a generated practice set for an automatic starting prompt. Paper practice and generated sets offer further hints. In **Timed** practice, the timer runs while you work on paper. Use **Finish and review** when you are ready to reveal solutions. The worked mark scheme can be opened one step at a time and checked against your written answer. Each full solution includes a common mistake to watch for and a follow-up problem. **Review progress** lists your self-awarded marks by topic and shows which questions need another attempt. Progress is saved in the current browser.

Print the question paper and worked mark scheme separately for offline practice. **Copy paper link** shares the same questions in the same order so students can compare methods after working independently. **Save paper file** downloads the question selection as JSON. **Open saved paper** restores that selection for a fresh attempt.

## Set calculator and Python checks

[Open the set calculator](https://polarvapourer.github.io/discrete-lab/sets.html) to enter your own sets and expressions. For example, with A = {1, 2, 3} and B = {2, 4}, type `A n B` to find {2}. You can check a handwritten answer or reveal the intermediate sets. The calculator accepts union, intersection, difference, complement, symmetric difference and parentheses. Specify U to define the universe for complements.

Open **Check in Python** to copy a standalone Python 3 script for the current inputs. Checks are available in the calculator, Workspace, Explore, generated practice and paper review. In an untimed paper, mark the question as attempted to open its check. In a timed paper, finish the attempt first. For general proof questions, use the example computations alongside your written argument.

## Run locally

From the repository root, run `python -m http.server 8000` and open `http://localhost:8000/`. GitHub Pages serves the same files directly. No dependencies or build step are needed.

## Course references

The exercises follow the topics and conventions in Søren Riis’s ECS407U Week 8 and 9 handouts, lab sheets and lecture notes, the supplied revision notes, Schaum’s *Outline of Discrete Mathematics* (Lipschutz and Lipson), and David Liben-Nowell’s *Discrete Mathematics for Computer Science*, §2.3. The guided practice format was inspired by the lecturer’s [Box proofs](https://sr123.github.io/box-proofs/) app. This is an independent student project.
