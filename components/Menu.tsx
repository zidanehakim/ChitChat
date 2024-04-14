"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faRightFromBracket,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import supabase from "@/utils/supabase/server";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer";
import { toast } from "react-toastify";
import { ContactContext } from "@/contexts/ContactContext";
import { AuthContext } from "@/contexts/AuthContext";

export const Menu = () => {
  const { user } = useContext(AuthContext);
  const { contactsUser } = useContext(ContactContext);
  const { systemTheme, theme, setTheme } = useTheme();
  const router = useRouter();

  const [unread, setUnread] = useState(
    contactsUser.reduce((count, person) => {
      console.log(user);
      const unreadChats = person.chats.filter(
        (chat) => chat.read_status === false && chat.recipient_id === user.id
      ).length;
      return count + unreadChats;
    }, 0)
  );

  useEffect(() => {
    const amount = contactsUser.reduce((count, person) => {
      console.log(user);
      const unreadChats = person.chats.filter(
        (chat) => chat.read_status === false && chat.recipient_id === user.id
      ).length;
      return count + unreadChats;
    }, 0);
    setUnread(amount);
    document.title =
      amount > 0 ? `ChitChat - New essages ${amount}` : `ChitChat - Chat now!`;
  }, [contactsUser]);

  console.log("unread", unread);

  const logOutHandler = async () => {
    const id = toast.loading("Signing Out...");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.update(id, {
          render: "Sign out failed",
          type: "error",
          isLoading: false,
          closeOnClick: true,
          autoClose: 5000,
        });
        throw error;
      } else
        toast.update(id, {
          render: "Sign out successful",
          type: "success",
          isLoading: false,
          closeOnClick: true,
          autoClose: 5000,
        });

      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  const darkModeHandler = () => {
    theme === "dark" ? setTheme("light") : setTheme("dark");
    theme === "dark"
      ? localStorage.setItem("darkMode", "light")
      : localStorage.setItem("darkMode", "dark");
  };

  return (
    <section className="h-full w-fit bg-gray-950 rounded-lg flex flex-col px-4 content-evenly shadow-lg">
      <Image
        src={"/logo_image.png"}
        alt="ChitChat"
        width={60}
        height={60}
        className="m-auto py-6"
      />

      <div className="h-full flex flex-col gap-10 justify-center">
        <div className="flex relative">
          <FontAwesomeIcon
            icon={faUserGroup}
            color="#f6f6f6"
            size="1x"
            className="hover:brightness-50 transition rounded-full shadow m-auto z-20 px-2 py-2 cursor-pointer relative"
          />
          {unread > 0 && (
            <div className="absolute w-4 h-4 bg-green-500 -right-1 -top-1 z-10 rounded-e-lg rounded-ss-lg font-semibold flex">
              <p className="text-xs m-auto text-gray-950">{unread}</p>
            </div>
          )}
        </div>
        <div className="flex">
          <FontAwesomeIcon
            icon={faRightFromBracket}
            color="#f6f6f6"
            size="1x"
            className="hover:brightness-50 transition rounded-full shadow m-auto px-2 py-2 cursor-pointer"
            onClick={logOutHandler}
          />
        </div>
      </div>

      <motion.div
        className="m-auto rounded-full w-8 min-h-24 max-h-24 relative px-[1.2em] py-1 mb-8 border"
        style={{
          backgroundImage: `url(${
            theme === "light" ? "/sun.jpg" : "/moon.jpg"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          className="w-8 h-8 rounded-full bg-white m-auto absolute left-1/2 -translate-x-1/2 cursor-pointer shadow-xl"
          animate={{
            top: theme === "light" ? 3 : 57,
            x: -16,
            rotate: theme === "light" ? 180 : 0,
          }}
          style={{
            backgroundImage: `url(${
              theme === "light" ? "/sun.png" : "/moon.png"
            })`,
            backgroundSize: "70%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          onClick={darkModeHandler}
        ></motion.div>
      </motion.div>
    </section>
  );
};
