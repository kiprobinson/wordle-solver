import CliUtils from "../lib/cli-utils";
import { setImmediateAsync } from "../lib/util";
import { getWordListStats, RateWordCriteria, getEmptyRateWordCriteria, DEFAULT_WORD_LIST, getSortedWordList } from "../lib/word-list";
import { getResultForGuess, updateCriteriaPerResult } from "../lib/wordle-engine";


type WordResult = {word:string, guesses:number};

const evaluateSolver = async () => {
  if(!(await CliUtils.askForBoolean('This will take a few minutes. Continue?')))
    return;
  
  const stats = getWordListStats();
  
  const results:WordResult[] = [];
  
  console.log('0% ...');
  let nextAlertPercent = 5;
  for(const word of DEFAULT_WORD_LIST) {
    const criteria: Required<RateWordCriteria> = getEmptyRateWordCriteria();
    
    let lastGuess = null;
    let guesses = 0;
    while(true) {
      guesses++;
      const sortedWordList = getSortedWordList(stats, criteria);
      if(sortedWordList[0].score <= 0)
        throw new Error(`Could not find any suggestions when evaluating word ${word}`);
      
      const guess = sortedWordList[0].word;
      if(guess === lastGuess)
        throw new Error(`Got stuck in a loop for word ${word}`);
      else
        lastGuess = guess;
      
      const result = getResultForGuess(guess, word);
      if(result === 'ggggg')
        break;
      
      updateCriteriaPerResult(guess, result, criteria);
    }
    
    results.push({word, guesses});
    if(results.length === Math.floor(DEFAULT_WORD_LIST.length * nextAlertPercent / 100)) {
      console.log(`${nextAlertPercent}% ...`);
      nextAlertPercent += 5;
    }
    
    // break up the task (i.e. so that user can ctrl+c to kill it)
    await setImmediateAsync();
  }
  
  results.sort((a,b) => a.guesses - b.guesses);
  
  console.log();
  console.log('Number of guesses required to get word:');
  results.forEach(({word, guesses}, i) => {
    console.log(`${String(i+1).padStart(4)}: ${word} ${String(guesses).padStart(2)}`);
  });
  
  const medianGuesses:number = results[Math.floor(results.length / 2)].guesses;
  const meanGuesses:number = results.reduce((acc:number, entry:WordResult):number => acc + entry.guesses, 0) / results.length;
  
  console.log();
  console.log(`Median number of guesses: ${medianGuesses.toFixed(3)}`);
  console.log(`Mean number of guesses:   ${meanGuesses.toFixed(3)}`);
};

export default evaluateSolver;