import BigBitMask from "./big-bit-mask";

const letters: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');


export default class WordListIndex {
  
  private hasLetterInPosition: Array<Record<string, BigBitMask>> = [];
  private exactCountsForLetter:Array<Record<string, BigBitMask>> = [];
  private minCountForLetter: Array<Record<string, BigBitMask>> = [];
  
  constructor(wordList:string[]) {
    for(let i = 0; i <= 5; i++) {
      this.exactCountsForLetter[i] = {};
      letters.forEach(letter => this.exactCountsForLetter[i][letter] = new BigBitMask(wordList.length));
      
      if(i !== 0) {
        // no point in having `minCountForLetter[0]` - every word has at least zero instances of every letter
        this.minCountForLetter[i] = {};
        letters.forEach(letter => this.minCountForLetter[i][letter] = new BigBitMask(wordList.length));
      }
      
      if(i !== 5) {
        // there is no position 5, just use 0-4 indexes
        this.hasLetterInPosition[i] = {};
        letters.forEach(letter => this.hasLetterInPosition[i][letter] = new BigBitMask(wordList.length));
      }
    }
    
    wordList.forEach((word, wordIndex) => {
      const letterCounts: Record<string, number> = {};
      letters.forEach(letter => letterCounts[letter] = 0);
      
      for(let position = 0; position < 5; position++) {
        const letter = word[position];
        this.hasLetterInPosition[position][letter].setBit(wordIndex);
        
          letterCounts[letter]++;
        }
      
      letters.forEach(letter => {
        const count = letterCounts[letter];
        this.exactCountsForLetter[count][letter].setBit(wordIndex);
        
        for(let n = 1; n <= count; n++) {
          this.minCountForLetter[n][letter].setBit(wordIndex);
        }
      });
    });
  }
  
  /**
   * Returns the bit mask for words with `letter` in `position`.
   */
   getMaskForWordsWithLetterInPosition(position:number, letter:string): BigBitMask {
    return this.hasLetterInPosition[position][letter];
  }
  
  /**
   * Returns the bit mask for words with exactly `count` instances of `letter`.
   */
  getMaskForWordsWithExactLetterCount(count:number, letter:string): BigBitMask {
    return this.exactCountsForLetter[count][letter];
  }
  
  /**
   * Returns the bit mask for words with at least `count` instances of `letter`.
   */
  getMaskForWordsWithMinimumLetterCount(count:number, letter:string): BigBitMask {
    return this.minCountForLetter[count][letter];
  }
}
