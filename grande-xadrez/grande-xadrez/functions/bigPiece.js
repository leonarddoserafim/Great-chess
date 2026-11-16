import { isPlayable } from "./bigBoard";

const at = (pieces, r, c) => pieces.find((p) => p.row === r && p.col === c);

// Todas as variações de sinal/ordem de (a, b): ex. (1,2) -> 8 saltos de cavalo
const sym = (a, b) => [
  ...new Set(
    [[a, b], [a, -b], [-a, b], [-a, -b], [b, a], [b, -a], [-b, a], [-b, -a]].map((o) =>
      JSON.stringify(o.map((n) => n + 0))
    )
  ),
].map((s) => JSON.parse(s));

// Salta direto para cada deslocamento (ignora peças no meio)
function leap(pieces, piece, offsets) {
  const moves = [];
  for (const [dr, dc] of offsets) {
    const r = piece.row + dr;
    const c = piece.col + dc;
    if (!isPlayable(r, c)) continue;
    const t = at(pieces, r, c);
    if (!t || t.color !== piece.color) moves.push({ row: r, col: c });
  }
  return moves;
}

// Scout: se a casa colada (distância 1) estiver ocupada, ele passa por cima?
const SCOUT_JUMPS_FIRST = true;

// Desliza em linha reta; só pode parar a partir de `minDist` casas
function slide(pieces, piece, dirs, minDist = 1) {
  const moves = [];
  for (const [dr, dc] of dirs) {
    for (let k = 1; ; k++) {
      const r = piece.row + dr * k;
      const c = piece.col + dc * k;
      if (!isPlayable(r, c)) break;
      const t = at(pieces, r, c);
      if (t) {
        if (k >= minDist && t.color !== piece.color) moves.push({ row: r, col: c });
        if (k >= minDist || !SCOUT_JUMPS_FIRST) break;
        continue;
      }
      if (k >= minDist) moves.push({ row: r, col: c });
    }
  }
  return moves;
}

// Giraffe: 1 passo na diagonal + 3 ou mais casas em linha reta "para fora".
// As casas do caminho precisam estar vazias.
function giraffe(pieces, piece) {
  const moves = [];
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const r1 = piece.row + dr;
      const c1 = piece.col + dc;
      if (!isPlayable(r1, c1) || at(pieces, r1, c1)) continue;
      for (const [sr, sc] of [[dr, 0], [0, dc]]) {
        for (let k = 1; ; k++) {
          const r = r1 + sr * k;
          const c = c1 + sc * k;
          if (!isPlayable(r, c)) break;
          const t = at(pieces, r, c);
          if (t) {
            if (k >= 3 && t.color !== piece.color) moves.push({ row: r, col: c });
            break;
          }
          if (k >= 3) moves.push({ row: r, col: c });
        }
      }
    }
  }
  return moves;
}

const ORTHO = sym(1, 0);
const DIAG = sym(1, 1);

export function getBigMoves(pieces, piece) {
  switch (piece.type) {
    // peças novas
    case "el": return leap(pieces, piece, sym(2, 2));
    case "li": return leap(pieces, piece, sym(3, 0));
    case "bu": return leap(pieces, piece, sym(2, 3));
    case "wm": return leap(pieces, piece, sym(2, 0));
    case "ca": return leap(pieces, piece, sym(1, 3));
    case "sm": return leap(pieces, piece, sym(1, 0));
    case "fz": return leap(pieces, piece, sym(1, 1));
    case "sc": return slide(pieces, piece, DIAG, 2);
    case "gi": return giraffe(pieces, piece);
    // peças clássicas
    case "r": return slide(pieces, piece, ORTHO);
    case "n": return leap(pieces, piece, sym(1, 2));
    case "k": return leap(pieces, piece, [...ORTHO, ...DIAG]);
    // "p" (peão) e "pk" (picket): regras ainda não definidas
    default: return [];
  }
}