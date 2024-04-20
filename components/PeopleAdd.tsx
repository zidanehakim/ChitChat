"use client";
import { AuthContext, user } from "@/contexts/AuthContext";
import supabase from "@/utils/supabase/server";
import React, { useContext, useEffect, useState } from "react";
import { MemoizedContact } from "./Contact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "next-themes";

export const PeopleAdd = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [otherContacts, setOtherContacts] = useState([] as user[]);

  const searchHandler = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`email.eq.${search},username.ilike.*${search}*`);

      if (error) throw error;

      const newOtherContacts: user[] = data
        .filter((a) => a.id !== user.id)
        .map((a) => {
          const { data: image } = supabase.storage
            .from("avatar")
            .getPublicUrl(`${a.id}.jpg`);

          return { ...a, image: image.publicUrl };
        });

      setOtherContacts(newOtherContacts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    search.length >= 3 ? searchHandler() : setOtherContacts([] as user[]);
  }, [search]);

  return (
    <div className="h-full relative text-black dark:text-gray-300 flex flex-col gap-1 w-full">
      <div className="w-full flex px-5 items-center bg-white dark:bg-gray-950 rounded-b-lg shadow-lg py-3">
        <h1 className="text-xl font-bold me-3">Add</h1>
        <div className="border border-gray-500 text-black dark:text-gray-50 dark:border-gray-800 text-xs font-normal py-2 rounded-full w-full px-5 flex">
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
          <h1 className="font-bold text-lg mx-5">Search Results</h1>
          {otherContacts.length > 0 && (
            <h1 className="font-bold text-xs mb-3 mx-5 text-gray-700">{`Found ${otherContacts.length} users`}</h1>
          )}

          {otherContacts?.map((user, index) => {
            return (
              <MemoizedContact indexes={index} key={index} contact={user} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MemoizedPeopleAdd = React.memo(PeopleAdd);
