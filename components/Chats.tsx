"use client";
import WavesurferPlayer from "@wavesurfer/react";
import { ContactContext, ListContacts, chats } from "@/contexts/ContactContext";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext, user } from "@/contexts/AuthContext";
import DateDiff from "date-diff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckDouble,
  faCopy,
  faDownload,
  faPause,
  faPlay,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import supabase from "@/utils/supabase/server";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useTheme } from "next-themes";
import { motion } from "framer";

type ChatsProps = {
  chats: chats;
  prevChats: chats;
  contact: user;
  text?: string;
  allChats?: chats[];
  indexes: number;
  search?: string;
};

export const Chats = ({
  chats,
  prevChats,
  contact,
  allChats,
  indexes,
  search,
  text,
}: ChatsProps) => {
  const fileName =
    chats.attachment &&
    chats.attachment!.split(".")[1] + "." + chats.attachment!.split(".")[2];

  const {
    user,
    setIsProfile,
    setProfile,
    setImage,
    setIsImage,
    setImageIndex,
    contextIndex,
    setContextIndex,
  } = useContext(AuthContext);
  const { systemTheme, theme, setTheme } = useTheme();

  const { contactsUser, setContactsUser, index } = useContext(ContactContext);
  const [fileBlob, setFileBlob] = useState(
    supabase.storage.from("attachment").getPublicUrl(chats.attachment!).data
      .publicUrl!
  );
  const [once, setOnce] = useState(false);
  const [menu, setMenu] = useState(false);

  const [wavesurfer, setWavesurfer] = useState({} as any);
  const [isPlaying, setIsPlaying] = useState(false);

  const dateTime = new Date(chats.created_at!);

  const streakID =
    chats.sender_id === prevChats.sender_id && chats.id !== prevChats.id;

  const date1 = new Date(prevChats.created_at!);
  const date2 = new Date(chats.created_at!);
  const streakDate =
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate() &&
    indexes !== 0;

  const dateDiff1 = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const dateDiff2 = new Date(
    new Date(chats.created_at!).getFullYear(),
    new Date(chats.created_at!).getMonth(),
    new Date(chats.created_at!).getDate()
  );
  const diff = new DateDiff(dateDiff1, dateDiff2);

  const video = ["mp4", "wav"];
  const image = ["jpeg", "jpg", "png"];
  const audio = ["mp3", "ogg"];

  useEffect(() => {
    const checkFile = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/filecheck`, {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(fileName),
        });

        if (response.ok) {
          const fileData = await response.blob();
          const url = URL.createObjectURL(fileData);

          setFileBlob(url);

          contactsUser[index].chats[indexes].blob = url;

          if (
            image.includes(chats.attachment!.split(".")[2]) ||
            video.includes(chats.attachment!.split(".")[2])
          )
            setOnce(true);
        } else {
          console.log("File doesn't exist");
        }
      } catch (err) {
        console.error(err);
      }
    };
    chats.attachment && checkFile();
  }, [contactsUser, index, chats, prevChats]);

  const downloadAttachment = async () => {
    if (!once) {
      console.log("Downloading..");

      const { data, error } = await supabase.storage
        .from("attachment")
        .download(chats.attachment!);

      if (error) throw error;

      const file = new File([data], fileName!);
      const url = URL.createObjectURL(file);

      setFileBlob(url);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName!;

      // Append link to the body
      document.body.appendChild(link);

      // Dispatch click event on the link
      // This is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      // Remove link from body
      document.body.removeChild(link);

      const chatIndex = contactsUser[index].chats.findIndex(
        (a) => a.id === chats.id
      );
      contactsUser[index].chats[chatIndex].blob = url;

      if (
        image.includes(chats.attachment!.split(".")[2]) ||
        video.includes(chats.attachment!.split(".")[2])
      )
        setOnce(true);
    } else {
      if (image.includes(chats.attachment!.split(".")[2])) {
        const imageChats = allChats?.filter(
          (a) => a.attachment && image.includes(a.attachment!.split(".")[2])
        );
        const foundImageIndex = imageChats?.findIndex((a) => a.id === chats.id);
        console.log(imageChats, foundImageIndex);

        setImageIndex(foundImageIndex!);
        setImage(imageChats!);
        setIsImage(true);
      }
    }
  };

  const deleteChats = async () => {
    setMenu(false);
    const newContactsUser: ListContacts[] = JSON.parse(
      JSON.stringify(contactsUser)
    );
    const indexes = contactsUser.findIndex(
      (a) => a.contactUser.id === contact.id
    );

    newContactsUser[indexes].chats = newContactsUser[indexes].chats.filter(
      (b) => b.id !== chats.id
    );
    setContactsUser(newContactsUser);

    try {
      const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chats.id);

      if (error) throw error;

      if (chats.attachment) {
        const { error } = await supabase.storage
          .from("attachment")
          .remove([chats.attachment]);

        if (error) throw error;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onContextMenuHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    setContextIndex(indexes);
    if (chats.sender_id === user.id) {
      setMenu((prev) => !prev);
    }
  };

  useEffect(() => {
    contextIndex !== indexes && setMenu(false), [contextIndex];
  });

  const profileHandler = (a: user) => {
    setIsProfile(true);
    setProfile(a);
  };

  function formatFileSize(sizeInBytes: number) {
    const KB = 1024;
    const MB = KB * KB;
    const GB = MB * KB;

    if (sizeInBytes >= GB) {
      return (sizeInBytes / GB).toFixed(2) + " GB";
    } else if (sizeInBytes >= MB) {
      return (sizeInBytes / MB).toFixed(2) + " MB";
    } else if (sizeInBytes >= KB) {
      return (sizeInBytes / KB).toFixed(2) + " KB";
    } else {
      return sizeInBytes + " bytes";
    }
  }

  function formatSecondsToMinutes(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  const onReady = (ws: any) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    console.log(wavesurfer);
    wavesurfer && wavesurfer.playPause();
  };

  return (
    <>
      {!streakDate && (
        <div className="flex justify-center align-center py-4">
          <div className="h-fit w-full flex m-auto">
            <div className="w-full h-0 border border-gray-500 rounded-full"></div>
          </div>
          <p className=" w-fit h-fit m-auto rounded-lg text-[.7em] px-3 py-1 my-5 font-semibold bg-gray-900 mx-3">
            {diff.days() >= 0 && diff.days() < 1
              ? "Today"
              : diff.days() >= 1 && diff.days() < 2
              ? "Yesterday"
              : `${date2.getDate()}/${
                  date2.getMonth() + 1
                }/${date2.getFullYear()}`}
          </p>
          <div className="h-fit w-full flex m-auto">
            <div className="w-full h-0 border border-gray-500 rounded-full"></div>
          </div>
        </div>
      )}
      <div onContextMenu={onContextMenuHandler} className="relative">
        {menu && contextIndex === indexes && (
          <motion.div
            animate={{ opacity: 1, top: 0 }}
            initial={{ opacity: 0, top: -10 }}
            className="text-gray-50 absolute right-0 z-20 bg-[rgba(0,0,0,.9)] flex flex-col justify-center rounded-lg"
          >
            <div
              className="w-full h-fit px-3 py-2 flex gap-2  justify-center items-center cursor-pointer rounded-t-lg hover:bg-gray-900"
              onClick={deleteChats}
            >
              <h1 className="text-xs">Delete</h1>
              <FontAwesomeIcon icon={faTrash} color="white" size="xs" />
            </div>
            {chats.attachment ? (
              <div
                className="w-full h-fit px-3 py-2 flex gap-2  justify-center items-center cursor-pointer rounded-b-lg hover:bg-gray-900"
                onClick={() => {
                  setOnce(false);
                  downloadAttachment();
                }}
              >
                <h1 className="text-xs">Download</h1>
                <FontAwesomeIcon icon={faDownload} color="white" size="xs" />
              </div>
            ) : (
              <div
                className="w-full h-fit px-3 py-2 flex gap-2  justify-center items-center cursor-pointer rounded-b-lg hover:bg-gray-900"
                onClick={() => {
                  navigator.clipboard.writeText(chats.chat);
                  setMenu(false);
                }}
              >
                <h1 className="text-xs">Copy</h1>
                <FontAwesomeIcon icon={faCopy} color="white" size="xs" />
              </div>
            )}
          </motion.div>
        )}
        {chats.sender_id === user.id ? (
          !chats.attachment ? (
            <div className="py-1 h-fit relative flex justify-end">
              <div className="flex">
                <div className="flex h-fit px-3 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[55em] shadow from-green-500 to-green-700 bg-gradient-to-r text-white dark:text-gray-950">
                  <p className="self-center break-all overflow whitespace-wrap py-2">
                    {chats.chat
                      .split(new RegExp(`(${search})`, "gi"))
                      .map((a, index) =>
                        a.toLowerCase() === search?.toLowerCase() ? (
                          <span
                            key={index}
                            className="bg-yellow-400 dark:bg-yelow-500"
                          >
                            {a}
                          </span>
                        ) : (
                          <span key={index}>{a}</span>
                        )
                      )}
                  </p>
                  <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                    <p className="text-[.8em]">{`${dateTime.getHours()}:${
                      dateTime.getMinutes() >= 10
                        ? dateTime.getMinutes()
                        : `0${dateTime.getMinutes()}`
                    }`}</p>

                    <FontAwesomeIcon
                      icon={chats.read_status ? faCheckDouble : faCheck}
                      className="ms-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-1 h-fit relative flex justify-end">
              <div className="flex">
                {image.includes(chats.attachment.split(".")[2]) ? (
                  <div className="flex h-fit  px-1 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[55em] shadow from-green-500 to-green-700 bg-gradient-to-r text-white py-1 relative">
                    <Image
                      src={fileBlob}
                      width={once ? 500 : 20}
                      height={once ? 500 : 20}
                      alt="IMG Icon"
                      onClick={downloadAttachment}
                      className="cursor-pointer rounded-xl w-60"
                    />

                    {!once && (
                      <div
                        onClick={downloadAttachment}
                        className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold flex gap-2 rounded-full bg-[rgba(0,0,0,.7)] px-4 py-2 text-xs cursor-pointer hover:scale-105 transition"
                      >
                        <h1 className="">{formatFileSize(chats.size!)}</h1>
                        <FontAwesomeIcon icon={faDownload} className="m-auto" />
                      </div>
                    )}

                    <div
                      className="self-end mt-3 ps-3 flex h-fit w-fit absolute right-4 px-2 py-1 rounded-full"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, rgba(0,0,0,.7),transparent)",
                      }}
                    >
                      <p className="text-[.8em]">{`${dateTime.getHours()}:${
                        dateTime.getMinutes() >= 10
                          ? dateTime.getMinutes()
                          : `0${dateTime.getMinutes()}`
                      }`}</p>
                      <FontAwesomeIcon
                        icon={chats.read_status ? faCheckDouble : faCheck}
                        className="ms-1"
                      />
                    </div>
                  </div>
                ) : video.includes(chats.attachment.split(".")[2]) ? (
                  <div className="flex h-fit  px-1 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[55em] shadow from-green-500 to-green-700 bg-gradient-to-r text-white py-1 cursor-pointer relative">
                    <ReactPlayer
                      width="300px"
                      height="200px"
                      url={fileBlob}
                      controls={true}
                      // light is usefull incase of dark mode
                      light={!once}
                      // picture in picture
                      pip={true}
                      onClick={downloadAttachment}
                      className="bg-gray-950 w-full h-full rounded-xl"
                    />
                    <source src={fileBlob} type="video/mp4" />

                    {!once && (
                      <div
                        onClick={downloadAttachment}
                        className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold flex gap-2 rounded-full bg-[rgba(0,0,0,.7)] px-4 py-2 text-xs cursor-pointer hover:scale-105 transition"
                      >
                        <h1 className="">{formatFileSize(chats.size!)}</h1>
                        <FontAwesomeIcon icon={faDownload} className="m-auto" />
                      </div>
                    )}

                    <div
                      className="self-end mt-3 ps-3 flex h-fit w-fit absolute right-4 px-2 py-1 rounded-full"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, rgba(0,0,0,.4),transparent)",
                      }}
                    >
                      <p className="text-[.8em]">{`${dateTime.getHours()}:${
                        dateTime.getMinutes() >= 10
                          ? dateTime.getMinutes()
                          : `0${dateTime.getMinutes()}`
                      }`}</p>
                      <FontAwesomeIcon
                        icon={chats.read_status ? faCheckDouble : faCheck}
                        className="ms-1"
                      />
                    </div>
                  </div>
                ) : !audio.includes(chats.attachment.split(".")[2]) ? (
                  <div
                    className="flex h-fit px-3 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[26em] shadow from-green-500 to-green-700 bg-gradient-to-r text-white dark:text-gray-950 cursor-pointer"
                    onClick={downloadAttachment}
                  >
                    {chats.attachment.split(".")[2] === "pdf" && (
                      <div className="flex justify-center items-center ms-2 w-16 h-20 m-auto">
                        <Image
                          src="/pdf_icon.png"
                          width={90}
                          height={90}
                          alt="PDF Icon"
                          className="border px-1 py-1"
                        />
                      </div>
                    )}
                    <div className="flex flex-col py-2 m-auto">
                      <p className="break-all overflow whitespace-wrap font-semibold ps-4">
                        {fileName
                          ?.split(new RegExp(`(${search})`, "gi"))
                          .map((a, index) =>
                            a.toLowerCase() === search?.toLowerCase() ? (
                              <span key={index} className="bg-yellow-">
                                {a}
                              </span>
                            ) : (
                              <span key={index}>{a}</span>
                            )
                          )}
                      </p>
                      <p className="break-all overflow whitespace-wrap ps-4 text-xs">
                        {`Size : ${formatFileSize(chats.size!)}`}
                      </p>
                      <p className="break-all overflow whitespace-wrap ps-4 text-xs">
                        {`Type : ${chats.attachment.split(".")[2]}`}
                      </p>
                    </div>
                    <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                      <p className="text-[.8em]">{`${dateTime.getHours()}:${
                        dateTime.getMinutes() >= 10
                          ? dateTime.getMinutes()
                          : `0${dateTime.getMinutes()}`
                      }`}</p>
                      <FontAwesomeIcon
                        icon={chats.read_status ? faCheckDouble : faCheck}
                        className="ms-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-50 dark:text-gray-950 from-green-500 to-green-700 bg-gradient-to-r rounded-ee-2xl rounded-s-xl flex justify-center items-center h-fit">
                    <Image
                      className={`w-11 h-11 rounded-full border-2 border-transparent border-green-800 mx-2`}
                      src={contact.image}
                      width={150}
                      height={150}
                      alt={`${contact.username}'s image`}
                    ></Image>

                    <FontAwesomeIcon
                      icon={isPlaying ? faPause : faPlay}
                      color="#222"
                      onClick={onPlayPause}
                      className="mx-2 cursor-pointer hover:scale-105 transition"
                      size="lg"
                    ></FontAwesomeIcon>

                    <div className="flex flex-col w-full">
                      <div className="flex flex-row items-center px-2 pt-2">
                        <WavesurferPlayer
                          height={40}
                          width={150}
                          waveColor={theme === "light" ? "#333" : "#dcdedc"}
                          cursorColor={theme === "dark" ? "#222" : "#f5f5f5"}
                          progressColor={theme === "dark" ? "#222" : "#f5f5f5"}
                          url={fileBlob}
                          onReady={onReady}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                      </div>

                      <div className="flex flex-row justify-between h-fit text-sm px-2">
                        <p className="text-[.8em]">
                          {wavesurfer &&
                            formatSecondsToMinutes(
                              wavesurfer?.renderer?.audioData?.duration
                            )}
                        </p>

                        <div className="flex">
                          <p className="text-[.8em]">{`${dateTime.getHours()}:${
                            dateTime.getMinutes() >= 10
                              ? dateTime.getMinutes()
                              : `0${dateTime.getMinutes()}`
                          }`}</p>
                          <FontAwesomeIcon
                            icon={chats.read_status ? faCheckDouble : faCheck}
                            className="ms-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : !chats.attachment ? (
          <div className="h-fit relative flex justify-start">
            <div className="flex">
              <Image
                className={`w-11 h-11 rounded-full me-3 border-2 border-transparent hover:border-yellow-400 hover:scale-105 transition ${
                  !(!streakID || !streakDate)
                    ? "opacity-0 cursor-default"
                    : "cursor-pointer"
                }`}
                src={contact.image}
                width={150}
                height={150}
                alt={`${contact.username}'s image`}
                onClick={() =>
                  (!streakID || !streakDate) && profileHandler(contact)
                }
              ></Image>

              <div className="py-1 h-fit relative flex justify-end">
                <div className="flex">
                  <div className="flex h-fit px-3 text-sm rounded-es-2xl rounded-e-xl m-auto max-w-[55em] shadow bg-white dark:bg-gray-900 dark:text-gray-50 text-gray-950">
                    <p className="self-center break-all overflow whitespace-wrap py-2">
                      {chats.chat
                        .split(new RegExp(`(${search})`, "gi"))
                        .map((a, index) =>
                          a.toLowerCase() === search?.toLowerCase() ? (
                            <span
                              key={index}
                              className="bg-yellow-400 dark:bg-yelow-500"
                            >
                              {a}
                            </span>
                          ) : (
                            <span key={index}>{a}</span>
                          )
                        )}
                    </p>
                    <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                      <p className="text-[.8em]">{`${dateTime.getHours()}:${
                        dateTime.getMinutes() >= 10
                          ? dateTime.getMinutes()
                          : `0${dateTime.getMinutes()}`
                      }`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-1 h-fit relative flex justify-start">
            <div className="flex">
              <Image
                className={`w-11 h-11 rounded-full me-3 border-2 border-transparent hover:border-yellow-400 hover:scale-105 transition ${
                  !(!streakID || !streakDate)
                    ? "opacity-0 cursor-default"
                    : "cursor-pointer"
                }`}
                src={`${!streakID || !streakDate ? contact.image : ""}`}
                width={150}
                height={150}
                alt={`${contact.username}'s image`}
                onClick={() =>
                  (!streakID || !streakDate) && profileHandler(contact)
                }
              ></Image>

              {image.includes(chats.attachment.split(".")[2]) ? (
                <div className="flex h-fit dark:text-whitenpm px-1 text-sm rounded-e-2xl rounded-es-xl m-auto max-w-[55em] shadow bg-white dark:bg-gray-900 py-1 relative">
                  <Image
                    src={fileBlob}
                    width={once ? 500 : 20}
                    height={once ? 500 : 20}
                    alt="IMG Icon"
                    onClick={downloadAttachment}
                    className="cursor-pointer rounded-xl w-60"
                  />

                  {!once && (
                    <div
                      onClick={downloadAttachment}
                      className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold flex gap-2 rounded-full bg-[rgba(0,0,0,.7)] px-4 py-2 text-xs cursor-pointer hover:scale-105 transition"
                    >
                      <h1 className="">{formatFileSize(chats.size!)}</h1>
                      <FontAwesomeIcon icon={faDownload} className="m-auto" />
                    </div>
                  )}

                  <div
                    className="self-end mt-3 flex h-fit w-fit absolute ps-3  rounded-full px-4 py-1"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(0,0,0,.4),transparent)",
                    }}
                  >
                    <p className="text-[.8em]">{`${dateTime.getHours()}:${
                      dateTime.getMinutes() >= 10
                        ? dateTime.getMinutes()
                        : `0${dateTime.getMinutes()}`
                    }`}</p>
                  </div>
                </div>
              ) : video.includes(chats.attachment.split(".")[2]) ? (
                <div className="flex h-fit  px-1 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[55em] shadow bg-green-white py-1 cursor-pointer relative">
                  <ReactPlayer
                    width="300px"
                    height="200px"
                    url={fileBlob}
                    controls={true}
                    // light is usefull incase of dark mode
                    light={!once}
                    // picture in picture
                    pip={true}
                    onClick={downloadAttachment}
                    className="bg-gray-950 w-full h-full rounded-xl"
                  />
                  <source src={fileBlob} type="video/mp4" />

                  {!once && (
                    <div
                      onClick={downloadAttachment}
                      className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold flex gap-2 rounded-full bg-[rgba(0,0,0,.7)] px-4 py-2 text-xs cursor-pointer hover:scale-105 transition"
                    >
                      <h1 className="">{formatFileSize(chats.size!)}</h1>
                      <FontAwesomeIcon icon={faDownload} className="m-auto" />
                    </div>
                  )}

                  <div
                    className="self-end mt-3 ps-3 flex h-fit w-fit absolute px-2 py-1 rounded-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(0,0,0,.4),transparent)",
                    }}
                  >
                    <p className="text-[.8em]">{`${dateTime.getHours()}:${
                      dateTime.getMinutes() >= 10
                        ? dateTime.getMinutes()
                        : `0${dateTime.getMinutes()}`
                    }`}</p>
                  </div>
                </div>
              ) : !audio.includes(chats.attachment.split(".")[2]) ? (
                <div
                  className="flex h-fit px-3 text-sm rounded-e-2xl rounded-es-xl m-auto max-w-[26em] shadow dark:bg-gray-900 bg-white dark:text-gray-50 text-gray-950 cursor-pointer"
                  onClick={downloadAttachment}
                >
                  {chats.attachment.split(".")[2] === "pdf" && (
                    <div className="flex justify-center items-center ms-2 w-16 h-20 m-auto">
                      <Image
                        src="/pdf_icon.png"
                        width={90}
                        height={90}
                        alt="PDF Icon"
                        className="border px-1 py-1"
                      />
                    </div>
                  )}
                  <div className="flex flex-col py-2 m-auto">
                    <p className="break-all overflow whitespace-wrap font-semibold ps-4">
                      {fileName
                        ?.split(new RegExp(`(${search})`, "gi"))
                        .map((a, index) =>
                          a.toLowerCase() === search?.toLowerCase() ? (
                            <span key={index} className="bg-yellow-">
                              {a}
                            </span>
                          ) : (
                            <span key={index}>{a}</span>
                          )
                        )}
                    </p>
                    <p className="break-all overflow whitespace-wrap ps-4 text-xs">
                      {`Size : ${formatFileSize(chats.size!)}`}
                    </p>
                    <p className="break-all overflow whitespace-wrap ps-4 text-xs">
                      {`Type : ${chats.attachment.split(".")[2]}`}
                    </p>
                  </div>
                  <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                    <p className="text-[.8em]">{`${dateTime.getHours()}:${
                      dateTime.getMinutes() >= 10
                        ? dateTime.getMinutes()
                        : `0${dateTime.getMinutes()}`
                    }`}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-950 dark:text-white bg-white dark:bg-gray-900 rounded-es-2xl rounded-e-xl flex justify-center items-center h-fit">
                  <Image
                    className={`w-11 h-11 rounded-full border-2 border-transparent border-gray-800 mx-2`}
                    src={contact.image}
                    width={150}
                    height={150}
                    alt={`${contact.username}'s image`}
                  ></Image>

                  <FontAwesomeIcon
                    icon={isPlaying ? faPause : faPlay}
                    color={theme === "dark" ? "white" : "#222"}
                    onClick={onPlayPause}
                    className="mx-2 cursor-pointer hover:scale-105 transition"
                    size="lg"
                  ></FontAwesomeIcon>

                  <div className="flex flex-col w-full">
                    <div className="flex flex-row items-center px-2 pt-2">
                      <WavesurferPlayer
                        height={40}
                        width={150}
                        waveColor={theme === "dark" ? "#333" : "#dcdedc"}
                        cursorColor={theme === "light" ? "#222" : "#f5f5f5"}
                        progressColor={theme === "light" ? "#222" : "#f5f5f5"}
                        url={fileBlob}
                        onReady={onReady}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>

                    <div className="flex flex-row justify-between h-fit text-sm px-2">
                      <p className="text-[.8em]">
                        {wavesurfer &&
                          formatSecondsToMinutes(
                            wavesurfer?.renderer?.audioData?.duration
                          )}
                      </p>

                      <div className="flex">
                        <p className="text-[.8em]">{`${dateTime.getHours()}:${
                          dateTime.getMinutes() >= 10
                            ? dateTime.getMinutes()
                            : `0${dateTime.getMinutes()}`
                        }`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const MemoizedChats = React.memo(Chats);
