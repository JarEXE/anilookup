import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import * as serviceWorkerRegistration from "../src/serviceWorkerRegistration";
import reportWebVitals from "../src/reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

serviceWorkerRegistration.register();

reportWebVitals();
