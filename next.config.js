/** @type {import('next').NextConfig} */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nextConfig = {
  reactStrictMode: true,
  // env: {
  //   NEXT_PUBLIC_ETHERSCAN_API_KEY: "Z5BW48C1FHQK9CVKWDJ96UA93ZX9K6XDDS",
  //   NEXT_PUBLIC_PROJECT_ID: "1c22538638cf4d209adf5796c4e52f1c",
  //   NEXT_PUBLIC_PRIVATE_KEY:
  //     "1c13f7c5607f84f02617ed9d6ce71d36cecd2d406a18251875e226beeca9edd1",
  //   NEXT_PUBLIC_CONTRACT_ADDRESS: "0xd2Bfc5f81eFC923a5ba921e04F765189F6cC47A3",
  //   NEXT_PUBLIC_ERC1155_CONTRACT_ADDRESS:
  //     "0x34aebB23646A88e62e9926eE972B4360E2f97dfB",
  //   NEXT_PUBLIC_ERC721_CONTRACT_ADDRESS:
  //     "0xf47027a13E7Fbd470c95e867c8285c9AEC023F2F",
  // },
  images: {
    domains: [
      "openseauserdata.com",
      "testnets.opensea.io",
      "static.opensea.io",
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\^(?!tailwind.css).(le|c)ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
        },
        {
          loader: "less-loader",
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    });

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: "static/css/[name].css",
        chunkFilename: "static/css/[contenthash].css",
      })
    );

    return config;
  },
};

module.exports = nextConfig;
