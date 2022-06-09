import React from "react";
import { useRouter } from "next/router";
import WalletList from "../components/WalletList";

const Login = () => {
  const router = useRouter();
  const { referrer } = router.query;

  return (
    <div className="w-full h-full flex justify-center pt-12">
      <div className="w-max-lg">
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-semibold ">Connect your wallet.</p>
          <p className="text-base text-gray-500">
            Connect with one of our available wallet providers or create a new
            one.
          </p>
          <WalletList referrer={`/${referrer}`} />
        </div>
      </div>
    </div>
  );
};

export default Login;
