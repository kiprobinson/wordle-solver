import * as fs from 'fs';
import BigBitMask from './big-bit-mask';
import { FrequencyTable } from './frequency-table';
import { arrayCount, arrayRemoveValue } from './util';
import WordListIndex from './word-list-index';
import { getResultForGuess, updateCriteriaPerResult } from './wordle-engine';

export type WordListStats = {
  overallFrequencies: FrequencyTable;
  characterFrequencies: Array<FrequencyTable>;
}

type SortedWordListEntry = {
  word: string;
  score: number;
}

type SortedWordListEntryV2 = {
  word: string;
  score: number;
  easyModeOnly: boolean;
}

export type SortedWordList = Array<SortedWordListEntry>;
export type SortedWordListV2 = Array<SortedWordListEntryV2>;

export type RateWordCriteria = {
  /** Letters which are *not* in the word. */
  invalidLetters?: Set<string>;
  
  /** Letters which are known to be invalid for a particular position. */
  invalidLettersByPosition?: Array<Set<string>>;
  
  /** The letters which we know are correct. */
  correctLetters?: Array<string|null>;
  
  /**
   * Letters which we know have to be in the answer at least a certain number
   * of times, but we don't know exactly how many or in which positions.
   */
  minimumLetterCounts?: Record<string, number>;
  
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
  
  easyMode?: boolean;
}

export const getEmptyRateWordCriteria = (easyMode:boolean=false):Required<RateWordCriteria> => ({
  invalidLetters: new Set(),
  invalidLettersByPosition: [new Set(), new Set(), new Set(), new Set(), new Set()],
  correctLetters: [null, null, null, null, null],
  minimumLetterCounts: {},
  knownLetterCounts: {},
  easyMode,
});

export const sanitizeCriteria = (criteria:RateWordCriteria):Required<RateWordCriteria> => {
  const result = getEmptyRateWordCriteria();
  
  if(criteria.invalidLetters instanceof Set)
    result.invalidLetters = new Set([...criteria.invalidLetters]);
  if(Array.isArray(criteria.invalidLettersByPosition) && criteria.invalidLettersByPosition.length === 5 && criteria.invalidLettersByPosition.every(o => o instanceof Set))
    result.invalidLettersByPosition = criteria.invalidLettersByPosition.map(o => new Set([...o]));
  if(Array.isArray(criteria.correctLetters) && criteria.correctLetters.length === 5 && criteria.correctLetters.every(s => s === null || 'string' === typeof s))
    result.correctLetters = [...criteria.correctLetters];
  if(Array.isArray(criteria.requiredLetters))
    result.requiredLetters = [...criteria.requiredLetters];
  if(criteria.knownLetterCounts)
    result.knownLetterCounts = {...criteria.knownLetterCounts};
  if('boolean' === typeof criteria.easyMode)
    result.easyMode = criteria.easyMode;
  
  return result;
}

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
  if(!wordMatchesCriteria(word, criteria))
    return 0;
  
  let score = 0;
  
  const minimumLetterCounts = criteria.minimumLetterCounts ? { ...criteria.minimumLetterCounts } : {};
  
  const lettersProcessed = new Set<string>();
  for(let i = 0; i < 5; i++) {
    const letter = word[i];
    
    const wasRequiredLetter = !!minimumLetterCounts[letter];
    
    if(wasRequiredLetter) {
      minimumLetterCounts[letter]--;
    }
    
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
  
  return score;
}

/**
 * Returns whether the given word matches the provided criteria.
 */
export const wordMatchesCriteria = (word:string, criteria:RateWordCriteria={}):boolean => {
  const minimumLetterCounts = criteria.minimumLetterCounts ? { ...criteria.minimumLetterCounts } : {};
  
  for(let i = 0; i < 5; i++) {
    const letter = word[i];
    
    if(criteria?.invalidLetters?.has(letter))
      return false;
    
    if(criteria?.invalidLettersByPosition?.[i]?.has(letter))
      return false;
    
    if(criteria?.correctLetters?.[i] && criteria.correctLetters[i] !== letter)
      return false;
    
    if(minimumLetterCounts[letter] > 1)
      minimumLetterCounts[letter]--;
    else if (minimumLetterCounts[letter])
      delete minimumLetterCounts[letter];
  }
  
  // if we didn't have all required letters, this can't be a match.
  if(Object.keys(minimumLetterCounts).length)
    return false;
  
  // check for character counts if any are known
  if(criteria.knownLetterCounts) {
    for(const letter of Object.keys(criteria.knownLetterCounts)) {
      if(arrayCount([...word], letter) !== criteria.knownLetterCounts[letter]) {
        return false;
      }
    }
  }
  
  return true;
}

