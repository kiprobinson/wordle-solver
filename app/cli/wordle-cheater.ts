import CliUtils from "../lib/cli-utils";
import { arrayCount, arrayRemoveValue, arrayIntersection, JsonStringifySets } from "../lib/util";
import { getWordListStats, getSortedWordList, RateWordCriteria, WordListStats } from "../lib/word-list";



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
  
  // required letters are kind of tricky. say the correct answer is "truss", and we guessed "shore".
  // => requiredLetters has an S.
  // Now, say we guess "shops". We need to know now that required letters has two Ss.
  // Now, say we guess "sassy". We need to make sure that we don't end up with three Ss in required letters
  const requiredLettersCopy = [...criteria.requiredLetters];
  
  const blackLetters:string[] = [];
  const nonBlackLetters:string[] = [];
  
  for(let i = 0; i < 5; i++) {
    const guessLetter = guess[i];
    const resultColor = result[i];
    if(resultColor === 'g') {
      // green - this is a correct letter!
      criteria.correctLetters[i] = guessLetter;
    }
    else if(resultColor === 'y') {
      // yellow - this letter is in the word, but not at this position
      criteria.invalidLettersByPosition[i].add(guessLetter);
    }
    else if(resultColor === 'b') {
      // black/gray - this letter is not in the word at all
      criteria.invalidLetters.add(guessLetter);
      criteria.invalidLettersByPosition[i].add(guessLetter);
    }
    else {
      throw new Error(`Invalid color: ${resultColor}`)
    }
    
    if(resultColor === 'g' || resultColor === 'y') {
      nonBlackLetters.push(guessLetter);
      if(requiredLettersCopy.includes(guessLetter)) {
        // this letter was already in criteria.required letters. Remove it from the copy, so that if
        // there is another yellow/green of this letter, it doesn't get skipped.
        arrayRemoveValue(requiredLettersCopy, guessLetter);
      }
      else {
        // this yellow/green letter wasn't already in required letters, so add it.
        criteria.requiredLetters.push(guessLetter);
      }
    }
    else {
      blackLetters.push(guessLetter);
    }
  }
  
  // in the case where we guessed a word that has two instances of a letter, but only one is correct,
  // we will have the letter in invalidLetters but also in correctLetters or requiredLetters, which
  // results in an impossible solution. So we have to remove that letter from invalidLetters
  for(const letter of criteria.correctLetters) {
    if(letter)
      criteria.invalidLetters.delete(letter);
  }
  for(const letter of criteria.requiredLetters) {
    if(letter)
      criteria.invalidLetters.delete(letter);
  }
  
  // If word is "myths" and we guess "truss" (ybbbg) or "tessa" (ybybb),
  // we would know from one S being black and one S being non-black that
  // there is exactly one S in the solution. So for any letter that appears
  // in both black and nonblack colors, the exact number of that letter in
  // the correct answer is the number of times that letter appears as
  // non-black.
  const multicolorLetters:string[] = arrayIntersection(blackLetters, nonBlackLetters);
  for(const letter of multicolorLetters) {
    criteria.knownLetterCounts[letter] = arrayCount(nonBlackLetters, letter);
  }
  
  //console.log();
  //console.log('current criteria:')
  //console.log(JsonStringifySets(criteria));
  //console.log();
  
  return {success: false};
}
