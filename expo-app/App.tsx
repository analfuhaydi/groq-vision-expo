import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function App() {
  // Request camera permission status and function to request permission
  const [permission, requestPermission] = useCameraPermissions();

  // Reference to the CameraView for taking picture
  const cameraRef = useRef<CameraView>(null);

  const [imageUri, setImageUri] = useState<string>("");

  const [groqDescription, setGroqDescription] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  /**
   - Function to capture a photo using the CameraView ref
   - Handles errors and sets loading state appropriately
   */
  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
      setGroqDescription("");
    } catch (error) {
      Alert.alert("Error", "Failed to take picture, Please try again.");
      console.error("takePicture error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   - Upload the captured photo to the backend server
   - using multipart/form-data.
   - Handles the response to set the description result.
   */
  const uploadImage = useCallback(async () => {
    if (!imageUri) return;
    setLoading(true);
    setGroqDescription("");

    try {
      // Create form data to upload the image file
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      // POST request to backend endpoint for image upload
      const endpoint = `http://<your-ip>:3000/upload`; // Replace with your backend URL
      // If using a local server, replace <your-ip> with your machine's IPv4 address
      // you can find your IPv4 Address by running `ipconfig` on macOS/Linux or `ipconfig` on Windows.
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      setGroqDescription(
        res.ok
          ? result.description
          : `Error: ${result.error || "Unknown error"}`
      );
    } catch (err) {
      Alert.alert("Upload Error", "Something went wrong uploading the image");
      console.error("Upload Error:", err);
      setGroqDescription("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [imageUri]);

  // If camera permission is denied, show fallback UI with instructions
  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Camera access is required to take photos
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant camera access"
        >
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // UI when an image has been captured
  if (imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          accessibilityLabel="Captured photo preview"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, loading && styles.disabledButton]}
            onPress={() => {
              setImageUri("");
              setGroqDescription("");
            }}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Retake photo"
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={uploadImage}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Describe photo"
          >
            <Text style={styles.buttonText}>Describe</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#007aff"
            accessibilityLabel="Loading indicator"
          />
        )}

        {groqDescription ? (
          <ScrollView style={styles.resultContainer}>
            <Text
              style={styles.descriptionText}
              accessibilityLabel="Description text"
            >
              {groqDescription}
            </Text>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    );
  }

  // Default camera screen UI
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        accessibilityLabel="Camera view"
      />
      <View style={styles.cameraControls}>
        <Pressable
          style={styles.captureButton}
          onPress={takePicture}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Capture photo"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    borderWidth: 4,
    borderColor: "#e0e0e0",
  },
  preview: {
    width: "90%",
    height: "50%",
    resizeMode: "contain",
    borderRadius: 16,
    backgroundColor: "#000",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    gap: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#888",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
    width: "100%",
  },
  descriptionText: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    color: "#333",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 24,
    color: "#444",
  },
});