export const applyCriteriaToWordList = (criteria:RateWordCriteria, wordList:string[], wordListIndex:WordListIndex):string[] => {
  // masks where a `1` means to include the word
  const includeMasks:BigBitMask[] = [];
    
  // masks where a `1` means to exclude the word
  const excludeMasks:BigBitMask[] = [];
  
  criteria.invalidLetters?.forEach(letter => includeMasks.push(wordListIndex.getMaskForWordsWithExactLetterCount(0, letter)));
  
  criteria.invalidLettersByPosition?.forEach((letters, position) => {
    letters?.forEach(letter => excludeMasks.push(wordListIndex.getMaskForWordsWithLetterInPosition(position, letter)));
  });
  
  criteria.correctLetters?.forEach((letter, position) => {
    if (letter)
      includeMasks.push(wordListIndex.getMaskForWordsWithLetterInPosition(position, letter));
  })
  
  if(criteria.minimumLetterCounts) {
    Object.entries(criteria.minimumLetterCounts).forEach(([letter, count]) => {
      includeMasks.push(wordListIndex.getMaskForWordsWithMinimumLetterCount(count, letter));
    })
  }
  
  if (criteria.knownLetterCounts) {
    Object.entries(criteria.knownLetterCounts).forEach(([letter, count]) => {
      includeMasks.push(wordListIndex.getMaskForWordsWithExactLetterCount(count, letter));
    });
  }
  
  if(excludeMasks.length && !includeMasks.length)
    includeMasks.push(new BigBitMask(wordList.length, true));
  
  if(includeMasks.length) {
    const includeMask = includeMasks.length > 1 ? BigBitMask.intersect(...includeMasks) : includeMasks[0];
    
    let finalMask = includeMask;
    if(excludeMasks.length) {
      const excludeMask = excludeMasks.length > 1 ? BigBitMask.union(...excludeMasks) : excludeMasks[0];
      finalMask = includeMask.subtract(excludeMask);
    }
    
    wordList = finalMask.apply(wordList);
  }
  
  return wordList;
}

/**
 * Assigns a score to a word, indicating how good of a guess that word is.
 * This version is based on how many words on average will be left after
 * this guess.
 */
export const rateWordV2 = (word:string, wordList:string[]=DEFAULT_WORD_LIST, criteria:RateWordCriteria={}):SortedWordListEntryV2 => {
  //test - word is swill, you guess "sxill". in easy mode, some invalid guesses might help more than a valid one.
  
  console.log(`rating word: ${word}`);
  
  const ret:SortedWordListEntryV2 = {
    word,
    score: 0,
    easyModeOnly: !wordMatchesCriteria(word, criteria),
  };
  
  // if this word is only allowed in easy mode, but we are not in easy mode, just return early
  if(ret.easyModeOnly && !criteria.easyMode)
    return ret;
  
  // get the list of words that could possibly be the correct word at this point
  const possibleWords = wordList.filter(word => wordMatchesCriteria(word, criteria));
  
  if(possibleWords.length === 0)
    throw new Error('No words are possible at this point');
  
  // go through every possible correct word, then assume that we guess "word", and see how many
  // possible words would remain after that guess. The best guess is the one that leaves the
  // fewest average answers
  let sumRemainingWords = 0;
  for(let possibleWord in possibleWords) {
    const guessResult = getResultForGuess(word, possibleWord);
    const updatedCriteria = sanitizeCriteria(criteria);
    updateCriteriaPerResult(word, guessResult, updatedCriteria);
    sumRemainingWords += possibleWords.filter(testWord => wordMatchesCriteria(testWord, criteria)).length;
  }
  
  ret.score = sumRemainingWords / possibleWords.length;
  
  return ret;
}

/**
 * Gets a sorted word list, evaluating the score for each word.
 */
export const getSortedWordList = (stats:WordListStats, criteria:RateWordCriteria={}, wordList:string[]=DEFAULT_WORD_LIST, wordListIndex?:WordListIndex):SortedWordList => {
  if (wordListIndex) {
    wordList = applyCriteriaToWordList(criteria, wordList, wordListIndex);
  }
  
  const list:SortedWordList = wordList.map(word => ({
    word,
    score: rateWord(word, stats, criteria),
  }));
  
  list.sort((a, b) => b.score - a.score);
  
  return list;
}

export const getSortedWordListV2 = (criteria:RateWordCriteria={}, wordList:string[]=DEFAULT_WORD_LIST):SortedWordListV2 => {
  const list:SortedWordListV2 = wordList.map(word => rateWordV2(word, wordList, criteria));
  
  list.filter(entry => entry.score > 0).sort((a, b) => a.score - b.score);
  
  return list;
}
