import { step } from "./common";

const OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export const knightMoves = (board, piece, row, col) =>
  step(board, piece, row, col, OFFSETS);
