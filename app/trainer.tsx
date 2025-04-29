import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  ScrollView,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
import { DB } from "@/firebaseConfig";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 2 * 78;

export default function App() {
  const [currentIndexUser, setCurrentIndexUser] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(
          collection(DB, "orientation_agents")
        );
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const currentTrainerUser = users[currentIndexUser];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / ITEM_WIDTH);
    if (index !== currentIndexUser && index >= 0 && index < users?.length) {
      setCurrentIndexUser(index);
    }
  };

  const scrollToTrainer = (index: number) => {
    if (index >= 0 && index < users?.length) {
      flatListRef.current?.scrollToOffset({
        offset: index * ITEM_WIDTH,
        animated: true,
      });
      setCurrentIndexUser(index);
    }
  };

  const handlePrevious = () => {
    scrollToTrainer(currentIndexUser - 1);
  };

  const handleNext = () => {
    scrollToTrainer(currentIndexUser + 1);
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/Splash.jpg")}
        style={styles.loadingBackground}
        resizeMode="cover"
      ></ImageBackground>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(248, 249, 251, 1)",
            alignItems: "center",
          }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.content}>
              <Text style={styles.title}>Choose your trainer</Text>

              <View style={styles.carouselContainer}>
                <TouchableOpacity
                  style={[
                    styles.carouselButton,
                    currentIndexUser === 0 && styles.disabledButton,
                  ]}
                  onPress={handlePrevious}
                  disabled={currentIndexUser === 0}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={currentIndexUser === 0 ? "#ccc" : "#485470"}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <FlatList
                    ref={flatListRef}
                    data={users}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={ITEM_WIDTH}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleScroll}
                    contentContainerStyle={styles.carouselList}
                    renderItem={({ item }) => (
                      <View style={styles.trainerImageContainer}>
                        <Image
                          source={{ uri: item?.imageLink }}
                          style={styles.trainerImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.carouselButton,
                    currentIndexUser === users?.length - 1 &&
                      styles.disabledButton,
                  ]}
                  onPress={handleNext}
                  disabled={currentIndexUser === users?.length - 1}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={
                      currentIndexUser === users?.length - 1
                        ? "#ccc"
                        : "#485470"
                    }
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.trainerName}>{currentTrainerUser?.name}</Text>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <FontAwesome
                    key={i}
                    name={
                      i < Math.floor(currentTrainerUser?.rating)
                        ? "star"
                        : i < currentTrainerUser?.rating
                        ? "star-half-o"
                        : "star-o"
                    }
                    size={16}
                    color="black"
                  />
                ))}
                <Text style={styles.ratingText}>
                  {currentTrainerUser?.rating.toFixed(1)}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.infoTitle}>More info</Text>
              <Text style={styles.infoText}>{currentTrainerUser?.info}</Text>

              <View style={styles.tagsContainer}>
                {currentTrainerUser?.skills.map((specialty, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            disabled={currentTrainerUser?.isPremium}
            onPress={() => router.push("/orientation")}
            style={{ width: "80%" }}
          >
            <LinearGradient
              colors={
                currentTrainerUser?.isPremium
                  ? ["#b0b0b0", "#d1d1d1"]
                  : ["#ff377d", "#ff8d51"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumButton}
            >
              {currentTrainerUser?.isPremium && (
                <MaterialIcons name="star" size={24} color="white" />
              )}
              <Text style={styles.premiumButtonText}>
                {currentTrainerUser?.isPremium
                  ? "Unlock with Premium"
                  : "Select trainer"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    flex: 1,
  },
  loadingBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },

  loadingOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    borderRadius: 10,
  },

  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  content: {
    flex: 1,
    backgroundColor: "rgba(248, 249, 251, 1)",
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    fontFamily: "Inter-Bold",
    textAlign: "center",
    marginBottom: 30,
    color: "black",
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  carouselList: {
    paddingHorizontal: 0,
  },
  carouselButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f4fb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  disabledButton: {
    backgroundColor: "#f8f8f8",
    shadowOpacity: 0,
    elevation: 0,
  },
  trainerImageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: ITEM_WIDTH / 2,
    backgroundColor: "rgba(228, 232, 255, 0.66)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  trainerImage: {
    width: "100%",
    height: "100%",
  },
  trainerName: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
    textAlign: "center",
    marginBottom: 5,
    color: "black",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter-Medium",
    marginLeft: 5,
    color: "black",
  },
  divider: {
    height: 1,
    backgroundColor: "#d3daea",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
    marginBottom: 10,
    color: "black",
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    marginBottom: 20,
    color: "black",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#f1f4fb",
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter-Medium",
    color: "#485470",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    borderRadius: 30,
    marginBottom: 20,
  },
  premiumButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginLeft: 10,
  },
});
