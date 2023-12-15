import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import {
  LockClosedIcon,
  UserIcon,
  CurrencyEuroIcon,
} from "@heroicons/react/24/solid";
import {
  InputFromLivePage,
  InputStar1Lock,
  InputStar2Lock,
  InputStar3Lock,
  InputTokenBalance,
  InputTotalBalance,
  InputIsSpectator,
  InputTableAmount,
  InputTableLockChoice,
} from ".";
import app from "../../config/firebase";
import { useList } from "react-firebase-hooks/database";
import { ref, set, get, getDatabase } from "firebase/database";
import ClickSound from "../../assets/audios/Conclusion/buttonclick.wav";
import WinSound from "../../assets/audios/Conclusion/winsound.wav";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";
import { useRef } from "react";

const database = getDatabase(app);

const Table = ({
  index,
  starNum,
  tableNum,
  tableAmount,
  tableTime,
  lockTime,
  minimumLimit,
}) => {
  const [star1lock] = useAtom(InputStar1Lock);
  const [star2lock] = useAtom(InputStar2Lock);
  const [star3lock] = useAtom(InputStar3Lock);
  const [fromLivePage, setFromLivePage] = useAtom(InputFromLivePage);
  const [currentLock, setCurrentLock] = useState(false);
  const [tokenBalance] = useAtom(InputTokenBalance);
  const [totalBalance] = useAtom(InputTotalBalance);
  const [isSpectator, setIsSpectator] = useAtom(InputIsSpectator);
  const [tableAmountMain, setTableAmountMain] = useAtom(InputTableAmount);
  const [tableLockChoice, setTableLockChoice] = useAtom(InputTableLockChoice);
  const navigate = useNavigate();
  const audioRef = useRef();

  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const [snapshotsTable, loadingTable1, error1] = useList(
    ref(database, `users/table${tableNum}/players`)
  );
  const findUniqueSnapshots = (snapshots) => {
    var uniqueSnapshots = snapshots?.filter(
      (snapshots, index, self) =>
        index === self.findIndex((t) => t.key === snapshots.key)
    );
    return uniqueSnapshots;
  };

  function getServerTime() {
    return Math.floor(Date.now() / 1000);
  }

  const handleJoinClick = () => {
    // const timerRef = ref(getDatabase(), `users/table${tableNum}/timer`)
    // snapshotsTable.length === 0 && set(timerRef, +getServerTime() + tableTime)
    const timerRef = ref(database, `timer${tableNum}`);
    get(timerRef).then((snapshot) => {
      const initialTime = snapshot.val();
      if (initialTime <= lockTime) {
        setIsSpectator(true);
        setTableLockChoice(true);
      } else {
        setIsSpectator(false);
        setTableLockChoice(false);
      }
    });
    setTableAmountMain(tableAmount);
    const userAuthID = localStorage.getItem("userAuthID");
    set(
      ref(database, "users/" + `table${tableNum}/` + "players/" + userAuthID),
      {
        boxClicked: 0,
      }
    );
    setFromLivePage(true);
    navigate(`/${tableTime}/table/${tableNum}`);
  };

  useEffect(() => {
    starNum === 1
      ? setCurrentLock(star1lock)
      : starNum === 2
      ? setCurrentLock(star2lock)
      : starNum === 3 && setCurrentLock(star3lock);
  }, [star1lock, star2lock, star3lock]);

  return (
    <div
      className={`basis-1/3 ${
        index === 2 ? "mr-0" : "mr-[25px]"
      }  flex justify-center`}
    >
      <div className="flex flex-col">
        <div className="w-fit">
          <div
            className={`${
              currentLock ? "invisible" : "visible"
            } relative z-0 top-[10px] right-[10px] bg-red-600 text-white text-center w-[40px] rounded-full px-[5px] py-[3px] shadow `}
          >
            <div className="flex justify-center">
              <UserIcon className="h-3 w-3 mr-[2px] mt-[4px] text-[17px]" />
              <span className="text-[13px] font-bold">
                {findUniqueSnapshots(snapshotsTable)?.length}
              </span>
            </div>
          </div>
          <div
            style={
              darkMode && currentLock
                ? {
                    border: "1px solid #ffbf00",
                    backgroundColor: "transparent",
                    color: "white",
                  }
                : darkMode && totalBalance >= tableAmount
                ? {
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid #0FBE00",
                  }
                : darkMode && totalBalance < tableAmount
                ? {
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid #ffbf00",
                  }
                : {}
            }
            className={`${
              currentLock
                ? "border-gray-200 bg-gray-200"
                : totalBalance >= tableAmount
                ? "border-[#BFF4BE] bg-[#BFF4BE]"
                : "border-amber-200 bg-amber-200"
            }  w-[75px] rounded-full px-5 py-6 text-center mb-[15px] mx-auto shadow text-gray-600 font-semibold`}
          >
            {tableAmount}
          </div>
        </div>

        <div className="w-full flex justify-center cursor-pointer">
          {currentLock ? (
            <LockClosedIcon
              style={darkMode ? { color: "#ffbf00" } : {}}
              className="h-5 w-5 text-gray-500 mr-1"
            />
          ) : totalBalance >= tableAmount ? (
            <div
              className="bg-green-400 w-fit h-[28px] font-bold text-center text-white rounded-full py-1 px-3 text-[13px]"
              onClick={() => {
                audioRef.current.play();
                handleJoinClick();
              }}
              style={
                darkMode ? { backgroundColor: "#0FBE00", color: "white" } : {}
              }
            >
              JOIN
            </div>
          ) : (
            <Link to="/deposit">
              <button className="bg-amber-300 flex w-fit h-[28px]  text-white font-bold py-1 px-3 rounded-full text-[13px]">
                BUY <CurrencyEuroIcon className="h-5 w-4 text-white ml-1" />
              </button>
            </Link>
          )}
        </div>
      </div>
      <audio ref={audioRef} src={ClickSound} />
    </div>
  );
};

export default Table;
