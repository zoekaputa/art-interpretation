import { Client, handle_file } from "@gradio/client";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// "concurrently \"npm run server\" \"npm run android\""

var jsonParser = bodyParser.json();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

const port = 3001;

// app.use(express.static("build"));
/* app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
}); */

app.listen(port, () => {
  console.log(`Server is running on http://10.30.17.242:${port}`); // ipconfig getifaddr en0
});

const model = await Client.connect("haoheliu/audioldm2-text2audio-text2music");

// Create a route and a handler for GET /posts/:id
app.post("/post", jsonParser, async (req, res) => {
  // Get the id parameter from the request
  try {
    // const msg = await anthropic.messages.create(req.body);
    const result = await model.predict("/text2audio", [
      req.body.description,
      "low quality",
      10,
      3.5,
      45,
      3,
    ]);

    const videoUrl = result.data[0].video.url;
    console.log(videoUrl);

    res.status(200).json(videoUrl);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
