
const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export class FrequencyTableEntry {
  count: number = 0;
  percent: number = NaN;
}

export type SortedFrequencyTableEntry = {
  letter: string;
  count: number;
  percent: number;
}

export type SortedFrequencyTable = Array<SortedFrequencyTableEntry>;

/**
 * Represents the frequency of each letter in a given data set.
 */
export class FrequencyTable {
  /** Total characters in frequency table. */
  count: number = 0;
  
  /** Flag to indicate if the percentages are accurate or not. */
  private percentagesAccurate:boolean = true;
  
  /** Counts for each letter of the alphabet. */
  private entries: Record<string, FrequencyTableEntry> = {};
  
  constructor() {
    ALL_LETTERS.forEach(c => this.entries[c] = new FrequencyTableEntry());
  }
  
  /**
   * Increments the count for the given letter.
   */
  incrementLetter(letter:string):void {
    this.entries[letter].count++;
    this.count++;
    this.percentagesAccurate = false;
  }
  
  /**
   * Gets the number of times the given letter was encountered.
   */
  getLetterCount(letter:string):number {
    return this.entries[letter].count;
  }
  
  /**
   * Gets the percentage of letters seen that were the given letter.
   */
  getLetterPercent(letter:string):number {
    if(!this.percentagesAccurate)
      this.updatePercentages();
    return this.entries[letter].percent;
  }
  
  /**
   * Updates the percentage field for all numbers in the table.
   */
  private updatePercentages():void {
    if(this.percentagesAccurate)
      return;
    ALL_LETTERS.forEach(c => this.entries[c].percent = 100 * this.entries[c].count / this.count);
    this.percentagesAccurate = true;
  }
  
  /**
   * Converts this table to a sorted frequency table, with the most common letters
   * first and least common letters last.
   */
  getSortedFrequencyTable():SortedFrequencyTable {
    const ret:SortedFrequencyTable = ALL_LETTERS.map(letter => ({
      letter,
      count: this.getLetterCount(letter),
      percent: this.getLetterPercent(letter), 
    }));
    ret.sort((a,b) => b.percent - a.percent);
    return ret;
  }
}
