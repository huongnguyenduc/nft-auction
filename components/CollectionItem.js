import Image from "next/image";
import Router from "next/router";
import React from "react";
import { getShortAddress } from "../utils/utils";

const CollectionItem = ({ collection }) => {
  const { name, address, description, image, banner, owner } = collection;
  return (
    <div
      onClick={() => Router.push(`/collections/${address}`)}
      className="w-full border hover:shadow-lg pb-[22px] cursor-pointer rounded-xl overflow-hidden"
    >
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
              {getShortAddress(owner)}
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
