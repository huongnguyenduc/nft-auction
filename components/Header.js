/* eslint-disable @next/next/link-passhref */
import React from "react";
import Link from "next/link";

function Header() {
  return (
    <nav className="flex p-4 justify-between shadow-lg fixed w-full z-50 bg-white">
      <Link href="/">
        <p className="text-xl font-bold cursor-pointer">NFT Marketplace</p>
      </Link>
      <div className="flex mt-4">
        <Link href="/create">
          <a className="mr-6 text-gray-400 hover:text-gray-500 font-medium">
            Create
          </a>
        </Link>
        <Link href="/dashboard">
          <a className="mr-6 text-gray-400 hover:text-gray-500 font-medium">
            Dashboard
          </a>
        </Link>
      </div>
    </nav>
  );
}

export default Header;
