

export const ROWS = 10;
export const COLS = 11;


export const EXTRA_SQUARES = [
  { row: 1, col: -1 }, 
  { row: 8, col: COLS }, 
];


export const MIN_COL = Math.min(0, ...EXTRA_SQUARES.map((s) => s.col));
export const MAX_COL = Math.max(COLS - 1, ...EXTRA_SQUARES.map((s) => s.col));
export const GRID_COLS = MAX_COL - MIN_COL + 1;


export const isPlayable = (row, col) =>
  (row >= 0 && row < ROWS && col >= 0 && col < COLS) ||
  EXTRA_SQUARES.some((s) => s.row === row && s.col === col);


export const isDark = (row, col) => (((row + col) % 2) + 2) % 2 === 1;

const COL_LETTERS = "abcdefghijk";
export const sq = (name) => ({
  col: COL_LETTERS.indexOf(name[0]),
  row: Number(name.slice(1)) - 1,
});

const SETUP_BLACK = [
  ["el", "a1"], ["li", "b1"], ["n", "c1"], ["bu", "d1"], ["wm", "e1"], ["sc", "f1"],
  ["wm", "g1"], ["bu", "h1"], ["ca", "i1"], ["li", "j1"], ["el", "k1"],

  ["r", "a2"], ["n", "b2"], ["pk", "c2"], ["gi", "d2"], ["fz", "e2"], ["k", "f2"],
  ["sm", "g2"], ["gi", "h2"], ["pk", "i2"], ["n", "j2"], ["r", "k2"],

  ["p", "a3"], ["p", "b3"], ["p", "c3"], ["p", "d3"], ["p", "e3"], ["p", "f3"],
  ["p", "g3"], ["p", "h3"], ["p", "i3"], ["p", "j3"], ["p", "k3"],

  ["p", "c4"], ["p", "f4"], ["p", "i4"],
];

export const initialBigPieces = () => {
  const black = SETUP_BLACK.map(([type, name]) => ({ type, color: "b", ...sq(name) }));
  const white = black.map((p) => ({ ...p, color: "w", row: ROWS - 1 - p.row, col: COLS - 1 - p.col }));
  return [...black, ...white];
};

export const pieceAt = (pieces, row, col) =>
  pieces.find((p) => p.row === row && p.col === col);