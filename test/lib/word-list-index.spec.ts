import { expect } from "chai";
import WordListIndex from "../../app/lib/word-list-index";


// some recent wordle solutions at the time i wrote this...
const wordList:string[] = [
  'alien',
  'bluff',
  'boxer',
  'buggy',
  'charm',
  'chief',
  'cling',
  'clown',
  'colby',
  'cramp',
  'fungi',
  'gauze',
  'glean',
  'gruel',
  'gully',
  'hunky',
  'inter',
  'irony',
  'khaki',
  'label',
  'merit',
  'needy',
  'onset',
  'patty',
  'poker',
  'prize',
  'quart',
  'rhyme',
  'ruder',
  'shrug',
  'smear',
  'stomp',
  'treat',
  'twang',
  'twice',
  'unfit',
  'upset',
  'waste',
  'whoop',
  'woven',
  'youth',
  'yummy',
  
  // some test values
  'aaaaa',
  'aaaab',
  'baaaa',
  'aabaa',
  'aaabb',
  'bbaaa',
  'baaab',
  'ababa',
  'aabbb',
  'abbba',
  'bbbaa',
  'babab',
];




describe('test word-list-index.ts methods', () => {
  const wordListIndex = new WordListIndex(wordList);
  
  it('getMaskForWordsWithLetterInPosition', () => {
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(0, 'a').apply(wordList)).to.deep.equal([
      'alien', 'aaaaa', 'aaaab', 'aabaa', 'aaabb', 'ababa', 'aabbb', 'abbba'
    ]);
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(1, 'b').apply(wordList)).to.deep.equal([
      'bbaaa', 'ababa', 'abbba', 'bbbaa'
    ]);
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(2, 'c').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(3, 'd').apply(wordList)).to.deep.equal([
      'needy'
    ]);
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(4, 'e').apply(wordList)).to.deep.equal([
      'gauze', 'prize', 'rhyme', 'twice', 'waste'
    ]);
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(2, 'r').apply(wordList)).to.deep.equal([
      'merit', 'shrug'
    ]);
    expect(wordListIndex.getMaskForWordsWithLetterInPosition(4, 'y').apply(wordList)).to.deep.equal([
      'buggy', 'colby', 'gully', 'hunky', 'irony', 'needy', 'patty', 'yummy'
    ]);
  });
  
  it('getMaskForWordsWithExactLetterCount', () => {
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(0, 'a').apply(wordList)).to.deep.equal([
      'bluff', 'boxer', 'buggy', 'chief', 'cling', 'clown', 'colby', 'fungi', 'gruel', 'gully', 'hunky', 'inter', 'irony', 'merit', 'needy', 'onset', 'poker', 'prize', 'rhyme', 'ruder', 'shrug', 'stomp', 'twice', 'unfit', 'upset', 'whoop', 'woven', 'youth', 'yummy',
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(1, 'a').apply(wordList)).to.deep.equal([
      'alien', 'charm', 'cramp', 'gauze', 'glean', 'khaki', 'label', 'patty', 'quart', 'smear', 'treat', 'twang', 'waste'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(2, 'a').apply(wordList)).to.deep.equal([
      'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(3, 'a').apply(wordList)).to.deep.equal([
      'aaabb', 'bbaaa', 'baaab', 'ababa'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(4, 'a').apply(wordList)).to.deep.equal([
      'aaaab', 'baaaa', 'aabaa'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(5, 'a').apply(wordList)).to.deep.equal([
      'aaaaa'
    ]);
    
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(0, 'b').apply(wordList)).to.deep.equal([
      'alien', 'charm', 'chief', 'cling', 'clown', 'cramp', 'fungi', 'gauze', 'glean', 'gruel', 'gully', 'hunky', 'inter', 'irony', 'khaki', 'merit', 'needy', 'onset', 'patty', 'poker', 'prize', 'quart', 'rhyme', 'ruder', 'shrug', 'smear', 'stomp', 'treat', 'twang', 'twice', 'unfit', 'upset', 'waste', 'whoop', 'woven', 'youth', 'yummy', 'aaaaa',
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(1, 'b').apply(wordList)).to.deep.equal([
      'bluff', 'boxer', 'buggy', 'colby', 'label', 'aaaab', 'baaaa', 'aabaa'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(2, 'b').apply(wordList)).to.deep.equal([
      'aaabb', 'bbaaa', 'baaab', 'ababa'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(3, 'b').apply(wordList)).to.deep.equal([
      'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(4, 'b').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(5, 'b').apply(wordList)).to.deep.equal([]);
    
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(0, 'z').apply(wordList)).to.deep.equal([
      'alien', 'bluff', 'boxer', 'buggy', 'charm', 'chief', 'cling', 'clown', 'colby', 'cramp', 'fungi', 'glean', 'gruel', 'gully', 'hunky', 'inter', 'irony', 'khaki', 'label', 'merit', 'needy', 'onset', 'patty', 'poker', 'quart', 'rhyme', 'ruder', 'shrug', 'smear', 'stomp', 'treat', 'twang', 'twice', 'unfit', 'upset', 'waste', 'whoop', 'woven', 'youth', 'yummy', 'aaaaa', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab',
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(1, 'z').apply(wordList)).to.deep.equal([
      'gauze', 'prize'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(2, 'z').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(3, 'z').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(4, 'z').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(5, 'z').apply(wordList)).to.deep.equal([]);
    
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(0, 'e').apply(wordList)).to.deep.equal([
      'bluff', 'buggy', 'charm', 'cling', 'clown', 'colby', 'cramp', 'fungi', 'gully', 'hunky', 'irony', 'khaki', 'patty', 'quart', 'shrug', 'stomp', 'twang', 'unfit', 'whoop', 'youth', 'yummy', 'aaaaa', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab',
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(1, 'e').apply(wordList)).to.deep.equal([
      'alien', 'boxer', 'chief', 'gauze', 'glean', 'gruel', 'inter', 'label', 'merit', 'onset', 'poker', 'prize', 'rhyme', 'ruder', 'smear', 'treat', 'twice', 'upset', 'waste', 'woven'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(2, 'e').apply(wordList)).to.deep.equal([
      'needy'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(3, 'e').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(4, 'e').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(5, 'e').apply(wordList)).to.deep.equal([]);
    
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(0, 't').apply(wordList)).to.deep.equal([
      'alien', 'bluff', 'boxer', 'buggy', 'charm', 'chief', 'cling', 'clown', 'colby', 'cramp', 'fungi', 'gauze', 'glean', 'gruel', 'gully', 'hunky', 'irony', 'khaki', 'label', 'needy', 'poker', 'prize', 'rhyme', 'ruder', 'shrug', 'smear', 'whoop', 'woven', 'yummy', 'aaaaa', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab',
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(1, 't').apply(wordList)).to.deep.equal([
      'inter', 'merit', 'onset', 'quart', 'stomp', 'twang', 'twice', 'unfit', 'upset', 'waste', 'youth'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(2, 't').apply(wordList)).to.deep.equal([
      'patty', 'treat'
    ]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(3, 't').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(4, 't').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithExactLetterCount(5, 't').apply(wordList)).to.deep.equal([]);
  });
  
  it('getMaskForWordsWithMinimumLetterCount', () => {
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(1, 'a').apply(wordList)).to.deep.equal([
      'alien', 'charm', 'cramp', 'gauze', 'glean', 'khaki', 'label', 'patty', 'quart', 'smear', 'treat', 'twang', 'waste', 'aaaaa', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(2, 'a').apply(wordList)).to.deep.equal([
      'aaaaa', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(3, 'a').apply(wordList)).to.deep.equal([
      'aaaaa', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(4, 'a').apply(wordList)).to.deep.equal([
      'aaaaa', 'aaaab', 'baaaa', 'aabaa'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(5, 'a').apply(wordList)).to.deep.equal([
      'aaaaa'
    ]);
    
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(1, 'b').apply(wordList)).to.deep.equal([
      'bluff', 'boxer', 'buggy', 'colby', 'label', 'aaaab', 'baaaa', 'aabaa', 'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(2, 'b').apply(wordList)).to.deep.equal([
      'aaabb', 'bbaaa', 'baaab', 'ababa', 'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(3, 'b').apply(wordList)).to.deep.equal([
      'aabbb', 'abbba', 'bbbaa', 'babab'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(4, 'b').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(5, 'b').apply(wordList)).to.deep.equal([]);
    
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(1, 'z').apply(wordList)).to.deep.equal([
      'gauze', 'prize'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(2, 'z').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(3, 'z').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(4, 'z').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(5, 'z').apply(wordList)).to.deep.equal([]);
    
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(1, 'e').apply(wordList)).to.deep.equal([
      'alien', 'boxer', 'chief', 'gauze', 'glean', 'gruel', 'inter', 'label', 'merit', 'needy', 'onset', 'poker', 'prize', 'rhyme', 'ruder', 'smear', 'treat', 'twice', 'upset', 'waste', 'woven'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(2, 'e').apply(wordList)).to.deep.equal([
      'needy'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(3, 'e').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(4, 'e').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(5, 'e').apply(wordList)).to.deep.equal([]);
    
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(1, 't').apply(wordList)).to.deep.equal([
      'inter', 'merit', 'onset', 'patty', 'quart', 'stomp', 'treat', 'twang', 'twice', 'unfit', 'upset', 'waste', 'youth'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(2, 't').apply(wordList)).to.deep.equal([
      'patty', 'treat'
    ]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(3, 't').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(4, 't').apply(wordList)).to.deep.equal([]);
    expect(wordListIndex.getMaskForWordsWithMinimumLetterCount(5, 't').apply(wordList)).to.deep.equal([]);
  });
});
