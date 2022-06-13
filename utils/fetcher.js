import axios from "axios";

export function axiosFetcher(endpoint = "", method = "GET", body = {}) {
  return axios({
    method: method,
    url: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${endpoint}`,
    data: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.data)
    .catch((error) => error);
}
