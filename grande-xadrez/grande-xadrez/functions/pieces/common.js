export const SIZE = 8;

export const inside = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export const pieceAt = (board, r, c) => (inside(r, c) ? board[r][c] : null);

// Movimentos "deslizantes" (torre, bispo, dama)
export function slide(board, piece, row, col, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (inside(r, c)) {
      const target = board[r][c];
      if (target) {
        if (target.color !== piece.color) moves.push({ row: r, col: c });
        break;
      }
      moves.push({ row: r, col: c });
      r += dr;
      c += dc;
    }
  }
  return moves;
}

// Movimentos de um passo (cavalo, rei)
export function step(board, piece, row, col, offsets) {
  const moves = [];
  for (const [dr, dc] of offsets) {
    const r = row + dr;
    const c = col + dc;
    if (!inside(r, c)) continue;
    const target = board[r][c];
    if (!target || target.color !== piece.color) moves.push({ row: r, col: c });
  }
  return moves;
}
