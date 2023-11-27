import React, { useState, useEffect } from "react";
import { BitcoinIcon, InfoIcon } from "../../assets/icons";
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
  where,
  increment,
  orderBy,
  limit,
  arrayUnion,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import app from "../../config/firebase";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { Header } from "../../components/PageTitle";
import NotAuthorised from "../../components/NotAuthorised";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";

const fireStore = getFirestore(app);
const functions = getFunctions(app);
const auth = getAuth(app);

const RewardsPage = () => {
  //initialising value, setup
  const [initialReward1bonus, setInitialReward1bonus] = useState(0);
  const [initialReward2count, setInitialReward2count] = useState(0);
  const [initialReward2bonus, setInitialReward2bonus] = useState(0);
  const [initialReward3bonus, setInitialReward3bonus] = useState(0);
  const [initialReward4bonus, setInitialReward4bonus] = useState(0);
  const [initialReward5Hrs, setInitialReward5Hrs] = useState(0);
  const [initialReward5bonus, setInitialReward5bonus] = useState(0);

  const [user, loadingUser] = useAuthState(auth);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);

  const [rewardLRedeem, setRewardLRedeem] = useState(false);
  const [isCurrMonthClaimed, setIsCurrentMonthClaimed] = useState(true);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  const [reward1Redeem, setReward1Redeem] = useState(false);
  const [claimedRefsCount, setClaimedRefsCount] = useState(0);
  const [unclaimedRefsCount, setUnclaimedRefsCount] = useState(0);
  const [unclaimedRefsData, setUnclaimedRefsData] = useState([]);

  const [reward2Redeem, setIsReward2Redeem] = useState(false);
  const [isReward2claimable, setIsReward2claimable] = useState(false);
  const [reward2table, setReward2Table] = useState(1);
  const [reward2res, setReward2res] = useState("lose");
  const [reward2ClaimedCount, setReward2ClaimedCount] = useState(0);
  const [reward2BonusEarned, setReward2BonusEarned] = useState(0);

  const [reward3Redeem, setReward3Redeem] = useState(false);
  const [isReward3claimed, setIsReward3Claimed] = useState(false);
  const [reward4Redeem, setReward4Redeem] = useState(false);
  const [isReward4claimed, setIsReward4Claimed] = useState(false);
  const [star2Deposit, setStar2Deposit] = useState(undefined);
  const [star3Deposit, setStar3Deposit] = useState(undefined);

  const [reward5Redeem, setReward5Redeem] = useState(false);
  const [reward5Percentage, setReward5Percentage] = useState(0);
  const [isReward5claimed, setIsReward5Claimed] = useState(false);
  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const fetchInitialData = async () => {
    const publicRef = doc(fireStore, "public", "settings");
    const publicSnapshot = await getDoc(publicRef);
    if (publicSnapshot.exists()) {
      const data = publicSnapshot.data();
      setInitialReward1bonus(data.reward1);
      setInitialReward2bonus(data.reward2);
      setInitialReward2count(data.reward2times);
      setInitialReward3bonus(data.reward3);
      setInitialReward4bonus(data.reward4);
      setInitialReward5Hrs(data.reward5Hrs);
      setInitialReward5bonus(data.reward5);
    }
  };

  const fetchUserData = async () => {
    const publicRef = doc(fireStore, "public", "settings");
    const publicSnapshot = await getDoc(publicRef);

    const userRef = doc(fireStore, "users", user.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setBonusBalance(userSnap.data().bonusBalance);
        setTokenBalance(userSnap.data().tokenBalance);

        // Loyalty REWARD
        const monthText = new Date().toLocaleString("default", {
          month: "long",
        });
        const year = new Date().getFullYear();
        const currDate = `${monthText}-${year}`;
        userSnap.data().loyaltyRewardClaimed?.includes(currDate)
          ? setIsCurrentMonthClaimed(true)
          : setIsCurrentMonthClaimed(false);

        // REWARD 1 -- Referral data
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
        setUnclaimedRefsData(updatedUnclaimedRefsData);
        setClaimedRefsCount(claimed);
        setUnclaimedRefsCount(unclaimed);
        setReferralBonus(userSnap.data().referralBonus ?? 0);

        // REWARD 2 -- reward 2 status
        if (userSnap.data().reward2status?.current === "unclaimed") {
          setIsReward2claimable(true);
          setReward2Table(userSnap.data().reward2status?.table);
          setReward2res(userSnap.data().reward2status?.result);
          setReward2BonusEarned(
            userSnap.data.reward2status?.reward2BonusEarned ?? 0
          );
        } else setIsReward2claimable(false);
        setReward2ClaimedCount(
          userSnap.data().reward2status?.claimedCount ?? 0
        );

        // REWARD 3, 4 -- Table unlock data
        userSnap.data().rewardsClaimed?.reward3
          ? setIsReward3Claimed(userSnap.data().rewardsClaimed.reward3)
          : setIsReward3Claimed(false);
        userSnap.data().rewardsClaimed?.reward4
          ? setIsReward4Claimed(userSnap.data().rewardsClaimed.reward4)
          : setIsReward4Claimed(false);
        userSnap.data().tableUnlockDeposit?.star2
          ? setStar2Deposit(userSnap.data().tableUnlockDeposit.star2)
          : setStar2Deposit(undefined);
        userSnap.data().tableUnlockDeposit?.star3
          ? setStar3Deposit(userSnap.data().tableUnlockDeposit.star3)
          : setStar3Deposit(undefined);

        // Reward 5 -- Tables played
        userSnap.data().rewardsClaimed?.reward5
          ? setIsReward5Claimed(userSnap.data().rewardsClaimed.reward5)
          : setIsReward5Claimed(false);

        const secondsPlayed = userSnap.data().allGamesPlayed.secondsPlayed ?? 1;
        const totalHoursConfig = publicSnapshot.data().reward5Hrs ?? 10;
        const totalHoursPlayed = secondsPlayed / 3600;
        const playedPercentage = (totalHoursPlayed / totalHoursConfig) * 100;
        setReward5Percentage(playedPercentage);
      }
    } catch (e) {
      console.log(e, "No doc exist!");
    }
    setLoading(false);
  };

  useEffect(() => {
    user && fetchUserData();
  }, [user]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const userRef = user ? doc(fireStore, "users", user.uid) : null;

    let unsubscribe = null;

    if (userRef) {
      unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setTokenBalance(parseFloat(doc.data().tokenBalance));
          setBonusBalance(parseFloat(doc.data().bonusBalance));
        } else {
          console.log("No such document!");
        }
        // setLoading(false)
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tokenBalance, bonusBalance]);

  function shortenId(longId) {
    const alphanumericOnly = longId.replace(/[^a-zA-Z0-9]/g, "");
    const shortId = alphanumericOnly.substring(0, 8);
    return shortId;
  }

  // Loyalty Reward
  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        sendEmail();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  async function sendEmail() {
    const sendEmailFunction = functions.httpsCallable("sendEmail");
    try {
      await sendEmailFunction({ userEmail: user.email });
      console.log("Email sent successfully.");
    } catch (error) {
      console.error(error);
    }
  }

  function calculateTimeLeft() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDayNextMonth = new Date(year, month + 1, 1);
    const difference = +firstDayNextMonth - +today;
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  const handleCopyLinkClick = () => {
    const url = `https://omo7-739e5.web.app/signup/${shortenId(user.uid)}`; //https://omo-v1.web.app/
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(!copied);
      })
      .catch((error) => {
        console.error("Failed to copy URL to clipboard: ", error);
      });
  };

  const handleClaimRewardLoyalty = () => {
    if (!rewardLRedeem) {
      const userRef = doc(fireStore, "users", user.uid);
      updateDoc(userRef, { bonusBalance: increment(10) });

      const monthText = new Date().toLocaleString("default", { month: "long" });
      const year = new Date().getFullYear();
      const newClaimedMonth = `${monthText}-${year}`;

      updateDoc(userRef, { loyaltyRewardClaimed: arrayUnion(newClaimedMonth) });
    }
    setRewardLRedeem(true);
  };

  const handleClaimReward1 = () => {
    if (!reward1Redeem) {
      const userRef = doc(fireStore, "users", user.uid);
      updateDoc(userRef, {
        bonusBalance: increment(unclaimedRefsCount * initialReward1bonus),
        referralBonus: increment(unclaimedRefsCount * initialReward1bonus),
      });

      const usersRefdCollection = collection(userRef, "usersReferred");
      unclaimedRefsData.map(async (data) => {
        const dataQuery = query(
          usersRefdCollection,
          where("userId", "==", data)
        );
        const querySnapshot = await getDocs(dataQuery);
        const doc = querySnapshot.docs[0];
        updateDoc(doc.ref, {
          claimed: true,
        });
      });
      setClaimedRefsCount(claimedRefsCount + unclaimedRefsCount);
      setReferralBonus(
        unclaimedRefsCount * initialReward1bonus + referralBonus
      );
    }
    setReward1Redeem(true);
  };

  const handleClaimReward2 = () => {
    if (!reward2Redeem) {
      const userRef = doc(fireStore, "users", user.uid);
      updateDoc(userRef, { bonusBalance: increment(initialReward2bonus) });
      updateDoc(userRef, {
        [`reward2status.claimedCount`]: increment(1),
        [`reward2status.current`]: "claimed",
        [`reward2status.earnedBonus`]: increment(initialReward2bonus),
      });
      setReward2ClaimedCount(reward2ClaimedCount + 1);
    }
    setReward2BonusEarned(initialReward2bonus + reward2BonusEarned);
    setIsReward2Redeem(true);
  };

  const handleClaimReward3 = () => {
    if (!reward3Redeem) {
      const userRef = doc(fireStore, "users", user.uid);
      updateDoc(userRef, {
        bonusBalance: increment(star2Deposit * (initialReward3bonus / 100)),
      });
      updateDoc(userRef, { [`rewardsClaimed.reward3`]: true });
    }
    setReward3Redeem(true);
  };

  const handleClaimReward4 = () => {
    if (!reward4Redeem) {
      const userRef = doc(fireStore, "users", user.uid);
      updateDoc(userRef, {
        bonusBalance: increment(star3Deposit * (initialReward4bonus / 100)),
      });
      updateDoc(userRef, { [`rewardsClaimed.reward4`]: true });
    }
    setReward4Redeem(true);
  };

  const handleClaimReward5 = () => {
    if (!reward5Redeem) {
      const userRef = doc(fireStore, "users", user.uid);
      updateDoc(userRef, { bonusBalance: increment(initialReward5bonus) });
      updateDoc(userRef, { [`rewardsClaimed.reward5`]: true });
    }
    setReward5Redeem(true);
  };

  return user ? (
    loadingUser || loading ? (
      <LoadingSpinner />
    ) : (
      <div
        className="p-[16px] flex flex-col overflow-scroll bg-gray-50"
        style={
          darkMode ? { backgroundColor: "black" } : { border: "2px solid red" }
        }
      >
        <div className="flex flex-col overflow-scroll scrollbar-hide pb-[50px] sm:w-[500px] sm:mx-auto">
          <Header title="REWARDS" />
          <div className="flex justify-center">
            <div
              className="flex mb-3 w-fit border px-3 py-1 bg-white rounded-xl shadow-sm"
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

          <div
            className="flex flex-col border mb-4 p-3 rounded-lg shadow-sm bg-white"
            style={darkMode ? { backgroundColor: "black", color: "white" } : {}}
          >
            <div className="flex flex-row justify-between mb-[13px]">
              <h1 className="text-[16px] font-bold">LOYALTY REWARD</h1>
              <div className="text-[13px] pt-[2px]">
                {timeLeft.days} days {timeLeft.hours}:{timeLeft.minutes}:
                {timeLeft.seconds} left
              </div>
            </div>
            <div className="flex text-[14px] mb-[13px]">
              <InfoIcon
                width="14px"
                height="14px"
                fill="gray"
                className="mt-[4px] mr-[7px]"
              />
              <div>Earn (€10) bonus on 1st day of every month</div>
            </div>
            <div className="w-fit bg-amber-400 text-white px-[10px] py-[5px] rounded-md text-[13px] font-bold">
              BONUS €10 / month
            </div>
            {!isCurrMonthClaimed && (
              <>
                <div
                  className="flex flex-col"
                  onClick={handleClaimRewardLoyalty}
                >
                  <div style={darkMode ? {backgroundColor:'black', border:'1px solid #F7931A'} : {}} className="h-[35px] text-[15px] cursor-pointer border font-medium w-fit flex bg-gray-100 px-3 py-1 mt-4 rounded-full mr-5 shadow-sm">
                    {!rewardLRedeem ? (
                      <span>Claim Reward 🏆</span>
                    ) : (
                      <span>Claimed! 🏆</span>
                    )}
                  </div>
                  <span className="text-[12px] mt-[7px] ml-2 flex">
                    <InfoIcon
                      width="12px"
                      height="12px"
                      fill="gray"
                      className="mt-[3px] mr-[6px] text-gray-200"
                    />
                    {!rewardLRedeem ? (
                      <span>
                        Claim loyalty reward for month of{" "}
                        {new Date().toLocaleString("default", {
                          month: "long",
                        })}
                      </span>
                    ) : (
                      <span>€10 added to your bonus balance!</span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col border mb-4 p-3 px-4 rounded-lg shadow-sm bg-white" style={darkMode? {color:'white', backgroundColor:"black"}:{}}>
            <div className="flex flex-row justify-between mb-[13px]">
              <h1 className="font-bold">REWARD 1</h1>
              <div className="text-[13px] pt-[3px]">
                Earned € {referralBonus}
              </div>
            </div>
            <div className="flex mb-[13px] text-[14px]">
              <InfoIcon
                width="14px"
                height="14px"
                fill="gray"
                className="mt-[4px] mr-[7px]"
              />
              <div>
                Earn (€{initialReward1bonus}) bonus for each friend you invite
              </div>
            </div>
            <div
              className="cursor-pointer w-fit flex bg-[#E7F1FF] px-3 py-2 font-medium rounded-full shadow-sm"
              onClick={handleCopyLinkClick}
              style={darkMode ? {backgroundColor:'black', color:'white', border:'1px solid #F7931A'} : {}} 
            >
              <div className="text-[#3884FF] p-[1px] mr-2 text-[14px]"  style={darkMode ? {backgroundColor:'black',color:'white'} : {}}>
                Referral Link
              </div>
              <div className="text-blue-400 underline cursor-pointer w-fit">
                {!copied ? (
                  <span>
                    <i className="fa fa-copy"></i>
                  </span>
                ) : (
                  <i className="fa fa-check"></i>
                )}
              </div>
            </div>

            {unclaimedRefsCount > 0 && (
              <>
                <div className="flex flex-col" onClick={handleClaimReward1}>
                  <div className="h-[35px] text-[15px] cursor-pointer border font-medium w-fit flex bg-gray-100 px-3 py-1 mt-4 rounded-full mr-5 shadow-sm">
                    {!reward1Redeem ? (
                      <span>Claim Reward 🏆</span>
                    ) : (
                      <span>Claimed! 🏆</span>
                    )}
                  </div>
                  <span className="text-[12px] mt-[7px] ml-2 flex">
                    <InfoIcon
                      width="12px"
                      height="12px"
                      fill="gray"
                      className="mt-[3px] mr-[6px] text-gray-200"
                    />
                    {!reward1Redeem ? (
                      <span>
                        {unclaimedRefsCount} users signed up using your referral
                        link
                      </span>
                    ) : (
                      <span>
                        €{unclaimedRefsCount * initialReward1bonus} added to
                        your bonus balance
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col border mb-4 p-3 rounded-lg shadow-sm bg-white" style={darkMode? {color:'white', backgroundColor:"black"}:{}}>
            <div className="flex flex-row justify-between mb-[13px]">
              <h1 className="text-[16px] font-bold">REWARD 2</h1>
              <div className="text-[13px] pt-[2px]">
                Earned € {reward2BonusEarned}
              </div>
            </div>
            <div className="flex text-[14px] mb-[13px]">
              <InfoIcon
                width="14px"
                height="14px"
                fill="gray"
                className="mt-[4px] mr-[7px]"
              />
              <div>
                Win or lose {initialReward2count} times in a row on same table
              </div>
            </div>
            <div className="w-fit bg-amber-400 text-white px-[10px] py-[5px] rounded-md text-[13px] font-bold">
              BONUS €{initialReward2bonus}
            </div>
            {isReward2claimable && (
              <>
                <div className="flex flex-col">
                  <div
                    className="h-[35px] text-[15px] cursor-pointer border font-medium w-fit flex bg-gray-100 px-3 py-1 mt-4 rounded-full mr-5 shadow-sm"
                    onClick={handleClaimReward2}
                  >
                    {!reward2Redeem ? (
                      <span>Claim Reward 🏆</span>
                    ) : (
                      <span>Claimed! 🏆</span>
                    )}
                  </div>
                  <span className="text-[12px] mt-[7px] ml-2 flex">
                    <InfoIcon
                      width="12px"
                      height="12px"
                      fill="gray"
                      className="mt-[3px] mr-[6px] text-gray-200"
                    />
                    {!reward2Redeem ? (
                      <span>
                        You {reward2res} 10 times on table {reward2table}
                      </span>
                    ) : (
                      <span>
                        €{initialReward2bonus} added to your bonus balance!
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col border mb-4 p-3 rounded-lg shadow-sm bg-white" style={darkMode? {color:'white', backgroundColor:"black"}:{}}>
            <div className="flex flex-row justify-between mb-[13px]">
              <h1 className="text-[16px] font-bold">REWARD 3</h1>
              <div className="text-[13px] pt-[2px]">
                {isReward3claimed || reward3Redeem ? (
                  <span className="text-green-500 font-semibold">Achieved</span>
                ) : (
                  <span>Incomplete</span>
                )}
              </div>
            </div>
            <div className="flex text-[14px] mb-[13px]">
              <InfoIcon
                width="14px"
                height="14px"
                fill="gray"
                className="mt-[4px] mr-[7px]"
              />
              <div>Unlock 2 star tables</div>
            </div>
            <div className="w-fit bg-amber-400 text-white px-[10px] py-[5px] rounded-md text-[13px] font-bold">
              {initialReward3bonus}% BONUS
            </div>
            {star2Deposit !== undefined && !isReward3claimed && (
              <>
                <div className="flex flex-col" onClick={handleClaimReward3}>
                  <div className="h-[35px] text-[15px] cursor-pointer border font-medium w-fit flex bg-gray-100 px-3 py-1 mt-4 rounded-full mr-5 shadow-sm">
                    {!reward3Redeem ? (
                      <span>Claim Reward 🏆</span>
                    ) : (
                      <span>Claimed! 🏆</span>
                    )}
                  </div>
                  <span className="text-[12px] mt-[7px] ml-2 flex">
                    <InfoIcon
                      width="12px"
                      height="12px"
                      fill="gray"
                      className="mt-[3px] mr-[6px] text-gray-200"
                    />
                    {!reward3Redeem ? (
                      <span>
                        You deposited €{star2Deposit} for unlocking 2 stars
                        tables
                      </span>
                    ) : (
                      <span>
                        €{star2Deposit * (initialReward3bonus / 100)} added to
                        your bonus balance
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col border mb-4 p-3 rounded-lg shadow-sm bg-white" style={darkMode? {color:'white', backgroundColor:"black"}:{}}>
            <div className="flex flex-row justify-between mb-[13px]">
              <h1 className="text-[16px] font-bold">REWARD 4</h1>
              <div className="text-[13px] pt-[2px]">
                {isReward4claimed || reward4Redeem ? (
                  <span className="text-green-500 font-semibold">Achieved</span>
                ) : (
                  <span>Incomplete</span>
                )}
              </div>
            </div>
            <div className="flex text-[14px] mb-[13px]">
              <InfoIcon
                width="14px"
                height="14px"
                fill="gray"
                className="mt-[4px] mr-[7px]"
              />
              <div>Unlock 3 star tables</div>
            </div>
            <div className="w-fit bg-amber-400 text-white px-[10px] py-[5px] rounded-md text-[13px] font-bold">
              {initialReward4bonus}% BONUS
            </div>
            {star3Deposit !== undefined && !isReward4claimed && (
              <>
                <div className="flex flex-col" onClick={handleClaimReward4}>
                  <div className="h-[35px] text-[15px] cursor-pointer border font-medium w-fit flex bg-gray-100 px-3 py-1 mt-4 rounded-full mr-5 shadow-sm">
                    {!reward4Redeem ? (
                      <span>Claim Reward 🏆</span>
                    ) : (
                      <span>Claimed! 🏆</span>
                    )}
                  </div>
                  <span className="text-[12px] mt-[7px] ml-2 flex">
                    <InfoIcon
                      width="12px"
                      height="12px"
                      fill="gray"
                      className="mt-[3px] mr-[6px] text-gray-200"
                    />
                    {!reward4Redeem ? (
                      <span>
                        You deposited €{star3Deposit} for unlocking 3 stars
                        tables
                      </span>
                    ) : (
                      <span>
                        €{star3Deposit * (initialReward4bonus / 100)} added to
                        your bonus balance
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col border mb-4 p-3 rounded-lg shadow-sm bg-white" style={darkMode? {color:'white', backgroundColor:"black"}:{}}>
            <div className="flex flex-row justify-between mb-[13px]">
              <h1 className="text-[16px] font-bold">REWARD 5</h1>
              {isReward5claimed || reward5Redeem ? (
                <span className="text-green-500 text-[13px] font-semibold">
                  Achieved
                </span>
              ) : (
                <div className="text-[13px] pt-[2px] font-semibold">
                  {reward5Percentage.toFixed(3)}% completed
                </div>
              )}
            </div>
            <div className="flex text-[14px] mb-[13px]">
              <InfoIcon
                width="14px"
                height="14px"
                fill="gray"
                className="mt-[4px] mr-[7px]"
              />
              <div>Play {initialReward5Hrs} hours on any tables</div>
            </div>
            <div className="w-fit bg-amber-400 text-white px-[10px] py-[5px] rounded-md text-[13px] font-bold">
              BONUS €{initialReward5bonus}
            </div>

            {reward5Percentage === 100 && !isReward5claimed && (
              <>
                <div className="flex flex-col" onClick={handleClaimReward5}>
                  <div className="h-[35px] text-[15px] cursor-pointer border font-medium w-fit flex bg-gray-100 px-3 py-1 mt-4 rounded-full mr-5 shadow-sm">
                    {!reward5Redeem ? (
                      <span>Claim Reward 🏆</span>
                    ) : (
                      <span>Claimed! 🏆</span>
                    )}
                  </div>
                  <span className="text-[12px] mt-[7px] ml-2 flex">
                    <InfoIcon
                      width="12px"
                      height="12px"
                      fill="gray"
                      className="mt-[3px] mr-[6px] text-gray-200"
                    />
                    {!reward5Redeem ? (
                      <span>
                        You played for {initialReward5Hrs} hours on all tables
                      </span>
                    ) : (
                      <span>
                        €{initialReward5bonus} added to your bonus balance!
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  ) : (
    <NotAuthorised />
  );
};

export default RewardsPage;
