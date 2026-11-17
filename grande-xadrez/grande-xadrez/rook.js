import { slide } from "./common";

export const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export const rookMoves = (board, piece, row, col) =>
  slide(board, piece, row, col, ROOK_DIRS);
