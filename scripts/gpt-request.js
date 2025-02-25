import OpenAI from "openai";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_GPT_API_KEY,
});

export async function getTranscription(audioFile) {
  try {
    const readBuffer = await FileSystem.readAsStringAsync(audioFile, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const transcription = await openai.audio.transcriptions.create({
      file: {
        url: readBuffer,
      },
      model: "whisper-1",
    });

    console.log(transcription);

    return transcription;
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
                        using an AI description to sound effect tool. You give them a list of 3 VERY SIMPLE sound effects descriptions that they would need to make a representative
                        the foreground, middle-ground, and background soundscape. You return a json of in the form
                        {
                          elements: [<foreground>,<middle-ground>,<background>]
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
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.indexOf("}");
    const cutString = responseText.substring(startIndex, endIndex + 1);
    return JSON.parse(cutString).elements;
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
