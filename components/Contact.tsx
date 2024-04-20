"use client";
import { AuthContext, user } from "@/contexts/AuthContext";
import { ContactContext, ListContacts, chats } from "@/contexts/ContactContext";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckDouble,
  faEye,
  faFile,
  faImage,
  faMusic,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import supabase from "@/utils/supabase/server";

type ContactProps = {
  contact: user;
  lastMessage?: chats;
  search?: boolean;
  textSearch?: string;
  chatboxID?: string;
  indexes: number;
};

export const Contact = ({
  contact,
  search,
  textSearch,
  chatboxID,
  lastMessage,
  indexes,
}: ContactProps) => {
  const { user, setIsProfile, setProfile } = useContext(AuthContext);

  const { setContactsUser, contactsUser, setIndex, index } =
    useContext(ContactContext);

  const [unread, setUnread] = useState(
    contactsUser[indexes]?.chats.filter((a) => a.read_status === false).length
  );

  const clickHandler = async () => {
    const foundIndex =
      contactsUser.length > 0
        ? contactsUser.findIndex((obj) => obj.contactUser.id === contact.id)
        : -1;

    if (foundIndex === -1) {
      const newContactCandidate: ListContacts = {
        chatboxID: "",
        chats: [],
        contactUser: contact,
      };
      setContactsUser((prev) => [...prev, newContactCandidate]);
      setIndex(contactsUser.length);
    } else {
      foundIndex !== index && setIndex(foundIndex);
    }
  };

  useEffect(() => {
    setUnread(
      contactsUser[indexes]?.chats.filter(
        (a) => a.read_status === false && a.sender_id === contact.id
      ).length
    );
  }, [index, contactsUser, unread]);

  const profileHandler = (a: user) => {
    setIsProfile(true);
    setProfile(a);
  };

  const date = lastMessage && new Date(lastMessage.created_at!);

  const video = ["mp4", "wav"];
  const image = ["jpeg", "jpg", "png"];
  const audio = ["mp3", "ogg"];

  useEffect(() => {
    const subscription = supabase
      .channel(chatboxID!)
      .on("broadcast", { event: "online" }, (payload) => {
        const newContactsUser: ListContacts[] = JSON.parse(
          JSON.stringify(contactsUser)
        );

        const foundIndex = newContactsUser.findIndex(
          (a) => a.contactUser.id === payload.payload.id
        );

        if (foundIndex !== -1) {
          newContactsUser[foundIndex].contactUser.online_status =
            payload.payload.online;

          setContactsUser(newContactsUser);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [index, contactsUser]);

  const sendBroadcastOnline = (status: boolean) => {
    // Send a message once the client is subscribed

    supabase.channel(chatboxID!).send({
      type: "broadcast",
      event: "online",
      payload: { id: user.id, online: status },
    });
  };

  useEffect(() => {
    sendBroadcastOnline(true);
  }, []);

  useEffect(() => {
    window.addEventListener("unload", (e) => {
      sendBroadcastOnline(false);
    });

    return () =>
      window.removeEventListener("unload", (e) => {
        sendBroadcastOnline(false);
      });
  }, []);

  return (
    <div
      onClick={clickHandler}
      className="h-fit py-3 px-6 flex hover:bg-gray-200 hover:dark:bg-gray-800 cursor-pointer transition border-b dark:border-gray-900 justify-center"
    >
      <div className="w-fit h-full me-3">
        <Image
          src={contact.image}
          className={`max-w-11 max-h-11 rounded-full border-2 ${
            contact.online_status ? "border-green-500" : "border-red-500"
          } hover:scale-105 hover:border-yellow-400 box-border transition`}
          alt={`${contact.username} profile`}
          width={150}
          height={150}
          onClick={() => profileHandler(contact)}
        ></Image>
      </div>

      <div className="h-11 w-full flex flex-col justify-center relative">
        <h1 className="text-[.95em]  font-semibold">{contact.username}</h1>

        <h2
          className={`text-[.75em] whitespace-nowrap overflow-hidden overflow-ellipsis ${
            search && "max-w-fit text-gray-800 dark:text-gray-50 px-1"
          }`}
        >
          {lastMessage ? (
            lastMessage.attachment ? (
              video.includes(lastMessage.attachment.split(".")[2]) ? (
                <>
                  <FontAwesomeIcon icon={faVideo} className="me-2" />
                  Video
                </>
              ) : image.includes(lastMessage.attachment.split(".")[2]) ? (
                <>
                  <FontAwesomeIcon icon={faImage} className="me-2" />
                  Image
                </>
              ) : audio.includes(lastMessage.attachment.split(".")[2]) ? (
                <>
                  <FontAwesomeIcon icon={faMusic} className="me-2" />
                  Audio
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFile} className="me-2" />
                  {lastMessage.attachment.split(".")[2].toUpperCase() + " File"}
                </>
              )
            ) : (
              lastMessage.chat
                .split(new RegExp(`(${textSearch})`, "gi"))
                .map((a, index) =>
                  a.toLowerCase() === textSearch?.toLowerCase() ? (
                    <span
                      key={index}
                      className="bg-yellow-400 dark:bg-yelow-500"
                    >
                      {a}
                    </span>
                  ) : (
                    <span key={index}>{a}</span>
                  )
                )
            )
          ) : (
            contact.email
          )}
        </h2>
      </div>

      {lastMessage ? (
        <div className="h-11 w-11 flex flex-col items-end justify-evenly relative font-semibold">
          <h2 className="text-[0.7em]">{`${date?.getHours()}:${
            date!.getMinutes() >= 10
              ? date?.getMinutes()
              : `0${date?.getMinutes()}`
          }`}</h2>

          <div className="w-fit h-fit">
            <div
              className={`${
                unread > 0 ? "bg-green-500" : ""
              } rounded-full min-w-4 min-h-4 flex`}
            >
              {unread > 0 ? (
                <h6 className="text-[0.6em] text-center m-auto font-bold text-gray-950">
                  {unread}
                </h6>
              ) : lastMessage.sender_id === user.id ? (
                <FontAwesomeIcon
                  icon={lastMessage.read_status ? faCheckDouble : faCheck}
                  className="ms-1"
                  color={"green"}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faEye}
                  className="ms-1"
                  color={"green"}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-11 w-11"></div>
      )}
    </div>
  );
};

export const MemoizedContact = React.memo(Contact);
