import { getSortedWordList, getWordListStats } from "../lib/word-list";

const dumpWordRatings = () => {
  const stats = getWordListStats();
  
  const sortedWordList = getSortedWordList(stats);
  
  console.log('Best starting words:')
  sortedWordList.forEach((entry, i) => {
    console.log(`${String(i+1).padStart(4)}: ${entry.word} ${entry.score.toFixed(2).padStart(6)}`);
  });
}

export default dumpWordRatings;

