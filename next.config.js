/** @type {import('next').NextConfig} */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "openseauserdata.com",
      "testnets.opensea.io",
      "static.opensea.io",
      "",
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
