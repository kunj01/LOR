import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import getApi from "../helpers/API/getApi";
import postApi from "../helpers/API/postApi";
// import putApi from "../helpers/API/putApi";
import toast from "react-hot-toast";

export default function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    function setUserData(data) {
        setUserInfo(data);
    }

    async function handlePingUser() {
        console.log("Pinging User...")
        try {
            const res = await getApi("/auth/", {}, false); // Don't show toast for auth checks
            console.log(res);
            if (res.status === 200) {
                console.log("Authorized User");
                setUserInfo(res.data.data);
                return res.data.data.role;
            }
            return false;
        } catch (error) {
            console.log("No authenticated user found or server error");
            return false;
        }
    }

    // Check authentication status on app load - only run once
    useEffect(() => {
        let isMounted = true;
        
        const checkAuth = async () => {
            try {
                const result = await handlePingUser();
                if (isMounted) {
                    if (!result) {
                        setUserInfo({});
                    }
                }
            } catch (error) {
                console.log("Authentication check failed:", error);
                if (isMounted) {
                    setUserInfo({});
                }
            } finally {
                if (isMounted) {
                    setIsInitialized(true);
                }
            }
        };
        
        checkAuth();
        
        // Cleanup function to prevent state updates if component unmounts
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array ensures this only runs once

    async function handleLogout() {
        try {
            const res = await getApi("/auth/logout");
            console.log(res);
            if (res.statusCode === 200) {
                console.log("Logged out successfully");
                // Clear user info immediately
                setUserInfo({});
                return true;
            }
            return false;
        } catch (error) {
            console.error("Logout error:", error);
            // Even if the API call fails, clear the local state
            setUserInfo({});
            return true;
        }
    }

    async function handleGetCategories() {
        const res = await getApi("/activity/get-category");
        if (res.statusCode === 200) {
            return res.data;
        }
        return [];
    }

    async function handleGetSubCategories(category) {
        const res = await getApi(`/activity/get-subcategory/${category}`);
        if (res.statusCode === 200) {
            return res.data;
        }
        return [];
    }

    async function handleGetNature(subcategory) {
        const res = await getApi(`/activity/get-nature/${subcategory}`);
        if (res.statusCode === 200) {
            return res.data;
        }
        return [];
    }

    async function handleGetActivity(nature) {
        const res = await getApi(`/activity/get-activity/${nature}`);
        if (res.statusCode === 200) {
            return res.data;
        }
        return [];
    }

    async function handleSubmitEntry(data) {
        const res = await postApi("/students/submit", data);
        if (res.status === 200) {
            return res.status;
        }
        toast.error("Error submitting entry");
        return false;
    }

    const ctxValue = {
        userInfo: userInfo,
        setUserInfo: setUserData,
        role: userInfo.role,
        isInitialized: isInitialized,
        pingUser: handlePingUser,
        logoutUser: handleLogout,
        getCategories: handleGetCategories,
        getSubCategories: handleGetSubCategories,
        getNature: handleGetNature,
        getActivity: handleGetActivity,
        submitEntry: handleSubmitEntry,
    }

    return (
        <UserContext.Provider value={ctxValue}>
            {children}
        </UserContext.Provider>
    )
}