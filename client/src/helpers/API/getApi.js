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
        // Only show toast error if showToast is true and it's not an auth check
        if (showToast && path !== "/auth/") {
            toast.error(err.response?.data?.message || "An error occurred");
        }
        throw err; // Re-throw the error so the calling function can handle it
    }
}

export default getApi;