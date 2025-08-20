import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import getApi from "../helpers/API/getApi";
import postApi from "../helpers/API/postApi";
import { UserContext } from "./UserContext";

export default function AuthContextProvider({children}) {
    const [credentials, setCredentials] = useState({
        ID: '',
        password: ''
    })

    const { setUserInfo } = useContext(UserContext);
    
    async function handleLoginUser() {
        console.log("Logging in User...")
        const res = await postApi("/auth/login", {
            enrollment_no: credentials.ID,
            password: credentials.password
        });
        console.log("API Response:", res);
        console.log("Response statusCode:", res?.statusCode);
        console.log("Response data:", res?.data);
        
        if(res.statusCode === 200){
            console.log("Login successful, setting user info:", res.data);
            toast.success("User Logged in Successfully");
            setUserInfo(res.data);
            return res.data;
        }
        console.log("Login failed, statusCode not 200");
        return false;
    }
    
    async function handleSignUp(signUpCredentials) {
        console.log("Signing Up User...")
        const res = await postApi("/auth/register", signUpCredentials);
        console.log(res);
        if(res.statusCode === 200){
            toast.success("User Signed Up Successfully");
            return true;
        }
        return false;
    }

    //Values to be passed to the context
    const ctxValue = {
        credentials: credentials,
        setCredentials: setCredentials,
        loginUser: handleLoginUser,
        signUpUser: handleSignUp,
    }

    return (
        <AuthContext.Provider value={ctxValue} >
            { children }
        </AuthContext.Provider>
    )
}