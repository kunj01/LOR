import { useState } from "react";
import Modal from "./Modal";
import Button from "./Buttons";
import toast from "react-hot-toast";
import postApi from "../../helpers/API/postApi";

export default function ResetPasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const res = await postApi("/auth/reset", { currentPassword, newPassword });
      console.log("Password reset response:", res);
      
      if (res?.statusCode === 200) {
        toast.success("Password reset successful!");
        onClose();
      } else {
        const errorMessage = res?.message || "Failed to reset password.";
        setError(errorMessage);
        console.error("Password reset error:", res);
      }
    } catch (err) {
      console.error("Password reset catch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  return (
    <Modal title="Reset Password" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2273f5]"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2273f5]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2273f5]"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="PRIMARY" extraClasses="w-full" disabled={!isValid || loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Modal>
  );
}


