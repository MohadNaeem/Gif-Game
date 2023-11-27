import React, { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import TablesCard from "./TablesCard";
import { BitcoinIcon } from "../../assets/icons";
import Popup from "../../components/Popup";
import app from "../../config/firebase";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import LoadingSpinner from "../../components/LoadingSpinner";
import NotAuthorised from "../../components/NotAuthorised";
import { Header } from "../../components/PageTitle";
import Styles from "./Index.module.css";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";

const fireStore = getFirestore(app);

export const InputStar1Lock = atom(false);
export const InputStar2Lock = atom(true);
export const InputStar3Lock = atom(true);
export const InputTotalBalance = atom(0);
export const InputTokenBalance = atom(0);
export const InputFromLivePage = atom(false);
export const InputIsSpectator = atom(false);
export const InputTableAmount = atom(0);
export const InputTableLockChoice = atom(false);

const ChooseTablePage = () => {
  const userAuthID = localStorage.getItem("userAuthID");
  const [tokenBalance, setTokenBalance] = useAtom(InputTokenBalance);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useAtom(InputTotalBalance);
  const [star1lock, setStar1lock] = useAtom(InputStar1Lock);
  const [star2lock, setStar2lock] = useAtom(InputStar2Lock);
  const [star3lock, setStar3lock] = useAtom(InputStar3Lock);
  const [loading, setLoading] = useState(true);
  const [darkMode,setDarkMode] = useRecoilState(Atom)

  const [level1time, setLevel1time] = useState(10);
  const [level2time, setLevel2time] = useState(15);
  const [level3time, setLevel3time] = useState(45);

  const tablesData = [
    { tableNum: 1, tableAmount: 0.25 },
    { tableNum: 2, tableAmount: 0.5 },
    { tableNum: 3, tableAmount: 1 },
    { tableNum: 4, tableAmount: 5 },
    { tableNum: 5, tableAmount: 10 },
    { tableNum: 6, tableAmount: 25 },
    { tableNum: 7, tableAmount: 50 },
    { tableNum: 8, tableAmount: 100 },
    { tableNum: 9, tableAmount: 500 },
  ];

  const fetchStarWiseTableStatus = async () => {
    const userRef = doc(fireStore, "users", userAuthID);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      userSnap.data().star2TablesLock !== undefined
        ? setStar2lock(userSnap.data().star2TablesLock)
        : setStar2lock(true);

      userSnap.data().star3TablesLock !== undefined
        ? setStar3lock(userSnap.data().star3TablesLock)
        : setStar3lock(true);
    }

    const publicRef = doc(fireStore, "public", "settings");
    const publicSnap = await getDoc(publicRef);

    if (publicSnap.exists()) {
      setLevel1time(publicSnap.data().level1time);
      setLevel2time(publicSnap.data().level2time);
      setLevel3time(publicSnap.data().level3time);
    }

    setLoading(false);
  };
  useEffect(() => {
    fetchStarWiseTableStatus();
  }, []);

  useEffect(() => {
    const userRef = userAuthID ? doc(fireStore, "users", userAuthID) : null;

    let unsubscribe = null;

    if (userRef) {
      unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setTokenBalance(parseFloat(doc.data().tokenBalance));
          setBonusBalance(parseFloat(doc.data().bonusBalance));
          setTotalBalance(
            parseFloat(doc.data().tokenBalance) +
              parseFloat(doc.data().bonusBalance)
          );
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
      <div className={darkMode ? Styles.Main_Dark_Page : Styles.Main_Page}>
        <div className={Styles.Main_Section}>
          <Header title="CHOOSE TABLE" />
          <div className={darkMode ? Styles.Top_Dark_Section :Styles.Top_Section}>
            <div>
              <div>
                <span>
                  {totalBalance % 1 === 0
                    ? totalBalance
                    : totalBalance.toFixed(2)}
                </span>
                <BitcoinIcon className={Styles.Bit_Coin} />
              </div>
            </div>
          </div>

          <div className="hidden bg-[#058274] bg-[#033382] bg-[#9E1DAB] bg-[#7416D4] bg-[#08400F] bg-[#24432F] bg-[#3C3819] bg-[#854405] bg-[#240000] bg-[#002424] bg-[#0E192D] bg-[#011924] bg-[#200024] bg-[#292201] bg-[#000000] bg-[#DEDEDE] bg-[#037082] bg-[#796F40] bg-[#8D8D8D]"></div>
          <Popup />
          <TablesCard
            starNum={1}
            lockTime={3}
            time={level1time}
            tablesData={tablesData.slice(0, 3)}
            minLimit={0.25}
          />
          <TablesCard
            starNum={2}
            time={level2time}
            tablesData={tablesData.slice(3, 6)}
            minLimit={5}
          />
          <TablesCard
            starNum={3}
            time={level3time}
            tablesData={tablesData.slice(6, 9)}
            minLimit={50}
          />
        </div>
      </div>
    )
  ) : (
    <NotAuthorised />
  );
};

export default ChooseTablePage;
