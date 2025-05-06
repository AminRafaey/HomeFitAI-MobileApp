import { View, Text, StyleSheet, Image } from "react-native";
import axios from "axios";
import fallbackImage from "../../../assets/images/warmup.gif";
import { useEffect, useState } from "react";

export default function ExerciseItem({
  id,
  index,
  name,
  duration,
  image,
  length,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const nameExer = name.toLowerCase();
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        if (image === undefined) {
          const response = await axios.get(
            `https://exercisedb.p.rapidapi.com/exercises/name/${nameExer}`,
            {
              headers: {
                "x-rapidapi-key":
                  "7319fe3066msh3ad6b025629ae02p104510jsn19100cc32820",
                "x-rapidapi-host": "exercisedb.p.rapidapi.com",
              },
            }
          );

          const formattedData = response.data[0].gifUrl;
          setImageUrl(formattedData);
        } else {
          const response = await axios.get(
            `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`,
            {
              headers: {
                "x-rapidapi-key":
                  "7319fe3066msh3ad6b025629ae02p104510jsn19100cc32820",
                "x-rapidapi-host": "exercisedb.p.rapidapi.com",
              },
            }
          );

          const formattedData = response.data.gifUrl;
          setImageUrl(formattedData);
        }
      } catch (err: any) {
        console.error("Error fetching exercises:", err.message);
      }
    };

    fetchExercises();
  }, []);
  const hasBottomBorder = index < length - 1;
  return (
    <View
      style={[
        styles.exerciseItem,
        hasBottomBorder && styles.exerciseItemWithBorder,
      ]}
    >
      <View style={styles.exerciseIconContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.exerciseIcon} />
        ) : (
          <Image source={fallbackImage} style={styles.exerciseIcon} />
        )}
      </View>
      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseName}>{name}</Text>
        <Text style={styles.exerciseDuration}>{duration}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0,
    borderBottomColor: "#F3F4F6",
  },
  exerciseItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  exerciseIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#D1D5DB",
    borderRadius: 4,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D2939",
    marginBottom: 2,
  },
  exerciseDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
});
