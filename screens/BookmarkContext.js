import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BookmarkContext = createContext();

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

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
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, loadBookmarks, removeBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
};
