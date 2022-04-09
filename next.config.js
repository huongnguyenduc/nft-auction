/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ETHERSCAN_API_KEY: "Z5BW48C1FHQK9CVKWDJ96UA93ZX9K6XDDS",
    PROJECT_ID: "b4a5716c3f164727bb35db5be7f8ed02",
    PRIVATE_KEY:
      "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    CONTRACT_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
  images: {
    domains: ["openseauserdata.com"],
  },
};

module.exports = nextConfig;
