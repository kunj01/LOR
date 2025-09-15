import toast from "react-hot-toast";
import apiInfo from "./apiInfo";
import axios from "axios";


async function getApi(path, parameters, showToast = true) {
    axios.defaults.withCredentials = true;
    try {
        const response = await axios.get(apiInfo.URL + path, {
            ...parameters,
            withCredentials: true,
        });
        return response.data; // Return the actual response data, not the full response object
    } catch (err) {
        console.log(err);
        // Only show toast error if showToast is true and it's not an auth check or expected 404 on profile fetch
        const isAuthPing = path === "/auth/";
        const isProfileFetch = path === "/students/profile" || path === "/students/profile/draft";
        const is404 = err?.response?.status === 404;
        if (showToast && !isAuthPing && !(isProfileFetch && is404)) {
            toast.error(err.response?.data?.message || "An error occurred");
        }
        throw err; // Re-throw the error so the calling function can handle it
    }
}

export default getApi;