"use client";
import { ContactContext, ListContacts, chats } from "@/contexts/ContactContext";
import {
  faEllipsis,
  faLink,
  faPaperPlane,
  faSearch,
  faSmile,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { MemoizedChats } from "./Chats";
import supabase from "@/utils/supabase/server";
import { AuthContext, user } from "@/contexts/AuthContext";
import Image from "next/image";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import { motion } from "framer";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

export const Rightbar = () => {
  const recorderControls = useAudioRecorder();
  const { systemTheme, theme, setTheme } = useTheme();
  const chatsRef = useRef<HTMLDivElement>(null);

  const [emojiOpen, setEmojiOpen] = useState(false);

  const { user, setIsProfile, setProfile, setContextIndex } =
    useContext(AuthContext);
  const { contactsUser, setContactsUser, index } = useContext(ContactContext);

  const [text, setText] = useState("");
  const [tempText, setTempText] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState("");

  const [otherChats, setOtherChats] = useState([] as chats[]);
  const [cancel, setCancel] = useState(false);

  const enterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault();

      return submitHandler(e);
    }
  };

  const scrollToBottom = () => {
    const scrollBot = () =>
      chatsRef.current?.scrollIntoView({ behavior: "instant" });

    setTimeout(scrollBot, 1);
  };

  const video = ["mp4", "wav"];
  const image = ["jpeg", "jpg", "png"];
  const audio = ["mp3", "ogg"];

  useEffect(() => {
    window.addEventListener("beforeunload", (e) => {
      setText("");
      e.preventDefault();
    });

    return () =>
      window.removeEventListener("beforeunload", (e) => {
        setText("");
        e.preventDefault();
      });
  }, []);

  useEffect(() => {
    chatsRef.current?.scrollIntoView({ behavior: "instant" });
  }, [index]);

  useEffect(() => setText(""), [index]);

  useEffect(() => {
    search.length > 0 ? searchHandler() : setOtherChats([] as chats[]);
  }, [search]);

  const searchHandler = async () => {
    const foundChats = contactsUser[index].chats.filter(
      (a) =>
        a.chat.toLowerCase().includes(search.toLowerCase()) ||
        (a.attachment?.toLowerCase().includes(search.toLowerCase()) &&
          !image.includes(a.attachment.split(".")[2]) &&
          !video.includes(a.attachment.split(".")[2]) &&
          !audio.includes(a.attachment.split(".")[2]))
    );

    setOtherChats(foundChats);
  };

  const submitHandler = async (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();

    scrollToBottom();

    setText("");
    setSearch("");
    setIsSearch(false);
    try {
      const texts = JSON.parse(JSON.stringify(text));
      const date = new Date().toISOString();

      const newChat: chats = {
        chat: texts,
        sender_id: user.id!,
        recipient_id: contactsUser[index].contactUser.id!,
        chatbox_id: contactsUser[index].chatboxID,
        created_at: date,
      };

      const newContactsUser: ListContacts[] = JSON.parse(
        JSON.stringify(contactsUser)
      );

      if (contactsUser[index].chatboxID === "")
        newContactsUser[index].chatboxID = ".";

      newContactsUser[index].chats.push(newChat);

      setContactsUser([...newContactsUser]);

      if (contactsUser[index].chatboxID === "") {
        const { data, error } = await supabase
          .from("chatbox")
          .insert([
            {
              p1_id: user!.id,
              p2_id: contactsUser[index].contactUser!.id,
              p1_name: user!.username,
              p2_name: contactsUser[index].contactUser!.username,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;

        const newContactsUser2: ListContacts[] = JSON.parse(
          JSON.stringify(newContactsUser)
        );
        newContactsUser2[index].chatboxID = data!.id;
        setContactsUser([...newContactsUser2]);

        const newChat2: chats = {
          chat: texts,
          recipient_id: contactsUser[index].contactUser.id!,
          sender_id: user.id!,
          chatbox_id: data!.id,
          created_at: date,
        };

        const { error: insertError } = await supabase
          .from("chats")
          .insert(newChat2);

        if (insertError) throw insertError;
      } else {
        console.log(newChat);
        const { error: insertError } = await supabase
          .from("chats")
          .insert(newChat);

        if (insertError) throw insertError;
      }

      await supabase
        .from("chatbox")
        .update({ last_message: texts, last_time: date })
        .eq("id", contactsUser[index].chatboxID);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const subscription1 = supabase
      .channel("chats")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chats",
        },
        deleteChats
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chats",
          filter: `sender_id=eq.${user.id}`,
        },
        updateChats
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `recipient_id=eq.${user.id}`,
        },
        insertChats
      )
      .subscribe();

    return () => {
      subscription1.unsubscribe();
    };
  }, [index, contactsUser, text]);

  const deleteChats = async () => {
    console.log("hellooooo");
    const newContactsUser: ListContacts[] = JSON.parse(
      JSON.stringify(contactsUser)
    );

    const promiseTemps = newContactsUser
      .filter(async (a) => {
        const datas =
          a.chatboxID !== "" && a.chatboxID
            ? (
                await supabase
                  .from("chats")
                  .select("*")
                  .eq("chatbox_id", a.chatboxID)
                  .order("created_at", { ascending: true })
              ).data
            : [];

        if (datas?.length === 0 && a.chatboxID !== "") {
          await supabase.from("chatbox").delete().eq("id", a.chatboxID);
        }

        return datas && datas!.length > 0;
      })
      .map(async (a) => {
        const { data } = await supabase
          .from("chats")
          .select("*")
          .eq("chatbox_id", a.chatboxID)
          .order("created_at", { ascending: true });

        return { ...a, chats: data ? data : [] };
      });

    await Promise.all(promiseTemps).then((a: ListContacts[]) => {
      setContactsUser(a);
    });
  };

  const updateChats = () => {
    insertUpdateChats();
  };

  const insertChats = () => {
    play();
    index !== -1 && updateSeen();
    insertUpdateChats();
  };

  const insertUpdateChats = async () => {
    console.log("asdasd");
    const newContactsUser: ListContacts[] = JSON.parse(
      JSON.stringify(contactsUser)
    );

    const promiseTemps = newContactsUser.map(async (a) => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("chatbox_id", a.chatboxID)
        .order("created_at", { ascending: true });

      return { ...a, chats: data ? data : [] };
    });

    await Promise.all(promiseTemps).then((a) => {
      setContactsUser(a);
    });
  };

  // const updateOnline = async () => {
  //   console.log("updateOnline");
  //   const newContactsUser: ListContacts[] = JSON.parse(
  //     JSON.stringify(contactsUser)
  //   );

  //   const newContactsUserPromise = newContactsUser.map(async (a, indexes) => {
  //     const { data } = await supabase
  //       .from("users")
  //       .select("*")
  //       .eq("id", a.contactUser.id)
  //       .single();

  //     const d = new Date();
  //     const n = d.getTime();

  //     const imageURL =
  //       data.image === newContactsUser[indexes].contactUser.image
  //         ? data.image
  //         : a.contactUser.image.split("?")[0] + "?v=" + n;
  //     const wallpaperURL =
  //       data.wallpaper === newContactsUser[indexes].contactUser.wallpaper
  //         ? data.wallpaper
  //         : a.contactUser.wallpaper.split("?")[0] + "?v=" + n;

  //     return {
  //       ...a,
  //       contactUser: {
  //         ...a.contactUser,
  //         ...data,
  //         online_status: data.online_status,
  //         image: imageURL,
  //         wallpaper: wallpaperURL,
  //       },
  //     };
  //   });

  //   await Promise.all(newContactsUserPromise).then((a) => {
  //     setContactsUser(a);
  //   });
  // };

  const profileHandler = () => {
    setIsProfile(true);
    setProfile(contactsUser[index].contactUser);
  };

  const attachmentHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date();
    const n = d.getTime();

    try {
      const file = e.target.files![0];
      const fileName = `${n + contactsUser[index].chatboxID}.${
        file.name.split(".")[0]
      }.${file.name.split(".")[1]}`;

      const { error } = await supabase.storage
        .from("attachment")
        .upload(fileName, file);

      if (error) throw error;

      const newChat: chats = {
        created_at: new Date().toISOString(),
        chatbox_id: contactsUser[index].chatboxID,
        sender_id: user.id!,
        recipient_id: contactsUser[index].contactUser.id!,
        attachment: fileName,
        size: file.size,
        chat: "",
      };

      const newContactsUser: ListContacts[] = JSON.parse(
        JSON.stringify(contactsUser)
      );
      newContactsUser[index].chats.push(newChat);

      setContactsUser(newContactsUser);

      const { error: chatsError } = await supabase
        .from("chats")
        .insert(newChat);

      if (chatsError) throw chatsError;

      scrollToBottom();
    } catch (err) {
      console.log(err);
    }
  };

  const updateSeen = async () => {
    if (
      contactsUser[index].chatboxID !== "" &&
      contactsUser[index].chats.length > 0
    ) {
      const newContactsUser: ListContacts[] = JSON.parse(
        JSON.stringify(contactsUser)
      );

      newContactsUser[index].chats = newContactsUser[index].chats.map((b) => ({
        ...b,
        read_status: b.recipient_id === user.id ? true : b.read_status,
      }));

      setContactsUser(newContactsUser);

      try {
        const { error } = await supabase
          .from("chats")
          .update({ read_status: true })
          .eq("sender_id", contactsUser[index].contactUser.id)
          .eq("recipient_id", user.id)
          .eq("chatbox_id", contactsUser[index].chatboxID)
          .eq("read_status", false);

        if (error) throw error;
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    index !== -1 && updateSeen();
  }, [index]);

  const addAudioElement = async (blob: Blob) => {
    const d = new Date();
    const n = d.getTime();

    if (!cancel) {
      try {
        const file = new File([blob], `${n}.mp3`);

        const fileName = `${contactsUser[index].chatboxID}.${
          file.name.split(".")[0]
        }.${file.name.split(".")[1]}`;

        const { error } = await supabase.storage
          .from("attachment")
          .upload(fileName, file);

        if (error) throw error;

        const newChat: chats = {
          created_at: new Date().toISOString(),
          chatbox_id: contactsUser[index].chatboxID,
          sender_id: user.id!,
          recipient_id: contactsUser[index].contactUser.id!,
          attachment: fileName,
          size: file.size,
          chat: "",
        };

        const newContactsUser: ListContacts[] = JSON.parse(
          JSON.stringify(contactsUser)
        );
        newContactsUser[index].chats.push(newChat);

        setContactsUser(newContactsUser);

        const { error: chatsError } = await supabase
          .from("chats")
          .insert(newChat);

        if (chatsError) throw chatsError;

        scrollToBottom();
      } catch (err) {
        console.log(err);
      }
    } else setCancel(false);
  };

  const play = () => {
    new Audio("/ring.wav").play();
  };

  return contactsUser.length > 0 && contactsUser[index] ? (
    <section className="h-full w-full min-w-[32em] flex flex-col relative overflow-x-hidden">
      <div className="h-fit py-3 flex bg-white dark:bg-gray-950 rounded-t-lg shadow-lg border-b dark:border-gray-900">
        <div className="h-full text-black dark:text-gray-100 flex px-5">
          <Image
            src={contactsUser[index].contactUser.image}
            className={`w-11 h-11 rounded-full border-2 ${
              contactsUser[index].contactUser.online_status
                ? "border-green-500"
                : "border-red-500"
            } hover:border-yellow-400 hover:scale-105 transition cursor-pointer`}
            alt={`${contactsUser[index].contactUser.username} profile`}
            width={150}
            height={150}
            onClick={profileHandler}
          ></Image>
          <div className="h-full w-56 mx-3 flex flex-col justify-center">
            <h1 className="text-[.95em] font-semibold">
              {contactsUser[index].contactUser.username}
            </h1>
            <div className="flex items-center">
              <div
                className={`${
                  contactsUser[index].contactUser.online_status
                    ? "bg-green-500"
                    : "bg-red-500"
                } rounded-full w-2 h-2`}
              ></div>
              <h1
                className={`text-[.75em] ${
                  contactsUser[index].contactUser.online_status
                    ? "text-green-700"
                    : "text-red-700"
                } me-5 ms-1`}
              >
                {contactsUser[index].contactUser.online_status
                  ? "Online"
                  : "Offline"}
              </h1>
            </div>
          </div>
        </div>

        <div className="w-[100%] flex items-center justify-end relative mx-5">
          <FontAwesomeIcon
            icon={faUser}
            color={theme === "light" ? "#2c313c" : "white"}
            size="1x"
            className="mx-2 hover:bg-gray-300 dark:hover:bg-gray-800 transition px-3 py-3 rounded-full cursor-pointer"
            onClick={profileHandler}
          />
          {isSearch && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-500 dark:border-gray-800 text-black dark:text-gray-200 text-xs font-normal py-2 rounded-full w-48 px-5 flex"
            >
              <input
                type="text"
                placeholder="Search chats.."
                className="w-full outline-none bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </motion.div>
          )}

          <FontAwesomeIcon
            icon={faSearch}
            color={theme === "light" ? "#2c313c" : "white"}
            size="1x"
            className="mx-2 hover:bg-gray-300 dark:hover:bg-gray-800 transition px-3 py-3 rounded-full cursor-pointer"
            onClick={() => setIsSearch((prev) => !prev)}
          />

          <FontAwesomeIcon
            icon={faEllipsis}
            color={theme === "light" ? "#2c313c" : "white"}
            size="1x"
            className="hover:bg-gray-300 dark:hover:bg-gray-800 transition px-3 py-3 rounded-full cursor-pointer"
          />
        </div>
      </div>

      <div
        className={`w-auto h-full bg-[rgba(250,250,250,0.7)] dark:bg-[rgba(0,0,0,0.9)] px-20 py-6 relative overflow-y-auto shadow-lg ${
          theme == "light" ? "lightscroll" : "darkscroll"
        }`}
      >
        {contactsUser[index].chats.length > 0 &&
        contactsUser[index].chatboxID !== "" &&
        search.length === 0
          ? contactsUser[index].chats.map((a, indexes) => (
              <MemoizedChats
                chats={a}
                prevChats={
                  contactsUser[index].chats[indexes - 1]
                    ? contactsUser[index].chats[indexes - 1]
                    : a
                }
                contact={contactsUser[index].contactUser}
                text={text}
                allChats={contactsUser[index].chats}
                key={indexes}
                indexes={indexes}
              />
            ))
          : otherChats.map((a, indexes) => (
              <MemoizedChats
                chats={a}
                prevChats={
                  otherChats[indexes - 1] ? otherChats[indexes - 1] : a
                }
                contact={contactsUser[index].contactUser}
                text={text}
                allChats={otherChats}
                key={indexes}
                indexes={indexes}
                search={search}
              />
            ))}

        {emojiOpen && (
          <div className="absolute bottom-[29em] left-8 z-20">
            <div
              className={`fixed ${
                emojiOpen ? "scale-105" : "scale-100"
              } transition`}
            >
              <Picker
                theme={theme === "light" ? "light" : "dark"}
                data={data}
                onEmojiSelect={(emoji: { native: string }) =>
                  setText((prev) => prev + emoji.native)
                }
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }} ref={chatsRef} />
      </div>

      <form
        onSubmit={submitHandler}
        className="w-full h-fit px-6 py-3 text-gray-700 dark:text-gray-50 bg-white dark:bg-gray-950 flex flex-row justify-evenly gap-2 items-center sticky bottom-0 rounded-b-lg shadow-lg border-t dark:border-t-gray-900"
      >
        {!recorderControls.isRecording && (
          <div className="flex w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-xl border dark:border-0 text-sm min-h-14 max-h-40 justify-center">
            <FontAwesomeIcon
              bounce
              icon={faSmile}
              size="lg"
              className="px-3 py-3 cursor-pointer"
              onClick={() => setEmojiOpen((prev) => !prev)}
            />

            <ReactTextareaAutosize
              required
              minRows={1}
              onKeyDown={enterPress}
              className={`mx-2 mb-1 py-3 w-full max-h-[8.9rem] outline-none overflow-y-auto bg-inherit dark:text-white ${
                theme === "dark" ? "darkscroll" : "lightscroll"
              }`}
              placeholder="Enter text here.."
              onChange={(e) => {
                setContextIndex(-1);
                setText(e.target.value);
              }}
              value={text}
              autoFocus
            />

            <label htmlFor="link">
              <FontAwesomeIcon
                spin
                icon={faLink}
                size="lg"
                className="px-3 py-3 m-auto cursor-pointer"
              />
            </label>
            <input
              id="link"
              name="link"
              type="file"
              className="hidden"
              onChange={attachmentHandler}
            />
          </div>
        )}

        <div
          className={
            recorderControls.isRecording
              ? "transition w-full py-2 flex items-center"
              : "hover:scale-105 transition flex items-center"
          }
        >
          <AudioRecorder
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            onRecordingComplete={(blob) => addAudioElement(blob)}
            recorderControls={recorderControls}
            showVisualizer
          />

          {recorderControls.isRecording && (
            <button type="submit" className="h-fit w-fit">
              <FontAwesomeIcon
                icon={faTrash}
                size="sm"
                onClick={() => {
                  setCancel(true);
                  recorderControls.stopRecording();
                }}
                className="bg-red-500 rounded-full px-3 py-3 hover:scale-105 hover:brightness-90 transition mx-3"
                color="white"
              />
            </button>
          )}
        </div>

        <button type="submit" className="h-fit w-fit">
          <FontAwesomeIcon
            icon={faPaperPlane}
            size="sm"
            className="from-teal-500 to-indigo-500 bg-gradient-to-r rounded-full px-3 py-3 hover:scale-105 hover:brightness-75 transition shadow"
            color={theme === "dark" ? "black" : "white"}
          />
        </button>
      </form>
    </section>
  ) : (
    <section className="h-full w-full min-w-[32em] flex flex-col justify-center relative bg-[rgba(255,255,255,.7)] dark:bg-[rgba(0,0,0,0.7)] text-black dark:text-white rounded-xl">
      <div className="m-auto px-8">
        <h1 className="font-semibold text-xl small-caps font-mono">
          By Zidane
        </h1>
        <Image
          src={theme === "light" ? "/cover_light.png" : "/cover_dark.png"}
          alt="Chitchat logo"
          width={400}
          height={400}
        />
      </div>
    </section>
  );
};

export const MemoizedRightbar = React.memo(Rightbar);
