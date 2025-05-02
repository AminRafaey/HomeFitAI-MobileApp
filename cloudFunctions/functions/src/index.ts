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
      userId: userId,
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

export const getAgentData = onCall(async (request) => {
  const { conversationId, userId } = request.data;

  if (!conversationId || !userId) {
    throw new Error("conversationId and userId are required");
  }

  try {
    const firestore = getFirestore();
    const userRef = firestore.collection("users").doc(userId);

    const transcript = await fetchTranscriptSummary(conversationId);
    if (!transcript) throw new Error("Transcript summary not found");

    const plansSnap = await userRef
      .collection("workoutPlans")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (plansSnap.empty) {
      return {
        success: true,
        transcript,
        workoutToday: null,
        message: "No workout plan found.",
      };
    }

    const planDoc = plansSnap.docs[0];
    const planData = planDoc.data();
    const planStartDate = planData.createdAt.toDate();

    const today = new Date();
    const daysSinceStart = Math.floor(
      (today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentWeek = Math.floor(daysSinceStart / 7) + 1;

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const todayName = dayNames[today.getDay()];
    const responseString = `The workout plan started on ${planStartDate.toDateString()}.
Today is ${todayName}, and it is week ${currentWeek} of the plan.`;

    const openAIPlanSnap = await userRef
      .collection("OpenAIPlan")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let latestOpenAIPlan = null;
    if (!openAIPlanSnap.empty) {
      const openAIPlanDoc = openAIPlanSnap.docs[0];
      latestOpenAIPlan = openAIPlanDoc.data();
    }

    return {
      success: true,
      transcript,
      workoutHistory: responseString,
      latestOpenAIPlan,
    };
  } catch (error) {
    console.error("Error in getAgentData:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export const geUpdatedWorkoutPlan = onCall(async (request) => {
  try {
    const userData = request.data.userData;
    const userId = request.data.userId;
    const conversationId = request.data.conversationId;

    const simplifiedExercises = await fetchSimplifiedExercises();
    if (!simplifiedExercises || simplifiedExercises.length === 0) {
      throw new Error("Failed to fetch exercise list");
    }

    const firestore = getFirestore();
    const userRef = firestore.collection("users").doc(userId);
    const prevPlanSnap = await userRef
      .collection("OpenAIPlan")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (prevPlanSnap.empty) throw new Error("No previous workout plan found");

    const prevPlan = prevPlanSnap.docs[0].data()?.cleanedWorkoutPlan;

    const workoutPlan = await generateModifiedWorkoutPlan(
      userData,
      simplifiedExercises,
      prevPlan
    );
    if (!workoutPlan) throw new Error("Failed to generate workout plan");
    const data = {
      userId: userId,
      workoutPlan,
      conversationId: conversationId,
    };
    await saveToFirestore(data);
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error in getConversationHistory:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

const generateModifiedWorkoutPlan = async (
  newUserData: UserData,
  exercises: Exercise[],
  prevPlan: string
) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional fitness coach assistant.
You are given new user data and their previous workout plan.
Update the plan based on any changes in preferences, injuries, goals, or schedule.
         Your workout plan should:
          - Match the user's goals and fitness level
          - Respect their injuries and avoid exercises that may aggravate them
          - Fit within their schedule (days and times available)
          - Include warm-up and cool-down suggestions
          - Balance muscle groups and allow for rest days
          
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
                  { 
                    "name": "Bodyweight squatting row", 
                    "id": "3xK09Sk", 
                    "sets": 3, 
                    "reps": "8-10", 
                    "note": "Focus on maintaining proper form", 
                    "image": "https://example.com/images/squatting_row.jpg" 
                  },
                  { 
                    "name": "Biceps pull-up", 
                    "id": "guT8YnS", 
                    "sets": 3, 
                    "reps": "6-8", 
                    "note": "Use a doorway pull-up bar if available", 
                    "image": "https://example.com/images/biceps_pull_up.jpg" 
                  }
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
        
         `,
        },
        {
          role: "user",
          content: `New User Data:\n${JSON.stringify(
            newUserData
          )}\n\nPrevious Plan:\n${prevPlan}\n\n`,
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
  gifUrl: string;
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
    image: exercise.gifUrl,
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
          
          Your workout plan should:
          - Match the user's goals and fitness level
          - Respect their injuries and avoid exercises that may aggravate them
          - Fit within their schedule (days and times available)
          - Include warm-up and cool-down suggestions
          - Balance muscle groups and allow for rest days
          
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
                  { 
                    "name": "Bodyweight squatting row", 
                    "id": "3xK09Sk", 
                    "sets": 3, 
                    "reps": "8-10", 
                    "note": "Focus on maintaining proper form", 
                    "image": "https://example.com/images/squatting_row.jpg" 
                  },
                  { 
                    "name": "Biceps pull-up", 
                    "id": "guT8YnS", 
                    "sets": 3, 
                    "reps": "6-8", 
                    "note": "Use a doorway pull-up bar if available", 
                    "image": "https://example.com/images/biceps_pull_up.jpg" 
                  }
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
          
`,
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
    const userRef = firestore.collection("users").doc(data.userId);
    let workoutPlan = data.workoutPlan;

    if (typeof workoutPlan === "string") {
      const cleanedWorkoutPlan = workoutPlan.replace(/```json|```/g, "").trim();
      const today = new Date();
      const currentDateId = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

      const openAIPlanRef = userRef.collection("OpenAIPlan").doc(currentDateId);
      await openAIPlanRef.set({
        cleanedWorkoutPlan: cleanedWorkoutPlan,
        createdAt: new Date(),
      });
      workoutPlan = JSON.parse(cleanedWorkoutPlan);
    }
    for (const day of Object.keys(workoutPlan.weekly_plan)) {
      const dayPlan = workoutPlan.weekly_plan[day];
      const workoutPlanRef = userRef.collection("workoutPlans").doc(day);

      await workoutPlanRef.set({
        conversationId: data.conversationId,
        name: workoutPlan.name || "",
        goal: workoutPlan.goal || "",
        schedule: workoutPlan.schedule,
        equipment: workoutPlan.equipment,
        note: workoutPlan.note || "",
        additional_notes: workoutPlan.additional_notes || "",
        warmup: dayPlan.warmup,
        cooldown: dayPlan.cooldown,
        createdAt: new Date(),
      });

      const exercisesRef = workoutPlanRef.collection("exercises");
      for (const exercise of dayPlan.workout) {
        await exercisesRef.doc(exercise.id).set({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          note: exercise.note,
          image: exercise.image || "",
        });

        await exercisesRef.doc(exercise.id).collection("progress").add({
          setsCompleted: 0,
          repsCompleted: [],
          feedback: null,
          date: null,
        });
      }
    }
    await userRef.update({
      orientation: true,
    });
  } catch (error) {
    console.error("Error saving nested workout plan", error);
    throw error;
  }
};

