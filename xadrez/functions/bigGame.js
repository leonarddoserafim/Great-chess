import { ROWS } from "./bigBoard";
import { getBigMoves, pawnAttacks } from "./bigPieces";

// Peça em que o peão se transforma ao chegar na última fileira (PROVISÓRIO)
export const PROMOTE_TO = "fz";

const opponent = (c) => (c === "w" ? "b" : "w");
const lastRow = (color) => (color === "w" ? 0 : ROWS - 1);

// A casa (row, col) é atacada por alguma peça da cor `by`?
export function isAttacked(pieces, row, col, by) {
  return pieces.some((p) => {
    if (p.color !== by) return false;
    const squares = p.type === "p" ? pawnAttacks(p) : getBigMoves(pieces, p);
    return squares.some((m) => m.row === row && m.col === col);
  });
}

export function inCheck(pieces, color) {
  const king = pieces.find((p) => p.type === "k" && p.color === color);
  return !!king && isAttacked(pieces, king.row, king.col, opponent(color));
}

// Move a peça em `from` para `to`. Devolve { pieces, captured }
export function applyMove(pieces, from, to) {
  const captured = pieces.find((p) => p.row === to.row && p.col === to.col) ?? null;
  const next = pieces
    .filter((p) => p !== captured)
    .map((p) => {
      if (p.row !== from.row || p.col !== from.col) return p;
      const moved = { ...p, row: to.row, col: to.col };
      if (p.type === "p" && to.row === lastRow(p.color)) moved.type = PROMOTE_TO;
      return moved;
    });
  return { pieces: next, captured };
}

// Lances legais da peça em (row, col): não podem deixar o próprio rei em xeque
export function legalMoves(pieces, row, col) {
  const piece = pieces.find((p) => p.row === row && p.col === col);
  if (!piece) return [];
  return getBigMoves(pieces, piece).filter(
    (m) => !inCheck(applyMove(pieces, piece, m).pieces, piece.color)
  );
}

export function hasAnyMove(pieces, color) {
  return pieces.some((p) => p.color === color && legalMoves(pieces, p.row, p.col).length > 0);
}

// { check, over, winner, reason } para quem joga agora (`turn`)
export function getBigStatus(pieces, turn) {
  const check = inCheck(pieces, turn);
  if (!hasAnyMove(pieces, turn)) {
    return check
      ? { check, over: true, winner: opponent(turn), reason: "checkmate" }
      : { check, over: true, winner: null, reason: "stalemate" };
  }
  if (pieces.every((p) => p.type === "k")) {
    return { check, over: true, winner: null, reason: "material" };
  }
  return { check, over: false, winner: null, reason: null };
}
