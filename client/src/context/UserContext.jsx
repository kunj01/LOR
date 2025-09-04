import { createContext } from "react";

export const UserContext = createContext({
    userInfo : {},
    setUserInfo: () => {},
    role: "",
    isInitialized: false,
    profileCompleted: false,
    pingUser: () => {},
    logoutUser: () => {},
    getCategories: () => {},
    getSubCategories: () => {},
    getNature: () => {},
    getActivity: () => {},
    submitEntry: () => {},
    createLORRequest: () => {},
    getMyLORRequests: () => {},
})