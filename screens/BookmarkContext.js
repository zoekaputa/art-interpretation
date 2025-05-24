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
        "This is 'The Starry Night' by Vincent van Gogh, created in 1889. The painting features a swirling night sky filled with glowing stars and a luminous crescent moon, over a quiet village in the background. In the foreground, a large, dark cypress tree rises dramatically, contrasting with the lighter tones of the sky and the quaint white church steeple. Van Gogh's expressive brushstrokes and vibrant colors create a sense of movement and emotional depth. The scene captures a dreamlike atmosphere, inviting viewers to immerse themselves in its rhythmic beauty.",
      shortDescription:
        "An oil-on-canvas impressionist painting depicting a village just before sunrise.",
      descriptions: [
        {
          element: "whispering wind",
          volume: 0.5,
          loop: true,
          interval: 0,
          fadeIn: true,
          fadeOut: false,
          startDelay: 0,
        },
        {
          element: "distant stars",
          volume: 0.3,
          loop: true,
          interval: 1000,
          fadeIn: true,
          fadeOut: true,
          startDelay: 0,
        },
        {
          element: "soft chimes",
          volume: 0.4,
          loop: false,
          interval: 0,
          fadeIn: true,
          fadeOut: true,
          startDelay: 2000,
        },
        {
          element: "gentle wave",
          volume: 0.6,
          loop: true,
          interval: 2000,
          fadeIn: false,
          fadeOut: true,
          startDelay: 0,
        },
        {
          element: "night owl hoot",
          volume: 0.2,
          loop: false,
          interval: 0,
          fadeIn: true,
          fadeOut: true,
          startDelay: 3000,
        },
      ],
      audios: {
        "whispering wind":
          "https://cdn.freesound.org/previews/728/728737_801011-hq.mp3",
        "distant stars":
          "https://cdn.freesound.org/previews/511/511702_973833-hq.mp3",
        "soft chimes":
          "https://cdn.freesound.org/previews/119/119543_1492767-hq.mp3",
        "gentle wave":
          "https://cdn.freesound.org/previews/566/566459_9630213-hq.mp3",
        "night owl hoot":
          "https://cdn.freesound.org/previews/745/745208_8711646-hq.mp3",
      },
      name: "The Starry Night",
      artist: "Vincent van Gogh",
    },
    {
      id: 1,
      image: require("../assets/paintings/water-lily-pond.jpg"),
      descriptionText:
        "This painting features a serene garden scene with a graceful white bridge arching over a tranquil pond filled with water lilies. The lush greenery surrounding the water is depicted in vibrant, impressionistic strokes, capturing the essence of light and reflection. The artist, Claude Monet, is renowned for his mastery of color and atmospheric effects, characteristic of the Impressionist movement in the late 19th century.",
      shortDescription:
        "An impressionist painting depicting a bridge over a pond covered water lilies.",
      descriptions: [
        {
          element: "water flowing",
          fadeIn: true,
          fadeOut: false,
          interval: 10000,
          loop: true,
          startDelay: 0,
          volume: 0.1,
        },
        {
          element: "birds chirping",
          fadeIn: true,
          fadeOut: true,
          interval: 5000,
          loop: true,
          startDelay: 2000,
          volume: 0.7,
        },
        {
          element: "leaves rustling",
          fadeIn: false,
          fadeOut: true,
          interval: 8000,
          loop: true,
          startDelay: 3000,
          volume: 0.2,
        },
        {
          element: "frog croaking",
          fadeIn: false,
          fadeOut: false,
          interval: 6000,
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
          "https://cdn.freesound.org/previews/536/536759_1415754-hq.mp3",
        "birds chirping":
          "https://cdn.freesound.org/previews/733/733732_8378872-hq.mp3",
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
      shortDescription:
        "A realism painting two siblings resting in bed in the morning.",
      descriptions: [
        {
          element: "baby giggling",
          fadeIn: true,
          fadeOut: false,
          interval: 30000,
          loop: true,
          startDelay: 0,
          volume: 0.4,
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
          volume: 0.6,
        },
        {
          element: "distant lullaby",
          fadeIn: true,
          fadeOut: true,
          interval: 120000,
          loop: true,
          startDelay: 0,
          volume: 0.3,
        },
        {
          element: "teacup clinking",
          fadeIn: false,
          fadeOut: false,
          interval: 0,
          loop: false,
          startDelay: 5000,
          volume: 0.4,
        },
      ],
      audios: {
        "baby giggling":
          "https://cdn.freesound.org/previews/388/388407_7293523-hq.mp3",
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
        "This painting by Jacob Lawrence features a vibrant winter scene with a backdrop of snow-covered hills and a blue sky. In the foreground, a series of colorful buildings, predominately in dark tones with geometric patterns, frame a winding path. Figures of people, dressed in varied colors, are seen walking, sledding, and engaging in winter activities on the snowy hillside. The artwork is characterized by bold, flat shapes and an expressive use of color, creating a lively atmosphere of community and movement.",
      shortDescription:
        "A dynamic cubism painting depicting a snow-cover hill in a city.",
      descriptions: [
        {
          element: "snow crunching",
          fadeIn: true,
          fadeOut: false,
          interval: 2000,
          loop: true,
          startDelay: 0,
          volume: 0.4,
        },
        {
          element: "children sledding",
          fadeIn: true,
          fadeOut: true,
          interval: 3000,
          loop: true,
          startDelay: 0,
          volume: 0.3,
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
          volume: 0.5,
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
        "children sledding":
          "https://cdn.freesound.org/previews/554/554358_2061858-hq.mp3",
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
