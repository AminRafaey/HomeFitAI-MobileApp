// utils/helpers/fetchExerciseImage.ts
import axios from "axios";

const RAPIDAPI_HEADERS = {
  "x-rapidapi-key": "7319fe3066msh3ad6b025629ae02p104510jsn19100cc32820",

  "x-rapidapi-host": "exercisedb.p.rapidapi.com",
};

export const fetchExerciseImage = async (
  id: string,
  name: string,
  image?: string
): Promise<string | null> => {
  try {
    const nameExer = name.toLowerCase();

    const url = image
      ? `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`
      : `https://exercisedb.p.rapidapi.com/exercises/name/${nameExer}`;

    const response = await axios.get(url, {
      headers: RAPIDAPI_HEADERS,
    });

    return image ? response.data.gifUrl : response.data[0].gifUrl;
  } catch (err: any) {
    console.error("Error fetching exercise image:", err.message);
    return null;
  }
};
