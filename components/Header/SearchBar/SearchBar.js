import React from "react";
import { InputPicker } from "rsuite";
import useNFTs from "./useNFTs";
import styles from "./InputPicker.module.css";
import Router from "next/router";

const SearchBar = () => {
  const [nfts, loading, getNfts] = useNFTs();
  const [keyword, setKeyword] = React.useState("");
  return (
    <div className="flex gap-2 items-center">
      <svg
        className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
        focusable="false"
        width="24"
        height="24"
        aria-hidden="true"
        viewBox="0 0 24 24"
        data-testid="SearchIcon"
        tabIndex="-1"
        title="Search"
        fill="rgb(112, 122, 131)"
      >
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
      </svg>
      <InputPicker
        data={nfts}
        style={{ width: "500px" }}
        menuClassName={styles.customInputPicker}
        cleanable
        placeholder="Search items"
        onSearch={(value) => {
          setKeyword(value);
          getNfts(value);
        }}
        // onChange={(value) => {
        //   console.log(value);
        //   setKeyword(value);
        // }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            Router.push(keyword ? `/assets?query=${keyword}` : `/assets`);
          }
        }}
        onSelect={(value) => {
          const [id, name] = value.split("||");
          Router.push(`/detail?id=${id}`);
        }}
        renderMenu={(menu) => {
          if (loading) {
            return (
              <p style={{ padding: 4, color: "#999", textAlign: "center" }}>
                <svg
                  role="status"
                  className="inline w-2 h-2 mr-2 text-gray-200 animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="#1C64F2"
                  />
                </svg>{" "}
                Loading...
              </p>
            );
          }
          return menu;
        }}
      />
    </div>
  );
};

export default SearchBar;
