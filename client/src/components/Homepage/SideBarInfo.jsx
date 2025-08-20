import { 
    PiHouse, PiHouseDuotone,
    PiUserCircle, PiUserCircleDuotone,
    PiClockUser, PiClockUserDuotone,
    PiNotePencil, PiNotePencilDuotone,
    PiListChecks, PiListChecksDuotone,
    PiNotebook, PiNotebookDuotone,
    PiUsersThree, PiUsersThreeDuotone,
    PiChatCircle, PiChatCircleDuotone,
    PiGear, PiGearDuotone,
} from "react-icons/pi";

// New simplified navigation for all users
export const LORSystemNavContentInfo = [
    {
        name: "LOR System",
        path: "/dashboard/lor",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Feedback for Students",
        path: "/dashboard/feedback",
        icon: <PiChatCircle />,
        fillIcon: <PiChatCircleDuotone />
    }
]

export const StudentNavContentInfo = [
    {
        name: "Home",
        path: "/home/student",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "New Event Entry",
        path: "/home/student/newEntry",
        icon: <PiNotePencil />,
        fillIcon: <PiNotePencilDuotone />
    },
    {
        name: "My Applications",
        path: "/home/student/events",
        icon: <PiListChecks />,
        fillIcon: <PiListChecksDuotone />
    },
    {
        name: "Profile",
        path: "/home/student/profile",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    }
]

export const CounsellorNavContentInfo = [
    {
        name: "Home",
        path: "/home/counsellor",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    // {
    //     name: "Reports",
    //     path: "/home/counsellor/reports",
    //     icon: <PiNotebook />,
    //     fillIcon: <PiNotebookDuotone />
    // },
    {
        name: "My Batch",
        path: "/home/counsellor/batch",
        icon: <PiUsersThree />,
        fillIcon: <PiUsersThreeDuotone />
    },
    {
        name: "Profile",
        path: "/home/counsellor/profile",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    }
]

export const HeadNavContentInfo = [
    {
        name: "Home",
        path: "/home/head",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: <PiClockUser />,
        fillIcon: <PiClockUserDuotone />
    },
    {
        name: "Profile",
        path: "/home/head/profile",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    }
]
export const PrincipalNavContentInfo = [
    {
        name: "Home",
        path: "/home/principal",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Appointments",
        path: "/home/principal/appointments",
        icon: <PiClockUser />,
        fillIcon: <PiClockUserDuotone />
    },
    {
        name: "Profile",
        path: "/home/principal/profile",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    }
]
export const AdminNavContentInfo = [
    {
        key: "dashboard",
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        key: "students",
        name: "Create New Students",
        path: "/admin/students",
        icon: <PiUsersThree />,
        fillIcon: <PiUsersThreeDuotone />
    },
    {
        key: "lor",
        name: "LOR Applications",
        path: "/admin/lor",
        icon: <PiNotebook />,
        fillIcon: <PiNotebookDuotone />
    },
    {
        key: "settings",
        name: "Settings",
        path: "/admin/settings",
        icon: <PiGear />,
        fillIcon: <PiGearDuotone />
    }
]

