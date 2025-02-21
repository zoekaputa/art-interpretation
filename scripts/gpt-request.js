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
              text: "You are a cool image analyst.  Your goal is to describe what is in this image.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What is in the image?",
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
    console.log(result.choices[0].message.content);
  } catch (error) {
    console.log(error);
  }
}
