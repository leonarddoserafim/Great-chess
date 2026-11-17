import { slide } from "./common";

export const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

export const bishopMoves = (board, piece, row, col) =>
  slide(board, piece, row, col, BISHOP_DIRS);
