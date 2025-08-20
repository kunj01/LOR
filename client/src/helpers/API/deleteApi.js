import toast from "react-hot-toast";
import apiInfo from "./apiInfo";
import axios from "axios";


async function deleteApi(path, parameters){
    axios.defaults.withCredentials = true;
    try {
        const response = await axios.delete(apiInfo.URL + path, {
            ...parameters,
            withCredentials: true,
        });
        return response.data; // Return the actual response data, not the full response object
    } catch (err) {
        console.log(err);
        if (err.response?.data?.message) {
            toast.error(err.response.data.message);
        } else {
            toast.error("An error occurred");
        }
        throw err; // Re-throw the error so the calling function can handle it
        }
}

export default deleteApi;