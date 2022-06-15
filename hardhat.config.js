require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_PROJECT_ID}`,
      accounts: [`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`],
    },
  },
  // etherscan: {
  //   apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  // },
};
