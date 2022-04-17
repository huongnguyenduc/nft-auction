/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ETHERSCAN_API_KEY: "Z5BW48C1FHQK9CVKWDJ96UA93ZX9K6XDDS",
    PROJECT_ID: "b4a5716c3f164727bb35db5be7f8ed02",
    PRIVATE_KEY:
      "1c13f7c5607f84f02617ed9d6ce71d36cecd2d406a18251875e226beeca9edd1",
    CONTRACT_ADDRESS: "0x2c7fA7a9c453fa526c8b594A498d816b2973De33",
  },
  images: {
    domains: ["openseauserdata.com"],
  },
};

module.exports = nextConfig;
