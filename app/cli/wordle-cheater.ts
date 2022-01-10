import CliUtils from "../lib/cli-utils";
import { getWordListStats, getSortedWordList, RateWordCriteria, WordListStats } from "../lib/word-list";
import { updateCriteriaPerResult } from "../lib/wordle-engine";



export const cheatAtWordle = async ():Promise<void> => {
  const stats = getWordListStats();
  const criteria: Required<RateWordCriteria> = {
    correctLetters: [null, null, null, null, null],
    requiredLetters: [],
    invalidLetters: new Set<string>(),
    invalidLettersByPosition: [
      new Set<string>(),
      new Set<string>(),
      new Set<string>(),
      new Set<string>(),
      new Set<string>(),
    ],
    knownLetterCounts: {},
  }
  
  let guessCount = 0;
  while(true) {
    const {abort} = await showBestGuesses(stats, criteria);
    if(abort)
      break;
    
    const {guess, result} = await playTurn();
    guessCount++;
    
    const {success} = processResponse(guess, result, guessCount, criteria);
    if(success)
      break;
  }
}

/**
 * Show the best guesses at this point in the game.
 */
const showBestGuesses = (stats:WordListStats, criteria:RateWordCriteria): {abort:boolean} => {
  const sortedWordList = getSortedWordList(stats, criteria);
  if(sortedWordList[0].score <= 0) {
    console.log();
    console.log("I'm sorry, but I couldn't find any words matching this criteria. Wordle must have a larger vocabulary than me!");
    return {abort: true};
  }
  
  console.log();
  console.log('Here are my top ten suggestions for you to try:');
  for(let i = 0; i < 10 && sortedWordList[i].score > 0; i++)
    console.log(`${i+1}: ${sortedWordList[i].word}`);
  
  return {abort: false};
}

/**
 * Let's the user play the current turn - they tell us what they guessed, and what Wordle told them.
 */
const playTurn = async ():Promise<{guess:string, result:string}> => {
  console.log();
  const guess = await CliUtils.ask({
    question: 'What word did you try?',
    formatter: (s:string):string => s.toLowerCase(),
    regex: /^[a-z]{5}$/i,
    //if answer is all [bgy], user entered the result instead of the guess, so don't allow that either
    validator: (s:string):boolean => !/^[bgy]+$/.test(s),
    retryMessage: "Sorry that doesn't look like a five letter word. Try again!",
  });
  
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
const processResponse = (guess: string, result: string, guessCount: number, criteria: Required<RateWordCriteria>): {success: boolean} => {
  if(result === 'ggggg') {
    console.log();
    console.log(`Congratulations! We did it in ${guessCount} guess${guessCount === 1 ? '' : 'es'}! That's some nice teamwork!`);
    return {success: true};
  }
  
  updateCriteriaPerResult(guess, result, criteria);
  
  return {success: false};
}
