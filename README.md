# Wordle Solver

This is a tool to solve wordle puzzles through a command-line interface.

# Setup

I'm going to assume you have a basic understanding of Git, Node.js, and npm development.

I use [pnpm](https://pnpm.io/) to install dependencies, but npm will also work.

# Running the tool

Once you've cloned the repo and installed dependencies, it's as simple as:

```
$ pnpm start
```

Then follow the instructions on screen.

# How does it work

Basically, I build a frequency list based on every word in [the word list](https://github.com/kiprobinson/wordle-solver/blob/main/app/resources/word-list.txt), identifying:

1. How often does each character occur in the word list
1. How often does each character appear in each of the position (i.e. how often is "e" the first letter in a five-letter word, how often is it the second letter, etc.)

From this, it assigns a score to each word based on the sum of the individual character frequencies and the sum of the overall frequencies. In the case of a word with the same letter more than once, the score for overall letter frequency is only added once, because you generally want to put more letters in your guess to narrow it down.

After each guess, you tell me what colors Wordle assigned to each of those letters, and I remove any words that don't match the criteria.

# Limitations

I don't know what word list Wordle uses. [My word list](https://github.com/kiprobinson/wordle-solver/blob/main/app/resources/word-list.txt) was cobbled together from a few different lists.
- If my list has too many junk words, my suggestions may not be great.
- If my list is missing the Wordle word, then the tool cannot find it (although it should get you close).
