import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LoginContent from "../components/login/LoginContent";
import PageWrapper from "../components/UI/PageWrapper";

export default function Login() {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      if (userInfo.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [userInfo, navigate]);

  return (
    <PageWrapper>
      <LoginContent />
    </PageWrapper>
  );
}
