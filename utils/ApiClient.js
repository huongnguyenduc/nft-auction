import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:1337";

const ApiClient = () => {
  const defaultOptions = {
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const instance = axios.create(defaultOptions);

  instance.interceptors.request.use(async (request) => {
    const session = await getSession();
    if (session) {
      request.headers.Authorization = `Bearer ${session.jwt}`;
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log(`error`, error);
    }
  );

  return instance;
};

export default ApiClient();
