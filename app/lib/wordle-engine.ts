import CliUtils from "./cli-utils";
import { arrayRemoveValue, arrayIntersection, arrayCount } from "./util";
import { RateWordCriteria } from "./word-list";


/**
 * Given a guess and the correct answer, returns the result- a string consisting
 * of the letters B=black/gray, Y=yellow, G=green.
 */
export const getResultForGuess = (guess: string, correctAnswer: string):string => {
  // we can't simply loop through and assign colors - we need to assign the greens,
  // then the yellows, and what is left is black
  
  const answerLetters = [...correctAnswer];
  const resultLetters = ['b', 'b', 'b', 'b', 'b'];
  
  // look for matches. If we find any, remove them from the correctAnswers array.
  for(let i = 0; i < 5; i++) {
    if(guess[i] === correctAnswer[i]) {
      resultLetters[i] = 'g';
      arrayRemoveValue(answerLetters, guess[i]);
    }
  }
  
  // now answerLetters array only has the letters that were not perfect matches.
  // any letter that was not correct, but is still in the answer (after the
  // perfect matches were removed) must be yellow.
  for(let i = 0; i < 5; i++) {
    if(guess[i] !== correctAnswer[i] && answerLetters.indexOf(guess[i]) >= 0) {
      resultLetters[i] = 'y';
      arrayRemoveValue(answerLetters, guess[i]);
    }
  }
  
  return resultLetters.join('');
}

/**
 * Formats the guess for display in the console, using console color escape sequences.
 */
export const formatGuessPerResult = (guess: string, result: string):string => {
  let formatted = '';
  for(let i = 0; i < 5; i++) {
    if(result[i] === 'g')
      formatted += CliUtils.cliColorString(guess[i].toUpperCase(), {background: 'green', foreground: 'black'});
    else if(result[i] === 'y')
      formatted += CliUtils.cliColorString(guess[i].toUpperCase(), {background: 'yellow', foreground: 'black'});
    else
      formatted += CliUtils.cliColorString(guess[i].toUpperCase(), {background: 'black', foreground: 'red'});
    
    formatted += ' ';
  }
  
  return formatted;
}

/**
 * After user makes a guess and Wordle responds, updates the criteria object with any new info. This will
 * allow future guesses to be narrowed down.
 * 
 * @param guess What user guessed.
 * @param result What Wordle responed with (five-letter string of letters G=green, Y=yellow, B=black)
 * @param criteria Current criteria. This object will be updated based on the response.
 */
export const updateCriteriaPerResult = (guess: string, result: string, criteria:Required<RateWordCriteria>):void => {
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
}