import { useContext, useState } from "react";
import Button from "../UI/Buttons";
import Input from "../UI/Inputs";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { Logo } from "../UI/Logo";

export default function LoginContent() {
  const [error, setError] = useState({
    field: "",
    message: "",
  });

  const [isPending, setIsPending] = useState(false);

  const { credentials, setCredentials, loginUser } = useContext(AuthContext);

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;

    if (value !== "" && value.includes(" ")) {
      setError({
        field: name,
        message: "Spaces are not allowed!",
      });
      return;
    } else {
      setError({
        field: "",
        message: "",
      });
    }

    setCredentials((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      };
    });
  }

  function checkEmptyFields() {
    for (let key in credentials) {
      if (!credentials[key] || credentials[key].trim() === "") {
        setError({
          field: key,
          message: "This field is required!",
        });
        return true;
      }
    }
    return false;
  }

  async function handleSubmit() {
    if (checkEmptyFields()) return;
    console.table(credentials);
    setIsPending(true);
    try {
      const res = await loginUser();
      console.log("Login response:", res);
      console.log("User role:", res?.role);
      console.log("Response type:", typeof res);
      console.log("Response keys:", res ? Object.keys(res) : "No response");

      if (res) {
        // Navigate based on user role
        console.log("Attempting navigation for role:", res.role);
        if (res.role === "ADMIN") {
          console.log("Navigating to /admin");
          navigate("/admin");
        } else if (res.role === "STUDENT") {
          console.log("Navigating to /student");
          navigate("/student");
        } else if (res.role === "TEACHER") {
          console.log("Navigating to /teacher");
          navigate("/teacher");
        } else {
          console.log("Navigating to /home (fallback)");
          navigate("/home"); // fallback
        }
      } else {
        console.log("No response received from loginUser");
      }
    } catch (e) {
      // errors are toasted in postApi; nothing else to do
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main>
      <div className="w-screen h-[100dvh] flex flex-row bg-loginBackground bg-cover">
        <section className="flex-1 flex justify-center items-center w-full">
          <div className="w-full md:w-[35rem] mx-4 md:mx-0 flex flex-col p-4 md:p-8 rounded-[1.5rem] bg-background-light backdrop-blur-md">
            <div className="flex-1 flex justify-center">
              <Logo size={"50%"} className="pb-5" />
            </div>
            <h1 className="md:text-[2.2rem] mb-2 md:mb-4 font-[600] stretched flex justify-center items-center">
              <span className="text-center">
                <span className="text-[1.8rem] md:text-[2.4rem]">
                  LOR/Feedback Platform
                </span>
              </span>
            </h1>
            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                Type={"PRIMARY"}
                labelText={"Enrollment Number"}
                type={"text"}
                name={"ID"}
                value={credentials.ID}
                onChange={handleChange}
                errorText={error.field === "ID" ? error.message : ""}
              />
              <Input
                Type={"PRIMARY"}
                labelText={"Password"}
                type={"password"}
                name={"password"}
                value={credentials.password}
                onChange={handleChange}
                errorText={error.field === "password" ? error.message : ""}
                extraClasses={"mb-4"}
              />
              <Button
                type={"MAIN"}
                onClick={handleSubmit}
                extraClasses={"w-full mb-6"}
                disabled={isPending}
              >
                Login
              </Button>
              {/* Forgot password link removed as per requirements */}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
