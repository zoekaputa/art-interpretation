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
