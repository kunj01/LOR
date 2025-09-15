import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import getApi from "../helpers/API/getApi";
import postApi from "../helpers/API/postApi";
import patchApi from "../helpers/API/patchApi";
// import putApi from "../helpers/API/putApi";
import toast from "react-hot-toast";

export default function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [profileCompleted, setProfileCompleted] = useState(false);

    function setUserData(data) {
        setUserInfo(data);
        // Check if profile is completed when user data is set
        if (data && data.profileCompleted !== undefined) {
            setProfileCompleted(data.profileCompleted);
        }
    }

    async function handlePingUser() {
        console.log("Pinging User...")
        try {
            const res = await getApi("/auth/", {}, false); // Don't show toast for auth checks
            console.log(res);
            if (res?.statusCode === 200 && res?.data) {
                console.log("Authorized User");
                setUserInfo(res.data);
                setProfileCompleted(res.data.profileCompleted || false);
                return res.data.role;
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
            if (res?.statusCode === 200) {
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

    async function handleCreateLORRequest({ teacherId, purpose, copies, requestData }) {
        if (!teacherId) {
            toast.error("Teacher ID is required");
            return false;
        }
        const res = await postApi("/lor", { teacherId, purpose, copies, requestData });
        if (res?.statusCode === 201) {
            toast.success("LOR request submitted");
            return res.data;
        }
        toast.error(res?.message || "Failed to submit LOR request");
        return false;
    }

    async function handleGetMyLORRequests() {
        try {
            const res = await getApi("/lor/mine");
            if (res?.statusCode === 200) {
                return res.data || [];
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    async function handleGetLORRequestDetails(id) {
        const res = await getApi(`/lor/${id}`);
        if (res?.statusCode === 200) return res.data;
        toast.error(res?.message || "Failed to load request");
        return null;
    }

    async function handleAddLORComment(id, body) {
        const res = await postApi(`/lor/${id}/comments`, { body });
        if (res?.statusCode === 201) return res.data;
        toast.error(res?.message || "Failed to add comment");
        return null;
    }

    async function handleUpdateLORRequest(id, data) {
        const res = await patchApi(`/lor/${id}`, data);
        if (res?.statusCode === 200) return res.data;
        toast.error(res?.message || "Failed to update request");
        return null;
    }

    async function handleUpdateLORStatus(id, status, comment = "") {
        const res = await patchApi(`/lor/${id}/status`, { status, comment });
        if (res?.statusCode === 200) return res.data;
        toast.error(res?.message || "Failed to update status");
        return null;
    }

    const ctxValue = {
        userInfo: userInfo,
        setUserInfo: setUserData,
        role: userInfo.role,
        isInitialized: isInitialized,
        profileCompleted: profileCompleted,
        pingUser: handlePingUser,
        logoutUser: handleLogout,
        getCategories: handleGetCategories,
        getSubCategories: handleGetSubCategories,
        getNature: handleGetNature,
        getActivity: handleGetActivity,
        submitEntry: handleSubmitEntry,
        createLORRequest: handleCreateLORRequest,
        getMyLORRequests: handleGetMyLORRequests,
        getLORRequestDetails: handleGetLORRequestDetails,
        addLORComment: handleAddLORComment,
        updateLORRequest: handleUpdateLORRequest,
        updateLORStatus: handleUpdateLORStatus,
    }

    return (
        <UserContext.Provider value={ctxValue}>
            {children}
        </UserContext.Provider>
    )
}