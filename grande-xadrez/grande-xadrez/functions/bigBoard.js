// Tabuleiro grande: 11 colunas x 10 fileiras + 2 casas extras.
// Coordenadas: row 0 = topo; col 0 = primeira coluna "normal" da esquerda.
// Casas extras ficam FORA do retângulo 0..10, por isso usam col -1 e col 11.

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
