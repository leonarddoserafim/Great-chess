export const ROWS = 10;
export const COLS = 11;

// Altere aqui se quiser mover/adicionar casas extras
export const EXTRA_SQUARES = [
  { row: 1, col: -1 }, // fileira 2 (de cima p/ baixo): casa extra à ESQUERDA
  { row: 8, col: COLS }, // fileira 9: casa extra à DIREITA
];

// Faixa de colunas que a grade precisa desenhar (-1 .. 11 => 13 colunas)
export const MIN_COL = Math.min(0, ...EXTRA_SQUARES.map((s) => s.col));
export const MAX_COL = Math.max(COLS - 1, ...EXTRA_SQUARES.map((s) => s.col));
export const GRID_COLS = MAX_COL - MIN_COL + 1;

// Esta casa existe no tabuleiro? (substitui o "inside" do tabuleiro 8x8)
export const isPlayable = (row, col) =>
  (row >= 0 && row < ROWS && col >= 0 && col < COLS) ||
  EXTRA_SQUARES.some((s) => s.row === row && s.col === col);

// Cor da casa (xadrez), funcionando também para col negativa
export const isDark = (row, col) => (((row + col) % 2) + 2) % 2 === 1;

// ---------- Peças ----------
// Letra = coluna (a=0 ... k=10, sem contar a casa extra)
// Número = fileira, contada de cima para baixo (1 = topo)
const COL_LETTERS = "abcdefghijk";
export const sq = (name) => ({
  col: COL_LETTERS.indexOf(name[0]),
  row: Number(name.slice(1)) - 1,
});

// r torre, n cavalo, k rei, p peão, pk picket,
// el elephant, li lion, bu bull, wm war machine, sc scout, ca camel,
// gi giraffe, sm sea monster, fz ferz
const SETUP_BLACK = [
  ["el", "a1"], ["li", "b1"], ["n", "c1"], ["bu", "d1"], ["wm", "e1"], ["sc", "f1"],
  ["wm", "g1"], ["bu", "h1"], ["ca", "i1"], ["li", "j1"], ["el", "k1"],

  ["r", "a2"], ["n", "b2"], ["pk", "c2"], ["gi", "d2"], ["fz", "e2"], ["k", "f2"],
  ["sm", "g2"], ["gi", "h2"], ["pk", "i2"], ["n", "j2"], ["r", "k2"],

  ["p", "a3"], ["p", "b3"], ["p", "c3"], ["p", "d3"], ["p", "e3"], ["p", "f3"],
  ["p", "g3"], ["p", "h3"], ["p", "i3"], ["p", "j3"], ["p", "k3"],

  ["p", "c4"], ["p", "f4"], ["p", "i4"],
];

// Brancas = pretas giradas 180°
export const initialBigPieces = () => {
  const black = SETUP_BLACK.map(([type, name]) => ({ type, color: "b", ...sq(name) }));
  const white = black.map((p) => ({ ...p, color: "w", row: ROWS - 1 - p.row, col: COLS - 1 - p.col }));
  return [...black, ...white];
};

export const pieceAt = (pieces, row, col) =>
  pieces.find((p) => p.row === row && p.col === col);
