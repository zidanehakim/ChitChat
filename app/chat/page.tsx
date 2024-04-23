"use client";

import { CSSProperties, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/server";
import { Info } from "@/components/Info";
import { AuthContext } from "@/contexts/AuthContext";
import { MemoizedLeftbar } from "@/components/Leftbar";
import { MemoizedRightbar } from "@/components/Rightbar";
import { ContactContext, ListContacts } from "@/contexts/ContactContext";
import { Menu } from "@/components/Menu";

import { Poppins } from "next/font/google";
import { Profile } from "@/components/Profile";
import { ImageViewer } from "@/components/ImageViewer";
import { useTheme } from "next-themes";

import { HashLoader } from "react-spinners";

import { Flip, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["devanagari"],
});

export default function Dashboard() {
  const { systemTheme, theme, setTheme } = useTheme();
  const router = useRouter();

  const { user, setUser, isProfile, isImage, setContextIndex } =
    useContext(AuthContext);

  const { contactsUser, setContactsUser, index, setIndex } =
    useContext(ContactContext);

  const [load, setLoad] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoad(true);
        const session = (await supabase.auth.getSession()).data.session;

        if (!session) router.replace("/");
        else {
          const { error } = await supabase.from("users").upsert(
            {
              email: session.user.email,
              online_status: true,
              auth_id: session.user.id,
            },
            { onConflict: "auth_id" }
          );

          if (error) throw error;

          fetch(
            `https://www.chitchat-now.xyz/api/updatestatus/${session?.user.id}`,
            {
              method: "POST",
              keepalive: true,
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(true),
            }
          );

          getUserData();
        }

        const updateOffline = async () => {
          fetch(
            `https://www.chitchat-now.xyz/api/updatestatus/${session?.user.id}`,
            {
              method: "POST",
              keepalive: true,
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(false),
            }
          );
        };
        // Add event listener for beforeunload
        window.addEventListener("unload", updateOffline);

        return () => {
          window.removeEventListener("unload", updateOffline);
        };
      } catch (err) {
        console.error(err);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel("chatbox")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chatbox",
        },
        updateUserData
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chatbox",
          filter: `p1_id=neq.${user.id}`,
        },
        updateUserData
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chatbox",
        },
        updateUserData
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [index, contactsUser]);

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode");
    darkMode && setTheme(darkMode!);
  }, []);

  const getUserData = async () => {
    const session = (await supabase.auth.getSession()).data.session;

    const id = session?.user.id;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", id)
      .single();

    if (userError) throw userError;

    const { data: image } = supabase.storage
      .from("avatar")
      .getPublicUrl(`${user.id}.jpg`);
    const { data: wallpaper } = supabase.storage
      .from("wallpaper")
      .getPublicUrl(`${user.id}.jpg`);

    const d = new Date();
    const n = d.getTime();

    image.publicUrl = image.publicUrl += "?v=" + n;
    wallpaper.publicUrl = wallpaper.publicUrl += "?v=" + n;

    user.image = image.publicUrl;
    user.wallpaper = wallpaper.publicUrl;

    setUser(user);

    const { data: chatboxes, error: chatboxesError } = await supabase
      .from("chatbox")
      .select("*")
      .or(`p1_id.eq.${user.id},p2_id.eq.${user.id}`)
      .order("last_time", { ascending: false });

    if (chatboxesError) throw chatboxesError;

    // Define an array to store contact information
    const contactsPromise = Promise.all(
      chatboxes!.map(async (a) => {
        const { data } =
          user.id === a.p1_id
            ? await supabase
                .from("users")
                .select("*")
                .eq("id", a.p2_id)
                .single()
            : await supabase
                .from("users")
                .select("*")
                .eq("id", a.p1_id)
                .single();

        const { data: image } = supabase.storage
          .from("avatar")
          .getPublicUrl(`${user.id === a.p1_id ? a.p2_id : a.p1_id}.jpg`);

        const { data: wallpaper } = supabase.storage
          .from("wallpaper")
          .getPublicUrl(`${user.id === a.p1_id ? a.p2_id : a.p1_id}.jpg`);

        const d = new Date();
        const n = d.getTime();

        image.publicUrl = image.publicUrl += "?v=" + n;
        wallpaper.publicUrl = wallpaper.publicUrl += "?v=" + n;
        return {
          ...data,
          image: image.publicUrl,
          wallpaper: wallpaper.publicUrl,
          last_message: a.last_message,
          last_time: a.last_time,
        };
      })
    );

    const chatsPromise = Promise.all(
      chatboxes.map(async (a) => {
        const { data: chats, error: chatsError } = await supabase
          .from("chats")
          .select("*")
          .eq("chatbox_id", a.id)
          .order("created_at", { ascending: true });

        if (chatsError) throw chatsError;

        return chats;
      })
    );

    await Promise.all([chatsPromise, contactsPromise]).then(
      ([chats, contacts]) => {
        const initialContactsUser: ListContacts[] = chatboxes.map(
          (a, index) => ({
            chatboxID: a.id,
            contactUser: contacts[index],
            chats: chats[index],
          })
        );

        setContactsUser(initialContactsUser);
        setLoad(false);
      }
    );
  };

  const updateUserData = async () => {
    const { data: chatboxes, error: chatboxesError } = await supabase
      .from("chatbox")
      .select("*")
      .or(`p1_id.eq.${user.id},p2_id.eq.${user.id}`)
      .order("last_time", { ascending: false });

    if (chatboxesError) throw chatboxesError;

    // Define an array to store contact information
    const contactsPromise = Promise.all(
      chatboxes!.map(async (a) => {
        const id = user.id === a.p1_id ? a.p2_id : a.p1_id;

        const { data: image } = supabase.storage
          .from("avatar")
          .getPublicUrl(`${id}.jpg`);

        const { data: wallpaper } = supabase.storage
          .from("wallpaper")
          .getPublicUrl(`${id}.jpg`);

        const { data } =
          user.id === a.p1_id
            ? await supabase
                .from("users")
                .select("*")
                .eq("id", a.p2_id)
                .single()
            : await supabase
                .from("users")
                .select("*")
                .eq("id", a.p1_id)
                .single();

        return {
          ...data,
          image: image.publicUrl,
          wallpaper: wallpaper.publicUrl,
          last_message: a.last_message,
          last_time: a.last_time,
        };
      })
    );

    const chatsPromise = Promise.all(
      chatboxes.map(async (a) => {
        const { data: chats, error: chatsError } = await supabase
          .from("chats")
          .select("*")
          .eq("chatbox_id", a.id)
          .order("created_at", { ascending: true });

        if (chatsError) throw chatsError;

        return chats;
      })
    );

    await Promise.all([chatsPromise, contactsPromise]).then(
      ([chats, contacts]) => {
        const updatedContactsUser: ListContacts[] = chatboxes.map(
          (a, index) => ({
            chatboxID: a.id,
            contactUser: contacts[index],
            chats: chats[index],
          })
        );

        if (index !== -1) {
          const updatedIndex = updatedContactsUser.findIndex(
            (a) => a.contactUser.id === contactsUser[index].contactUser.id
          );
          setIndex(updatedIndex);
        }

        setContactsUser(updatedContactsUser);
      }
    );
  };

  return !load ? (
    <main className={poppins.className} onClick={() => setContextIndex(-1)}>
      <>
        <Head>
          <title>My page title</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme={theme === "dark" ? "dark" : "light"}
          transition={Flip}
        />
        {isProfile && <Profile />}
        {isImage && <ImageViewer />}

        <div
          className="bg-gray-200 dark:bg-slate-900 align-center overflow-y-hidden overflow-x-auto h-[100vh] w-[100vw] font-primary"
          style={{
            backgroundImage: `url(/${
              theme === "light" ? "pattern_light" : "pattern_dark"
            }.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex w-[100vw] h-[100vh] px-[1%] py-[.5%] gap-1">
            <Menu />
            <MemoizedLeftbar />
            <MemoizedRightbar />
          </div>
          {!user?.username && (
            <div className="w-[100vw] h-[100vh] z-50 fixed top-0">
              <Info />
            </div>
          )}
        </div>
      </>
    </main>
  ) : (
    <div className="flex flex-col text-center justify-center items-center w-full h-[100vh] bg-white dark:bg-gray-950">
      <HashLoader
        className="mb-8"
        color={theme === "dark" ? "white" : "black"}
        loading={load}
        aria-label="Loading Spinner"
        data-testid="loader"
        size={90}
      />
    </div>
  );
}
