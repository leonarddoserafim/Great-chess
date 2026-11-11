import { Pressable, StyleSheet, Text, View } from "react-native";
 
export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{"\u265F\uFE0E"}</Text>
      <Text style={styles.title}>Xadrez</Text>
 
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("Chess")}
      >
        <Text style={styles.buttonText}>Novo Jogo</Text>
      </Pressable>
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
  icon: { fontSize: 96, color: "#fff" },
  title: { fontSize: 40, fontWeight: "700", color: "#fff", marginBottom: 24 },
  button: {
    backgroundColor: "#769656",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontSize: 20, fontWeight: "600" },
});