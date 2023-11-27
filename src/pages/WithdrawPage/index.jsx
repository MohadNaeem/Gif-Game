import React, { useState, useEffect } from "react";
import { BitcoinIcon } from "../../assets/icons";
import app from "../../config/firebase";
import { getDoc, doc, getFirestore, onSnapshot } from "firebase/firestore";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Header } from "../../components/PageTitle";
import NotAuthorised from "../../components/NotAuthorised";
import { Tabs } from "./Tabs";
import { atom, useAtom } from "jotai";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";

const fireStore = getFirestore(app);
export const InputTokenBalance = atom(0);
export const InputPlatformFeePerc = atom(0);
export const InputDocsVerified = atom(false);

const WithdrawPage = () => {
  const [tokenBalance, setTokenBalance] = useAtom(InputTokenBalance);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [platformFee, setPlatformFee] = useAtom(InputPlatformFeePerc);
  const [docsVerified, setIsDocsVerified] = useAtom(InputDocsVerified);
  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const userAuthID = localStorage.getItem("userAuthID");

  const fetchPlatformFee = async () => {
    const docRef = doc(fireStore, "public", "settings");
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      setPlatformFee(data.withdrawFeePercentage);
    }
  };

  const fetchVerifyStatus = async () => {
    const userRef = userAuthID ? doc(fireStore, "users", userAuthID) : null;
    const userSnap = await getDoc(userRef);
    console.log(userSnap.data());
    if (userSnap.exists()) {
      setIsDocsVerified(
        userSnap.data().IDProofApprove && userSnap.data().addressProofApprove
      );
      console.log(docsVerified);
    }
  };

  useEffect(() => {
    fetchPlatformFee();
    fetchVerifyStatus();
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
      <div style={darkMode ? {backgroundColor:'black'} : {}}>
        <div
          className="p-[16px] flex flex-col sm:w-[600px] mx-auto"
          style={darkMode ? { color: "white", backgroundColor: "black" } : {}}
        >
          <Header title="WITHDRAW" />
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

export default WithdrawPage;
