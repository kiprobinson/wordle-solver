import util from 'util';

const BITS_PER_ELEMENT = Uint32Array.BYTES_PER_ELEMENT * 8;

class BigBitMask {
  private readonly length: number;
  private readonly data: Uint32Array;
  private readonly lastByteMask: number;
  
  constructor(binaryString:string);
  constructor(booleans:boolean[]);
  constructor(length:number, defaultFilled?:boolean);
  constructor(other:BigBitMask);
  constructor(arg1:string|boolean[]|BigBitMask|number, arg2?:boolean) {
    if(arg1 instanceof BigBitMask) {
      const other:BigBitMask = arg1;
      this.length = other.length;
      this.data = new Uint32Array(other.data.length);
      this.data.set(other.data);
      this.lastByteMask = other.lastByteMask;
      return;
    }
    
    if('string' === typeof arg1) {
      const binaryString:string = arg1;
      if (!/^[01]+$/.test(binaryString))
        throw new Error(`Illegal binary string: ${binaryString}`);
      
      // convert to a boolean array and use that constructor
      arg1 = binaryString.split('').map(s => s === '1');
    }
    
    if(Array.isArray(arg1)) {
      const booleans:boolean[] = arg1;
      if (booleans.length <= 0)
        throw new Error("BigBitMask length must be greater than zero");
      
      this.length = booleans.length;
      this.data = new Uint32Array(Math.ceil(this.length / BITS_PER_ELEMENT));
      
      let val = 0, byteIndex = 0, bitMask = 1;
      booleans.forEach((b:boolean) => {
        if (b) {
          val |= bitMask;
        }
        
        // note- can't do `bitMask !== 0x80000000` because 0x40000000 << 1 is actually `-0x80000000` ...
        if ((bitMask & 0x80000000) !== 0) {
          this.data[byteIndex] = val;
          byteIndex++;
          bitMask = 1;
          val = 0;
        }
        else {
          bitMask <<= 1;
        }
      });
      
      if (bitMask !== 1)
        this.data[byteIndex] = val;
      
      this.lastByteMask = BigBitMask.computeMaskForLastByte(this.length);
      return;
    }
    
    const length:number = arg1;
    const defaultFilled:boolean = arg2 ?? false;
    
    if (length <= 0)
      throw new Error("BigBitMask length must be greater than zero");
    
    this.length = length;
    this.data = new Uint32Array(Math.ceil(this.length / BITS_PER_ELEMENT));
    
    this.lastByteMask = BigBitMask.computeMaskForLastByte(this.length);
    
    if(defaultFilled) {
      for(let i = 0; i < this.data.length; i++) {
        if(i === this.data.length - 1)
          this.data[i] = 0xffffffff & this.lastByteMask;
        else
          this.data[i] = 0xffffffff;
      }
    }
  }
  
  toString():string {
    return this.data.reduce(
      (s:string, n:number):string => {
        // the bits in each byte are in reverse order
        return s.concat(n.toString(2).padStart(BITS_PER_ELEMENT, '0').split('').reverse().join(''))
      },
      '',
    ).substring(0, this.length);
  }
  
  /**
   * This overrides what is printed when you do console.log()
   */
  [util.inspect.custom]():string {
    return this.toString();
  }
  
  /**
   * Gets the length of this mask
   */
  getLength():number {
    return this.length;
  }
  
  /**
   * Gets the number of bits set in this mask
   */
  getBitCount():number {
    return this.data.reduce(
      (sum:number, val:number):number => sum + BigBitMask.bitCount32(val),
      0,
    );
  }
  
  /**
   * Given the index of a bit in the mask, returns:
   *   - byteIndex: the index of the byte containing this bit
   *   - bitMask: a mask for the bit within the given byte
   */
  private getByteIndex(index:number):{byteIndex:number, bitMask:number} {
    if(index < 0 || index >= this.length)
      throw new Error(`BigBitMask index out of bounds: ${index} >= ${this.length}`);
    
    return {
      byteIndex: Math.trunc(index / BITS_PER_ELEMENT),
      bitMask: 1 << (index % BITS_PER_ELEMENT),
    };
  }
  
  /**
   * Determines if the given bit is set
   */
  isBitSet(index:number):boolean {
    const {byteIndex, bitMask} = this.getByteIndex(index);
    return 0 !== (this.data[byteIndex] & bitMask);
  }
  
  /**
   * Marks a bit as being in or not in the mask
   * @param value whether to mark the bit as being in or out of the mask
   */
  setBit(index:number, value:boolean|0|1=true):void {
    const {byteIndex, bitMask} = this.getByteIndex(index);
    if (value)
      this.data[byteIndex] |= bitMask;
    else
      this.data[byteIndex] &= ~bitMask;
  }
  
  /**
   * Applies the mask to the given array, returning a new array containing only the
   * elements that are marked in the mask.
   */
  apply<T>(arr:T[]):T[] {
    if(arr.length !== this.length) {
      throw new Error('List to apply is not the same size as mask');
    }
    
    return arr.filter((_el, index) => this.isBitSet(index));
  }
  
  /**
   * Performs bitwise negation of the mask
   */
  negate():BigBitMask {
    const result = new BigBitMask(this);
    for(let i = 0; i < result.data.length; i++) {
      if(i === result.data.length - 1)
        result.data[i] = ~result.data[i] & result.lastByteMask;
      else
        result.data[i] = ~result.data[i];
    }
    return result;
  }
  
  /**
   * Performs union (bitwise or) of this mask and one or more other masks.
   */
  union(...masks:BigBitMask[]):BigBitMask {
    return this.bitwiseOpImplementation(masks, (a, b) => a | b);
  }
  
  /**
   * Performs intersect (bitwise and) of this mask and one or more other masks.
   */
  intersect(...masks:BigBitMask[]):BigBitMask {
    return this.bitwiseOpImplementation(masks, (a, b) => a & b);
  }
  
  /**
   * Subtracts the other mask from this mask (bitwise `this & ~other`).
   */
  subtract(other:BigBitMask):BigBitMask {
    return this.bitwiseOpImplementation([other], (a, b) => a & ~b);
  }
  
  private bitwiseOpImplementation(masks:BigBitMask[], op:{(a:number, b:number):number}):BigBitMask {
    if (masks.length === 0)
      throw new Error('Must provide at least one other mask');
    
    if (masks.some(mask => mask.length !== this.length))
      throw new Error('Masks must all be the same length');
    
    const result = new BigBitMask(this);
    for(let i = 0; i < masks.length; i++) {
      for(let j = 0; j < result.data.length; j++) {
        result.data[j] = op(result.data[j], masks[i].data[j]);
      }
    }
    
    return result;
  }
  
  /**
   * Counts bits set in a Uint32.
   * Based on: https://stackoverflow.com/a/43122214/18511
   */
  private static bitCount32(n:number):number {
    //n = n & 0xffffffff; // not necessary?
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
  }
  
  private static computeMaskForLastByte(length:number):number {
    const bitsInLastByte = length % 32;
    if(bitsInLastByte === 0)
      return 0xffffffff;
    else
      return ((1 << bitsInLastByte) - 1) & 0xffffffff;
  }
};

export default BigBitMask;
