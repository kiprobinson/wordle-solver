import CliUtils from "../lib/cli-utils";
import { getWordListStats, getSortedWordList, RateWordCriteria, WordListStats, getEmptyRateWordCriteria } from "../lib/word-list";
import { formatGuessPerResult, getResultForGuess, updateCriteriaPerResult } from "../lib/wordle-engine";

type GuessHistory = Array<{guess:string, result:string}>;

/**
 * Text-based adventure to solve a Wordle problem.
 */
const cheatAtWordle = async ():Promise<void> => {
  const stats = getWordListStats();
  const criteria: Required<RateWordCriteria> = getEmptyRateWordCriteria();
  
  const correctAnswer = await askForAnswer();
  
  let guesses:GuessHistory = [];
  while(true) {
    const {abort} = showBestGuesses(stats, criteria);
    if(abort)
      break;
    
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
