import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_GPT_API_KEY,
});

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
