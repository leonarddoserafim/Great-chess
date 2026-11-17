import { slide } from "./common";
import { ROOK_DIRS } from "./rook";
import { BISHOP_DIRS } from "./bishop";

export const queenMoves = (board, piece, row, col) =>
  slide(board, piece, row, col, [...ROOK_DIRS, ...BISHOP_DIRS]);
