import * as fs from 'fs';
import { FrequencyTable } from './frequency-table';

export type WordListStats = {
  overallFrequencies: FrequencyTable;
  characterFrequencies: Array<FrequencyTable>;
}

type SortedWordListEntry = {
  word: string;
  score: number;
}

export type SortedWordList = Array<SortedWordListEntry>

const VALID_WORD_REGEX = /^[a-z]{5}$/;

/**
 * The list of all five-letter English words.
 */
export const wordList:string[] = fs.readFileSync('app/resources/word-list.txt').toString()
  .split(/\s+/)
  .filter(s => VALID_WORD_REGEX.test(s));

/**
 * Parse the word list to calculate frequencies of each character overall and per-character.
 */
export const getWordListStats = ():WordListStats => {
  const stats:WordListStats = {
    overallFrequencies: new FrequencyTable(),
    characterFrequencies: [
      new FrequencyTable(),
      new FrequencyTable(),
      new FrequencyTable(),
      new FrequencyTable(),
      new FrequencyTable(),
    ]
  };
  
  for(const word of wordList) {
    for(let i = 0; i < 5; i++) {
      const letter = word[i];
      stats.overallFrequencies.incrementLetter(letter);
      stats.characterFrequencies[i].incrementLetter(letter);
    }
  }
  
  return stats;
}

/**
 * Assigns a score to a word, indicating how good of a guess that word is.
 * This takes into account the likelihood of any letters being correct or
 * in the word.
 */
export const rateWord = (word:string, stats:WordListStats):number => {
  let score = 0;
  
  const lettersProcessed = new Set<string>();
  for(let i = 0; i < 5; i++) {
    const letter = word[i];
    // award points based on how likely this letter is to be the right answer at this position
    score += stats.characterFrequencies[i].getLetterPercent(letter);
    
    // award points based on how likely this letter is to be in the solution at any location,
    // but only if we haven't already seen this word.
    if(!lettersProcessed.has(letter)) {
      score += stats.overallFrequencies.getLetterPercent(letter);
      lettersProcessed.add(letter);
    }
  }
  
  return score;
}

/**
 * Gets a sorted word list, evaluating the score for each word.
 */
export const getSortedWordList = (stats:WordListStats):SortedWordList => {
  const list:SortedWordList = wordList.map(word => ({
    word,
    score: rateWord(word, stats),
  }));
  
  list.sort((a, b) => b.score - a.score);
  
  return list;
}
