import { useMemo, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  SIZE,
  initialState,
  legalMoves,
  applyMove,
  getStatus,
  findKing,
} from "../functions/game";

const BOARD_PX = Math.min(Dimensions.get("window").width - 24, 480);
const SQUARE = BOARD_PX / SIZE;

// Glifos sólidos para as duas cores (a cor vem do estilo)
const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const glyph = (type) => GLYPH[type] + "︎";
const VALUE = { q: 9, r: 5, b: 3, n: 3, p: 1 };

const colorName = (c) => (c === "w" ? "Brancas" : "Pretas");
const REASONS = {
  stalemate: "Empate: afogamento.",
  material: "Empate: material insuficiente.",
  fifty: "Empate: regra dos 50 lances.",
};

export default function ChessScreen({ navigation }) {
  const [state, setState] = useState(initialState);
  const [selected, setSelected] = useState(null); // { row, col }
  const [lastMove, setLastMove] = useState(null); // { from, to }
  const [captured, setCaptured] = useState({ w: [], b: [] }); // peças perdidas por cor
  const [pendingPromo, setPendingPromo] = useState(null); // { from, move }

  const status = useMemo(() => getStatus(state), [state]);
  const moves = useMemo(
    () => (selected && !status.over ? legalMoves(state, selected.row, selected.col) : []),
    [selected, state, status.over]
  );
  const kingInCheck = status.check ? findKing(state.board, state.turn) : null;

  const reset = () => {
    setState(initialState());
    setSelected(null);
    setLastMove(null);
    setCaptured({ w: [], b: [] });
    setPendingPromo(null);
  };

  const play = (from, move, promoteTo) => {
    const { state: next, captured: cap } = applyMove(state, from, move, promoteTo);
    if (cap) setCaptured((c) => ({ ...c, [cap.color]: [...c[cap.color], cap.type] }));
    setState(next);
    setSelected(null);
    setLastMove({ from, to: { row: move.row, col: move.col } });
  };

  const handlePress = (row, col) => {
    if (status.over || pendingPromo) return;

    const move = moves.find((m) => m.row === row && m.col === col);
    if (selected && move) {
      if (move.promotion) setPendingPromo({ from: selected, move });
      else play(selected, move);
      return;
    }

    const piece = state.board[row][col];
    setSelected(piece && piece.color === state.turn ? { row, col } : null);
  };

  const choosePromotion = (type) => {
    const { from, move } = pendingPromo;
    setPendingPromo(null);
    play(from, move, type);
  };

  let message;
  if (status.reason === "checkmate") message = `Xeque-mate! ${colorName(status.winner)} venceram.`;
  else if (status.over) message = REASONS[status.reason];
  else message = `Vez das ${colorName(state.turn)}${status.check ? " — xeque!" : ""}`;

  // Vantagem material (positiva = brancas na frente)
  const score = (list) => list.reduce((s, t) => s + VALUE[t], 0);
  const advantage = score(captured.b) - score(captured.w);

  const renderCaptured = (color) => (
    <View style={styles.capturedRow}>
      <Text style={[styles.capturedText, color === "b" ? styles.capturedBlack : styles.capturedWhite]}>
        {[...captured[color]]
          .sort((a, b) => VALUE[b] - VALUE[a])
          .map(glyph)
          .join("")}
      </Text>
      {(color === "b" ? advantage : -advantage) > 0 && (
        <Text style={styles.advantage}>+{Math.abs(advantage)}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.status, status.check && !status.over && styles.statusCheck]}>
        {message}
      </Text>

      <View>
        {renderCaptured("b") /* pretas capturadas pelas brancas */}
        <View style={styles.board}>
          {state.board.map((rowArr, row) => (
            <View key={row} style={styles.row}>
              {rowArr.map((piece, col) => {
                const dark = (row + col) % 2 === 1;
                const isSelected = selected?.row === row && selected?.col === col;
                const isMove = moves.some((m) => m.row === row && m.col === col);
                const isLast =
                  lastMove &&
                  ((lastMove.from.row === row && lastMove.from.col === col) ||
                    (lastMove.to.row === row && lastMove.to.col === col));
                const isCheck = kingInCheck?.row === row && kingInCheck?.col === col;

                return (
                  <Pressable
                    key={col}
                    onPress={() => handlePress(row, col)}
                    style={[
                      styles.square,
                      { backgroundColor: dark ? "#769656" : "#eeeed2" },
                      isLast && styles.last,
                      isSelected && styles.selected,
                      isCheck && styles.check,
                    ]}
                  >
                    {piece && (
                      <Text
                        style={[styles.piece, piece.color === "w" ? styles.white : styles.black]}
                      >
                        {glyph(piece.type)}
                      </Text>
                    )}
                    {isMove && <View style={piece ? styles.captureRing : styles.dot} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        {renderCaptured("w") /* brancas capturadas pelas pretas */}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={reset}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.buttonText}>Menu</Text>
        </Pressable>
      </View>

      <Modal visible={!!pendingPromo} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Promover peão para:</Text>
            <View style={styles.promoRow}>
              {["q", "r", "b", "n"].map((t) => (
                <Pressable key={t} style={styles.promoOption} onPress={() => choosePromotion(t)}>
                  <Text
                    style={[
                      styles.promoPiece,
                      state.turn === "w" ? styles.white : styles.black,
                    ]}
                  >
                    {glyph(t)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  status: { color: "#fff", fontSize: 22, fontWeight: "600", textAlign: "center", paddingHorizontal: 12 },
  statusCheck: { color: "#ff6b6b" },
  board: {
    width: BOARD_PX,
    height: BOARD_PX,
    borderWidth: 2,
    borderColor: "#444",
  },
  row: { flexDirection: "row" },
  square: {
    width: SQUARE,
    height: SQUARE,
    alignItems: "center",
    justifyContent: "center",
  },
  last: { backgroundColor: "#cdd26a" },
  selected: { backgroundColor: "#f6f669" },
  check: { backgroundColor: "#e8554e" },
  piece: { fontSize: SQUARE * 0.8, lineHeight: SQUARE },
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
    borderWidth: 3,
    borderColor: "rgba(200,0,0,0.6)",
  },
  capturedRow: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  capturedText: { fontSize: 20, letterSpacing: 1 },
  capturedBlack: { color: "#000", textShadowColor: "#888", textShadowRadius: 2, textShadowOffset: { width: 0, height: 0 } },
  capturedWhite: { color: "#fff" },
  advantage: { color: "#bbb", fontSize: 14, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 12 },
  button: {
    backgroundColor: "#769656",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  secondary: { backgroundColor: "#555" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: { backgroundColor: "#2b2b2b", borderRadius: 14, padding: 20, gap: 14, alignItems: "center" },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  promoRow: { flexDirection: "row", gap: 10 },
  promoOption: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#eeeed2",
    alignItems: "center",
    justifyContent: "center",
  },
  promoPiece: { fontSize: 44, lineHeight: 64 },
});
