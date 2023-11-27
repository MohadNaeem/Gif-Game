import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { IntlProvider } from "react-intl";
import messages_en from "./translations/en.json";
import messages_es from "./translations/es.json"; // spanish
import messages_fr from "./translations/fr.json";
import messages_ar from "./translations/ar.json";
import messages_zh from "./translations/ch.json";
import messages_th from "./translations/th.json";
import messages_hi from "./translations/hi.json";
import messages_tr from "./translations/tr.json";
import { RecoilRoot } from "recoil";
const messages = {
  en: messages_en,
  fr: messages_fr,
  es: messages_es,
  ar: messages_ar,
  zh: messages_zh,
  th: messages_th,
  hi: messages_hi,
  tr: messages_tr,
  // Add more languages as needed
};

const language = JSON.parse(localStorage.getItem("flag")) || "en";

ReactDOM.createRoot(document.getElementById("root")).render(
  <IntlProvider locale={language} messages={messages[language]}>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </IntlProvider>
);
