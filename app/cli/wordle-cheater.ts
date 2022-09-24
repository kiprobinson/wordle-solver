import CliUtils from "../lib/cli-utils";
import { getWordListStats, getSortedWordList, RateWordCriteria, getEmptyRateWordCriteria, DEFAULT_WORD_LIST } from "../lib/word-list";
import WordListIndex from "../lib/word-list-index";
import { formatGuessPerResult, getResultForGuess, updateCriteriaPerResult } from "../lib/wordle-engine";

const NUM_WORDS_TO_SHOW = 40;

type GuessHistory = Array<{guess:string, result:string}>;

/**
 * Text-based adventure to solve a Wordle problem.
 */
const cheatAtWordle = async ():Promise<void> => {
  let wordList = DEFAULT_WORD_LIST;
  const wordListIndex = new WordListIndex(wordList);
  const criteria: Required<RateWordCriteria> = getEmptyRateWordCriteria();
  
  const correctAnswer = await askForAnswer();
  
  let guesses:GuessHistory = [];
  while(true) {
    const {abort, newWordList} = showBestGuesses(wordList, wordListIndex, criteria);
    if(abort)
      break;
    
    wordList = newWordList;
    
    const {guess, result} = await playTurn(correctAnswer);
    guesses.push({guess, result});
    
    const {success} = processResponse(guess, result, guesses, criteria);
    if(success)
      break;
  }
}

/**
 * Ask the user if they already know what the answer is. This can make it easier to 
 */
const askForAnswer = async ():Promise<string|null> => {
  console.log();
  const userHasAnswer:boolean = await CliUtils.askForBoolean('Do you already know what the correct word is?');
  
  if(!userHasAnswer)
    return null;
  
  console.log();
  return await CliUtils.ask({
    question: 'Great, what is the correct word?',
    formatter: (s:string):string => s.toLowerCase(),
    regex: /^[a-z]{5}$/i,
    retryMessage: "Sorry that doesn't look like a five letter word. Try again!",
  });
}

/**
 * Show the best guesses at this point in the game.
 */
const showBestGuesses = (wordList:string[], wordListIndex:WordListIndex, criteria:RateWordCriteria): {abort:boolean, newWordList: string[]} => {
  const stats = getWordListStats(wordList);
  const sortedWordList = getSortedWordList(stats, criteria, undefined, wordListIndex);
  const newWordList = sortedWordList.map(e => e.word);
  
  if(newWordList.length <= 0) {
    console.log();
    console.log("I'm sorry, but I couldn't find any words matching this criteria. Wordle must have a larger vocabulary than me!");
    return {abort: true, newWordList};
  }
  
  const numPossibleWords = sortedWordList.length;
  
  console.log();
  console.log(`I found ${numPossibleWords} possible words. Here are my top ${Math.min(numPossibleWords, NUM_WORDS_TO_SHOW)} suggestions for you to try:`);
  for(let i = 0; i < numPossibleWords && i < NUM_WORDS_TO_SHOW; i++)
    console.log(`${i+1}: ${sortedWordList[i].word}`);
  
  return {abort: false, newWordList};
}

/**
 * Let's the user play the current turn - they tell us what they guessed, and what Wordle told them.
 */
const playTurn = async (correctAnswer:string|null):Promise<{guess:string, result:string}> => {
  console.log();
  const guess = await CliUtils.ask({
    question: 'What word did you try?',
    formatter: (s:string):string => s.toLowerCase(),
    regex: /^[a-z]{5}$/i,
    //if answer is all [bgy], user entered the result instead of the guess, so don't allow that either
    validator: (s:string):boolean => !/^[bgy]+$/.test(s),
    retryMessage: "Sorry that doesn't look like a five letter word. Try again!",
  });
  
  if(correctAnswer) {
    const result = getResultForGuess(guess, correctAnswer);
    console.log();
    console.log(' Result: ' + formatGuessPerResult(guess, result));
    return {guess, result};
  }
  
  console.log();
  console.log('Great, now what color did Wordle give each letter in that guess?');
  console.log('Enter the response as five letters, using G=green, Y=yellow, B=black/gray.');
  const result = await CliUtils.ask({
    question: 'What was the result? ',
    formatter: (s:string):string => s.toLowerCase(),
    regex: /^[gyb]{5}$/i,
    retryMessage: "Sorry, I didn't understand that. Please enter the response as five letters, using G=green, Y=yellow, B=black/gray.",
  });
  
  return {guess, result};
}


/**
 * Process the response that Wordle gave us, and update our criteria for use in the next round.
 */
const processResponse = (guess: string, result: string, guesses: GuessHistory, criteria: Required<RateWordCriteria>): {success: boolean} => {
  if(result === 'ggggg') {
    console.log();
    for(const {guess, result} of guesses)
      console.log(formatGuessPerResult(guess, result));
    
    console.log();
    console.log(`Congratulations! We did it in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}! That's some nice teamwork!`);
    return {success: true};
  }
  
  updateCriteriaPerResult(guess, result, criteria);
  
  return {success: false};
}

export default cheatAtWordle;
