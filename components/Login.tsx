"use client";

import {
  faLongArrowLeft,
  faRightToBracket,
  faSquareCaretLeft,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorMessage, useFormik } from "formik";
import { motion } from "framer";
import React, { useEffect, useState } from "react";
import { loginSchema } from "./YupSchema";
import supabase from "@/utils/supabase/server";
import { useRouter } from "next/navigation";
import OtpInput from "react-otp-input";
import { toast } from "react-toastify";

type LoginProps = {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

const appearVariants = {
  hidden: { width: "0vw", height: "0vh" },
  visible: {
    width: ["2vw", "100vw", "100vw"],
    height: ["2vh", "0vh", "100vh"],
  },
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 100],
    bottom: [0, 10],
    transition: {
      delay: 1,
      duration: 0.5,
    },
  },
};

export const Login = ({ setIsLogin }: LoginProps) => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { resetForm }) => {
      setVerification(true);

      const sendOtp = async () => {
        setTimer(60);
        await supabase.auth.signInWithOtp({
          email: values.email,
        });
      };

      timer <= 0 && sendOtp();
    },
  });

  const [verification, setVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;

        if (session) router.replace("/chat");
      } catch (error) {
        console.log(error);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const verifyOtp = async () => {
      try {
        const id = toast.loading("Signing in...");

        const { error } = await supabase.auth.verifyOtp({
          email: formik.values.email,
          token: otp,
          type: "email",
        });

        if (error) {
          toast.update(id, {
            render: "Incorrect OTP 🤯",
            type: "error",
            isLoading: false,
            autoClose: 5000,
            closeOnClick: true,
          });
          throw error;
        } else
          toast.update(id, {
            render: "Correct OTP 👌",
            type: "success",
            isLoading: false,
            autoClose: 5000,
            closeOnClick: true,
          });

        router.replace("/chat");
        setVerification(false);
        setIsLogin(false);
      } catch (error) {
        console.log(error);
      }
    };

    if (otp.length >= 6 && verification) verifyOtp();
  }, [otp]);

  useEffect(() => {
    const timeout = setInterval(
      () => timer > 0 && setTimer((prev) => prev - 1),
      1000
    );
    return () => {
      clearInterval(timeout);
    };
  }, [otp, verification, timer]);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={appearVariants}
      className="fixed h-fit bg-[rgba(0,0,0,0.8)] z-50 flex flex-col justify-center items-center top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 shadow-xl"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="w-fit h-fit text-black bg-white relative rounded-xl"
      >
        <button
          className="z-30 absolute top-2 right-2 hover:scale-105 transition"
          onClick={() => {
            setVerification(false);
            setIsLogin(false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} color="black" size="xl" />
        </button>

        <div className="w-64 sm:min-w-80 h-fit flex from-green-800 to-green-950 bg-gradient-to-r rounded-lg shadow-xl absolute left-1/2 -translate-x-1/2 top-[-3em]">
          <div className="mx-6 w-fit h-fit px-5 py-5">
            <h1 className="text-white font-bold text-xl">Sign in</h1>
            <h1 className="text-gray-200 text-md">Starts chatting today!</h1>
          </div>
        </div>

        <div className="min-w-[20em] sm:min-w-[25em] h-fit m-auto mt-[5.5em] sm:mt-[4.4em]">
          <div className="w-4/5 h-fit m-auto">
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4 w-full h-fit m-auto"
            >
              {!verification ? (
                <>
                  <div className="bg-zinc-200 w-full h-fit text-gray-900 rounded-md py-3 px-2 flex items-center m-auto border border-gray-600">
                    <FontAwesomeIcon
                      icon={faUser}
                      color="#303030"
                      className="mx-3"
                    />
                    <input
                      type="text"
                      className="rounded-md outline-none bg-transparent dark:bg-transparent w-full h-full text-sm"
                      placeholder="Email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.errors.email && (
                    <h1 className="error">{formik.errors.email}</h1>
                  )}

                  <button
                    disabled={verification}
                    type="submit"
                    className="bg-gray-950 text-white font-semibold m-auto w-full py-3 rounded-md flex items-center justify-center px-5 hover:brightness-50 transition text-sm"
                  >
                    Sign in
                    <FontAwesomeIcon
                      icon={faRightToBracket}
                      color="white"
                      className="mx-2 ml-auto"
                    />
                  </button>

                  <h1 className="text-gray-950 brightness-100 text-sm mb-10 mt-3">
                    Sign in now, it's totally free.
                  </h1>
                </>
              ) : (
                <>
                  <div className="sm:flex m-auto hidden">
                    <OtpInput
                      inputStyle={{
                        fontSize: "1.3em",
                        margin: "auto",
                        width: "2.4em",
                        height: "2.4em",
                        border: "1px solid #303030",
                        color: "black",
                        borderRadius: ".3em .3em .3em .3em",
                        outlineColor: "green",
                        backgroundColor: "transparent",
                      }}
                      value={otp.toUpperCase()}
                      onChange={setOtp}
                      numInputs={6}
                      renderSeparator={<span className="mx-[.2em]"></span>}
                      renderInput={(props) => <input {...props} />}
                    />
                  </div>

                  <div className="flex m-auto sm:hidden">
                    <OtpInput
                      inputStyle={{
                        fontSize: "1.2em",
                        margin: "auto",
                        width: "2em",
                        height: "2em",
                        border: "1px solid #303030",
                        color: "black",
                        borderRadius: ".3em .3em .3em .3em",
                        outlineColor: "green",
                        backgroundColor: "transparent",
                      }}
                      value={otp.toUpperCase()}
                      onChange={setOtp}
                      numInputs={6}
                      renderSeparator={<span className="mx-[.2em]"></span>}
                      renderInput={(props) => <input {...props} />}
                    />
                  </div>

                  <div className="w-full h-fit flex flex-row justify-between items-center">
                    <div className="w-full">
                      <FontAwesomeIcon
                        className="cursor-pointer"
                        icon={faLongArrowLeft}
                        size="xl"
                        onClick={() => {
                          setVerification(false);
                          setOtp("");
                        }}
                      />
                    </div>

                    <div className="w-full text-end">
                      <button
                        className={`text-xs font-normal w-fit ${
                          timer <= 0 ? "text-blue-400" : "text-gray-500"
                        }`}
                        onClick={() => setTimer(60)}
                        disabled={timer > 0}
                      >
                        Resend {timer > 0 && timer}
                      </button>
                    </div>
                  </div>
                  <h1 className="text-gray-950 brightness-100 text-sm mb-10">
                    Enter the otp being sent to your email!
                  </h1>
                </>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
