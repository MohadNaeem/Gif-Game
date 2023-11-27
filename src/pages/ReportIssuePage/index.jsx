import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router-dom";
import NotAuthorised from "../../components/NotAuthorised";
import FileUploader from "./FileUploader";
import Styles from "./index.module.css";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";

const ReportIssuePage = () => {
  const userAuthID = localStorage.getItem("userAuthID");

  const [darkMode, setDarkMode] = useRecoilState(Atom);

  return userAuthID ? (
    <div style={darkMode ? {width:'100vw', height:'100vh', backgroundColor:'black', color:'white'} : {}}>
      <div
        className="p-5 lg:w-[40%] lg:mx-auto"
      >
        <div className="flex">
          <Link to="/myaccount">
            <div>
              <ArrowLeftCircleIcon className="w-7 h-7 bg text-gray-500 arrow-svg" style={darkMode ? {border:'2px solid goldenrod', borderRadius:'5rem', background:'goldenrod'} : {}} />
            </div>
          </Link>
        </div>
        <div className="text-center font-bold text-lg mb-7" >REPORT ISSUE</div>
        <div className="mb-5" style={darkMode ? {color: "#FFF"} : {}}>
          Please let us know if there is any issue you want to report, or any
          bug you observe. Thankyou.
        </div>
        <div>
          <FileUploader />
        </div>
      </div>
    </div>
  ) : (
    <NotAuthorised />
  );
};

export default ReportIssuePage;
