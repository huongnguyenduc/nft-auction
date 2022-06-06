import React from "react";

const LoadingPage = () => {
  return (
    <div className="h-[90vh] w-[100vw] flex justify-center items-center">
      <div className="w-[60px] h-[60px] flex justify-center items-center shadow rounded-[60px]">
        <img src="/loading.svg" />
      </div>
    </div>
  );
};

export default LoadingPage;
