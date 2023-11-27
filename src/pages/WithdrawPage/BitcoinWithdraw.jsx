import React, { useState, useEffect } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { BitcoinIcon } from "../../assets/icons";
import { InputDocsVerified, InputPlatformFeePerc, InputTokenBalance } from ".";
import { atom, useAtom } from "jotai";
import Popup, {
  InputIsModalOpen,
  InputModalContent,
  InputModalHeader,
  InputModalType,
} from "../../components/Popup";
import axios from "../../config/axios";
import { Atom } from "../../Atom/Atom";
import { useRecoilState } from "recoil";

export const InputFromWithdrawPage = atom(false);
const userAuthID = localStorage.getItem("userAuthID");

const BitcoinWithdraw = () => {
  const [totalBalance, setTotalBalance] = useAtom(InputTokenBalance);
  const [BTCaddress, setBTCaddress] = useState("");
  const [amount, setAmount] = useState("");
  const [errorAddress, setErrorAddress] = useState(false);
  const [errorAmount, setErrorAmount] = useState(false);
  const [plaformFeePercentage] = useAtom(InputPlatformFeePerc);
  const [isVerified, setIsVerified] = useAtom(InputDocsVerified);
  const [modalOpen, setModalOpen] = useAtom(InputIsModalOpen);
  const [modalHeader, setModalHeader] = useAtom(InputModalHeader);
  const [modalContent, setModalContent] = useAtom(InputModalContent);
  const [modalType, setModalType] = useAtom(InputModalType);
  const [fromWithdrawPage, setFromWithdrawPage] = useAtom(
    InputFromWithdrawPage
  );
  const [btcprice, setBtcPrice] = useState();

  const [darkMode, setDarkMode] = useRecoilState(Atom);

  console.log({
    address: BTCaddress,
    amount: amount,
  });
  const getEuros = async () => {
    console.log(totalBalance);
    axios
      .get("/getEuro")
      .then((response) => setBtcPrice(response.data.euroAmount))
      .catch((error) => console.error(error));
  };
  console.log(btcprice);
  useEffect(() => {
    getEuros();
  }, []);

  const handleWithdrawBTC = async () => {
    if (!isVerified) {
      console.log(isVerified);
      console.log("withdraw");
      setModalOpen(true);
      setModalHeader("Verify Documents");
      setModalContent(
        "Please verify your documents before proceeding with the withdrawal process. Thank you."
      );
      setModalType("verifyDoc");
      setFromWithdrawPage(true);
    } else {
      try {
        const response = await axios.post(
          "https://us-central1-omo-v1.cloudfunctions.net/omoAPI/withdraw",
          {
            id: userAuthID, // Replace with the user ID
            address: BTCaddress, // Replace with the withdrawal address
            amount: amount, // Replace with the withdrawal amount in Euros
          }
        );

        console.log({ tx: response.data.tx });

        // Display success message to the user
        setModalOpen(true);
        setModalHeader("Withdraw Success");
        setModalContent("Bitcoin withdrawal successful.");
        setModalType("success");
        setFromWithdrawPage(true);
      } catch (error) {
        console.log({ error });
        // Display error message to the user
        setModalOpen(true);
        setModalHeader("Withdraw Error");
        setModalContent("Failed to withdraw Bitcoin.");
        setModalType("error");
        setFromWithdrawPage(true);
      }
    }
  };

  const handleEnable2fA = () => {};
  const handleMaxClick = () => {
    setAmount(totalBalance);
  };

  return (
    <div className="py-4 px-4" style={{ paddingBottom: "5rem" }}>
      <div className="mb-4">
        <div
          className="font-medium text-gray-700 text-[15px] mb-2 flex"
          style={darkMode ? { color: "white" } : {}}
        >
          <BitcoinIcon className="w-5 h-5 mr-[8px] mt-[1px] text-yellow-500" />
          BTC Address <span className="text-red-400">*</span>{" "}
        </div>
        <input
          style={
            darkMode
              ? {
                  border: "1px solid #F7931A",
                  backgroundColor: "black",
                  color: "white",
                }
              : {}
          }
          value={BTCaddress}
          type="text"
          placeholder="Enter BTC address"
          className="block text-md h-[36px] w-full px-2 py-1 text-gray-900 border border-[#E2E8F0] rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500 bg-[#E2E8F0]"
          onChange={(e) => setBTCaddress(e.target.value)}
        />
        {errorAddress && (
          <div className="flex mt-[4px]">
            <ExclamationCircleIcon className="w-4 text-red-400 mr-1" />
            <div className="text-sm font-medium text-red-400">
              Enter valid BTC address
            </div>
          </div>
        )}
      </div>
      <div className="mb-7">
        <div className="flex justify-between">
          <div
            className="font-medium text-gray-700 text-[15px] mb-2 flex"
            style={darkMode ? { color: "white" } : {}}
          >
            Amount <span className="text-red-400">*</span>{" "}
          </div>
          <div className="text-sm font-medium">€{btcprice}</div>
          {/* Conversion btc to euro */}
        </div>
        <div className="flex">
          <input
            style={
              darkMode
                ? {
                    border: "1px solid #F7931A",
                    backgroundColor: "black",
                    color: "white",
                  }
                : {}
            }
            type="number"
            value={amount}
            placeholder="Enter amount"
            className="block h-[36px] w-full px-2 py-1 text-gray-900 border border-[#E2E8F0] rounded-l-md bg-gray-50 text-md focus:ring-blue-500 focus:border-blue-500 bg-[#E2E8F0]"
            onChange={(e) => setAmount(e.target.value)}
          />
          <div
            className="border px-4 py-1 rounded-r-md cursor-pointer bg-gray-400 text-white font-semibold"
            onClick={handleMaxClick}
            style={
              darkMode
                ? {
                    backgroundColor: "#4E4E4E",
                    border: "1px solid #F7931A",
                    color: "white",
                  }
                : {}
            }
          >
            Max
          </div>
        </div>
        {errorAmount && (
          <div className="flex mt-[4px]">
            <ExclamationCircleIcon className="w-4 text-red-400 mr-1" />
            <div className="text-sm font-medium text-red-400">
              The minimum value is 5
            </div>
          </div>
        )}
      </div>

      <div className="w-full cursor-pointer mb-3" onClick={handleWithdrawBTC} style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div
          className="border text-center py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
          style={
            darkMode
              ? {
                  border: "1.5px solid #0FBE00",
                  boxShadow: "0px 1px 1px 0px rgba(15, 190, 0, 0.50)",
                  background: "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 27.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                  width: "55%",
                }
              : {}
          }
        >
          Withdraw
        </div>
      </div>
      <div className="text-[14px] mb-5">
        Your withdrawal will have {plaformFeePercentage}% substracted from your
        remaining balance to cover the platform and gas fees required to process
        the transaction.
        <span className="flex">
          Minimum withdrawal is 0.00020000{" "}
          <BitcoinIcon className="mx-1 mt-[3px] w-4 h-4 text-yellow-500" />
        </span>
      </div>
      <Popup />
      <div className="mb-11" style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
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

export default BitcoinWithdraw;
