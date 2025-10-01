import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import Accordion from "../../components/UI/Accordion";

export default function AdminSettings() {
  const { userInfo } = useContext(UserContext);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <div className="bg-gradient-to-r from-[#6b8de3] to-[#2b59c3] rounded-lg p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">
            {userInfo?.name?.[0] || "A"}
          </div>
          <div>
            <div className="text-lg font-semibold">{userInfo?.name}</div>
            <div className="text-xs uppercase tracking-wide">ADMIN</div>
          </div>
        </div>
      </div>
      <Accordion
        items={[
          {
            title: "Account Details",
            content: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-gray-500 text-sm mb-1">Admin ID</div>
                  <div className="font-medium">{userInfo?.id}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-gray-500 text-sm mb-1">Email</div>
                  <div className="font-medium">{userInfo?.email}</div>
                </div>
              </div>
            ),
          },
          {
            title: "Permissions & Role",
            content: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-gray-500 text-sm mb-1">Role</div>
                  <div className="font-medium">ADMIN</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-gray-500 text-sm mb-1">Privileges</div>
                  <div className="font-medium text-sm text-gray-700">
                    Manage users, monitor LOR requests, export reports
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
