"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import { AuthContext } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faComments,
  faEdit,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ContactContext } from "@/contexts/ContactContext";
import { user } from "@/contexts/AuthContext";
import ReactTextareaAutosize from "react-textarea-autosize";
import supabase from "@/utils/supabase/server";
import { useTheme } from "next-themes";
import { toast, Flip } from "react-toastify";

export const Profile = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const notify = () =>
    toast.success("Profile has been edited!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
      theme: theme,
      transition: Flip,
    });

  const { user, setUser, profile, setProfile, setIsProfile } =
    useContext(AuthContext);
  const { contactsUser, setIndex } = useContext(ContactContext);

  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [status, setStatus] = useState(profile.status);
  const [image, setImage] = useState<null | File>(null);
  const [wallpaper, setWallpaper] = useState<null | File>(null);

  const chatNowHandler = () => {
    const foundIndex =
      contactsUser.length > 0
        ? contactsUser.findIndex((obj) => obj.contactUser.id === profile.id)
        : -1;

    setIndex(foundIndex);

    setIsProfile(false);
  };

  const submitHandler = async () => {
    notify();
    setLoading(true);
    try {
      if (wallpaper) {
        const { error: wallpaperError } = await supabase.storage
          .from("wallpaper")
          .update(`${user.id}.jpg`, wallpaper);

        if (wallpaperError) throw wallpaperError;
      }

      if (image) {
        const { error: imageError } = await supabase.storage
          .from("avatar")
          .update(`${user.id}.jpg`, image);

        if (imageError) throw imageError;
      }

      const { error: userError } = await supabase
        .from("users")
        .update({ username, status })
        .eq("id", user.id);

      if (userError) throw userError;

      setLoading(false);
      setEdit((prev) => !prev);
      setIsProfile(false);

      const newUser: user = JSON.parse(JSON.stringify(user));

      const { data: imageData } = supabase.storage
        .from("avatar")
        .getPublicUrl(`${user.id}.jpg`);

      const { data: wallpaperData } = supabase.storage
        .from("wallpaper")
        .getPublicUrl(`${user.id}.jpg`);

      const d = new Date();
      const n = d.getTime();

      imageData.publicUrl = imageData.publicUrl += "?v=" + n;
      wallpaperData.publicUrl = wallpaperData.publicUrl += "?v=" + n;

      const updatedUser = {
        ...newUser,
        username,
        status,
        image: imageData.publicUrl,
        wallpaper: wallpaperData.publicUrl,
      };

      setUser(updatedUser);
    } catch (err) {
      console.log(err);
    }
  };

  const wallpaperChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWallpaper(e.target.files![0]);

    const wallpaperPath = URL.createObjectURL(e.target.files![0]);
    const newProfile: user = JSON.parse(JSON.stringify(profile));
    newProfile.wallpaper = wallpaperPath;

    setProfile(newProfile);
  };

  const imageChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files![0]);

    const imagePath = URL.createObjectURL(e.target.files![0]);
    const newProfile: user = JSON.parse(JSON.stringify(profile));
    newProfile.image = imagePath;

    setProfile(newProfile);
  };

  return (
    <>
      <div className="bg-black w-full h-full z-30 fixed opacity-70"></div>
      <div className="w-full h-full fixed z-30 flex justify-center">
        <div
          className="m-auto w-[35em] h-[20em] rounded-2xl flex relative shadow bg-blue-100"
          style={{
            backgroundImage: `url("${profile.wallpaper}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {profile.id === user.id && edit && (
            <>
              <label htmlFor="wallpaper">
                <FontAwesomeIcon
                  icon={faImage}
                  className="cursor-pointer hover:scale-105 bg-gray-900 absolute bottom-5 left-0 rounded-full px-3 py-3 ms-4"
                  size="lg"
                />
              </label>
              <input
                accept="image/*"
                name="wallpaper"
                type="file"
                id="wallpaper"
                className="hidden"
                onChange={wallpaperChangeHandler}
                disabled={loading}
              />
            </>
          )}

          {profile.id === user.id &&
            (!edit ? (
              <button
                onClick={() => setEdit((prev) => !prev)}
                disabled={loading}
              >
                <FontAwesomeIcon
                  icon={faEdit}
                  className="cursor-pointer hover:scale-105 transition absolute top-3 left-5 bg-gray-900 rounded-full px-2 py-2"
                  size="sm"
                />
              </button>
            ) : (
              <button onClick={submitHandler} disabled={loading}>
                <FontAwesomeIcon
                  icon={faCheck}
                  className="cursor-pointer hover:scale-105 transition absolute top-3 left-5 bg-gray-900 rounded-full px-2 py-2"
                  size="sm"
                />
              </button>
            ))}

          <div className="h-full w-fit text-center m-auto items flex flex-col items-center justify-center">
            <div>
              {profile.id === user.id && edit && (
                <>
                  <label htmlFor="image">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="cursor-pointer hover:scale-105 bg-gray-900 absolute rounded-full px-2 py-2 ms-4"
                      size="xs"
                    />
                  </label>

                  <input
                    accept="image/*"
                    name="image"
                    type="file"
                    id="image"
                    className="hidden"
                    onChange={imageChangeHandler}
                    disabled={loading}
                  />
                </>
              )}
              <Image
                src={profile.image}
                className="w-20 h-20 rounded-full bg-black m-auto border"
                alt={`${profile.username} profile`}
                width={200}
                height={200}
              />
            </div>

            <div className="mt-2 flex flex-col justify-center items-center w-fit">
              <div
                className="rounded-xl py-1 px-1"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(0,0,0,.7),transparent)",
                }}
              >
                <div className="w-fit flex items-center m-auto">
                  <div
                    className={`${
                      profile.online_status || profile.id === user.id
                        ? "bg-green-400"
                        : "bg-red-500"
                    } rounded-full w-2 h-2`}
                  ></div>
                  <h1
                    className={`text-xs ${
                      profile.online_status || profile.id === user.id
                        ? "text-green-400"
                        : "text-red-500"
                    } ms-2 font-semibold`}
                  >
                    {profile.online_status || profile.id === user.id
                      ? "Online"
                      : "Offline"}
                  </h1>
                </div>

                <ReactTextareaAutosize
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-xl font-semibold relative bg-transparent outline-none text-center w-fit"
                  disabled={!edit}
                  autoFocus
                  maxLength={15}
                />
                <h1 className="text-xs font-semibold">{profile.email}</h1>
                <ReactTextareaAutosize
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="text-sm font-normal mt-2 bg-transparent text-center outline-none font-mono w-fit"
                  disabled={!edit}
                  autoFocus
                  maxLength={44}
                />
              </div>
            </div>

            {!(profile.id === user.id) && (
              <button
                disabled={loading}
                onClick={chatNowHandler}
                className="w-fit h-fit flex justify-center bg-green-500 rounded-full px-4 py-2 hover:brightness-90 hover:scale-95 transition mt-6 shadow-lg"
              >
                <FontAwesomeIcon icon={faComments} size="lg" />
                <h1 className="text-sm mx-2 m-auto font-semibold">Chat Now!</h1>
              </button>
            )}
          </div>

          <button disabled={loading} onClick={() => setIsProfile(false)}>
            <FontAwesomeIcon
              icon={faXmark}
              className="absolute right-4 top-4 cursor-pointer hover:brightness-50 transition w-4 h-4 px-1 py-1 rounded-full shadow-xl bg-slate-900"
              size="lg"
            />
          </button>
        </div>
      </div>
    </>
  );
};
