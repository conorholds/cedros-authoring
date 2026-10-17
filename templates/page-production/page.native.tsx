import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function __CEDROS_PAGE_COMPONENT__() {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>CEDROS AUTHORED PAGE</Text>
      <Text accessibilityRole="header" style={styles.title}>{__CEDROS_PAGE_LABEL_JSON__}</Text>
      <Text style={styles.lede}>This production-ready starting point keeps web, native, and Markdown surfaces aligned while leaving room for the page's real content and interactions.</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={styles.button}>
        <Text style={styles.buttonText}>{expanded ? "Hide authoring note" : "Show authoring note"}</Text>
      </Pressable>
      {expanded ? <Text accessibilityLiveRegion="polite">Replace this note with a useful, accessible interaction or remove it before publishing.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: 64, paddingHorizontal: 24, gap: 18 },
  eyebrow: { color: "#2454d6", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 },
  title: { fontSize: 42, lineHeight: 46, fontWeight: "700" },
  lede: { maxWidth: 680, fontSize: 18, lineHeight: 28 },
  button: { alignSelf: "flex-start", backgroundColor: "#111827", borderRadius: 10, paddingVertical: 13, paddingHorizontal: 16 },
  buttonText: { color: "#ffffff", fontWeight: "600" },
});
