

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

// r = torre, n = cavalo, s = picket, k = rei, p = peão
const SETUP_BLACK = [
  ["r", "a2"], ["n", "b2"], ["s", "c2"], ["k", "f2"], ["s", "i2"], ["n", "j2"], ["r", "k2"],
  ["p", "a3"], ["p", "b3"], ["p", "c3"], ["p", "d3"], ["p", "e3"], ["p", "f3"],
  ["p", "g3"], ["p", "h3"], ["p", "i3"], ["p", "j3"], ["p", "k3"],
  ["p", "c4"], ["p", "f4"], ["p", "i4"],
];

const SETUP_WHITE = [
  ["r", "k9"], ["n", "j9"], ["s", "i9"], ["k", "f9"], ["s", "c9"], ["n", "b9"], ["r", "a9"],
  ["p", "k8"], ["p", "j8"], ["p", "i8"], ["p", "h8"], ["p", "g8"], ["p", "f8"],
  ["p", "e8"], ["p", "d8"], ["p", "c8"], ["p", "b8"], ["p", "a8"],
  ["p", "i7"], ["p", "f7"], ["p", "c7"],
];

export const initialBigPieces = () => {
  const black = SETUP_BLACK.map(([type, name]) => ({ type, color: "b", ...sq(name) }));
  const white = black.map((p) => ({ ...p, color: "w", row: ROWS - 1 - p.row, col: COLS - 1 - p.col }));
  return [...black, ...white];
};

export const pieceAt = (pieces, row, col) =>
  pieces.find((p) => p.row === row && p.col === col);