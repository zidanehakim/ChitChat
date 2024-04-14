"use client";
import React, { createContext, useState } from "react";
import { chats } from "./ContactContext";

type AuthContextProps = {
  children: React.ReactNode;
};

type AuthContextType = {
  user: user;
  setUser: React.Dispatch<React.SetStateAction<user>>;

  profile: user;
  setProfile: React.Dispatch<React.SetStateAction<user>>;

  isProfile: boolean;
  setIsProfile: React.Dispatch<React.SetStateAction<boolean>>;

  image: chats[];
  setImage: React.Dispatch<React.SetStateAction<chats[]>>;

  isImage: boolean;
  setIsImage: React.Dispatch<React.SetStateAction<boolean>>;

  contextIndex: number;
  setContextIndex: React.Dispatch<React.SetStateAction<number>>;

  imageIndex: number;
  setImageIndex: React.Dispatch<React.SetStateAction<number>>;
};

export type user = {
  username: string;
  status: string;
  online_status: boolean;
  email: string;
  image: string;
  wallpaper: string;
  id?: string;
  typing?: boolean;
} & {
  [key: string]: any;
};

export const AuthContext = createContext({} as AuthContextType);

export const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [user, setUser] = useState({} as user);
  const [session, setSession] = useState("");
  const [profile, setProfile] = useState({} as user);
  const [isProfile, setIsProfile] = useState(false);
  const [image, setImage] = useState([] as chats[]);
  const [isImage, setIsImage] = useState(false);
  const [contextIndex, setContextIndex] = useState(-1);
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        isProfile,
        setIsProfile,
        image,
        setImage,
        isImage,
        setIsImage,
        imageIndex,
        setImageIndex,
        contextIndex,
        setContextIndex,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
