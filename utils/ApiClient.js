import axios from "axios";
import { getSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import Web3Modal from "web3modal";
import VerifySignatureContract from "../contracts/VerifySignature.json";

const verifySignatureContractAddress =
  process.env.NEXT_PUBLIC_VERIFY_SIGNATURE_CONTRACT_ADDRESS;

async function login(account) {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const message = uuidv4();
    let contract = new ethers.Contract(
      verifySignatureContractAddress,
      VerifySignatureContract.abi,
      provider
    );
    const hashMessage = await contract.getMessageHash(message);
    const signature = await signer.signMessage(
      ethers.utils.arrayify(hashMessage)
    );
    const res = await signIn("credentials", {
      redirect: false,
      wallet: account,
      message,
      signature,
    });
    if (res !== undefined) {
      const { error, url } = res;
      console.log("res login api client", res);
      if (error) {
        console.log("error login api client", error);
      }
      if (url) {
        console.log("url login api client", url);
      }
    }
  } catch (e) {
    console.log("error login api client", e);
  }
}

export async function verifyUser(account) {
  try {
    const session = await getSession();
    if (
      session &&
      session?.user?.wallet === account &&
      !(session?.error === "RefreshAccessTokenError")
    ) {
      console.log("verify okie");
    } else {
      // if (session) {
      //   await signOut();
      // }
      console.log("verify ko okie", session);
      console.log("address", account);
      console.log("1", !!session);
      console.log("2", !!session?.user?.wallet === account);
      console.log("3", !!!(session?.error === "RefreshAccessTokenError"));
      await login(account);
    }
  } catch (e) {
    console.log("verify user failed", e);
  }
}

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:1337";

const ApiClient = (account) => {
  const defaultOptions = {
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const instance = axios.create(defaultOptions);

  instance.interceptors.request.use(async (request) => {
    try {
      const session = await getSession(request);
      console.log("session request api client", session);
      if (
        session &&
        session?.user?.wallet === account &&
        !(session?.error === "RefreshAccessTokenError")
      ) {
        console.log("login okie", session);
        request.headers.x_authorization = session?.accessToken;
      } else {
        // if (session) {
        //   await signOut();
        // }
        console.log("login ko okie", session);
        console.log("address", account);
        console.log("1", !!session);
        console.log("2", !!session?.user?.wallet === account);
        console.log("3", !!!(session?.error === "RefreshAccessTokenError"));
        await login(account);
        const newSession = await getSession(request);
        console.log("newSession api client", newSession);
        request.headers.x_authorization = `${newSession?.accessToken}`;
      }
    } catch (e) {
      console.log("error interceptor", e);
      return request;
    }
    return request;
  });

  // async function refreshToken() {
  //   const session = await getSession();
  //   return instance.post("/auth/refresh", {
  //     refreshToken: session.refreshToken,
  //   });
  // }

  // instance.interceptors.response.use(
  //   (response) => {
  //     const { code, auto } = response.data;
  //     if (code === 401) {
  //       if (auto === "yes") {
  //         return refreshToken().then((rs) => {
  //           const { token } = rs.data;
  //           instance.setToken(token);
  //           const config = response.config;
  //           config.headers["x-access-token"] = token;
  //           config.baseURL = "http://localhost:3000/";
  //           return instance(config);
  //         });
  //       }
  //     }
  //     return response;
  //   },
  //   (error) => {
  //     console.warn("Error status", error.response.status);
  //     // return Promise.reject(error)
  //     if (error.response) {
  //       return parseError(error.response.data);
  //     } else {
  //       return Promise.reject(error);
  //     }
  //   }
  // );

  return instance;
};

export default ApiClient;

export function apiClientFetcher(endpoint, account) {
  return ApiClient(account)
    .get(endpoint)
    .then((res) => res.data);
}
