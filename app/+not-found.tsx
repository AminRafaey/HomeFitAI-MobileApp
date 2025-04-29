import { Image } from "react-native";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Image source={require("./../assets/images/Splash.jpg")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
