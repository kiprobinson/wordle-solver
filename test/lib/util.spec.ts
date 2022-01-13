import { expect } from "chai";
import { arrayCount, arrayIntersection, arrayRemoveValue, arrayUnion, JsonStringifySets } from "../../app/lib/util";


describe('test util.ts methods', () => {
  it('arrayRemoveValue', () => {
    let arr:any[];
    
    arr = ['a', 'b', 'c']
    expect(arrayRemoveValue(arr, 'a')).to.be.true;
    expect(arr).to.deep.equal(['b', 'c']);
    
    arr = ['a', 'b', 'c']
    expect(arrayRemoveValue(arr, 'b')).to.be.true;
    expect(arr).to.deep.equal(['a', 'c']);
    
    arr = ['a', 'b', 'c']
    expect(arrayRemoveValue(arr, 'x')).to.be.false;
    expect(arr).to.deep.equal(['a', 'b', 'c']);
    
    arr = ['a', 'a', 'a']
    expect(arrayRemoveValue(arr, 'a')).to.be.true;
    expect(arr).to.deep.equal(['a', 'a']);
    
    arr = ['a', 'b', 'a']
    expect(arrayRemoveValue(arr, 'a')).to.be.true;
    expect(arr).to.deep.equal(['b', 'a']);
    
    arr = ['a']
    expect(arrayRemoveValue(arr, 'a')).to.be.true;
    expect(arr).to.deep.equal([]);
    
    arr = []
    expect(arrayRemoveValue(arr, 'a')).to.be.false;
    expect(arr).to.deep.equal([]);
  });
  
  it('arrayRemoveValue - ensure triple equals comparison', () => {
    let arr:any[];
    
    arr = ['1', '2', '3']
    expect(arrayRemoveValue(arr, '1')).to.be.true;
    expect(arr).to.deep.equal(['2', '3']);
    
    arr = ['1', '2', '3']
    expect(arrayRemoveValue(arr, 1)).to.be.false;
    expect(arr).to.deep.equal(['1', '2', '3']);
    
    arr = [1, 2, 3]
    expect(arrayRemoveValue(arr, '1')).to.be.false;
    expect(arr).to.deep.equal([1, 2, 3]);
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
