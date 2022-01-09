import * as fs from 'fs';
import { FrequencyTable } from './frequency-table';
import { arrayRemoveValue } from './util';

export type WordListStats = {
  overallFrequencies: FrequencyTable;
  characterFrequencies: Array<FrequencyTable>;
}

type SortedWordListEntry = {
  word: string;
  score: number;
}

export type SortedWordList = Array<SortedWordListEntry>;

export type RateWordCriteria = {
  /** Letters which are *not* in the word. */
  invalidLetters?: Set<string>;
  
  /** Letters which are known to be invalid for a particular position. */
  invalidLettersByPosition?: Array<Set<string>>;
  
  /** The letters which we know are correct. */
  correctLetters?: Array<string|null>;
  
  /** 
   * Letters which we know have to be in the answer, but we don't know where.
   * Defined as an array (rather than set) because e.g. if the word is "tasty"
   * and we guessed "stint", we would know that there are *two* Ts that have
   * to be in the answer.
   */
  requiredLetters?: string[];
}

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
 * in the word. If a word is impossible based on the criteria, a score of
 * zero is returned.
 */
export const rateWord = (word:string, stats:WordListStats, criteria:RateWordCriteria={}):number => {
  let score = 0;
  
  const requiredLetters = criteria.requiredLetters ? [...criteria.requiredLetters] : [];
  
  const lettersProcessed = new Set<string>();
  for(let i = 0; i < 5; i++) {
    const letter = word[i];
    
    if(criteria?.invalidLetters?.has(letter))
      return 0;
    
    if(criteria?.invalidLettersByPosition?.[i]?.has(letter))
      return 0;
    
    if(criteria?.correctLetters?.[i] && criteria.correctLetters[i] !== letter)
      return 0;
    
    arrayRemoveValue(requiredLetters, letter);
    
    // award points based on how likely this letter is to be the right answer at this position
    score += stats.characterFrequencies[i].getLetterPercent(letter);
    
    // award points based on how likely this letter is to be in the solution at any location,
    // but only if we haven't already seen this word.
    if(!lettersProcessed.has(letter)) {
      score += stats.overallFrequencies.getLetterPercent(letter);
      lettersProcessed.add(letter);
    }
  }
  
  // if we didn't have all required letters, this can't be a match.
  if(requiredLetters.length)
    return 0;
  
  return score;
}

/**
 * Gets a sorted word list, evaluating the score for each word.
 */
export const getSortedWordList = (stats:WordListStats, criteria:RateWordCriteria={}):SortedWordList => {
  const list:SortedWordList = wordList.map(word => ({
    word,
    score: rateWord(word, stats, criteria),
  }));
  
  list.sort((a, b) => b.score - a.score);
  
  return list;
}
