
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
