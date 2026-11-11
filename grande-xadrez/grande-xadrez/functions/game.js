import { SIZE, inside } from "./pieces/common";
import { pawnMoves, pawnAttacks } from "./pieces/pawn";
import { rookMoves } from "./pieces/rook";
import { knightMoves } from "./pieces/knight";
import { bishopMoves } from "./pieces/bishop";
import { queenMoves } from "./pieces/queen";
import { kingMoves } from "./pieces/king";

export { SIZE };

const BACK_RANK = ["r", "n", "b", "q", "k", "b", "n", "r"];

const opponent = (c) => (c === "w" ? "b" : "w");

// ---------- Estado ----------
// state = { board, turn, enPassant, castling, halfmove }
// board[row][col] = { type: 'p'|'r'|'n'|'b'|'q'|'k', color: 'w'|'b' } | null
// Linha 0 = topo (pretas), linha 7 = base (brancas)
// castling = { wK, wQ, bK, bQ } (direitos ainda válidos)

export function initialState() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (let c = 0; c < SIZE; c++) {
    board[0][c] = { type: BACK_RANK[c], color: "b" };
    board[1][c] = { type: "p", color: "b" };
    board[6][c] = { type: "p", color: "w" };
    board[7][c] = { type: BACK_RANK[c], color: "w" };
  }
  return {
    board,
    turn: "w",
    enPassant: null,
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    halfmove: 0,
  };
}

// Carrega uma posição FEN (usado nos testes)
export function fromFEN(fen) {
  const [placement, turn, castle, ep, half] = fen.split(" ");
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  placement.split("/").forEach((rowStr, r) => {
    let c = 0;
    for (const ch of rowStr) {
      if (/\d/.test(ch)) c += Number(ch);
      else {
        board[r][c++] = {
          type: ch.toLowerCase(),
          color: ch === ch.toUpperCase() ? "w" : "b",
        };
      }
    }
  });
  return {
    board,
    turn,
    castling: {
      wK: castle.includes("K"),
      wQ: castle.includes("Q"),
      bK: castle.includes("k"),
      bQ: castle.includes("q"),
    },
    enPassant: ep && ep !== "-" ? { row: 8 - Number(ep[1]), col: ep.charCodeAt(0) - 97 } : null,
    halfmove: Number(half ?? 0),
  };
}

// ---------- Geração de movimentos ----------
function pseudoMoves(state, row, col) {
  const piece = state.board[row][col];
  if (!piece) return [];
  const { board, enPassant } = state;
  switch (piece.type) {
    case "p": return pawnMoves(board, piece, row, col, enPassant);
    case "r": return rookMoves(board, piece, row, col);
    case "n": return knightMoves(board, piece, row, col);
    case "b": return bishopMoves(board, piece, row, col);
    case "q": return queenMoves(board, piece, row, col);
    case "k": return kingMoves(board, piece, row, col);
    default: return [];
  }
}

// A casa (row, col) é atacada por alguma peça da cor `by`?
export function isAttacked(board, row, col, by) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (!p || p.color !== by) continue;
      if (p.type === "p") {
        if (pawnAttacks(p, r, c).some((m) => m.row === row && m.col === col)) return true;
      } else if (
        pseudoMoves({ board, enPassant: null }, r, c).some((m) => m.row === row && m.col === col)
      ) {
        return true;
      }
    }
  }
  return false;
}

export function findKing(board, color) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p && p.type === "k" && p.color === color) return { row: r, col: c };
    }
  return null;
}

export function inCheck(state, color = state.turn) {
  const k = findKing(state.board, color);
  return !!k && isAttacked(state.board, k.row, k.col, opponent(color));
}

