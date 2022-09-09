import { expect } from "chai";
import { getWordListStats, wordMatchesCriteria, rateWord } from "../../app/lib/word-list";


describe('test word-list.ts methods', () => {
  it('getWordListStats', () => {
    const stats = getWordListStats(['hello', 'world', 'aloha', 'earth']);
    
    expect(stats.overallFrequencies.count).to.equal(20);
    expect(stats.overallFrequencies.getLetterCount('h')).to.equal(3);
    expect(stats.overallFrequencies.getLetterCount('e')).to.equal(2);
    expect(stats.overallFrequencies.getLetterCount('l')).to.equal(4);
    expect(stats.overallFrequencies.getLetterCount('o')).to.equal(3);
    expect(stats.overallFrequencies.getLetterCount('w')).to.equal(1);
    expect(stats.overallFrequencies.getLetterCount('r')).to.equal(2);
    expect(stats.overallFrequencies.getLetterCount('d')).to.equal(1);
    expect(stats.overallFrequencies.getLetterCount('a')).to.equal(3);
    expect(stats.overallFrequencies.getLetterCount('t')).to.equal(1);
    expect(stats.overallFrequencies.getLetterCount('i')).to.equal(0);
    expect(stats.overallFrequencies.getLetterPercent('h')).to.equal(15);
    expect(stats.overallFrequencies.getLetterPercent('e')).to.equal(10);
    expect(stats.overallFrequencies.getLetterPercent('l')).to.equal(20);
    expect(stats.overallFrequencies.getLetterPercent('o')).to.equal(15);
    expect(stats.overallFrequencies.getLetterPercent('w')).to.equal(5);
    expect(stats.overallFrequencies.getLetterPercent('r')).to.equal(10);
    expect(stats.overallFrequencies.getLetterPercent('d')).to.equal(5);
    expect(stats.overallFrequencies.getLetterPercent('a')).to.equal(15);
    expect(stats.overallFrequencies.getLetterPercent('t')).to.equal(5);
    expect(stats.overallFrequencies.getLetterPercent('i')).to.equal(0);
    
    expect(stats.characterFrequencies[0].count).to.equal(4);
    expect(stats.characterFrequencies[0].getLetterCount('h')).to.equal(1);
    expect(stats.characterFrequencies[0].getLetterCount('w')).to.equal(1);
    expect(stats.characterFrequencies[0].getLetterCount('a')).to.equal(1);
    expect(stats.characterFrequencies[0].getLetterCount('e')).to.equal(1);
    expect(stats.characterFrequencies[0].getLetterCount('d')).to.equal(0);
    expect(stats.characterFrequencies[0].getLetterPercent('h')).to.equal(25);
    expect(stats.characterFrequencies[0].getLetterPercent('w')).to.equal(25);
    expect(stats.characterFrequencies[0].getLetterPercent('a')).to.equal(25);
    expect(stats.characterFrequencies[0].getLetterPercent('e')).to.equal(25);
    expect(stats.characterFrequencies[0].getLetterPercent('d')).to.equal(0);
    
    expect(stats.characterFrequencies[1].count).to.equal(4);
    expect(stats.characterFrequencies[1].getLetterCount('e')).to.equal(1);
    expect(stats.characterFrequencies[1].getLetterCount('o')).to.equal(1);
    expect(stats.characterFrequencies[1].getLetterCount('l')).to.equal(1);
    expect(stats.characterFrequencies[1].getLetterCount('a')).to.equal(1);
    expect(stats.characterFrequencies[1].getLetterCount('h')).to.equal(0);
    expect(stats.characterFrequencies[1].getLetterPercent('e')).to.equal(25);
    expect(stats.characterFrequencies[1].getLetterPercent('o')).to.equal(25);
    expect(stats.characterFrequencies[1].getLetterPercent('l')).to.equal(25);
    expect(stats.characterFrequencies[1].getLetterPercent('a')).to.equal(25);
    expect(stats.characterFrequencies[1].getLetterPercent('h')).to.equal(0);
    
    expect(stats.characterFrequencies[2].count).to.equal(4);
    expect(stats.characterFrequencies[2].getLetterCount('l')).to.equal(1);
    expect(stats.characterFrequencies[2].getLetterCount('r')).to.equal(2);
    expect(stats.characterFrequencies[2].getLetterCount('o')).to.equal(1);
    expect(stats.characterFrequencies[2].getLetterCount('h')).to.equal(0);
    expect(stats.characterFrequencies[2].getLetterPercent('l')).to.equal(25);
    expect(stats.characterFrequencies[2].getLetterPercent('r')).to.equal(50);
    expect(stats.characterFrequencies[2].getLetterPercent('o')).to.equal(25);
    expect(stats.characterFrequencies[2].getLetterPercent('h')).to.equal(0);
    
    expect(stats.characterFrequencies[3].count).to.equal(4);
    expect(stats.characterFrequencies[3].getLetterCount('l')).to.equal(2);
    expect(stats.characterFrequencies[3].getLetterCount('h')).to.equal(1);
    expect(stats.characterFrequencies[3].getLetterCount('t')).to.equal(1);
    expect(stats.characterFrequencies[3].getLetterCount('a')).to.equal(0);
    expect(stats.characterFrequencies[3].getLetterPercent('l')).to.equal(50);
    expect(stats.characterFrequencies[3].getLetterPercent('h')).to.equal(25);
    expect(stats.characterFrequencies[3].getLetterPercent('t')).to.equal(25);
    expect(stats.characterFrequencies[3].getLetterPercent('a')).to.equal(0);
    
    expect(stats.characterFrequencies[4].count).to.equal(4);
    expect(stats.characterFrequencies[4].getLetterCount('o')).to.equal(1);
    expect(stats.characterFrequencies[4].getLetterCount('d')).to.equal(1);
    expect(stats.characterFrequencies[4].getLetterCount('a')).to.equal(1);
    expect(stats.characterFrequencies[4].getLetterCount('h')).to.equal(1);
    expect(stats.characterFrequencies[4].getLetterCount('t')).to.equal(0);
    expect(stats.characterFrequencies[4].getLetterPercent('o')).to.equal(25);
    expect(stats.characterFrequencies[4].getLetterPercent('d')).to.equal(25);
    expect(stats.characterFrequencies[4].getLetterPercent('a')).to.equal(25);
    expect(stats.characterFrequencies[4].getLetterPercent('h')).to.equal(25);
    expect(stats.characterFrequencies[4].getLetterPercent('t')).to.equal(0);
  });
  
  it('rateWord', () => {
    //a few real words for particular tests, then other fake words to ensure all letters are represented
    //const words = ['myths', 'truss', 'tessa', 'sassy', 'thequ', 'ickbr', 'ownfo', 'xjump', 'sover', 'thela', 'zydog'];
    
    const stats = getWordListStats();
    
    //note to self - i'm not trying to test the particular score, just whether it is zero or not
    expect(rateWord('myths', stats)).to.be.above(0);
    
    expect(rateWord('myths', stats, {invalidLetters: new Set([])})).to.be.above(0);
    expect(rateWord('myths', stats, {invalidLetters: new Set(['m'])})).to.equal(0);
    expect(rateWord('myths', stats, {invalidLetters: new Set(['x'])})).to.be.above(0);
    expect(rateWord('myths', stats, {invalidLetters: new Set(['x', 'h', 'p'])})).to.equal(0);
    
    expect(rateWord('myths', stats, {invalidLettersByPosition: [ new Set([]), new Set([]), new Set([]), new Set([]), new Set([]) ]})).to.be.above(0);
    expect(rateWord('myths', stats, {invalidLettersByPosition: [ new Set(['m']), new Set(['a']), new Set(['b']), new Set(['c']), new Set(['d']) ]})).to.equal(0);
    expect(rateWord('myths', stats, {invalidLettersByPosition: [ new Set(['s']), new Set(['m']), new Set(['y']), new Set(['t']), new Set(['h']) ]})).to.be.above(0);
    
    expect(rateWord('myths', stats, {correctLetters: ['m', null, null, null, null]})).to.be.above(0);
    expect(rateWord('myths', stats, {correctLetters: [null, null, null, null, 's']})).to.be.above(0);
    expect(rateWord('myths', stats, {correctLetters: [null, null, 'y', null, null]})).to.equal(0);
    expect(rateWord('myths', stats, {correctLetters: [null, null, null, null, null]})).to.be.above(0);
    
    expect(rateWord('myths', stats, {minimumLetterCounts: {}})).to.be.above(0);
    expect(rateWord('myths', stats, {minimumLetterCounts: {e:1}})).to.equal(0);
    expect(rateWord('myths', stats, {minimumLetterCounts: {t:1}})).to.be.above(0);
    expect(rateWord('myths', stats, {minimumLetterCounts: {s:1}})).to.be.above(0);
    expect(rateWord('myths', stats, {minimumLetterCounts: {s:1, t:1}})).to.be.above(0);
    expect(rateWord('myths', stats, {minimumLetterCounts: {s:2, t:1}})).to.equal(0);
    expect(rateWord('truss', stats, {minimumLetterCounts: {s:2, t:1}})).to.be.above(0);
    expect(rateWord('truss', stats, {minimumLetterCounts: {s:3}})).to.equal(0);
    expect(rateWord('sassy', stats, {minimumLetterCounts: {s:3}})).to.be.above(0);
    
    expect(rateWord('myths', stats, {knownLetterCounts: {}})).to.be.above(0);
    expect(rateWord('myths', stats, {knownLetterCounts: {s:1}})).to.be.above(0);
    expect(rateWord('myths', stats, {knownLetterCounts: {s:2}})).to.equal(0);
    expect(rateWord('truss', stats, {knownLetterCounts: {s:1}})).to.equal(0);
    expect(rateWord('truss', stats, {knownLetterCounts: {s:2}})).to.be.above(0);
    expect(rateWord('truss', stats, {knownLetterCounts: {s:3}})).to.equal(0);
    expect(rateWord('sassy', stats, {knownLetterCounts: {s:1}})).to.equal(0);
    expect(rateWord('sassy', stats, {knownLetterCounts: {s:2}})).to.equal(0);
    expect(rateWord('sassy', stats, {knownLetterCounts: {s:3}})).to.be.above(0);
  });
  
  it('wordMatchesCriteria', () => {
    //a few real words for particular tests, then other fake words to ensure all letters are represented
    //const words = ['myths', 'truss', 'tessa', 'sassy', 'thequ', 'ickbr', 'ownfo', 'xjump', 'sover', 'thela', 'zydog'];
    
    expect(wordMatchesCriteria('myths')).to.be.true;
    
    expect(wordMatchesCriteria('myths', {invalidLetters: new Set([])})).to.be.true;
    expect(wordMatchesCriteria('myths', {invalidLetters: new Set(['m'])})).to.be.false;
    expect(wordMatchesCriteria('myths', {invalidLetters: new Set(['x'])})).to.be.true;
    expect(wordMatchesCriteria('myths', {invalidLetters: new Set(['x', 'h', 'p'])})).to.be.false;
    
    expect(wordMatchesCriteria('myths', {invalidLettersByPosition: [ new Set([]), new Set([]), new Set([]), new Set([]), new Set([]) ]})).to.be.true;
    expect(wordMatchesCriteria('myths', {invalidLettersByPosition: [ new Set(['m']), new Set(['a']), new Set(['b']), new Set(['c']), new Set(['d']) ]})).to.be.false;
    expect(wordMatchesCriteria('myths', {invalidLettersByPosition: [ new Set(['s']), new Set(['m']), new Set(['y']), new Set(['t']), new Set(['h']) ]})).to.be.true;
    
    expect(wordMatchesCriteria('myths', {correctLetters: ['m', null, null, null, null]})).to.be.true;
    expect(wordMatchesCriteria('myths', {correctLetters: [null, null, null, null, 's']})).to.be.true;
    expect(wordMatchesCriteria('myths', {correctLetters: [null, null, 'y', null, null]})).to.be.false;
    expect(wordMatchesCriteria('myths', {correctLetters: [null, null, null, null, null]})).to.be.true;
    
    expect(wordMatchesCriteria('myths', {minimumLetterCounts: {}})).to.be.true;
    expect(wordMatchesCriteria('myths', {minimumLetterCounts: {e:1}})).to.be.false;
    expect(wordMatchesCriteria('myths', {minimumLetterCounts: {t:1}})).to.be.true;
    expect(wordMatchesCriteria('myths', {minimumLetterCounts: {s:1}})).to.be.true;
    expect(wordMatchesCriteria('myths', {minimumLetterCounts: {s:1, t:1}})).to.be.true;
    expect(wordMatchesCriteria('myths', {minimumLetterCounts: {s:2, t:1}})).to.be.false;
    expect(wordMatchesCriteria('truss', {minimumLetterCounts: {s:2, t:1}})).to.be.true;
    expect(wordMatchesCriteria('truss', {minimumLetterCounts: {s:3}})).to.be.false;
    expect(wordMatchesCriteria('sassy', {minimumLetterCounts: {s:3}})).to.be.true;
    
    expect(wordMatchesCriteria('myths', {knownLetterCounts: {}})).to.be.true;
    expect(wordMatchesCriteria('myths', {knownLetterCounts: {s:1}})).to.be.true;
    expect(wordMatchesCriteria('myths', {knownLetterCounts: {s:2}})).to.be.false;
    expect(wordMatchesCriteria('truss', {knownLetterCounts: {s:1}})).to.be.false;
    expect(wordMatchesCriteria('truss', {knownLetterCounts: {s:2}})).to.be.true;
    expect(wordMatchesCriteria('truss', {knownLetterCounts: {s:3}})).to.be.false;
    expect(wordMatchesCriteria('sassy', {knownLetterCounts: {s:1}})).to.be.false;
    expect(wordMatchesCriteria('sassy', {knownLetterCounts: {s:2}})).to.be.false;
    expect(wordMatchesCriteria('sassy', {knownLetterCounts: {s:3}})).to.be.true;
  });
});
