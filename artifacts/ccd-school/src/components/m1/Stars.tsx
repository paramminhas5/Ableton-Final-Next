/** Stars out of three (or `of`), gold when earned, read out as "2 of 3 stars". */
export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return <span className="wc-stars" role="img" aria-label={`${n} of ${of} stars`}>{Array.from({ length: of }, (_, i) => <b key={i} className={i < n ? "is-on" : ""}>★</b>)}</span>;
}
