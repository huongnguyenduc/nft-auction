import Image from "next/image";
import React from "react";

const LoadingPage = () => {
  return (
    <div className="h-[90vh] w-full flex justify-center items-center">
      <div className="relative w-[60px] h-[60px] flex justify-center items-center shadow rounded-[60px]">
        <Image
          layout="fill"
          objectFit="cover"
          src="/loading.svg"
          alt="loading"
        />
      </div>
    </div>
  );
};

export default LoadingPage;
