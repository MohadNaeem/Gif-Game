import React, { useState, useEffect } from "react";
import { atom, useAtom } from "jotai";
import { BitcoinIcon } from "../../assets/icons";
import app from "../../config/firebase";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Header } from "../../components/PageTitle";
import NotAuthorised from "../../components/NotAuthorised";
import { Tabs } from "./Tabs";
import axios from "../../config/axios";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";

export const InputBuyTokens = atom(0);
export const InputTokenBalance = atom(0);
export const InputBuyTokenMessage = atom(false);
export const InputAdminWallet = atom("Wallet Address is loading...");

const fireStore = getFirestore(app);

const DepositPage = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adminWallet, setAdminWallet] = useAtom(InputAdminWallet);

  const userAuthID = localStorage.getItem("userAuthID");

  const [darkMode, seDarkMode] = useRecoilState(Atom);

  const fetchData = async () => {
    const response = await axios.get("/getWallet/" + userAuthID);
    if (response.status === 404) {
      setAdminWallet("No Wallet Found");
    } else {
      setAdminWallet(response.data.address);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const userRef = userAuthID ? doc(fireStore, "users", userAuthID) : null;

    let unsubscribe = null;

    if (userRef) {
      unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setTokenBalance(parseFloat(doc.data().tokenBalance));
          setBonusBalance(parseFloat(doc.data().bonusBalance));
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return userAuthID ? (
    loading ? (
      <LoadingSpinner />
    ) : (
      <div style={darkMode ? {backgroundColor:'black'}: {}}>
        <div
          className="p-[16px] flex flex-col sm:w-[600px] mx-auto"
          style={darkMode ? { backgroundColor: "#000" } : {}}
        >
          <Header title="DEPOSIT" />
          <div className="flex justify-center mb-3">
            <div
              className="flex w-fit border px-3 py-1 bg-white rounded-xl shadow-sm"
              style={
                darkMode
                  ? { backgroundColor: "black", border: "1px solid #F7931A" }
                  : {}
              }
            >
              <div className="flex font-medium text-[16px] py-[1px] text-gray-600">
                <span
                  className="mr-2"
                  style={darkMode ? { color: "white" } : {}}
                >
                  {(tokenBalance + bonusBalance) % 1 === 0
                    ? +tokenBalance + bonusBalance
                    : (tokenBalance + bonusBalance).toFixed(2)}
                </span>
                <BitcoinIcon className="my-1 w-[20px] h-[18px] text-yellow-500" />
              </div>
            </div>
          </div>
          <Tabs />
        </div>
      </div>
    )
  ) : (
    <NotAuthorised />
  );
};

export default DepositPage;
