export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const micPermission = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });

    if (micPermission.state === "granted") {
      return true;
    } else if (micPermission.state === "prompt") {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } else {
      console.warn("Microphone permission denied previously.");
      return false;
    }
  } catch (error) {
    console.error("Error checking microphone permission:", error);
    return false;
  }
}
