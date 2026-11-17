import { step } from "./common";

const OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1],
];

// Movimentos normais do rei (o roque é tratado em game.js)
export const kingMoves = (board, piece, row, col) =>
  step(board, piece, row, col, OFFSETS);
