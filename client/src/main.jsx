import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../CSS/index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{}}
      containerClassName=""
      toastOptions={{
        duration: 5000,
        style: {
          background: "#fff",
          color: "#363636",
        },
      }}
    />
    <App />
  </StrictMode>
);
