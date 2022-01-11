
/**
 * Removes the given item from the array, if it is present.
 * If it is present more than once, it only removes it once.
 * Based on: https://stackoverflow.com/a/5767357/18511
 */
export const arrayRemoveValue = <T>(arr:T[], value:T):T[] => {
  const index = arr.indexOf(value);
  if (index > -1)
    arr.splice(index, 1);
  return arr;
}

/**
 * Returns the union of two arrays.
 */
export const arrayUnion = <T>(a:T[], b:T[]):T[] => {
  const set = new Set<T>([...a, ...b]);
  return [...set];
}

/**
 * Returns the intersection of two arrays.
 */
export const arrayIntersection = <T>(a:T[], b:T[]):T[] => {
  const bSet = new Set<T>([...b]);
  const res = new Set<T>();
  for(let el of a) {
    if(bSet.has(el)) {
      res.add(el);
    }
  }
  return [...res];
}

/**
 * Counts the number of times a given value appears in an array.
 */
export const arrayCount = <T>(arr:T[], val:T):number => {
  let count = 0;
  for(let el of arr) {
    if(el === val) {
      count++;
    }
  }
  return count;
}

/**
 * Version of JSON.stringify but it renders sets as arrays.
 */
export const JsonStringifySets = (o:any, space?:number|string):string => {
  return JSON.stringify(o, (k, v) => v instanceof Set ? [...v] : v, space);
}

/**
 * Promise version of setImmediate().
 */
export const setImmediateAsync = async ():Promise<void> => await new Promise(resolve => setImmediate(resolve));