function castlingMoves(state, row, col) {
  const piece = state.board[row][col];
  const { board, castling } = state;
  const home = piece.color === "w" ? 7 : 0;
  if (row !== home || col !== 4) return [];
  const enemy = opponent(piece.color);
  if (isAttacked(board, row, col, enemy)) return [];

  const moves = [];
  const k = piece.color + "K";
  const q = piece.color + "Q";

  if (
    castling[k] &&
    board[home][7]?.type === "r" && board[home][7].color === piece.color &&
    !board[home][5] && !board[home][6] &&
    !isAttacked(board, home, 5, enemy) && !isAttacked(board, home, 6, enemy)
  ) {
    moves.push({ row: home, col: 6, castle: "K" });
  }
  if (
    castling[q] &&
    board[home][0]?.type === "r" && board[home][0].color === piece.color &&
    !board[home][1] && !board[home][2] && !board[home][3] &&
    !isAttacked(board, home, 3, enemy) && !isAttacked(board, home, 2, enemy)
  ) {
    moves.push({ row: home, col: 2, castle: "Q" });
  }
  return moves;
}

// Aplica um movimento SEM validar. promoteTo: 'q'|'r'|'b'|'n'
export function applyMove(state, from, move, promoteTo = "q") {
  const board = state.board.map((r) => r.slice());
  const piece = board[from.row][from.col];
  const captured =
    board[move.row][move.col] ??
    (move.enPassant ? board[from.row][move.col] : null);

  board[from.row][from.col] = null;
  if (move.enPassant) board[from.row][move.col] = null;
  board[move.row][move.col] = move.promotion ? { type: promoteTo, color: piece.color } : piece;

  if (move.castle) {
    const home = move.row;
    if (move.castle === "K") {
      board[home][5] = board[home][7];
      board[home][7] = null;
    } else {
      board[home][3] = board[home][0];
      board[home][0] = null;
    }
  }

  // Direitos de roque
  const castling = { ...state.castling };
  if (piece.type === "k") {
    castling[piece.color + "K"] = false;
    castling[piece.color + "Q"] = false;
  }
  const touch = (r, c) => {
    if (r === 7 && c === 0) castling.wQ = false;
    if (r === 7 && c === 7) castling.wK = false;
    if (r === 0 && c === 0) castling.bQ = false;
    if (r === 0 && c === 7) castling.bK = false;
  };
  touch(from.row, from.col);
  touch(move.row, move.col);

  // Casa de en passant
  const enPassant =
    piece.type === "p" && Math.abs(move.row - from.row) === 2
      ? { row: (move.row + from.row) / 2, col: from.col }
      : null;

  return {
    state: {
      board,
      turn: opponent(state.turn),
      enPassant,
      castling,
      halfmove: piece.type === "p" || captured ? 0 : state.halfmove + 1,
    },
    captured,
    piece,
  };
}

// Movimentos legais da peça em (row, col)
export function legalMoves(state, row, col) {
  const piece = state.board[row][col];
  if (!piece || piece.color !== state.turn) return [];
  let moves = pseudoMoves(state, row, col);
  if (piece.type === "k") moves = moves.concat(castlingMoves(state, row, col));
  return moves.filter((m) => {
    const { state: next } = applyMove(state, { row, col }, m);
    return !inCheck(next, piece.color);
  });
}

export function allLegalMoves(state) {
  const out = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      for (const m of legalMoves(state, r, c)) out.push({ from: { row: r, col: c }, move: m });
  return out;
}

// Material insuficiente para dar mate
function insufficientMaterial(board) {
  const pieces = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p && p.type !== "k") pieces.push({ ...p, sq: (r + c) % 2 });
    }
  if (pieces.length === 0) return true;
  if (pieces.length === 1) return pieces[0].type === "b" || pieces[0].type === "n";
  // só bispos, todos na mesma cor de casa
  return pieces.every((p) => p.type === "b" && p.sq === pieces[0].sq);
}

// Situação da posição para quem joga agora
// { check: bool, over: bool, winner: 'w'|'b'|null, reason: string|null }
export function getStatus(state) {
  const check = inCheck(state);
  const hasMoves = allLegalMoves(state).length > 0;
  if (!hasMoves) {
    return check
      ? { check, over: true, winner: opponent(state.turn), reason: "checkmate" }
      : { check, over: true, winner: null, reason: "stalemate" };
  }
  if (insufficientMaterial(state.board))
    return { check, over: true, winner: null, reason: "material" };
  if (state.halfmove >= 100)
    return { check, over: true, winner: null, reason: "fifty" };
  return { check, over: false, winner: null, reason: null };
}

export { inside };
