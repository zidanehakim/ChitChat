import React, { useContext, useState } from "react";
import Image from "next/image";
import { AuthContext } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronRight,
  faCircleChevronLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export const ImageViewer = () => {
  const { image, setIsImage, imageIndex, setImageIndex } =
    useContext(AuthContext);

  console.log(image);

  return (
    <>
      <div className="bg-black w-full h-full z-30 fixed opacity-70"></div>
      <div className="w-full h-full fixed z-30 flex justify-center">
        <div className="fixed top-4 right-4 z-20 cursor-pointer">
          <FontAwesomeIcon
            icon={faXmark}
            size="2xl"
            onClick={() => setIsImage(false)}
          />
        </div>

        <div
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer px-8 ${
            imageIndex <= 0 && "hidden"
          }`}
          onClick={() => {
            setImageIndex((prev) => prev - 1);
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronLeft} size="3x" />
        </div>

        <div
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer px-8 ${
            imageIndex >= image.length - 1 && "hidden"
          }`}
          onClick={() => {
            setImageIndex((prev) => prev + 1);
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronRight} size="3x" />
        </div>

        <div className="flex flex-col justify-center pt-10 items-center w-full relative">
          <div className="flex h-full">
            <Image
              src={image[imageIndex].blob!}
              width={400}
              height={400}
              alt="a"
              className="m-auto"
            />
          </div>

          <div className="max-w-[100vw] min-w-[100vw] h-32 border-t overflow-x-auto flex">
            <div className="w-fit h-fit flex justify-start gap-2 m-auto">
              {image.map((a, index) => (
                <div
                  key={index}
                  className={`hover:scale-90 transition w-24 h-24 flex cursor-pointer flex-shrink-0 ${
                    imageIndex === index && "scale-90"
                  }`}
                  onClick={() => setImageIndex(index)}
                >
                  <Image
                    src={a.blob!}
                    width={100}
                    height={100}
                    alt={`Image ${index}`}
                    className={`m-auto border-4 border-gray-700 hover:border-yellow-500 rounded-xl ${
                      imageIndex === index && "border-yellow-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
