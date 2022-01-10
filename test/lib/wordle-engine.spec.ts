import { expect } from "chai";
import { getEmptyRateWordCriteria } from "../../app/lib/word-list";
import { updateCriteriaPerResult } from "../../app/lib/wordle-engine";


describe('test wordle-engine.ts methods', () => {
  it('updateCriteriaPerResult - word is "truss" and we guess "tares" then "tours"', () => {
    let criteria = getEmptyRateWordCriteria();
    updateCriteriaPerResult('tares', 'gbybg', criteria);
    expect(criteria.correctLetters).to.deep.equal(['t', null, null, null, 's']);
    expect([...criteria.invalidLetters]).to.deep.equal(['a', 'e']);
    expect([...criteria.invalidLettersByPosition[0]]).to.deep.equal([]);
    expect([...criteria.invalidLettersByPosition[1]]).to.deep.equal(['a']);
    expect([...criteria.invalidLettersByPosition[2]]).to.deep.equal(['r']);
    expect([...criteria.invalidLettersByPosition[3]]).to.deep.equal(['e']);
    expect([...criteria.invalidLettersByPosition[4]]).to.deep.equal([]);
    expect(criteria.knownLetterCounts).to.deep.equal({});
    expect(criteria.requiredLetters).to.deep.equal(['t', 'r', 's']);
    
    updateCriteriaPerResult('tours', 'gbgyg', criteria);
    expect(criteria.correctLetters).to.deep.equal(['t', null, 'u', null, 's']);
    expect([...criteria.invalidLetters]).to.deep.equal(['a', 'e', 'o']);
    expect([...criteria.invalidLettersByPosition[0]]).to.deep.equal([]);
    expect([...criteria.invalidLettersByPosition[1]]).to.deep.equal(['a', 'o']);
    expect([...criteria.invalidLettersByPosition[2]]).to.deep.equal(['r']);
    expect([...criteria.invalidLettersByPosition[3]]).to.deep.equal(['e', 'r']);
    expect([...criteria.invalidLettersByPosition[4]]).to.deep.equal([]);
    expect(criteria.knownLetterCounts).to.deep.equal({});
    expect(criteria.requiredLetters).to.deep.equal(['t', 'r', 's', 'u']);
  });
  
  //If word is "myths" and we guess "truss" (ybbbg) or "tessa" (ybybb),
  it('updateCriteriaPerResult - word is "myths" and we guess "truss"', () => {
    let criteria = getEmptyRateWordCriteria();
    updateCriteriaPerResult('truss', 'ybbbg', criteria);
    expect(criteria.correctLetters).to.deep.equal([null, null, null, null, 's']);
    expect([...criteria.invalidLetters]).to.deep.equal(['r', 'u']);
    expect([...criteria.invalidLettersByPosition[0]]).to.deep.equal(['t']);
    expect([...criteria.invalidLettersByPosition[1]]).to.deep.equal(['r']);
    expect([...criteria.invalidLettersByPosition[2]]).to.deep.equal(['u']);
    expect([...criteria.invalidLettersByPosition[3]]).to.deep.equal(['s']);
    expect([...criteria.invalidLettersByPosition[4]]).to.deep.equal([]);
    expect(criteria.knownLetterCounts).to.deep.equal({s:1});
    expect(criteria.requiredLetters).to.deep.equal(['t', 's']);
  });
  
  it('updateCriteriaPerResult - word is "myths" and we guess "tessa"', () => {
    let criteria = getEmptyRateWordCriteria();
    updateCriteriaPerResult('tessa', 'ybybb', criteria);
    expect(criteria.correctLetters).to.deep.equal([null, null, null, null, null]);
    expect([...criteria.invalidLetters]).to.deep.equal(['e', 'a']);
    expect([...criteria.invalidLettersByPosition[0]]).to.deep.equal(['t']);
    expect([...criteria.invalidLettersByPosition[1]]).to.deep.equal(['e']);
    expect([...criteria.invalidLettersByPosition[2]]).to.deep.equal(['s']);
    expect([...criteria.invalidLettersByPosition[3]]).to.deep.equal(['s']);
    expect([...criteria.invalidLettersByPosition[4]]).to.deep.equal(['a']);
    expect(criteria.knownLetterCounts).to.deep.equal({s:1});
    expect(criteria.requiredLetters).to.deep.equal(['t', 's']);
  });
  
  it('updateCriteriaPerResult - word is "truss" and we guess "tessa"', () => {
    let criteria = getEmptyRateWordCriteria();
    updateCriteriaPerResult('tessa', 'gbygb', criteria);
    expect(criteria.correctLetters).to.deep.equal(['t', null, null, 's', null]);
    expect([...criteria.invalidLetters]).to.deep.equal(['e', 'a']);
    expect([...criteria.invalidLettersByPosition[0]]).to.deep.equal([]);
    expect([...criteria.invalidLettersByPosition[1]]).to.deep.equal(['e']);
    expect([...criteria.invalidLettersByPosition[2]]).to.deep.equal(['s']);
    expect([...criteria.invalidLettersByPosition[3]]).to.deep.equal([]);
    expect([...criteria.invalidLettersByPosition[4]]).to.deep.equal(['a']);
    expect(criteria.knownLetterCounts).to.deep.equal({});
    expect(criteria.requiredLetters).to.deep.equal(['t', 's', 's']);
  });
  
  it('updateCriteriaPerResult - word is "truss" and we guess "sassy"', () => {
    let criteria = getEmptyRateWordCriteria();
    updateCriteriaPerResult('sassy', 'ybbgb', criteria);
    expect(criteria.correctLetters).to.deep.equal([null, null, null, 's', null]);
    expect([...criteria.invalidLetters]).to.deep.equal(['a', 'y']);
    expect([...criteria.invalidLettersByPosition[0]]).to.deep.equal(['s']);
    expect([...criteria.invalidLettersByPosition[1]]).to.deep.equal(['a']);
    expect([...criteria.invalidLettersByPosition[2]]).to.deep.equal(['s']);
    expect([...criteria.invalidLettersByPosition[3]]).to.deep.equal([]);
    expect([...criteria.invalidLettersByPosition[4]]).to.deep.equal(['y']);
    expect(criteria.knownLetterCounts).to.deep.equal({s: 2});
    expect(criteria.requiredLetters).to.deep.equal(['s', 's']);
  });
});