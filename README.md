# How to Use Groq Image Vision Model API in Expo React Native

In this project, you'll learn how to use the Groq Vision API to describe images taken with the camera in an Expo React Native app.

We also use a simple Express.js as a backend to handle the image before sending it to Groq.

https://github.com/user-attachments/assets/b68f0c41-1095-454a-bdca-a6d7440c05c0

## How It Works
Here's the basic flow we follow in this project:
1. In the Expo app, we use the camera to take a photo.
2. We send the image to the backend using `multipart/form-data`.
3. The backend uses `multer` to parse the image file.
4. We convert the image to `base64` on the backend.
5. Then we send it to Groq’s Vision API, asking it to describe the image.
6. The response is returned to the app and shown to the user.

