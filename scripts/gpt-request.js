import OpenAI from "openai";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import fs from "fs";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_GPT_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function uploadUrlToDevice(url, name) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "utf-8");
  const fileUri = await saveBufferToFile(buffer, `${name}.wav`); // used to be mp4
  return fileUri;
}

export async function getTranscription(audioFile) {
  console.log("audioFile", audioFile);
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

    /*const response = await FileSystem.uploadAsync(
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
    );*/

    const response = await fetch(audioFile);
    const audioBlob = await response.blob();

    const audioFileFile = new File([audioBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileFile,
      model: "whisper-1",
    });

    console.log(transcription.text);
    // console.log(JSON.parse(response.body).text);

    return transcription.text;
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
    const defaultMessage =
      "I can't answer your question, but here is the current soundscape.";
    const result = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: `You are an expert in answering questions about artowrks. Given a picture of a painting and a user message, respond in the following format:
                        '{
                          "message": <message to the user>,
                          "elements": [<"element": element1, "volume": volume1, "loop": boolean, "interval": interval1, "fadeIn": boolean, "fadeOut": boolean, "startDelay": boolean>, <"element": element2, "volume": volume2, "loop": boolean, "interval": interval2, "fadeIn": boolean, "fadeOut": boolean, "startDelay": boolean>, ...]
                        }'
                        The elements attribute describes a set of sounds and their settings from a soundscape represeting the artwork, where each element corresponds (by index) to a sound description.

                        You directly address the questions about the artwork and soundscape posed in the user's message through the message attribute. In order to answer questions about the artwork, look at the included image of the artowrk. 
                        If their question warrents sounds needing to be updated, update one or more settings in the elements attribute. You can also add new sounds or remove existing sounds.

                        If the user's request does not warrent a change, keep the json the same.

                        When you do make a change, make the change you describe to the elements attribute in your response.
                        Replace removed elements with null in the included list of sounds, and add any new sounds to the end of the list in the same format as the included sounds.

                        if you cannot answer the user's question, still respond in the above format, but tell them in the message attribute that you can't answer their question and keep the elements attribute the same as the included elements.
                          
                        current elements: ${JSON.stringify(descriptions)}`,
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
      // throw new Error("No JSON found in GPT response");
      return {
        message: defaultMessage,
        elements: descriptions,
      };
    }
    console.log(jsonMatch);

    let jsonResponse = null;
    if (jsonMatch[0].charAt(0) !== "{") {
      jsonResponse = JSON.parse(`{${jsonMatch[0]}}`);
    } else {
      jsonResponse = JSON.parse(jsonMatch[0]);
    }
    console.log("updated response", jsonResponse);

    if (!jsonResponse.message) {
      return {
        message: defaultMessage,
        elements: descriptions,
      };
    }

    if (
      !jsonResponse.elements ||
      !Array.isArray(jsonResponse.elements) ||
      jsonResponse.elements.length === 0
    ) {
      jsonResponse.elements = descriptions;
    }

    return jsonResponse;
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

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result.split(",")[1]); // removes `data:*/*;base64,` prefix
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

async function saveBufferToFile(buffer, fileName) {
  try {
    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: "audio/wav" }); // or "audio/mpeg" or correct MIME type

    // Create a temporary download link
    /*const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("url", url);
    const base64Index = url.indexOf(":") + 1;
    const base64String = url.substring(base64Index);

    console.log("File download triggered:", fileName);
    return base64String; // or return nothing*/
    return await blobToBase64(blob);
  } catch (error) {
    console.error("Error saving file on web:", error);
  }
}
