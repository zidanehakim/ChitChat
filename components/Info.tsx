"use client";
import { AuthContext } from "@/contexts/AuthContext";
import supabase from "@/utils/supabase/server";
import React, { useContext, useEffect, useState } from "react";
import { user } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faUpload } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import ReactTextareaAutosize from "react-textarea-autosize";
import { ErrorMessage, Field, FormikProvider, useFormik } from "formik";
import { initialProfileSchema } from "./YupSchema";
import { toast, Flip } from "react-toastify";
import { useTheme } from "next-themes";

export const Info = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const notify = () =>
    toast.success("Profile has been created!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
      theme: theme,
      transition: Flip,
    });

  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [imageShow, setImageShow] = useState("/default_user.jpg");
  const [wallpaperShow, setWallpaperShow] = useState("/default_wallpaper.jpg");

  const formik = useFormik({
    initialValues: {
      username: "",
      status: "",
      image: new File([""], ""),
      wallpaper: new File([""], ""),
    },
    validationSchema: initialProfileSchema,
    onSubmit: async (values, { resetForm }) => {
      notify();
      setLoading(true);

      const newUser: user = JSON.parse(JSON.stringify(user));
      newUser.username = values.username;
      newUser.status = values.status;
      newUser.image = imageShow;
      newUser.wallpaper = wallpaperShow;

      setUser(newUser);

      try {
        const { error } = await supabase
          .from("users")
          .update({ username: values.username, status: values.status })
          .eq("id", user.id);

        if (error) throw error;

        const { error: imageError } = await supabase.storage
          .from("avatar")
          .upload(`${user.id}.jpg`, values.image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (imageError) throw imageError;

        const { error: wallpaperError } = await supabase.storage
          .from("wallpaper")
          .upload(`${user.id}.jpg`, values.wallpaper, {
            cacheControl: "3600",
            upsert: false,
          });

        if (wallpaperError) throw wallpaperError;

        setLoading(false);
        resetForm();
      } catch (error) {
        console.log(error);
      }
    },
  });

  useEffect(() => {
    const fetchImageAsBlob = async () => {
      try {
        const response1 = await fetch("/default_user.jpg");
        if (!response1.ok) {
          throw new Error("Network response was not ok.");
        }
        const response2 = await fetch("/default_wallpaper.jpg");
        if (!response2.ok) {
          throw new Error("Network response was not ok.");
        }

        const imageBlob = await response1.blob();
        const wallpaperBlob = await response2.blob();
        const imageFile = new File([imageBlob], `${user.id}.jpg`);
        const wallpaperFile = new File([wallpaperBlob], `${user.id}.jpg`);

        formik.setFieldValue("image", imageFile);
        formik.setFieldValue("wallpaper", wallpaperFile);
      } catch (error) {
        console.error("There was a problem fetching the image:", error);
      }
    };

    fetchImageAsBlob();
  }, []);

  const wallpaperChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue("image", e.target.files![0]);

    const path = URL.createObjectURL(e.target.files![0]);
    setWallpaperShow(path);
  };

  const imageChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue("wallpaper", e.target.files![0]);

    const path = URL.createObjectURL(e.target.files![0]);
    setImageShow(path);
  };

  return (
    <FormikProvider value={formik}>
      <div className="bg-black w-full h-full z-30 fixed opacity-70"></div>
      <div className="flex w-full h-full justify-center items-center">
        <div className="w-fit h-fit z-30 flex justify-center items-center flex-col mb-24">
          <div className="h-fit w-fit mb-5 text-center">
            <h1 className="font-bold text-2xl font-mono">Customize Profile</h1>
            <h1 className="text-lg font-mono">
              Choose how you want to be seen
            </h1>
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className="m-auto w-[35em] h-[20em] rounded-2xl flex relative shadow bg-blue-100"
            style={{
              backgroundImage: `url("${wallpaperShow}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
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

            <div className="h-full w-fit text-center m-auto items flex flex-col items-center justify-center">
              <div>
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

                <Image
                  src={imageShow}
                  className="w-20 h-20 rounded-full bg-black m-auto border-4 border-blue-500"
                  alt={`${formik.values.username} profile`}
                  width={200}
                  height={200}
                />
              </div>

              <div className="mt-2 flex flex-col justify-center items-center w-fit">
                <div
                  className="rounded-xl py-1 px-1 flex flex-col justify-center  items-center"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(0,0,0,.7),transparent)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.username}
                    className="text-xl font-semibold relative bg-transparent outline-none text-center w-fit"
                    autoFocus
                    maxLength={15}
                    name="username"
                  />

                  <ReactTextareaAutosize
                    placeholder="Status"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.status}
                    className="text-sm font-normal mt-2 bg-transparent text-center outline-none font-mono w-fit"
                    maxLength={44}
                    name="status"
                    maxRows={3}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-fit h-fit flex justify-center bg-green-500 rounded-full px-4 py-2 hover:brightness-90 hover:scale-95 transition mt-6 shadow-lg mb-3"
                  >
                    <FontAwesomeIcon icon={faUpload} size="lg" />
                    <h1 className="text-sm mx-2 m-auto font-semibold">
                      Create Profile
                    </h1>
                  </button>

                  {formik.errors.username && (
                    <ErrorMessage
                      name="username"
                      component="h1"
                      className="error"
                    />
                  )}
                  {!formik.errors.username && formik.errors.status && (
                    <ErrorMessage
                      name="status"
                      component="h1"
                      className="error"
                    />
                  )}
                  {!formik.errors.username &&
                    !formik.errors.status &&
                    formik.errors.image && (
                      <ErrorMessage
                        name="image"
                        component="h1"
                        className="error"
                      />
                    )}
                  {!formik.errors.username &&
                    !formik.errors.status &&
                    !formik.errors.image &&
                    formik.errors.wallpaper && (
                      <ErrorMessage
                        name="wallpaper"
                        component="h1"
                        className="error"
                      />
                    )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormikProvider>
  );
};
