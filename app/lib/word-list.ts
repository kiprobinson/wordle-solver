import * as fs from 'fs';
import { FrequencyTable } from './frequency-table';
import { arrayCount, arrayRemoveValue } from './util';

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
  
  /**
   * Stores any letters for which we know exactly how many of that letter is
   * in the solution.
   * 
   * Example where this is needed:
   * 
   * - If word is "myths" and we guess "truss" (ybbbg) or "tessa" (ybybb),
   *   we would know from one S being black that there is exactly one S
   *   in the solution.
   */
  knownLetterCounts?: Record<string, number>;
}

export const getEmptyRateWordCriteria = ():Required<RateWordCriteria> => ({
  invalidLetters: new Set(),
  invalidLettersByPosition: [new Set(), new Set(), new Set(), new Set(), new Set()],
  correctLetters: [null, null, null, null, null],
  requiredLetters: [],
  knownLetterCounts: {},
});

const VALID_WORD_REGEX = /^[a-z]{5}$/;

/**
 * The list of all five-letter English words. We can pass a different list to the functions
 * for unit testing.
 */
export const DEFAULT_WORD_LIST:string[] = fs.readFileSync('app/resources/word-list.txt').toString()
  .split(/\s+/)
  .filter(s => VALID_WORD_REGEX.test(s));

/**
 * Parse the word list to calculate frequencies of each character overall and per-character.
 */
export const getWordListStats = (wordList:string[]=DEFAULT_WORD_LIST):WordListStats => {
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
    
    const wasRequiredLetter = arrayRemoveValue(requiredLetters, letter);
    
    // award points based on how likely this letter is to be the right answer at this position.
    // But if this wasn't a required letter, multiply the position-specific points by 1/1000,
    // so that the algorithm heavily favors the most common letters overall. For the case where
    // we have no required letters (i.e. first guess), the character-specific points really only
    // come into play when breaking ties. But if we have a word with a required letter, we want
    // to favor a guess that has that letter in the most likely position.
    score += stats.characterFrequencies[i].getLetterPercent(letter) * (wasRequiredLetter ? 1 : 0.001);
    
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
  
  // check for character counts if any are known
  if(criteria.knownLetterCounts) {
    for(const letter of Object.keys(criteria.knownLetterCounts)) {
      if(arrayCount([...word], letter) !== criteria.knownLetterCounts[letter]) {
        return 0;
      }
    }
  }
  
  return score;
}

/**
 * Gets a sorted word list, evaluating the score for each word.
 */
export const getSortedWordList = (stats:WordListStats, criteria:RateWordCriteria={}, wordList:string[]=DEFAULT_WORD_LIST):SortedWordList => {
  const list:SortedWordList = wordList.map(word => ({
    word,
    score: rateWord(word, stats, criteria),
  }));
  
  list.sort((a, b) => b.score - a.score);
  
  return list;
}
