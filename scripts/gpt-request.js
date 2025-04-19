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
                        that if I query https://freesound.org/'s database for them, I should get results. For each description, based on its relevance in the photo, provide a 
                        corresponding volume, whether it should loop, an interval if there is a loop (milliseconds between repeats), whether should fade in, whether it should fade out, and 
                        whether it should have a delayed start (milliseconds before starting). Expo-av reads volume from a scale between 0 (silence) and 1 (maximum volume). Complete the following fields for 
                        each description. 
                        You return a json of in the form
                        {
                          elements: [<"element": element1, "volume": volume1, "loop": boolean, "interval": interval1, "fadeIn": boolean, "fadeOut": boolean, "startDelay": boolean>, <"element": element2, "volume": volume2, "loop": boolean, "interval": interval2, "fadeIn": boolean, "fadeOut": boolean, "startDelay": boolean>, ...]
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
    const responseText = result.choices[0].message.content;
    console.log("responseText", responseText);

    // Try to extract the JSON from inside a ```json ... ``` block
    const match = responseText.match(/```json([\s\S]*?)```/);
    const jsonString = match ? match[1].trim() : null;

    if (!jsonString) {
      throw new Error("Failed to extract JSON block from response");
    }

    const parsed = JSON.parse(jsonString);
    console.log("parsed elements", parsed.elements);

    return parsed.elements;
  } catch (error) {
    console.error("Error in requestSoundDescriptions:", error);
    return [];
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
              text: `You are an expert in updating the artwork's soundscape based on the user's request. Given a picture of a painting, a user message, a description of the painting, and existing sounds from a soundscape and their settings in the following format, 
                        {
                          elements: [<"element": element1, "volume": volume1, "loop": boolean, "interval": interval1, "fadeIn": boolean, "fadeOut": boolean, "startDelay": boolean>, <"element": element2, "volume": volume2, "loop": boolean, "interval": interval2, "fadeIn": boolean, "fadeOut": boolean, "startDelay": boolean>, ...]
                        }
                        where each element is a 2-3 description of a sound effect. 
                        You directly address the concerns layed out in their message by deciding which sounds need to be updated, and updating one or more settings. You can also add new sounds or remove existing sounds.
                        Only modify the sounds the user requests you to change. Return the new json in the same format as above. 

                        If the user's request does not warrent a change, tell them in the message you didn't change anything and keep the json the same.
                          
                        current json: ${descriptions}`,
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
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in GPT response");
    }
    const jsonResponse = JSON.parse(jsonMatch[0]);
    console.log("updated response", jsonResponse);

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
              text: "You are an expert at coming up with short alt text descirptions for paintings. You focus on the visuals in the scene and the aritistic style of the work. If you recognize the piece of artwork, also provide the artwork's title, the artist, and the time period its from. Respond as if you were presenting this art to someone who is touring a museum.",
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
    console.log("responseText", responseText);
    return responseText;
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
