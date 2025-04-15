/* eslint-disable quote-props */
/* eslint-disable max-len */
/* eslint-disable object-curly-spacing */
import { onCall } from "firebase-functions/v2/https";
import axios from "axios";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp({ projectId: "homefit-ai" });

export const getWorkoutPlan = onCall(async (request) => {
  const conversationId = request.data.conversationId;
  const userId = request.data.userId;
  console.log(userId, " userId");

  if (!conversationId) {
    throw new Error("No conversationId provided");
  }

  try {
    const transcript = await fetchTranscriptSummary(conversationId);
    if (!transcript) throw new Error("Transcript summary not found");

    const userData = await extractUserDataFromTranscript(transcript);
    if (!userData) throw new Error("Failed to extract structured data");

    const simplifiedExercises = await fetchSimplifiedExercises();
    if (!simplifiedExercises || simplifiedExercises.length === 0) {
      throw new Error("Failed to fetch exercise list");
    }

    const workoutPlan = await generateWorkoutPlan(
      userData,
      simplifiedExercises
    );
    if (!workoutPlan) throw new Error("Failed to generate workout plan");

    const data = {
      userId: userId.uid,
      workoutPlan,
      conversationId,
    };
    await saveToFirestore(data);
    return {
      success: true,
      data: workoutPlan,
    };
  } catch (error) {
    console.error("Error in getConversationHistory:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchTranscriptSummary = async (
  conversationId: string
): Promise<string | null> => {
  const maxRetries = 3;
  const delayBetweenRetries = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            "xi-api-key": "sk_44e26b7fba8ab5176bb0c4dec37ef2faf4546a1755e32e9f",
          },
        }
      );

      const summary = response?.data?.analysis?.transcript_summary;
      if (summary) {
        return summary;
      }

      console.warn(`Attempt ${attempt}: Transcript not found. Retrying...`);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, (error as Error).message);
    }

    if (attempt < maxRetries) {
      await delay(delayBetweenRetries);
    }
  }

  return null;
};

const extractUserDataFromTranscript = async (summary: string) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts structured fitness user data from conversation transcripts. Return a JSON object with keys: name, gender, age, height, weight, fitness_goal, equipment, days_to_exercise, time_per_day, and past_injuries. If a value is missing, set it as null.",
        },
        {
          role: "user",
          content: summary,
        },
      ],
    },
    {
      headers: {
        Authorization:
          "Bearer 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",
      },
    }
  );

  return response.data.choices[0].message.content;
};

interface Exercise {
  id: string;
  name: string;
}

const fetchSimplifiedExercises = async (): Promise<Exercise[]> => {
  const response = await axios.get(
    "https://exercisedb.p.rapidapi.com/exercises?limit=0",
    {
      headers: {
        "x-rapidapi-key": "7319fe3066msh3ad6b025629ae02p104510jsn19100cc32820",
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data.map((exercise: Exercise) => ({
    id: exercise.id,
    name: exercise.name,
  }));
};

interface UserData {
  name: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  fitness_goal: string | null;
  equipment: string[] | null;
  days_to_exercise: number | null;
  time_per_day: number | null;
  past_injuries: string[] | null;
}

const generateWorkoutPlan = async (
  userData: UserData,
  exercises: Exercise[]
) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional personal trainer AI assistant. 
          You will be given user information including: name, gender, age, height, weight, fitness goal, available equipment, preferred days and times to exercise, and any past injuries.
          
          Below is a list of available exercises, each containing a name and a unique ID. You must only use exercises from this list when generating the workout plan.
          Your workout plan should:\n- Match the user's goals and fitness level\n- Respect their injuries and avoid exercises that may aggravate them\n- Fit within their schedule (days and times available)\n- Include warm-up and cool-down suggestions\n- Balance muscle groups and allow for rest days\n
          
          You MUST return the response as a valid JSON object with the following format:
          
          {
            "name": "John",
            "goal": "Build muscle and lose fat",
            "schedule": ["Monday", "Wednesday", "Friday"],
            "equipment": ["Dumbbells", "Resistance bands"],
            "note": "Avoid exercises that may strain the lower back",
            "weekly_plan": {
              "Monday": {
                "warmup": [{ "name": "Arm circles" }, { "name": "Marching in place" }],
                "workout": [
                  { "name": "Bodyweight squatting row", "id": "3xK09Sk", "sets": 3, "reps": "8-10", "note": "Focus on maintaining proper form" },
                  { "name": "Biceps pull-up", "id": "guT8YnS", "sets": 3, "reps": "6-8", "note": "Use a doorway pull-up bar if available" }
                ],
                "cooldown": [{ "name": "Gentle forward bend" }, { "name": "Deep breathing exercises" }]
              },
              "Wednesday": { /* same structure */ },
              "Friday": { /* same structure */ }
            },
            "additional_notes": [
              "Focus on form to protect your lower back.",
              "Ensure proper nutrition.",
              "Progressively increase resistance.",
              "Consult a physical therapist if pain persists."
            ]
          }
          
          Only return valid JSON. Do not include markdown or explanations.
          
          Available Exercises: ${JSON.stringify(exercises)}`,
        },
        {
          role: "user",
          content: userData,
        },
      ],
    },
    {
      headers: {
        Authorization:
          "Bearer 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",
      },
    }
  );

  return response.data.choices[0].message.content;
};
const saveToFirestore = async (data: any) => {
  try {
    const firestore = getFirestore();
    const userWorkoutPlansRef = firestore
      .collection("userWorkoutPlans")
      .doc(data.userId)
      .collection("workoutPlans");

    let workoutPlan = data.workoutPlan;
    if (typeof workoutPlan === "string") {
      const cleanedWorkoutPlan = workoutPlan.replace(/```json|```/g, "").trim();
      workoutPlan = JSON.parse(cleanedWorkoutPlan);
    }

    for (const day of Object.keys(workoutPlan)) {
      const dayPlan = workoutPlan[day];

      await userWorkoutPlansRef.doc(day).set({
        conversationId: data.conversationId,
        workoutPlan: dayPlan,
        createdAt: new Date(),
      });

      console.log(`${day} workout plan document created successfully`);
    }
  } catch (error) {
    console.error("Error creating workout plan document", error);
    throw error;
  }
};
