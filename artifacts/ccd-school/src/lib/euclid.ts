/** Spread `hits` evenly over `steps`, then rotate. Euclid's rhythm: 4 of 16 is four on the floor. */
export function euclid(hits: number, steps = 16, rotate = 0): boolean[] {
  const h = Math.max(0, Math.min(steps, Math.round(hits)));
  const out = Array<boolean>(steps).fill(false);
  for (let k = 0; k < h; k++) out[Math.floor((k * steps) / h)] = true;
  const r = ((Math.round(rotate) % steps) + steps) % steps;
  return out.map((_, i) => out[(i - r + steps) % steps]);
}
