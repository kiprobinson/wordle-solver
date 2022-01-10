import { expect } from "chai";
import { arrayCount, arrayIntersection, arrayRemoveValue, arrayUnion, JsonStringifySets } from "../../app/lib/util";


describe('test util.ts methods', () => {
  it('arrayRemoveValue', () => {
    expect(arrayRemoveValue(['a', 'b', 'c'], 'a')).to.deep.equal(['b', 'c']);
    expect(arrayRemoveValue(['a', 'b', 'c'], 'b')).to.deep.equal(['a', 'c']);
    expect(arrayRemoveValue(['a', 'b', 'c'], 'x')).to.deep.equal(['a', 'b', 'c']);
    expect(arrayRemoveValue(['a', 'a', 'a'], 'a')).to.deep.equal(['a', 'a']);
    expect(arrayRemoveValue(['a', 'b', 'a'], 'a')).to.deep.equal(['b', 'a']);
    expect(arrayRemoveValue(['a'], 'a')).to.deep.equal([]);
    expect(arrayRemoveValue([], 'a')).to.deep.equal([]);
    
    
    expect(arrayRemoveValue(['1', '2', '3'], '1')).to.deep.equal(['2', '3']);
    expect(arrayRemoveValue(<any[]>['1', '2', '3'], 1)).to.deep.equal(['1', '2', '3']);
    expect(arrayRemoveValue(<any[]>[1, 2, 3], '1')).to.deep.equal([1, 2, 3]);
  });
  
  it('arrayRemoveValue modifies array in place and also returns a reference to the same array', () => {
    let arrIn = ['a', 'b', 'c'];
    let arrOut = arrayRemoveValue(arrIn, 'a');
    
    //original array should be modified also
    expect(arrOut).to.deep.equal(['b', 'c']);
    expect(arrIn).to.deep.equal(['b', 'c']);
    
    //ensure that both arrays are actually the same reference
    expect(arrIn).to.equal(arrOut);
  });
  
  it('arrayUnion', () => {
    expect(arrayUnion(['a', 'b', 'c'], ['d', 'e', 'f'])).to.deep.equal(['a', 'b', 'c', 'd', 'e', 'f']);
    expect(arrayUnion(['a', 'b', 'c'], [])).to.deep.equal(['a', 'b', 'c']);
    expect(arrayUnion([], ['d', 'e', 'f'])).to.deep.equal(['d', 'e', 'f']);
    expect(arrayUnion([], [])).to.deep.equal([]);
    expect(arrayUnion(['a', 'b', 'c'], ['a', 'b', 'c'])).to.deep.equal(['a', 'b', 'c']);
    expect(arrayUnion(['a', 'a', 'a'], ['a', 'a', 'a'])).to.deep.equal(['a']);
    expect(arrayUnion(['a', 'a', 'a'], ['b', 'b', 'b'])).to.deep.equal(['a', 'b']);
    expect(arrayUnion(['a', 'a', 'a'], [])).to.deep.equal(['a']);
    expect(arrayUnion([], ['b', 'b', 'b'])).to.deep.equal(['b']);
    expect(arrayUnion(['a', 'b', 'a'], ['b', 'c', 'a'])).to.deep.equal(['a', 'b', 'c']);
    
    expect(arrayUnion(['1', '2', '3'], ['5', '4', '3'])).to.deep.equal(['1', '2', '3', '5', '4']);
    expect(arrayUnion(<any>['1', '2', '3'], <any>[5, 4, 3])).to.deep.equal(['1', '2', '3', 5, 4, 3]);
  });
  
  it('arrayIntersection', () => {
    expect(arrayIntersection(['a', 'b', 'c'], ['d', 'e', 'f'])).to.deep.equal([]);
    expect(arrayIntersection(['a', 'b', 'c'], [])).to.deep.equal([]);
    expect(arrayIntersection([], ['d', 'e', 'f'])).to.deep.equal([]);
    expect(arrayIntersection([], [])).to.deep.equal([]);
    expect(arrayIntersection(['a', 'b', 'c'], ['c', 'b', 'a'])).to.deep.equal(['a', 'b', 'c']);
    expect(arrayIntersection(['a', 'b', 'c'], ['e', 'd', 'c'])).to.deep.equal(['c']);
    expect(arrayIntersection(<any>['1', '2', '3'], <any>[5, 4, 3])).to.deep.equal([]);
  });
  
  it('arrayCount', () => {
    expect(arrayCount(['a', 'b', 'c'], 'a')).to.equal(1);
    expect(arrayCount(['a', 'b', 'a'], 'a')).to.equal(2);
    expect(arrayCount(['a', 'a', 'a'], 'a')).to.equal(3);
    expect(arrayCount(['a', 'b', 'c'], 'x')).to.equal(0);
    expect(arrayCount([1, 2, 3], 3)).to.equal(1);
    expect(arrayCount([3, 2, 3], 3)).to.equal(2);
    expect(arrayCount([3, 3, 3], 3)).to.equal(3);
    expect(arrayCount(<any>['1', '2', '3'], 1)).to.equal(0);
    expect(arrayCount(<any>[1, 2, 3], '1')).to.equal(0);
  });
  
  it('JsonStringifySets', () => {
    const o = {
      a: 'b',
      c: ['d', 'e', 'f'],
      g: new Set(['h', 'i', 'j']),
      k: true,
      l: {
        m: new Set(['n', 0, 'p']),
        q: ['r', 's', 't'],
      },
    };
    
    const expectedNoSpace = '{"a":"b","c":["d","e","f"],"g":["h","i","j"],"k":true,"l":{"m":["n",0,"p"],"q":["r","s","t"]}}';
    const expectedThreeSpace = '{\n   "a": "b",\n   "c": [\n      "d",\n      "e",\n      "f"\n   ],\n   "g": [\n      "h",\n      "i",\n      "j"\n   ],\n   "k": true,\n   "l": {\n      "m": [\n         "n",\n         0,\n         "p"\n      ],\n      "q": [\n         "r",\n         "s",\n         "t"\n      ]\n   }\n}';
    
    expect(JsonStringifySets(o)).to.equal(expectedNoSpace);
    expect(JsonStringifySets(o, 3)).to.equal(expectedThreeSpace);
  });
});
