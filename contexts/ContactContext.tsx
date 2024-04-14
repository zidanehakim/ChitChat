"use client";
import React, { createContext, useState } from "react";
import { user } from "./AuthContext";

type ContactContextProps = {
  children: React.ReactNode;
};

export type ListContacts = {
  contactUser: user;
  chats: chats[];
  chatboxID: string;
} & {
  [key: string]: any;
};

type ContactContextType = {
  contactsUser: ListContacts[];
  setContactsUser: React.Dispatch<React.SetStateAction<ListContacts[]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

export type chats = {
  id?: string;
  chatbox_id: string;
  sender_id: string;
  recipient_id: string;
  chat: string;
  created_at?: string;
  read_status?: boolean;
  attachment?: string;
  size?: number;
  blob?: string;
} & {
  [key: string]: any;
};

export const ContactContext = createContext({} as ContactContextType);

export const ContactContextProvider = ({ children }: ContactContextProps) => {
  const [contactsUser, setContactsUser] = useState([] as ListContacts[]);
  const [index, setIndex] = useState(-1);

  return (
    <ContactContext.Provider
      value={{
        contactsUser,
        setContactsUser,
        index,
        setIndex,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};
