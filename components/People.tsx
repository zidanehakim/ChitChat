"use client";
import { AuthContext, user } from "@/contexts/AuthContext";

import React, { useContext, useEffect, useState } from "react";
import { Contact, MemoizedContact } from "./Contact";
import { ContactContext, ListContacts } from "@/contexts/ContactContext";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "next-themes";

export const People = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const { setIsProfile, setProfile } = useContext(AuthContext);
  const { contactsUser } = useContext(ContactContext);

  const [search, setSearch] = useState("");
  const [otherContacts, setOtherContacts] = useState([] as ListContacts[]);

  const onlineContactsUser = contactsUser.filter(
    (a) => a.contactUser.online_status === true && a.chatboxID !== ""
  );

  const searchHandler = async () => {
    const foundChats = contactsUser.filter((a) =>
      a.chats[a.chats.length - 1].chat
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    const newOtherContacts = contactsUser
      .filter((a) => {
        const isFound =
          foundChats.findIndex((b) => b.contactUser.id === a.contactUser.id) !==
          -1;

        return (
          a.contactUser.email.toLowerCase().includes(search.toLowerCase()) ||
          a.contactUser.username.toLowerCase().includes(search.toLowerCase()) ||
          isFound
        );
      })
      .map((a) => {
        const isFound =
          foundChats.findIndex((b) => b.contactUser.id === a.contactUser.id) !==
          -1;

        return { ...a, search: isFound };
      });

    setOtherContacts(newOtherContacts);
  };

  useEffect(() => {
    search.length > 0
      ? searchHandler()
      : setOtherContacts([] as ListContacts[]);
  }, [search]);

  useEffect(() => {
    setOtherContacts([] as ListContacts[]);
    setSearch("");
  }, [contactsUser]);

  const profileHandler = (a: user) => {
    setIsProfile(true);
    setProfile(a);
  };

  return search.length === 0 ? (
    <div className="h-full relative text-black dark:text-gray-200 flex flex-col gap-1 w-full">
      <div className="w-full flex px-5 items-center bg-white dark:bg-gray-950 rounded-b-lg shadow-lg py-3">
        <h1 className="text-xl font-bold me-3">Chat</h1>
        <div className="border border-gray-500 text-black dark:text-white dark:border-gray-800 text-xs font-normal py-2 rounded-full w-full px-5 flex">
          <input
            type="text"
            placeholder="Search contacts.."
            className="w-full outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            color={theme === "light" ? "#0F172A" : "white"}
            size="lg"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg h-full overflow-y-auto pt-5">
        <div className="w-full h-fit px-5">
          <h1 className="font-bold text-lg">Online now</h1>

          <div className="flex w-full h-full flex-row text-center my-6 gap-4">
            {onlineContactsUser.length > 0 ? (
              onlineContactsUser?.map((a, index) => (
                <div
                  key={index}
                  className="w-fit h-fit flex flex-col align-center justify-center"
                >
                  <div className="w-fit h-fit relative m-auto">
                    <Image
                      src={a.contactUser.image}
                      className="w-11 h-11 rounded-full border-2 dark:border-gray-300 box-border cursor-pointer hover:scale-110 hover:border-yellow-400 transition"
                      alt={`${a.contactUser.username} profile`}
                      width={150}
                      height={150}
                      onClick={() => profileHandler(a.contactUser)}
                    ></Image>

                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <h1 className="text-sm mt-2 font-semibold m-auto">
                    {a.contactUser.username.split(" ")[0]}
                  </h1>
                </div>
              ))
            ) : (
              <h1 className="text-sm font-semibold text-gray-400 m-auto my-6">
                None Online
              </h1>
            )}
          </div>
        </div>

        <div className="">
          <h1 className="font-bold text-lg mb-3 mx-5">Messages</h1>

          {contactsUser?.map((user, index) => {
            return (
              user.chatboxID !== "" && (
                <MemoizedContact
                  key={index}
                  indexes={index}
                  chatboxID={user.chatboxID}
                  contact={user.contactUser}
                  lastMessage={user.chats[user.chats.length - 1]}
                />
              )
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="h-full relative flex flex-col gap-1 w-full text-black dark:text-gray-300">
      <div className="w-full flex px-5 items-center bg-white dark:bg-gray-950 rounded-lg shadow-lg py-3">
        <h1 className="text-xl font-bold me-3">Chat</h1>
        <div className="border border-gray-500 text-black dark:text-white dark:border-gray-800 text-xs font-normal py-2 rounded-full w-full px-5 flex">
          <input
            type="text"
            placeholder="Search contacts.."
            className="w-full outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            color={theme === "light" ? "#0F172A" : "white"}
            size="lg"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg h-full overflow-y-auto pt-5">
        <div className="">
          <h1 className="font-bold text-lg mx-5">Search Messages</h1>
          {otherContacts.length > 0 && (
            <h1 className="font-bold text-xs mb-3 mx-5 text-gray-700">{`Found ${otherContacts.length}`}</h1>
          )}

          {otherContacts?.map((user, index) => {
            return (
              <MemoizedContact
                key={index}
                indexes={index}
                contact={user.contactUser}
                chatboxID={user.chatboxID}
                search={user.search}
                textSearch={search}
                lastMessage={user.chats[user.chats.length - 1]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MemoizedPeople = React.memo(People);
