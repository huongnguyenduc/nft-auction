import Image from "next/image";
import Router from "next/router";
import React from "react";
import { getShortAddress } from "../utils/utils";
import useHover from "./CustomHook/useHover";

const CollectionItem = ({ collection, account, canEdit }) => {
  const { name, address, description, image, banner, owner } = collection;
  const [hoverCollectionRef, isHoveredCollection] = useHover();
  return (
    <div
      onClick={() => Router.push(`/collections/${address}`)}
      ref={hoverCollectionRef}
      className="w-full border hover:shadow-lg pb-[22px] cursor-pointer rounded-xl overflow-hidden relative"
    >
      {isHoveredCollection && canEdit ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            Router.push(`/collections/edit?address=${address}`);
          }}
          className="rounded-[10px] bg-white overflow-hidden opacity-90 p-2 flex justify-center items-center hover:opacity-100 absolute right-3 top-3 z-10 cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
            focusable="false"
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-testid="EditIcon"
            tabIndex="-1"
            title="Edit"
          >
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
          </svg>
        </div>
      ) : (
        <></>
      )}
      <div className="h-[199px] w-full relative overflow-hidden">
        <Image
          layout="fill"
          objectFit="cover"
          src={banner}
          alt="collection-banner"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="mt-[-36px] w-full relative p-[10px]">
        <div className="flex justify-center">
          <div className="flex justify-center items-center w-[50px] h-[50px] rounded-[50px] bg-white border">
            <div className="h-[44px] w-[44px] rounded-[44px] relative overflow-hidden">
              <Image
                layout="fill"
                objectFit="cover"
                src={image}
                alt="collection-avatar"
              />
            </div>
          </div>
        </div>
        <p className="mt-8 w-full text-center font-semibold text-base">
          {name}
        </p>
        <div className="mt-2 flex w-full justify-center">
          <div className="flex gap-1 items-center">
            <p className="font-medium text-sm">by </p>
            <p className="font-medium text-sm text-blue-400 mt-0">
              {getShortAddress(owner, account)}
            </p>
          </div>
        </div>
        <div className="mt-4 w-full flex justify-center">
          <p className="text-center max-w-[80%] text-base">
            {description
              ? description.length < 114
                ? description
                : description.substring(0, 114)
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollectionItem;
