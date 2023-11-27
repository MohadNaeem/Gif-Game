import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";
import UnknownImage from "../../assets/img/unknownFinal.png";

const NotAuthorised = () => {
  const [darkMode, setDarkMode] = useRecoilState(Atom);

  return (
    <div
      className="flex flex-col justify-center h-[70vh] text-center items-center"
      style={
        darkMode
          ? { height: "100vh", backgroundColor: "#000", color: "white" }
          : {}
      }
    >
      {darkMode ? (
        <img src={UnknownImage} style={{borderRadius:'20rem', width:'10rem', height:'10rem'}} />
      ) : (
        <img
          src="https://cdn-icons-png.flaticon.com/512/4123/4123751.png"
          className="w-[80px] mb-[20px]"
        />
      )}
      <div className="font-bold text-[21px] mb-[20px]">
        Please sign in first!
      </div>
      <div className="mb-[20px]">
        This section is only allowed for authorised users.
      </div>
      <Link to="/login" className="text-blue-500 font-bold">
        Login
      </Link>
    </div>
  );
};

export default NotAuthorised;
