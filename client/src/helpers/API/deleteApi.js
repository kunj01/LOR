import axios from "axios";
import apiInfo from "./apiInfo";
import toast from "react-hot-toast";

export default async function deleteApi(path) {
  axios.defaults.withCredentials = true;

  try {
    const response = await axios.delete(apiInfo.URL + path, {
      withCredentials: true,
    });
    return response.data; // Return the actual response data, not the full response object
  } catch (err) {
    console.error(err);
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(err.response.data.message);
    } else if (err.code === "ERR_NETWORK") {
      toast.error("Network error: Unable to connect to server");
    } else {
      toast.error("An error occurred. Please try again.");
    }
    throw err; // Re-throw the error so the calling function can handle it
  }
}