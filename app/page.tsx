"use client";
import {
  IconDefinition,
  faBorderStyle,
  faCheckDouble,
  faDownload,
  faHeadset,
  faMessage,
  faPalette,
  faRightToBracket,
  faServer,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faGithub,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { Variants, motion } from "framer";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Login } from "@/components/Login";
import { Flip, ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["devanagari"],
});

const levitatingVariants: Variants = {
  initial: {
    y: [-10, 10],
    rotate: 0,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },

  initialReverse: {
    y: [10, -10],
    rotate: 0,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export default function Home() {
  const { systemTheme, theme, setTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode");
    if (!darkMode) localStorage.setItem("darkMode", "dark");
  }, []);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
        transition={Flip}
      />
      {isLogin && (
        <div className={poppins.className}>
          <Login setIsLogin={setIsLogin} />
        </div>
      )}
      <section
        className={`flex flex-col w-[100vw] h-fit overflow-hidden ${poppins.className}`}
      >
        <nav className="flex w-full h-fit justify-evenly py-5 fixed z-20 shadow-sm from-black to-transparent bg-gradient-to-b">
          <Image
            className="self-start cursor-pointer"
            src="/cover_dark.png"
            width={180}
            height={180}
            alt="logo"
          ></Image>

          <div className="flex flex-row items-center justify-center">
            <div className="sm:flex hidden w-fit h-fit gap-3">
              <a href="https://github.com/zidanehakim" target="_blank">
                <FontAwesomeIcon
                  icon={faGithub as IconDefinition}
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>

              <a
                href="https://www.instagram.com/yazidanehakim/"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faInstagram as IconDefinition}
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>

              <a href="https://www.facebook.com/ZidanyuChan/" target="_blank">
                <FontAwesomeIcon
                  icon={faFacebook as IconDefinition}
                  target="_blank_"
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>

              <a
                href="https://www.linkedin.com/in/yazidane-hakim-25754128a/"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faLinkedin as IconDefinition}
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(true);
              }}
              className="bg-green-700 text-sm px-7 py-2 rounded-sm font-semibold box-border transition hover:brightness-50 ms-6 text-white dark:text-white"
            >
              Log in
            </button>
          </div>
        </nav>

        <div
          className="w-[100vw] h-[100vh] bg-gray-950 relative flex"
          style={{
            boxShadow: " inset 0px 70px 100px -4px rgba(0,0,0,0.75)",
            backgroundImage: `url("/wallpaper.svg")`,
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col lg:flex-row m-auto w-fit h-fit px-8">
            <div className="flex flex-col justify-center items-end w-fit text-white">
              <div className="w-fit h-fit text-start lg:text-end max-w-[30em]">
                <h1 className="text-[4em] sm:text-[5em] font-bold bg-gradient-to-r from-purple-200 via-green-500 to-blue-300 bg-clip-text text-transparent">
                  ChitChat.
                </h1>
                <h1 className="text-[2em] sm:text-[2.5em] font-semibold leading-tight ">
                  Chat makes{" "}
                  <span className="font-bold bg-gradient-to-r from-green-400 to-green-900 bg-clip-text text-transparent">
                    easy
                  </span>
                  <br />
                  discover
                  <span className="font-bold bg-gradient-to-r from-purple-400 to-purple-900 bg-clip-text text-transparent">
                    {" "}
                    seamless
                  </span>
                  <br />
                  chatting app
                </h1>
                <h1 className="text-lg mt-8 text-gray-300 text-start lg:text-end">
                  Simple, elegant, and modern chat app
                </h1>

                <div className="flex flex-row h-fit w-fit lg:ml-auto">
                  <div className="flex w-fit mt-8 mx-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsLogin(true);
                      }}
                      className="bg-blue-600 text-sm px-5 py-2 rounded-sm font-semibold transition hover:brightness-50"
                    >
                      <FontAwesomeIcon
                        icon={faRightToBracket}
                        className="me-3"
                      />
                      Try Now!
                    </button>
                  </div>

                  <div className="flex w-fit mt-8 ml-auto">
                    <a
                      className="bg-transparent border-2 text-md px-5 py-2 rounded-sm font-semibold transition hover:brightness-50 cursor-pointer"
                      href="https://github.com/zidanehakim"
                    >
                      <FontAwesomeIcon
                        icon={faGithub as IconDefinition}
                        className="me-2"
                      />
                      Github
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:flex hidden justify-start items-center w-full relative pe-10">
              <Image
                src="/bg.png"
                width={400}
                height={400}
                alt="Graphics"
                className="brightness-150"
              ></Image>

              <motion.div className="flex flex-col w-56 absolute -right-[1em]">
                <motion.div
                  animate="initial"
                  variants={levitatingVariants}
                  drag
                  dragConstraints={{
                    top: -1,
                    right: 1,
                    bottom: 1,
                    left: -1,
                  }}
                  className="py-1 h-fit relative flex justify-end"
                >
                  <div className="flex">
                    <div className="flex h-fit px-3 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[55em] shadow bg-green-700 text-white cursor-pointer">
                      <p className="self-center break-all overflow whitespace-wrap py-2">
                        Hii!
                      </p>
                      <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                        <p className="text-[.8em]">11:00</p>

                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          className="ms-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={["initialReverse"]}
                  variants={levitatingVariants}
                  drag
                  dragConstraints={{
                    top: -1,
                    right: 1,
                    bottom: 1,
                    left: -1,
                  }}
                  className="py-1 h-fit relative flex justify-start"
                >
                  <div className="flex">
                    <div className="flex h-fit px-3 text-sm rounded-es-2xl rounded-e-xl m-auto max-w-[55em] shadow bg-slate-900 border text-white cursor-pointer">
                      <p className="self-center break-all overflow whitespace-wrap py-2">
                        Hello!
                      </p>
                      <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                        <p className="text-[.8em]">11:01</p>

                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          className="ms-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={["initial"]}
                  variants={levitatingVariants}
                  drag
                  dragConstraints={{
                    top: -1,
                    right: 1,
                    bottom: 1,
                    left: -1,
                  }}
                  className="py-1 h-fit relative flex justify-center"
                >
                  <div className="flex">
                    <div className="flex h-fit px-3 text-sm rounded-ee-2xl rounded-s-xl m-auto max-w-[55em] shadow bg-green-700 text-white cursor-pointer">
                      <p className="self-center break-all overflow whitespace-wrap py-2">
                        What's ur name?
                      </p>
                      <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                        <p className="text-[.8em]">11:00</p>

                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          className="ms-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={["initialReverse"]}
                  variants={levitatingVariants}
                  drag
                  dragConstraints={{
                    top: -1,
                    right: 1,
                    bottom: 1,
                    left: -1,
                  }}
                  className="py-1 h-fit relative flex justify-start"
                >
                  <div className="flex">
                    <div className="flex h-fit px-3 text-sm rounded-es-2xl rounded-e-xl m-auto max-w-[55em] shadow bg-slate-900 border text-white cursor-pointer">
                      <p className="self-center break-all overflow whitespace-wrap py-2">
                        I'm Zidane, nice to meet u!
                      </p>
                      <div className="self-end mt-3 ps-3 flex h-fit w-fit">
                        <p className="text-[.8em]">11:01</p>

                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          className="ms-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={["initials"]}
                  variants={levitatingVariants}
                  className="m-auto rounded-full min-w-24 max-w-24 h-10 relative px-1 py-[1.2em] mt-8 border"
                  style={{
                    backgroundImage: `url(${!dark ? "/sun.jpg" : "/moon.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full bg-white m-auto absolute left-1/2 -translate-x-1/2 cursor-pointer shadow-xl"
                    animate={{
                      left: !dark ? 20 : 73,
                      x: -16,
                      y: -15,
                      rotate: !dark ? 180 : 0,
                    }}
                    style={{
                      backgroundImage: `url(${
                        !dark ? "/sun.png" : "/moon.png"
                      })`,
                      backgroundSize: "70%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    onClick={() => setDark((prev) => !prev)}
                  ></motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        <div
          className="w-[100vw] h-fit py-[8em] bg-gray-950 relative flex"
          style={{
            backgroundImage:
              " radial-gradient(circle at 37%, rgb(20,120,255,.15) 0%, rgb(3 7 18 / var(--tw-bg-opacity)) 25%)",
          }}
        >
          <div className="flex w-fit m-auto flex-col lg:flex-row h-fit gap-6 px-8">
            <div className="flex flex-col justify-center items-center max-w-[30em] text-white">
              <div className="w-fit h-fit text-center lg:text-end">
                <h1 className="text-[2.5em] sm:text-[3em] font-semibold leading-tight">
                  Custom themes in
                  <span className="font-bold bg-gradient-to-r from-purple-400 to-purple-900 bg-clip-text text-transparent">
                    {" "}
                    dark
                  </span>{" "}
                  or{" "}
                  <span className="font-bold bg-gradient-to-r from-blue-300 to-blue-900 bg-clip-text text-transparent">
                    light.
                  </span>
                </h1>
                <h1 className="text-lg mt-8 text-gray-300 max-w-96 m-auto lg:m-0 lg:mt-8 lg:text-end lg:ml-auto">
                  Switch from light to dark mode as you prefer easily with
                  switch
                </h1>
              </div>
            </div>

            <div className="flex items-center justify-center m-auto">
              <Image
                src="/1.png"
                width={350}
                height={350}
                alt="Graphics"
              ></Image>
            </div>
          </div>
        </div>

        <div
          className="w-[100vw] h-fit py-[8em] bg-gray-950 relative flex"
          style={{
            backgroundImage:
              " radial-gradient(circle at 55%, rgba(160,32,240,.15) 0%, rgb(3 7 18 / var(--tw-bg-opacity)) 25%)",
          }}
        >
          <div className="flex flex-col lg:flex-row w-fit h-fit m-auto">
            <div className="lg:flex hidden items-center w-fit relative px-10">
              <Image
                src="/2.png"
                width={250}
                height={250}
                alt="Graphics"
              ></Image>
            </div>

            <div className="flex justify-center items-start max-w-[30em] text-white px-8">
              <div className="w-fit h-fit text-center lg:text-start">
                <h1 className="text-[3em] font-semibold leading-tight">
                  Smart
                  <span className="font-bold bg-gradient-to-r from-purple-400 to-purple-900 bg-clip-text text-transparent">
                    {" "}
                    sync
                  </span>{" "}
                  <br />
                  database.
                </h1>
                <h1 className="text-lg mt-8 text-gray-300 m-auto lg:m-0 lg:mt-8 lg:text-start lg:ml-auto max-w-96">
                  Your conversations are where you are, on any device, anytime.
                </h1>
              </div>
            </div>

            <div className="flex lg:hidden items-center justify-center m-auto w-fit relative pt-10 lg:pt-0">
              <Image
                src="/2.png"
                width={250}
                height={250}
                alt="Graphics"
              ></Image>
            </div>
          </div>
        </div>

        <div
          className="w-[100vw] h-fit py-[8em] bg-gray-950 relative flex "
          style={{
            backgroundImage:
              " radial-gradient(circle at 37%, rgba(0,200,128,.15) 0%, rgb(3 7 18 / var(--tw-bg-opacity)) 25%)",
          }}
        >
          <div className="flex flex-col lg:flex-row m-auto w-fit h-fit">
            <div className="flex flex-col justify-center items-end max-w-[30em] text-white px-8">
              <div className="w-fit h-fit text-center lg:text-end">
                <h1 className="text-[3em] font-semibold leading-tight">
                  File sharing be
                  <span className="font-bold bg-gradient-to-r from-green-400 to-green-900 bg-clip-text text-transparent">
                    {" "}
                    easier{" "}
                  </span>
                  for users.
                </h1>
                <h1 className="text-lg mt-2 text-gray-300 m-auto text-center lg:m-0 lg:my-8 lg:text-end lg:ml-auto max-w-96">
                  Drag and drop files, photos, and more with instant sync.
                </h1>
              </div>
            </div>

            <div className="flex items-center justify-center m-auto relative pt-10 lg:pt-0 px-10">
              <Image
                src="/3.png"
                width={250}
                height={250}
                alt="Graphics"
              ></Image>
            </div>
          </div>
        </div>

        <div
          className="w-[100vw] h-fit pt-[10em] bg-gray-950 relative flex flex-col"
          style={{
            backgroundImage:
              " radial-gradient(circle at 50%, rgba(0,255,255,.15) 0%, rgb(3 7 18 / var(--tw-bg-opacity)) 40%)",
          }}
        >
          <div className="flex flex-col justify-center items-center w-full text-white px-8">
            <div className="w-fit h-fit text-center">
              <h1 className="text-[3em] font-semibold leading-tight bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 bg-clip-text text-transparent">
                And most importantly
              </h1>
              <h1 className="text-lg mt-2 text-gray-300 text-center max-w-96 m-auto">
                As a great chatting app, we have our own values.
              </h1>
            </div>
          </div>

          <div className="flex justify-center items-center relative py-[5em] w-[80vw] flex-wrap m-auto gap-4">
            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faMessage}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Instant Messaging
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  ChitChat is optimized for speed, ensuring that your
                  conversations keep up with your thoughts.
                </p>
              </div>
            </div>

            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faBorderStyle}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Intuitive User Interface
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  Navigate with ease through ChitChat’s straightforward and
                  attractive interface, designed for clarity and simplicity.
                </p>
              </div>
            </div>

            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faHeadset}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Dedicated Support Team
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  ChitChat's customer support is just a message away, providing
                  you with prompt and helpful service whenever you need it.
                </p>
              </div>
            </div>

            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faPalette}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Customizable Themes
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  Tailor your chat experience with customizable themes,
                  including a choice between a soothing dark mode and a bright
                  light mode.
                </p>
              </div>
            </div>

            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faServer}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Real-time Synchronization
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  Seamlessly continue conversations across different devices
                  with real-time synchronization, so you never miss a message.
                </p>
              </div>
            </div>

            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faTruckFast}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Optimized for Performance
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  ChitChat doesn't just run fast; it’s also light on resources,
                  preserving your device’s battery and data usage.
                </p>
              </div>
            </div>

            <div className="flex w-72 h-40 px-1 py-3 bg-slate-900 shadow-xl border rounded-lg">
              <FontAwesomeIcon
                icon={faDownload}
                color="lightgreen"
                size="lg"
                className="bg-green-900 rounded-full px-2 py-2 mx-2"
              />
              <div className="flex flex-col">
                <h1 className="text-md font-bold text-green-400">
                  Consistent Updates
                </h1>
                <p className="text-sm pe-2 text-white dark:text-white">
                  Benefit from an app that grows and improves with regular
                  updates, new features, and enhancements tailored to user
                  feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-[100vw] h-fit pt-[4em] pb-[2em] bg-gray-950 relative flex flex-col"
          style={{
            backgroundImage:
              " linear-gradient(to bottom, rgb(3 7 18 / var(--tw-bg-opacity)) 1%,black)",
          }}
        >
          <div className="flex flex-col justify-center items-center w-full text-white">
            <div className="flex gap-4 pb-6">
              <a href="https://github.com/zidanehakim" target="_blank">
                <FontAwesomeIcon
                  icon={faGithub as IconDefinition}
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>

              <a
                href="https://www.instagram.com/yazidanehakim/"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faInstagram as IconDefinition}
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>

              <a href="https://www.facebook.com/ZidanyuChan/" target="_blank">
                <FontAwesomeIcon
                  icon={faFacebook as IconDefinition}
                  target="_blank_"
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>

              <a
                href="https://www.linkedin.com/in/yazidane-hakim-25754128a/"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faLinkedin as IconDefinition}
                  size="xl"
                  className="cursor-pointer hover:scale-125 transition"
                />
              </a>
            </div>
            <h1>© 2024 Hakim, Yazidane All right reserved</h1>
          </div>
        </div>
      </section>
    </>
  );
}
