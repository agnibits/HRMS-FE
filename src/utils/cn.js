/** Combine class names, ignoring falsy values. */
export function cn(...classes) {
  return classes.flat(Infinity).filter(Boolean).join(' ');
}

export default cn;
