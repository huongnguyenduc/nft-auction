import React from "react";
import Router from "next/router";

const index = () => {
  return (
    <div className="flex justify-center w-full">
      <div className="max-w-[1280px] w-full relative bg-gradient-to-b from-transparent to-white overflow-hidden">
        <div className="w-full scale-[1.2] translate-y-[62px] h-full absolute bg-cover bg-center opacity-[0.3] blur bg-[url('https://lh3.googleusercontent.com/bXQ7PUJ2k_dzuIQMFrfiKJ0wKjGDeWm2EPDuNXqLiW6z9ZY5HnDagZl3Lhufv8rop_G9B9O7Pb7nqrj0gdyPXTH-=s250')] z-[-1]" />
        <div className="flex gap-12 w-full p-10 pl-6 items-center">
          <div className="flex flex-col gap-6 flex-1 w-full">
            <p className="font-semibold text-[45px] leading-[110%]">
              Discover, collect, and sell extraordinary NFTs
            </p>
            <p className="text-2xl max-w-[400px] leading-9">
              OpenSky is the world&apos;s first and largest NFT marketplace
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => Router.push("/assets")}
                className={`text-white transition ease-in bg-blue-500 hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 font-semibold rounded-xl text-base px-14 py-4`}
              >
                Explore
              </button>
              <button
                onClick={() => Router.push("/create")}
                className={`transition border-2 hover:shadow-lg ease-in bg-white text-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold rounded-xl text-base px-14 py-4`}
              >
                Create
              </button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[550px] max-h-[419px] shadow-xl hover:shadow-2xl overflow-hidden flex items-end transition ease-in bg-white rounded-lg">
            <img
              src="https://lh3.googleusercontent.com/bXQ7PUJ2k_dzuIQMFrfiKJ0wKjGDeWm2EPDuNXqLiW6z9ZY5HnDagZl3Lhufv8rop_G9B9O7Pb7nqrj0gdyPXTH-=s550"
              alt="home-image"
              className="mb-[-64px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
