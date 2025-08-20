import { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentContext";
import StudentDashboardTable from "../student/DashboardTable";
import EventDetailModal from "../student/EntryModal";
import LoadingAnimation from "../UI/Loading";

export default function Dashboard() {
    const { applications, studentInfo, getDashboardData } = useContext(StudentContext);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    useEffect(() => {
        handleGetDashboardData();
    }, []);

    async function handleGetDashboardData() {
        const res = await getDashboardData();
        if (res) {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <main className="flex w-full flex-col">
                <div className="p-8 border-b">
                    <h1 className="text-[1.8rem] font-[600]">Dashboard</h1>
                </div>
                <LoadingAnimation />
            </main>
        )
    }

    return (
        <main className="flex w-full flex-col">
            <div className=" flex justify-between px-8 py-4 border-b">
                <h1 className="text-[1.8rem] font-[600] flex items-center">Dashboard</h1>
                <div className="flex items-center p-4 mr-4 rounded-xl bg-primaryTranslucentHover">
                    Total Points: 
                    <span className="text-lg ml-2 font-[600]">{studentInfo.total_points}</span>
                </div>
            </div>
            <StudentDashboardTable applications={applications} studentData={studentInfo} onViewDetails={handleViewDetails} />
            <EventDetailModal
                event={selectedEvent}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </main>
    )
}