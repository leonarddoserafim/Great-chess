import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ROWS,
  MIN_COL,
  GRID_COLS,
  isPlayable,
  isDark,
  initialBigPieces,
  pieceAt,
} from '../functions/bigBoard';

const GLYPH = {
  k: '\u265A',
  r: '\u265C',
  n: '\u265E',
  p: '\u265F',
  fz: '\u265B',
};
const LABEL = {
  pk: 'Pk',
  el: 'El',
  li: 'Li',
  bu: 'Bu',
  wm: 'WM',
  sc: 'Sc',
  ca: 'Ca',
  gi: 'Gi',
  sm: 'SM',
};

// A grade tem 13 colunas de largura (11 + 1 extra de cada lado)
const BOARD_PX = Math.min(Dimensions.get('window').width - 24, 520);
const SQUARE = BOARD_PX / GRID_COLS;

export default function BigChessScreen({ navigation }) {
  const [pieces] = useState(initialBigPieces);
  const [selected, setSelected] = useState(null); // { row, col }

  const handlePress = (row, col) => {
    setSelected((cur) =>
      cur?.row === row && cur?.col === col ? null : { row, col }
    );
    // TODO: aqui entram as regras/peças do novo tabuleiro
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {selected
          ? `Fileira ${selected.row + 1}, coluna ${selected.col - MIN_COL + 1}`
          : 'Toque em uma casa'}
      </Text>

      <View style={styles.board}>
        {Array.from({ length: ROWS }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: GRID_COLS }).map((_, i) => {
              const col = i + MIN_COL; // converte índice da grade -> coluna lógica
              const key = `${row}-${col}`;

              // Posição vazia da grade: ocupa espaço mas não existe no jogo
              if (!isPlayable(row, col))
                return <View key={key} style={styles.square} />;

              const isSelected = selected?.row === row && selected?.col === col;
              const piece = pieceAt(pieces, row, col);
              return (
                <Pressable
                  key={key}
                  onPress={() => handlePress(row, col)}
                  style={[
                    styles.square,
                    {
                      backgroundColor: isDark(row, col) ? '#769656' : '#eeeed2',
                    },
                    isSelected && styles.selected,
                  ]}>
                  {piece && (
                    <Text
                      style={[
                        GLYPH[piece.type] ? styles.piece : styles.label,
                        piece.color === 'w' ? styles.white : styles.black,
                      ]}>
                      {GLYPH[piece.type]
                        ? GLYPH[piece.type] + '\uFE0E'
                        : LABEL[piece.type]}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.secondary]}
          onPress={() => setSelected(null)}>
          <Text style={styles.buttonText}>Limpar</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondary]}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Menu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  status: { color: '#fff', fontSize: 20, fontWeight: '600' },
  board: { width: BOARD_PX },
  row: { flexDirection: 'row' },
  square: {
    width: SQUARE,
    height: SQUARE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: { fontSize: SQUARE * 0.8, lineHeight: SQUARE },
  white: {
    color: '#fff',
    textShadowColor: '#000',
    textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 0 },
  },
  black: { color: '#000' },
  selected: { backgroundColor: '#f6f669' },
  actions: { flexDirection: 'row', gap: 12 },
  button: {
    backgroundColor: '#769656',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  secondary: { backgroundColor: '#555' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
