import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useAtom } from "jotai";
import React, { useState, useEffect } from "react";
import { InputAdminWallet } from ".";
import axios from "../../config/axios";
import QRCode from "qrcode";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";

const BitcoinDeposit = () => {
  const [depositAddress, setDepositAddress] = useAtom(InputAdminWallet);
  const [isCopySuccessful, setIsCopySuccessful] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const [isMobile, setIsMobile] = useState(false);
  const userAuthID = localStorage.getItem("userAuthID");
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 450);
    };
    handleResize(); // set initial state
    window.addEventListener("resize", handleResize); // add listener for window resize
    return () => window.removeEventListener("resize", handleResize); // cleanup listener
  }, []);

  const handleReloadDepositAddress = async () => {
    console.log("handleReloadDepositAddress");
    const response = await axios.get("/getWallet/" + userAuthID);
    if (response.status === 404) {
      setAdminWallet("No Wallet Found");
    } else {
      setDepositAddress(response.data.address);
    }
  };
  const handleCopyDepositAddress = () => {
    navigator.clipboard
      .writeText(depositAddress)
      .then(() => {
        setIsCopySuccessful(true);
        setTimeout(() => setIsCopySuccessful(false), 5000); // Set isCopySuccessful to false after 5 seconds
      })
      .catch((err) => {
        setIsCopySuccessful(false);
      });
  };
  useEffect(() => {
    QRCode.toDataURL(depositAddress)
      .then((url) => setQrCode(url))
      .catch((err) => console.log(err));
  }, [depositAddress]);
  const handleEnable2fA = () => {};

  return (
    <div
      className="py-2 mx-auto p-4 md:px-8 overflow-scroll scrollbar-hide sm:w-[600px]"
      style={{ gap: "1.5rem", display: "flex", flexDirection: "column" }}
    >
      <div className="mb-6">
        <div
          className="font-medium text-[15px] mb-2 "
          style={darkMode ? { color: "white" } : {}}
        >
          Your BTC deposit address
        </div>
        <div className="border border-gray-300 h-[43px] bg-gray-300 py-2 px-3 rounded-md flex justify-between">
          <div className="text-sm font-semibold text-gray-700 mt-[2px]">
            {!isMobile ? (
              depositAddress
            ) : (
              <span className="text-[11px]">
                {/* {depositAddress.slice(0, 8)} ...{depositAddress.slice(-8)} */}
                {depositAddress}
              </span>
            )}
          </div>

          <div className="flex">
            <ArrowPathIcon
              className="w-4 cursor-pointer"
              onClick={handleReloadDepositAddress}
            />
            <span className="mx-2 text-gray-600">|</span>
            {isCopySuccessful ? (
              <div className="cursor-pointer text-gray-600">
                <i className="fa fa-check"></i>
              </div>
            ) : (
              <div
                className="w-4 mt-1 cursor-pointer text-gray-700"
                onClick={handleCopyDepositAddress}
              >
                <svg
                  className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium cursor-pointer css-i4bv87-MuiSvgIcon-root"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  data-testid="ContentCopyIcon"
                >
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-[200px] h-[200px] mx-auto text-sm">
        <img src={qrCode} />
      </div>

      <div
        className="text-center mb-4 text-[15px]"
        style={darkMode ? { color: "white" } : {}}
      >
        Only send BTC to this address, 1 confirmation required.
      </div>
      <div
        className="mb-11"
        style={
          darkMode
            ? {
                color: "white",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }
            : { display: "flex", flexDirection: "column", gap: "1rem" }
        }
      >
        <div className="text-center mb-2 text-[15px]">
          Improve your account security with Two-factor Authentication
        </div>
        <div className="flex justify-center ">
          <div
            className="border px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold cursor-pointer"
            onClick={handleEnable2fA}
          >
            Enable 2FA
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinDeposit;
