import OpenAI from "openai";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_GPT_API_KEY,
});

export async function uploadUrlToDevice(url, name) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "utf-8");
  const fileUri = await saveBufferToFile(buffer, `${name}.wav`); // used to be mp4
  return fileUri;
}

export async function getTranscription(audioFile) {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: audioFile,
      name: "media",
      type: "audio/m4a",
    });
    formData.append("model", "whisper-1");

    console.log(audioFile);
    console.log("fetching");
    /*const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_GPT_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      }
    );

    const transcription = await response.json();*/

    const response = await FileSystem.uploadAsync(
      "https://api.openai.com/v1/audio/transcriptions",
      audioFile,
      {
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_GPT_API_KEY}`,
        },

        // Options specifying how to upload the file.
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        mimeType: "audio/mpeg",
        parameters: {
          model: "whisper-1",
        },
      }
    );

    console.log(JSON.parse(response.body).text);

    return JSON.parse(response.body).text;
  } catch (error) {
    console.log(error);
  }
}

export async function createAudioDescription(text) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const fileUri = await saveBufferToFile(buffer, "test.mp3");

    return fileUri;
  } catch (error) {
    console.log(error);
  }
}

export async function requestSoundDescriptions(base64Img) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: `Given a picture of a painting you are an expert in creating artwork descriptions. The user wants to create a soundscape representing the painting
                        using a description to sound effect database (https://freesound.org/). You give them a list of around 5 INCREDIBLY SIMPLE sound effects descriptions
                        (like 2-3 words) that they would need to make a representative soundscape describing the scene of the artwork. The descriptions should be so simple
                        that if I query https://freesound.org/'s database for them, I should get results. You return a json of in the form
                        {
                          elements: [<element1>,<element2>,<element3>,...,<elementn>]
                        }`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Given me a json list for this image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Img}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });
    console.log("result", result);
    const responseText = result.choices[0].message.content;
    console.log("responseText", responseText);
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.indexOf("}");
    const cutString = responseText.substring(startIndex, endIndex + 1);
    return JSON.parse(cutString).elements;
  } catch (error) {
    console.log(error);
  }
}

export async function requestSoundDescriptionUpdate(
  descriptions,
  userMessage,
  base64Img
) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: `Given a picture of a painting, existing descriptions of this painting's forground, middle-ground, and background, and a user message you are an expert in
                        updating the artwork's descriptions based on the user's request. You directly
                        address the concerns layed out in their message by updating one or more description and giving then a short explanation. In your list of descriptions,
                        each shopuld be a 3 VERY SIMPLE sound effect description. You return a json of in the form
                        {
                          message: <message explaining what you changed. Do not refer to the array of descriptions directly>,
                          descriptions: [<foreground>,<middle-ground>,<background>]
                        }

                        If the user's request does not warrent a change, tell them in the message you didn't change anything and keep the descriptions the same.
                          
                        current descriptions: ${descriptions}`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `User's message: ${userMessage}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Img}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });
    const responseText = result.choices[0].message.content;
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.indexOf("}");
    const cutString = responseText.substring(startIndex, endIndex + 1);
    const jsonResponse = JSON.parse(cutString);

    return { ...jsonResponse, oldDescriptions: descriptions };
  } catch (error) {
    console.log(error);
  }
}

export async function containsArtwork(base64Img) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are an expert at determining if there is an artwork in images. Given the included image, respond 'true' if the image includes an artwork and 'false' if not. You do not captalize the response",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Img}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });
    const responseText = result.choices[0].message.content;
    return responseText;
  } catch (error) {
    console.log(error);
  }
}

export async function getTitle(base64Img) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Come up with a five or less word descriptive name for the painting in this image. Do not surround the title in quotes",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Img}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });
    const responseText = result.choices[0].message.content;
    return responseText;
  } catch (error) {
    console.log(error);
  }
}

export async function getAltText(base64Img) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are an expert at coming up with short alt text descirptions for paintings. You focus on the visuals in the scene and the aritistic style of the work.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Give me a short alt text description of the painting in this image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Img}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });
    const responseText = result.choices[0].message.content;
    return responseText;
  } catch (error) {
    console.log(error);
  }
}

export async function requestAltTextUpdate(
  altText,
  descriptions,
  userMessage,
  base64Img
) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: `Given a picture of a painting, an existing alt text description, descriptions of this painting's forground, middle-ground, and background, and a user message you are an expert in
                        updating the artwork's description based on the user's request. You directly
                        address the concerns layed out in their message by updating the text description. Here is the text description: ${altText}. Tell them that you updated the alt text description.
                        
                        Based on your updated alt text description, determine whether the descriptions of the painting's forground, middle-ground, and background need to be updated. You directly
                        update one or more of descriptions and give them a short explanation.

                        In your updated list of descriptions,
                        each should be a 3 VERY SIMPLE sound effect description. You return a json of in the form
                        {
                          message: <message explaining that you changed. Do not refer to the array of descriptions directly>,
                          altText: <updated alt text description>,
                          descriptions: [<foreground>,<middle-ground>,<background>]
                        }
                          
                        current descriptions: ${descriptions}`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `User's message: ${userMessage}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Img}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });
    const responseText = result.choices[0].message.content;
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.indexOf("}");
    const cutString = responseText.substring(startIndex, endIndex + 1);
    const jsonResponse = JSON.parse(cutString);

    return { ...jsonResponse, oldDescriptions: descriptions };
  } catch (error) {
    console.log(error);
  }
}

async function saveBufferToFile(buffer, fileName) {
  try {
    const base64String = Buffer.from(buffer).toString("base64");
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("File saved at:", fileUri);
    return fileUri;
  } catch (error) {
    console.error(error);
  }
}
