import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { DB } from "@/firebaseConfig";
import { router } from "expo-router";

export const resetUserOrientation = async (userId: string) => {
  try {
    const userRef = doc(DB, "users", userId.uid);

    const deleteSubcollection = async (subPath: string) => {
      const subColRef = collection(DB, `users/${userId}/${subPath}`);
      const snapshot = await getDocs(subColRef);

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(docSnap.ref)
      );

      await Promise.all(deletePromises);
    };

    await deleteSubcollection("workoutPlans");
    await deleteSubcollection("OpenAIPlan");
    await deleteSubcollection("exercises");
    await deleteSubcollection("progress");

    await updateDoc(userRef, { orientation: false });

    router.push("/orientation");
  } catch (error) {
    console.error("Error resetting orientation:", error);
    throw error;
  }
};
