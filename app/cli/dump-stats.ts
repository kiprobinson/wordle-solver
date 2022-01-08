import { FrequencyTable } from "../lib/frequency-table";
import { getWordListStats } from "../lib/word-list";

const printSortedTable = (frequencyTable:FrequencyTable) => {
  const sortedTable = frequencyTable.getSortedFrequencyTable();
  for(const entry of sortedTable)
    console.log(`${entry.letter}: ${(100 * entry.percent).toFixed(3).padStart(7)} %`);
}

const dumpStats = async ():Promise<void> => {
  const stats = getWordListStats();

  console.log('-----------------------------');
  
  console.log('Frequencies for ALL positions:');
  printSortedTable(stats.overallFrequencies);
  
  for(let i = 0; i < stats.characterFrequencies.length; i++) {
    console.log();
    console.log(`Frequencies in character ${i}:`);
    printSortedTable(stats.characterFrequencies[i]);
  }
}

export default dumpStats;
