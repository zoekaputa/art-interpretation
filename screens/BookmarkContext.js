import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BookmarkContext = createContext();

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([
    {
      id: 0,
      image: require("../assets/paintings/starry-night.jpg"),
      descriptionText:
        "This is 'The Starry Night' by Vincent van Gogh, created in 1889. The painting features a swirling night sky filled with glowing stars and a luminous crescent moon, over a quiet village. In the foreground, a large, dark cypress tree rises dramatically, contrasting with the lighter tones of the sky and the quaint white church steeple. Van Gogh's expressive brushstrokes and vibrant colors create a sense of movement and emotional depth. The scene captures a dreamlike atmosphere, inviting viewers to immerse themselves in its rhythmic beauty.",
      descriptions: [
        {
          element: "gentle wind",
          fadeIn: true,
          fadeOut: false,
          interval: 5000,
          loop: true,
          startDelay: 0,
          volume: 0.3,
        },
        {
          element: "distant church bells",
          fadeIn: false,
          fadeOut: true,
          interval: 12000,
          loop: true,
          startDelay: 2000,
          volume: 0.1,
        },
        {
          element: "soft nightingale calls",
          fadeIn: true,
          fadeOut: false,
          interval: 8000,
          loop: true,
          startDelay: 1000,
          volume: 0.4,
        },
        {
          element: "rustling leaves",
          fadeIn: true,
          fadeOut: true,
          interval: 6000,
          loop: true,
          startDelay: 0,
          volume: 0.2,
        },
        {
          element: "crickets chirping",
          fadeIn: false,
          fadeOut: false,
          interval: 4000,
          loop: true,
          startDelay: 0,
          volume: 0.5,
        },
      ],
      audios: {
        "gentle wind":
          "https://cdn.freesound.org/previews/181/181250_499617-hq.mp3",
        "soft nightingale calls":
          "https://cdn.freesound.org/previews/54/54746_8043-hq.mp3",
        "rustling leaves":
          "https://cdn.freesound.org/previews/489/489929_10570192-hq.mp3",
        "distant church bells":
          "https://cdn.freesound.org/previews/412/412918_5121236-hq.mp3",
        "crickets chirping":
          "https://cdn.freesound.org/previews/755/755882_2061858-hq.mp3",
      },
      name: "The Starry Night",
      artist: "Vincent van Gogh",
    },
    {
      id: 1,
      image: require("../assets/paintings/water-lily-pond.jpg"),
      descriptionText:
        "This painting features a serene garden scene with a graceful white bridge arching over a tranquil pond filled with water lilies. The lush greenery surrounding the water is depicted in vibrant, impressionistic strokes, capturing the essence of light and reflection. The artist, Claude Monet, is renowned for his mastery of color and atmospheric effects, characteristic of the Impressionist movement in the late 19th century.",
      descriptions: [
        {
          element: "water flowing",
          fadeIn: true,
          fadeOut: false,
          interval: 10000,
          loop: true,
          startDelay: 0,
          volume: 0.5,
        },
        {
          element: "birds chirping",
          fadeIn: true,
          fadeOut: true,
          interval: 5000,
          loop: true,
          startDelay: 2000,
          volume: 0.4,
        },
        {
          element: "leaves rustling",
          fadeIn: false,
          fadeOut: true,
          interval: 8000,
          loop: true,
          startDelay: 3000,
          volume: 0.3,
        },
        {
          element: "frog croaking",
          fadeIn: false,
          fadeOut: false,
          interval: 7000,
          loop: true,
          startDelay: 4000,
          volume: 0.2,
        },
        {
          element: "distant wind",
          fadeIn: true,
          fadeOut: true,
          interval: 12000,
          loop: true,
          startDelay: 1000,
          volume: 0.1,
        },
      ],
      audios: {
        "water flowing":
          "https://cdn.freesound.org/previews/78/78411_1218676-hq.mp3",
        "frog croaking":
          "https://cdn.freesound.org/previews/67/67261_634166-hq.mp3",
        "birds chirping":
          "https://cdn.freesound.org/previews/327/327444_4028726-hq.mp3",
        "leaves rustling":
          "https://cdn.freesound.org/previews/667/667057_1661766-hq.mp3",
        "distant wind":
          "https://cdn.freesound.org/previews/669/669197_1661766-hq.mp3",
      },
      name: "The Water Lily Pond",
      artist: "Claude Monet",
    },
    {
      id: 2,
      image: require("../assets/paintings/breakfast-in-bed.jpg"),
      descriptionText:
        "This artwork is titled “Breakfast in Bed“ by Mary Cassatt, an American painter active in the late 19th and early 20th centuries. The painting features two small children nestled together in bed, conveying a sense of warmth and intimacy. The younger child, with curly hair, sits beside an older sibling who appears to be sleeping, their faces showcasing soft, serene expressions. The scene is set against a backdrop of crisp white bed linens and a muted green bedside table that holds a tea cup. The brushwork is loose and fluid, characteristic of early 20th-century Impressionism, highlighting the tender connection between the siblings.",
      descriptions: [
        {
          element: "soft breathing",
          fadeIn: true,
          fadeOut: false,
          interval: 30000,
          loop: true,
          startDelay: 0,
          volume: 0.5,
        },
        {
          element: "gentle rustling",
          fadeIn: true,
          fadeOut: false,
          interval: 15000,
          loop: true,
          startDelay: 0,
          volume: 0.3,
        },
        {
          element: "light rain",
          fadeIn: false,
          fadeOut: true,
          interval: 60000,
          loop: true,
          startDelay: 0,
          volume: 0.4,
        },
        {
          element: "distant lullaby",
          fadeIn: true,
          fadeOut: true,
          interval: 120000,
          loop: true,
          startDelay: 0,
          volume: 0.6,
        },
        {
          element: "teacup clinking",
          fadeIn: false,
          fadeOut: false,
          interval: 0,
          loop: false,
          startDelay: 5000,
          volume: 0.2,
        },
      ],
      audios: {
        "soft breathing":
          "https://cdn.freesound.org/previews/795/795721_16936704-hq.mp3",
        "teacup clinking":
          "https://cdn.freesound.org/previews/665/665189_14490715-hq.mp3",
        "light rain":
          "https://cdn.freesound.org/previews/501/501242_8644110-hq.mp3",
        "distant lullaby":
          "https://cdn.freesound.org/previews/706/706663_8432823-hq.mp3",
        "gentle rustling":
          "https://cdn.freesound.org/previews/497/497134_10552075-hq.mp3",
      },
      name: "Breakfast in Bed",
      artist: "Mary Cassatt",
    },
    {
      id: 3,
      image: require("../assets/paintings/city-college.jpeg"),
      descriptionText:
        "This painting by Jacob Lawrence features a vibrant winter scene with a backdrop of snow-covered hills and a blue sky. In the foreground, a series of colorful buildings, predominately in dark tones with geometric patterns, frame a winding path. Figures of people, dressed in varied colors, are seen walking, skiing, and engaging in winter activities on the snowy hillside. The artwork is characterized by bold, flat shapes and an expressive use of color, creating a lively atmosphere of community and movement.",
      descriptions: [
        {
          element: "snow crunching",
          fadeIn: true,
          fadeOut: false,
          interval: 2000,
          loop: true,
          startDelay: 0,
          volume: 1,
        },
        {
          element: "laughter",
          fadeIn: true,
          fadeOut: true,
          interval: 3000,
          loop: true,
          startDelay: 0,
          volume: 0.1,
        },
        {
          element: "wind blowing",
          fadeIn: true,
          fadeOut: true,
          interval: 5000,
          loop: true,
          startDelay: 0,
          volume: 1,
        },
        {
          element: "footsteps",
          fadeIn: true,
          fadeOut: true,
          interval: 2500,
          loop: true,
          startDelay: 0,
          volume: 0.9,
        },
        {
          element: "distant chatter",
          fadeIn: true,
          fadeOut: true,
          interval: 4000,
          loop: true,
          startDelay: 0,
          volume: 0.9,
        },
      ],
      audios: {
        laughter: "https://cdn.freesound.org/previews/171/171168_321967-hq.mp3",
        "distant chatter":
          "https://cdn.freesound.org/previews/542/542148_10965984-hq.mp3",
        footsteps:
          "https://cdn.freesound.org/previews/505/505831_4024739-hq.mp3",
        "snow crunching":
          "https://cdn.freesound.org/previews/766/766454_15744955-hq.mp3",
        "wind blowing":
          "https://cdn.freesound.org/previews/361/361053_5914866-hq.mp3",
      },
      name: "City College is like a Beacon over Harlem",
      artist: "Jacob Lawrence",
    },
  ]);

  // Load saved bookmarks from AsyncStorage
  const loadBookmarks = async () => {
    try {
      const savedBookmarks = await AsyncStorage.getItem("bookmarks");
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  };

  const saveBookmarks = async (newBookmarks) => {
    setBookmarks(newBookmarks);
    await AsyncStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  };

  const addBookmark = async (newBookmark) => {
    const bookmarkWithId = { ...newBookmark, id: Date.now().toString() };
    const updatedBookmarks = [...bookmarks, bookmarkWithId];
    await saveBookmarks(updatedBookmarks);
  };

  const removeBookmark = async (id) => {
    console.log("Removing bookmark with id:", id);
    if (!id) return;

    const updatedBookmarks = bookmarks.filter((item) => item.id !== id);
    setBookmarks(updatedBookmarks);
    await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
};
