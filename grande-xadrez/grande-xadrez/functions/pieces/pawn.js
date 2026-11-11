import { SIZE, inside } from "./common";

export const pawnDir = (color) => (color === "w" ? -1 : 1);
const startRow = (color) => (color === "w" ? 6 : 1);
const lastRow = (color) => (color === "w" ? 0 : SIZE - 1);

// Casas que o peão ataca (diagonais)
export function pawnAttacks(piece, row, col) {
  const r = row + pawnDir(piece.color);
  return [-1, 1].filter((dc) => inside(r, col + dc)).map((dc) => ({ row: r, col: col + dc }));
}

// enPassant: casa alvo { row, col } ou null
export function pawnMoves(board, piece, row, col, enPassant) {
  const dir = pawnDir(piece.color);
  const moves = [];
  const add = (r, c, extra = {}) =>
    moves.push({ row: r, col: c, ...(r === lastRow(piece.color) ? { promotion: true } : {}), ...extra });

  const one = row + dir;
  if (inside(one, col) && !board[one][col]) {
    add(one, col);
    const two = row + 2 * dir;
    if (row === startRow(piece.color) && !board[two][col]) add(two, col);
  }

  for (const { row: r, col: c } of pawnAttacks(piece, row, col)) {
    const target = board[r][c];
    if (target && target.color !== piece.color) add(r, c);
    else if (!target && enPassant && enPassant.row === r && enPassant.col === c) {
      add(r, c, { enPassant: true });
    }
  }
  return moves;
}
