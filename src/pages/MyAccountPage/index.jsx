import React, { useState, useEffect } from "react";
import { BitcoinIcon } from "../../assets/icons";
import { getAuth, sendEmailVerification, signOut } from "firebase/auth";
import app from "../../config/firebase";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
  getDocs,
  query,
} from "firebase/firestore";
import Papa from "papaparse";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./index.css";
import {
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Header } from "../../components/PageTitle";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import NotAuthorised from "../../components/NotAuthorised";
import { InputFromWithdrawPage } from "../WithdrawPage/BitcoinWithdraw";
import { useAtom } from "jotai";
import FileUploader from "./FileUploader";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { useIntl } from "react-intl";
import CustomFlagSelect from "../../components/CustomFlagSelect";
import {useRecoilState} from 'recoil';
import {Atom} from "../../Atom/Atom.jsx";

const fireStore = getFirestore(app);
const auth = getAuth(app);

const MyAccountPage = ({ userData }) => {
  const [user, loading, error] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const [reward2claims, setReward2claims] = useState(0);
  const [reward2BonusEarned, setReward2BonusEarned] = useState(0);
  const [initialReward1bonus, setInitialReward1bonus] = useState(0);
  const [referredUsers, setReferredUsers] = useState(0);
  const [referralBonusEarned, setReferralBonusEarned] = useState(0);
  const [claimedRefsCount, setClaimedRefsCount] = useState(0);
  const [unclaimedRefsCount, setUnclaimedRefsCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reward3, setReward3] = useState(false);
  const [reward4, setReward4] = useState(false);
  const [reward5, setReward5] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [currPagStartIndex, setCurrPagStartIndex] = useState(0);
  const [pagSize, setPagSize] = useState(0);
  const [noTransactions, setNoTransactions] = useState(false);
  const [fromWithdrawPage, setFromWithdrawPage] = useAtom(
    InputFromWithdrawPage
  );
  const [idProofURL, setIdProofURL] = useState(null);
  const [addressProofURL, setAddressProofURL] = useState(null);
  const [idProofApprove, setIdProofApprove] = useState(false);
  const [addressProofApprove, setAddressProofApprove] = useState(false);
  const [clickEmailNotVerified, setClickEmailNotVerified] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const [darkMode, setDarkMode] = useRecoilState(Atom);


  const { formatMessage } = useIntl();
  const handleSignOut = () => {
    localStorage.clear();
    signOut(auth);
  };
  console.log(fromWithdrawPage);
  console.log(idProofApprove);
  console.log(addressProofApprove);
  const fetchUserData = async () => {
    setLoadingData(true);
    const userRef = doc(fireStore, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUsername(userSnap.data().username);
      userSnap.data().firstName &&
        userSnap.data().lastName &&
        setFullName(userSnap.data().firstName + " " + userSnap.data().lastName);
      setBonusBalance(+userSnap.data().bonusBalance);
      setTokenBalance(+userSnap.data().tokenBalance);
      if (userSnap.data().allGamesPlayed) {
        setTotalGames(+userSnap.data().allGamesPlayed.total);
        setWinCount(+userSnap.data().allGamesPlayed.wins);
        setLostCount(+userSnap.data().allGamesPlayed.loses);
        setDrawCount(+userSnap.data().allGamesPlayed.draws);
      }
      setReward2claims(userSnap.data().reward2status?.claimedCount ?? 0);
      setReward2BonusEarned(
        userSnap.data.reward2status?.reward2BonusEarned ?? 0
      );
      setReward3(userSnap.data().rewardsClaimed?.reward3 ?? false);
      setReward4(userSnap.data().rewardsClaimed?.reward4 ?? false);
      setReward5(userSnap.data().rewardsClaimed?.reward5 ?? false);

      setReferredUsers(+userSnap.data().usersReferred);
      const usersRefdCollection = collection(userRef, "usersReferred");
      const usersRefdQuery = query(usersRefdCollection);
      const usersRefdSnapshots = await getDocs(usersRefdQuery);
      let claimed = 0;
      let unclaimed = 0;
      let updatedUnclaimedRefsData = [];
      usersRefdSnapshots.forEach((doc) => {
        updatedUnclaimedRefsData.push(doc.data().userId);
        doc.data().claimed ? ++claimed : ++unclaimed;
      });
      setClaimedRefsCount(claimed);
      setUnclaimedRefsCount(unclaimed);
      setReferralBonusEarned(userSnap.data().referralBonus ?? 0);

      setAddressProofURL(userSnap.data().addressProofUrl ?? null);
      setAddressProofApprove(userSnap.data().addressProofApprove ?? null);
      setIdProofURL(userSnap.data().IDProofUrl ?? null);
      setIdProofApprove(userSnap.data().IDProofApprove ?? null);
    }

    const transactionsRef = collection(userRef, "transactions");
    const transactionsQuery = query(transactionsRef);
    const transactionsSnapshot = await getDocs(transactionsQuery);

    const transactionDataRead = [];
    transactionsSnapshot.forEach((doc) => {
      transactionDataRead.push({
        id: doc.id,
        amount: doc.data().amount,
        type: doc.data().type,
        time: doc.data().time?.toDate().toLocaleTimeString(),
        date: doc.data().time?.toDate().toLocaleDateString(),
        timeStamp: doc.data().time,
      });
    });

    transactionDataRead.sort((a, b) => {
      return b.timeStamp - a.timeStamp;
    });

    transactionDataRead.length === 0
      ? setNoTransactions(true)
      : setNoTransactions(false);

    setTransactions(transactionDataRead);
    setPagSize(Math.ceil(transactionDataRead.length / 5));

    setLoadingData(false);

    const publicRef = doc(fireStore, "public", "settings");
    const publicSnapshot = await getDoc(publicRef);
    if (publicSnapshot.exists()) {
      const data = publicSnapshot.data();
      setInitialReward1bonus(data.reward1);
    }
  };

  const downloadTransactions = () => {
    const downloadArray = [];
    transactions.forEach((doc) => {
      downloadArray.push({
        id: doc.id,
        amount: doc.amount,
        type: doc.type,
        time: doc.time,
        date: doc.date,
      });
    });
    const csv = Papa.unparse(downloadArray);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "transactions.csv");
    tempLink.click();
  };

  function shortenId(longId) {
    const alphanumericOnly = longId.replace(/[^a-zA-Z0-9]/g, "");
    const shortId = alphanumericOnly.substring(0, 8);
    return shortId;
  }
  const handleCopyLinkClick = () => {
    const url = `https://omo7-739e5.web.app/signup/${
      userData.shortID || shortenId(user.uid)
    }`; //https://omo-v1.web.app/
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(!copied);
      })
      .catch((error) => {
        console.error("Failed to copy URL to clipboard: ", error);
      });
  };

  const setUpUserData = async () => {
    setUsername(userData.username);
    userData.firstName &&
      userData.lastName &&
      setFullName(userData.firstName + " " + userData.lastName);
    setBonusBalance(+userData.bonusBalance);
    setTokenBalance(+userData.tokenBalance);
    if (userData.allGamesPlayed) {
      setTotalGames(+userData.allGamesPlayed.total);
      setWinCount(+userData.allGamesPlayed.wins);
      setLostCount(+userData.allGamesPlayed.loses);
      setDrawCount(+userData.allGamesPlayed.draws);
    }
    setReward2claims(userData.reward2status?.claimedCount ?? 0);
    setReward2BonusEarned(userData.reward2status?.reward2BonusEarned ?? 0);
    setReward3(userData.rewardsClaimed?.reward3 ?? false);
    setReward4(userData.rewardsClaimed?.reward4 ?? false);
    setReward5(userData.rewardsClaimed?.reward5 ?? false);

    setReferredUsers(+userData.usersReferred);
    const usersRefdCollection = collection(userRef, "usersReferred");
    const usersRefdQuery = query(usersRefdCollection);
    const usersRefdSnapshots = await getDocs(usersRefdQuery);
    let claimed = 0;
    let unclaimed = 0;
    let updatedUnclaimedRefsData = [];
    usersRefdSnapshots.forEach((doc) => {
      updatedUnclaimedRefsData.push(doc.data().userId);
      doc.data().claimed ? ++claimed : ++unclaimed;
    });
    setClaimedRefsCount(claimed);
    setUnclaimedRefsCount(unclaimed);
    setReferralBonusEarned(userData.referralBonus ?? 0);

    setAddressProofURL(userData.addressProofUrl ?? null);
    setAddressProofApprove(userData.addressProofApprove ?? null);
    setIdProofURL(userData.IDProofUrl ?? null);
    setIdProofApprove(userData.IDProofApprove ?? null);
  };

  useEffect(() => {
    console.log(userData, "user data from props");
    if (!userData) {
      user && fetchUserData();
    } else {
      setUpUserData();
    }
  }, [user, userData]);

  useEffect(() => {
    setCurrPagStartIndex(paginationIndex * 5);
  }, [paginationIndex]);

  const PAGINATION_LIMIT = 5;

  // Create the pagination buttons for the full list
  const fullPagButtons = [];
  for (let i = 0; i < pagSize; ++i) {
    fullPagButtons.push(
      <button
        key={i}
        onClick={() => setPaginationIndex(i)}
        className={`px-3 py-1 border-r border-r-gray-300 ${
          i === paginationIndex ? "active" : ""
        }`}
      >
        {i + 1}
      </button>
    );
  }

  // Create the pagination buttons for the shortened list
  const shortPagButtons = [];
  if (pagSize <= PAGINATION_LIMIT) {
    // Show all buttons if there are 10 or fewer pages
    shortPagButtons.push(...fullPagButtons);
  } else {
    // Otherwise, show a shortened list
    const startPage = Math.max(
      paginationIndex - Math.floor(PAGINATION_LIMIT / 2),
      0
    );
    const endPage = Math.min(startPage + PAGINATION_LIMIT - 1, pagSize - 1);
    if (startPage > 0) {
      // Show the first page if it's not in the shortened list
      shortPagButtons.push(
        <button
          className={`px-3 py-1 border-r border-r-gray-300 ${
            paginationIndex == 0 ? "active" : ""
          }`}
          key={0}
          onClick={() => setPaginationIndex(0)}
        >
          1
        </button>
      );
      // Show an ellipsis if the first page is not adjacent to the shortened list
      if (startPage > 1) {
        shortPagButtons.push(
          <span
            key="ellipsis1"
            className="px-2 py-1 border-r border-r-gray-300"
          >
            ...
          </span>
        );
      }
    }
    // Show the pages in the shortened list
    for (let i = startPage; i <= endPage; ++i) {
      shortPagButtons.push(
        <button
          key={i}
          onClick={() => setPaginationIndex(i)}
          className={`px-3 py-1 border-r border-r-gray-300 ${
            i === paginationIndex ? "active" : ""
          }`}
        >
          {i + 1}
        </button>
      );
    }
    if (endPage < pagSize - 1) {
      // Show an ellipsis if the last page is not adjacent to the shortened list
      if (endPage < pagSize - 2) {
        shortPagButtons.push(
          <span
            key="ellipsis2"
            className="px-2 py-1 border-r border-r-gray-300"
          >
            ...
          </span>
        );
      }
      // Show the last page if it's not in the shortened list
      shortPagButtons.push(
        <button
          key={pagSize - 1}
          className={`px-3 py-1 border-r border-r-gray-300 ${
            paginationIndex == pagSize - 1 ? "active" : ""
          }`}
          onClick={() => setPaginationIndex(pagSize - 1)}
        >
          {pagSize}
        </button>
      );
    }
  }

  const handleUploadCompleteID = (url) => {
    setIdProofURL(url);
  };
  const handleUploadCompleteAddress = (url) => {
    setAddressProofURL(url);
  };

  const handleEmailVerficationClick = () => {
    !isEmailSent &&
      sendEmailVerification(user)
        .then(() => setIsEmailSent(true))
        .catch((error) => {
          if (error.code === "auth/too-many-requests") {
            setIsEmailSent(true);
          }
        });
  };



  const handleOnChange = () => {
    setDarkMode(!darkMode);
  };


  if (loading || loadingData) {
    return <LoadingSpinner />;
  }

  // if (user) {
  return user ? (
    <div style={darkMode ? { backgroundColor: "black" } : {}}>
      <div
        className=" flex flex-col sm:w-[630px] sm:mx-auto my-3"
        style={darkMode ? { backgroundColor: "black", border: "1px solid gray" } : {}}
      >
        {/* <FormattedMessage id="welcomeMessage" defaultMessage="Welcome to my app!" /> */}
        <Header title={formatMessage({ id: "My Account" })} />
        <div className="w-full flex justify-center text-[13px] px-4">
          <div
            className="flex w-fit border border-gray-300 px-3 py-1 bg-white rounded-xl shadow-sm"
            style={
              darkMode
                ? { backgroundColor: "black", border: "1px solid #F7931A" }
                : {}
            }
          >
            <div className="flex font-medium text-[16px] py-[1px] text-gray-600">
              <span className="mr-2" style={darkMode ? { color: "white" } : {}}>
                {(tokenBalance + bonusBalance) % 1 === 0
                  ? +tokenBalance + bonusBalance
                  : (tokenBalance + bonusBalance).toFixed(2)}
              </span>
              <BitcoinIcon className="my-1 w-[20px] h-[18px] text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="p-[16px] overflow-scroll scrollbar-hide">
          <div className="flex flex-col">
            <div className="flex justify-between mb-5">
              <div className="mt-[15px] flex">
                <div
                  className="w-fit h-fit m-[2px] px-[8px] border border-gray-300 bg-white rounded-md py-1 text-sm"
                  style={
                    darkMode
                      ? {
                          border: "2px solid #F7931A",
                          color: "white",
                          backgroundColor: "black",
                        }
                      : {}
                  }
                >
                  User ID:{" "}
                  <span
                    className="text-sky-700 font-bold"
                    style={darkMode ? { color: "#8E8BFF" } : {}}
                  >
                    {userData?.shortID || shortenId(user?.uid)}
                  </span>
                </div>
              </div>
              <img
                src={
                  user?.photoURL
                    ? user.photoURL
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                }
                className="w-[50px] h-[50px] rounded-full"
              />
            </div>

            <div className="Profile mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "Profile" })}
                </div>
                {username !== undefined ? (
                  <div className="flex justify-between">
                    <span
                      className="font-semibold"
                      style={darkMode ? { color: "white" } : {}}
                    >
                      Username
                    </span>
                    <span style={darkMode ? { color: "white" } : {}}>
                      {username}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span
                    className="font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {formatMessage({ id: "Email" })}
                  </span>
                  <span
                    className="flex font-medium"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {userData?.email || user?.email}
                    {userData?.emailVerified || user.emailVerified ? (
                      <CheckBadgeIcon
                        width="18px"
                        height="18px"
                        className="mt-[5px] ml-[3px] text-green-500"
                      />
                    ) : (
                      <div
                        onClick={() =>
                          setClickEmailNotVerified(!clickEmailNotVerified)
                        }
                      >
                        <ExclamationCircleIcon
                          width="18px"
                          height="18px"
                          className="mt-[5px] ml-[3px] text-red-400 cursor-pointer"
                        />
                      </div>
                    )}
                  </span>
                </div>
                {clickEmailNotVerified && !user.emailVerified && (
                  <div
                    className="flex flex-row-reverse"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    <span
                      className="text-sm text-blue-500 font-medium cursor-pointer"
                      onClick={handleEmailVerficationClick}
                    >
                      {isEmailSent
                        ? "Verification link sent!"
                        : "Send verification link"}
                    </span>
                    <div className="text-sm mr-1">Email not verified. </div>
                  </div>
                )}

                {fullName !== "" && (
                  <div className="flex justify-between">
                    <span className="font-semibold" style={darkMode ? {color:'white'} : {}}>Name</span>
                    <span className="flex" style={darkMode ? {color:'white'} : {}}>{fullName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="Doc">
              <div className="flex flex-col">
                {fromWithdrawPage || idProofURL || addressProofURL ? (
                  <div className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]" style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }>
                    DOCUMENTS
                  </div>
                ) : null}
                {(fromWithdrawPage || idProofURL || addressProofURL) && (
                  <div className="mb-[30px]">
                    <div className="mb-4">
                      <div className="font-semibold pb-1 flex" style={darkMode ? { color: "white" } : {}}>
                        1. Proof of ID{" "}
                        {idProofApprove === "approved" && (
                          <div>
                            <CheckBadgeIcon
                              width="18px"
                              height="18px"
                              className="mt-[5px] ml-[10px] text-green-500"
                            />
                          </div>
                        )}{" "}
                        verified
                      </div>

                      {idProofApprove === null ? (
                        <div style={darkMode ? { color: "white" } : {}}>
                          {idProofURL ? (
                            <div>
                              <div className="flex justify-between">
                                <a
                                  href={idProofURL}
                                  target="_blank"
                                  className="text-blue-600 underline"
                                >
                                  Uploaded ID proof
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <FileUploader
                                userId={user.uid}
                                type="ID"
                                onUploadComplete={handleUploadCompleteID}
                              />
                              {idProofURL && (
                                <a
                                  href={idProofURL}
                                  target="_blank"
                                  className="text-blue-600 underline"
                                  style={darkMode ? { color: "white" } : {}}
                                >
                                  Uploaded ID proof
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ) : idProofApprove === "declined" ? (
                        <div>
                          <FileUploader
                            userId={user.uid}
                            type="ID"
                            onUploadComplete={handleUploadCompleteID}
                            declineMsg={true}
                          />
                          {idProofURL && (
                            <a
                              href={idProofURL}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              Uploaded ID proof
                            </a>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div className="font-semibold pb-1 flex" style={darkMode ? { color: "white" } : {}}>
                        2. Proof of Address{" "}
                        {addressProofApprove === "approved" && (
                          <div>
                            <CheckBadgeIcon
                              width="18px"
                              height="18px"
                              className="mt-[5px] ml-[10px] text-green-500"
                            />
                          </div>
                        )}{" "}
                        verified
                      </div>
                      {addressProofApprove === null ? (
                        <div>
                          {addressProofURL ? (
                            <div>
                              <div className="flex justify-between">
                                <a
                                  href={addressProofURL}
                                  target="_blank"
                                  className="text-blue-600 underline"
                                >
                                  Uploaded address proof
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div>
                                <FileUploader
                                  userId={user.uid}
                                  type="address"
                                  onUploadComplete={handleUploadCompleteAddress}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        addressProofApprove === "declined" && (
                          <div>
                            <FileUploader
                              userId={user.uid}
                              type="address"
                              onUploadComplete={handleUploadCompleteAddress}
                              declineMsg={true}
                            />
                            <a
                              href={addressProofURL}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              Uploaded address proof
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="Token  mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "Theme" })}
                </div>
                <div className="flex justify-between">
                  <div className="w-[60%]">
                    <div className="flex  justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {" "}
                        {formatMessage(darkMode ? { id: "Dark Mode" } : {id: "Light Mode"})}
                      </span>
                      <span
                        className="flex"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        <div
                          className="checkbox_wrapper"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <label class="switch">
                            <input
                              type="checkbox"
                              checked={darkMode}
                              onChange={handleOnChange}
                              style={{border:'1px solid gray'}}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="Token  mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "Balance" })}
                </div>
                <div className="flex justify-between">
                  <div className="w-[60%]">
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {formatMessage({ id: "AccountBalance" })}
                      </span>
                      <span
                        className="flex"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        €{" "}
                        {tokenBalance % 1 == 0
                          ? tokenBalance
                          : tokenBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex  justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {" "}
                        {formatMessage({ id: "BonusBalance" })}
                      </span>
                      <span
                        className="flex"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {bonusBalance ? (
                          <span>
                            €
                            {bonusBalance % 1 == 0
                              ? bonusBalance
                              : bonusBalance.toFixed(2)}
                          </span>
                        ) : (
                          0
                        )}
                      </span>
                    </div>
                  </div>

                  <Link to="/deposit">
                    <div className="w-[100px] mt-[10px]">
                      <button
                        className="bg-red-400 hover:bg-red-500 text-white font-bold py-[5px] px-[15px] rounded-full text-[12px]"
                        style={
                          darkMode
                            ? {
                                border: "1px solid #0FBE00",
                                background:
                                  "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 20.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                              }
                            : {}
                        }
                      >
                        {formatMessage({ id: "Deposit" })}
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="History  mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "History" })}
                </div>
                {noTransactions ? (
                  <span
                    className="text-center"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    You have not made any transactions yet
                  </span>
                ) : (
                  <div>
                    <div className="flex flex-col " style={darkMode ? {backgroundColor:'black', color:'white'} : {}}>
                      <div className="flex justify-between px-2 py-2 text-[14px]" style={darkMode ? {backgroundColor:'black', color:'white'} : {}}>
                        <span className="flex"
                    style={darkMode ? { color: "white" } : {}} >Transactions history</span>
                        <span
                          style={darkMode ? { color: "white" } : {}}
                          className="underline cursor-pointer"
                          onClick={downloadTransactions}
                        >
                          Download
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="overflow-x-auto" style={darkMode ? {backgroundColor:'black', color:'white'} : {}}>
                          <div className="p-1.5 w-[100%] inline-block align-middle">
                            <div className="overflow-hidden border rounded-lg">
                              <table className="w-[100%] divide-y divide-gray-200">
                                <thead className="bg-gray-50" style={darkMode ? { backgroundColor:'black'} : {}}>
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                      style={darkMode ? { color: "white" } : {}}
                                    >
                                      Amount
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-11 pl-3 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                      style={darkMode ? { color: "white" } : {}}
                                    >
                                      Type
                                    </th>
                                    <th
                                      scope="col"
                                      className="pl-3 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                      style={darkMode ? { color: "white" } : {}}
                                    >
                                      time
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                  {transactions
                                    .slice(
                                      currPagStartIndex,
                                      currPagStartIndex + 5
                                    )
                                    .map((transaction, index) => (
                                      <tr key={index}>
                                        <td
                                          className="pl-5 py-2 text-sm text-gray-800 whitespace-nowrap "
                                          style={
                                            darkMode ? { color: "white" } : {}
                                          }
                                        >
                                          € {transaction.amount}
                                        </td>
                                        <td
                                          className="py-2 text-sm text-gray-800 whitespace-nowrap"
                                          style={
                                            darkMode ? { color: "white" } : {}
                                          }
                                        >
                                          {transaction.type
                                            .charAt(0)
                                            .toUpperCase()}
                                          {transaction.type.slice(1)}
                                        </td>
                                        <td className="py-2 text-sm text-gray-800 whitespace-nowrap">
                                          <div className="flex flex-col">
                                            <span
                                              style={
                                                darkMode
                                                  ? { color: "white" }
                                                  : {}
                                              }
                                            >
                                              {transaction.date}
                                            </span>
                                            <span
                                              style={
                                                darkMode
                                                  ? { color: "white" }
                                                  : {}
                                              }
                                            >
                                              {transaction.time}{" "}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      {transactions.length > 5 && (
                        <div className="w-full flex justify-center">
                          <div className="flex w-full">
                            <div className="w-fit flex border-y border-gray-300 rounded-md">
                              <div
                                onClick={() =>
                                  paginationIndex - 1 > 0
                                    ? setPaginationIndex(paginationIndex - 1)
                                    : setPaginationIndex(0)
                                }
                                className="border-x py-2 border-x-gray-300 rounded-l-md px-2 cursor-pointer"
                              >
                                <ChevronLeftIcon className="w-4" />
                              </div>
                              {shortPagButtons}
                              <div
                                onClick={() =>
                                  paginationIndex + 1 < pagSize
                                    ? setPaginationIndex(paginationIndex + 1)
                                    : setPaginationIndex(paginationIndex)
                                }
                                className="border-r py-2 border-r-gray-300  rounded-r-md px-2 cursor-pointer"
                              >
                                <ChevronRightIcon className="w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="Games  mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "Games" })}
                </div>
                <div className="flex justify-between">
                  <div className="w-[55%]">
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {" "}
                        {formatMessage({ id: "Played" })}
                      </span>
                      <span
                        className="flex"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {totalGames ? totalGames : 0}
                      </span>
                    </div>
                    <div className="flex  justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {" "}
                        {formatMessage({ id: "Wins" })}
                      </span>
                      <span
                        className="flex "
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {winCount ? winCount : 0}
                      </span>
                    </div>
                    <div className="flex  justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {" "}
                        {formatMessage({ id: "Losses" })}
                      </span>
                      <span
                        className="flex "
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {lostCount ? lostCount : 0}
                      </span>
                    </div>
                    <div className="flex  justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {formatMessage({ id: "Draw" })}
                      </span>
                      <span
                        className="flex "
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {drawCount ? drawCount : 0}
                      </span>
                    </div>
                  </div>

                  <Link to="/live">
                    <div className="w-[100px] mt-[20px]">
                      <button
                        className="bg-red-400 hover:bg-red-500 text-white font-bold py-[5px] px-[15px] rounded-full text-[12px]"
                        style={
                          darkMode
                            ? {
                                border: "1px solid #0FBE00",
                                background:
                                  "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 20.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                              }
                            : {}
                        }
                      >
                        {formatMessage({ id: "GoLive" })}
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="Referrals  mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "Referrals" })}
                </div>
                <div className="flex justify-between">
                  <div className="w-[55%] mr-4">
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {formatMessage({ id: "Registered" })}
                      </span>
                      <span style={darkMode ? { color: "white" } : {}}>
                        {referredUsers ? referredUsers : 0}{" "}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {" "}
                        {formatMessage({ id: "Unclaimed" })}
                      </span>
                      <span
                        className="flex"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        € {unclaimedRefsCount * initialReward1bonus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        Claimed
                      </span>
                      <span
                        className="flex"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        € {referralBonusEarned}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div
                      className="cursor-pointer h-fit w-fit flex bg-[#E7F1FF] px-3 py-2 font-medium rounded-full shadow-sm"
                      style={darkMode ? { background: "#44BCFF" } : {}}
                      onClick={handleCopyLinkClick}
                    >
                      <div
                        className="text-[#3884FF] p-[1px] mr-2 text-[14px]"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        Referral Link
                      </div>
                      <div
                        className="text-blue-400 underline cursor-pointer w-fit"
                        style={darkMode ? { color: "white" } : {}}
                      >
                        {!copied ? (
                          <span>
                            <i className="fa fa-copy"></i>
                          </span>
                        ) : (
                          <i className="fa fa-check"></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="Rewards  mb-[30px]">
              <div className="flex flex-col">
                <div
                  className="font-bold bg-gray-500 w-fit px-[10px] py-[5px] text-white rounded-md text-[14px] mb-[7px]"
                  style={
                    darkMode
                      ? {
                          border: "1px solid #F7931A",
                          backgroundColor: "#F7931A",
                        }
                      : {}
                  }
                >
                  {formatMessage({ id: "Rewards" })}
                </div>
                <div className="flex justify-between">
                  <span
                    className="font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {formatMessage({ id: "Reward" })} 1
                  </span>
                  <span
                    className="text-gray-500 font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    Earned €{referralBonusEarned}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {formatMessage({ id: "Reward" })} 2
                  </span>
                  <span
                    className="text-gray-500 font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    Earned €{reward2BonusEarned}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {formatMessage({ id: "Reward" })} 3
                  </span>
                  {reward3 ? (
                    <span className="text-green-500 font-semibold">
                      Achieved
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">
                      {formatMessage({ id: "Incomplete" })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span
                    className="font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {formatMessage({ id: "Reward" })} 4
                  </span>
                  {reward4 ? (
                    <span className="text-green-500 font-semibold">
                      Achieved
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">
                      {formatMessage({ id: "Incomplete" })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span
                    className="font-semibold"
                    style={darkMode ? { color: "white" } : {}}
                  >
                    {formatMessage({ id: "Reward" })} 5
                  </span>
                  {reward5 ? (
                    <span className="text-green-500 font-semibold">
                      Achieved
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">
                      {formatMessage({ id: "Incomplete" })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-[30px] flex justify-between">
              <Link to="/termsConditions">
                <div className="underline cursor-pointer text-blue-500">
                  Terms and Conditions
                </div>
              </Link>
              <Link to="/report">
                <div
                  className="underline text-gray-600 cursor-pointer"
                  style={darkMode ? { color: "white" } : {}}
                >
                  Report Issue
                </div>
              </Link>
            </div>

            <div
              className="pb-[60px]"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <div
                className="cursor-pointer font-bold bg-blue-400 w-fit px-[10px] pt-[7px] pb-[0px]  text-white rounded-md text-[14px] flex"
                onClick={() => handleSignOut()}
                style={
                  darkMode
                    ? {
                        width: "120px",
                        height: "40px",
                        border: "1px solid #0FBE00",
                        background:
                          "linear-gradient(180deg, rgba(15, 190, 0, 0.50) 20.27%, rgba(15, 190, 0, 0.00) 145.45%)",
                      }
                    : { width: "120px", height: "40px" }
                }
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                Log out
              </div>
              <div style={{ marginTop: "-20px" }}>
                {" "}
                <CustomFlagSelect />{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <NotAuthorised />
  );
};

export default MyAccountPage;
