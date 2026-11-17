import { useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import {
  ROWS,
  MIN_COL,
  GRID_COLS,
  isPlayable,
  isDark,
  initialBigPieces,
  pieceAt,
} from "../functions/bigBoard";
import { legalMoves, applyMove, getBigStatus } from "../functions/bigGame";

// A grade tem 13 colunas de largura (11 + 1 extra de cada lado)
const BOARD_PX = Math.min(Dimensions.get("window").width - 24, 520);
const SQUARE = BOARD_PX / GRID_COLS;

// O Unicode só tem símbolos para as peças clássicas; as novas usam sigla
const GLYPH = { k: "♚", r: "♜", n: "♞", p: "♟", fz: "♛" };
const LABEL = {
  pk: "Pk", el: "El", li: "Li", bu: "Bu", wm: "WM",
  sc: "Sc", ca: "Ca", gi: "Gi", sm: "SM",
};

const colorName = (c) => (c === "w" ? "Brancas" : "Pretas");
const REASONS = {
  stalemate: "Empate: afogamento.",
  material: "Empate: só restaram os reis.",
};

export default function BigChessScreen({ navigation }) {
  const [pieces, setPieces] = useState(initialBigPieces);
  const [turn, setTurn] = useState("w");
  const [selected, setSelected] = useState(null); // { row, col }
  const [lastMove, setLastMove] = useState(null); // { from, to }

  const status = useMemo(() => getBigStatus(pieces, turn), [pieces, turn]);
  const moves = useMemo(
    () => (selected && !status.over ? legalMoves(pieces, selected.row, selected.col) : []),
    [selected, pieces, status.over]
  );
  const king = status.check ? pieces.find((p) => p.type === "k" && p.color === turn) : null;

  const reset = () => {
    setPieces(initialBigPieces());
    setTurn("w");
    setSelected(null);
    setLastMove(null);
  };

  const handlePress = (row, col) => {
    if (status.over) return;

    // Mover a peça selecionada
    if (selected && moves.some((m) => m.row === row && m.col === col)) {
      const { pieces: next } = applyMove(pieces, selected, { row, col });
      setPieces(next);
      setTurn(turn === "w" ? "b" : "w");
      setSelected(null);
      setLastMove({ from: selected, to: { row, col } });
      return;
    }

    // Selecionar peça da vez
    const piece = pieceAt(pieces, row, col);
    setSelected(piece && piece.color === turn ? { row, col } : null);
  };

  let message;
  if (status.reason === "checkmate") message = `Xeque-mate! ${colorName(status.winner)} venceram.`;
  else if (status.over) message = REASONS[status.reason];
  else message = `Vez das ${colorName(turn)}${status.check ? " — xeque!" : ""}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.status, status.check && !status.over && styles.statusCheck]}>
        {message}
      </Text>

      <View style={styles.board}>
        {Array.from({ length: ROWS }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: GRID_COLS }).map((_, i) => {
              const col = i + MIN_COL; // converte índice da grade -> coluna lógica
              const key = `${row}-${col}`;

              // Posição vazia da grade: ocupa espaço mas não existe no jogo
              if (!isPlayable(row, col)) return <View key={key} style={styles.square} />;

              const piece = pieceAt(pieces, row, col);
              const isSelected = selected?.row === row && selected?.col === col;
              const isMove = moves.some((m) => m.row === row && m.col === col);
              const isLast =
                lastMove &&
                ((lastMove.from.row === row && lastMove.from.col === col) ||
                  (lastMove.to.row === row && lastMove.to.col === col));
              const isCheck = king?.row === row && king?.col === col;

              return (
                <Pressable
                  key={key}
                  onPress={() => handlePress(row, col)}
                  style={[
                    styles.square,
                    { backgroundColor: isDark(row, col) ? "#769656" : "#eeeed2" },
                    isLast && styles.last,
                    isSelected && styles.selected,
                    isCheck && styles.check,
                  ]}
                >
                  {piece && (
                    <Text
                      style={[
                        GLYPH[piece.type] ? styles.piece : styles.label,
                        piece.color === "w" ? styles.white : styles.black,
                      ]}
                    >
                      {GLYPH[piece.type] ? GLYPH[piece.type] + "︎" : LABEL[piece.type]}
                    </Text>
                  )}
                  {isMove && <View style={piece ? styles.captureRing : styles.dot} />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={reset}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.buttonText}>Menu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  status: { color: "#fff", fontSize: 20, fontWeight: "600", textAlign: "center", paddingHorizontal: 12 },
  statusCheck: { color: "#ff6b6b" },
  board: { width: BOARD_PX },
  row: { flexDirection: "row" },
  square: { width: SQUARE, height: SQUARE, alignItems: "center", justifyContent: "center" },
  last: { backgroundColor: "#cdd26a" },
  selected: { backgroundColor: "#f6f669" },
  check: { backgroundColor: "#e8554e" },
  piece: { fontSize: SQUARE * 0.8, lineHeight: SQUARE },
  label: { fontSize: SQUARE * 0.42, fontWeight: "700" },
  white: {
    color: "#fff",
    textShadowColor: "#000",
    textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 0 },
  },
  black: { color: "#000" },
  dot: {
    position: "absolute",
    width: SQUARE * 0.3,
    height: SQUARE * 0.3,
    borderRadius: SQUARE * 0.15,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  captureRing: {
    position: "absolute",
    width: SQUARE * 0.9,
    height: SQUARE * 0.9,
    borderRadius: SQUARE * 0.45,
    borderWidth: 2,
    borderColor: "rgba(200,0,0,0.6)",
  },
  actions: { flexDirection: "row", gap: 12 },
  button: {
    backgroundColor: "#769656",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  secondary: { backgroundColor: "#555" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
