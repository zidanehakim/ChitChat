"use client";
import React, { useContext, useState } from "react";
import { MemoizedPeople } from "./People";
import { AuthContext } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemoizedPeopleAdd } from "./PeopleAdd";
import {
  faCommentDots,
  faPenToSquare,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useTheme } from "next-themes";

export const Leftbar = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const { user, setIsProfile, setProfile } = useContext(AuthContext);
  console.log(user.image);

  const [isAdd, setIsAdd] = useState(false);

  const profileHandler = () => {
    setIsProfile(true);
    setProfile(user);
  };

  return (
    <section className="h-full w-full min-w-[23em] max-w-[30em] flex flex-col relative">
      <div className="h-fit w-full  px-4 bg-white dark:bg-gray-950 rounded-t-lg shadow-lg">
        <div className="h-full w-full py-3 text-black dark:text-gray-100 flex justify-center align-center">
          <div className="h-full w-full flex flex-row">
            <Image
              src={user!.username ? user.image : "/default_user.jpg"}
              className="w-11 h-11 rounded-full border-2 border-blue-500 box-border hover:scale-105 hover:border-yellow-400 transition cursor-pointer"
              alt={`${user.username} profile`}
              width={150}
              height={150}
              onClick={profileHandler}
            ></Image>

            <div className="h-full w-fit mx-3 flex flex-col justify-center">
              <h1 className="text-[.95em] font-semibold">
                {user!.username ? user!.username : "New User"}
              </h1>
              <h2 className="text-[.75em]">{user!.email}</h2>
            </div>
          </div>

          <button
            onClick={profileHandler}
            className="flex items-center justify-center mx-4"
          >
            <FontAwesomeIcon
              icon={faPenToSquare}
              color={theme == "light" ? "#0F172A" : "rgba(220,220,220,1)"}
              size="sm"
              className="dark:hover:brightness-50 hover:bg-gray-400 dark:hover:bg-transparent dark:border-gray-200 transition rounded-full shadow border-[.12em] border-slate-800 px-3 py-3"
            />
          </button>

          <div className="flex items-center justify-center">
            <div
              className="min-w-10 min-h-10 flex bg-green-600 rounded-full shadow-md cursor-pointer m-auto hover:brightness-50 transition"
              onClick={() => setIsAdd((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={!isAdd ? faPlus : faCommentDots}
                size="sm"
                color="white"
                className="m-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {isAdd ? <MemoizedPeopleAdd /> : <MemoizedPeople />}
    </section>
  );
};

export const MemoizedLeftbar = React.memo(Leftbar);
