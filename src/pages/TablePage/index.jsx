import { useState, useEffect, useLayoutEffect } from "react";
import { useAtom } from "jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSound from "use-sound";
import app from "../../config/firebase";
import VaderPress from "../../assets/gif/Sorted Gifs/yoda vader fix/vader-press.mp4";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
  onDisconnect,
  get,
  runTransaction,
} from "firebase/database";
import { useList } from "react-firebase-hooks/database";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getFirestore,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import {
  CircleStackIcon,
  ShareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import {
  BitcoinIcon,
  Button1Turq,
  Button2Turq,
  Button1TurqPressedNormal,
  Button1TurqPressedGreen,
  Button1TurqPressedRed,
  Button2TurqPressedNormal,
  Button2TurqPressedGreen,
  Button2TurqPressedRed,
  Button1Gray,
  Button2Gray,
  Button1GrayPressedNormal,
  Button1GrayPressedGreen,
  Button1GrayPressedRed,
  Button2GrayPressedNormal,
  Button2GrayPressedGreen,
  Button2GrayPressedRed,
  LeftPink,
  LeftPinkPressed,
  RightPink,
  RightPinkPressed,
  LeftYellow,
  LeftYellowPressed,
  RightYellow,
  RightYellowPressed,
  GreenLeft,
  GreenRight,
  RedLeft,
  RedRight,
} from "../../assets/icons";
import NotAuthorised from "../../components/NotAuthorised";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProgressRing from "./ProgressRing";
import {
  InputFromLivePage,
  InputIsSpectator,
  InputTableAmount,
  InputTableLockChoice,
} from "../ChooseTablePage";
import Popup, {
  InputIsModalOpen,
  InputModalContent,
  InputModalHeader,
  InputModalType,
} from "../../components/Popup";
import { generateRandomTable } from "../../utils/TableDesign/TableSelect.js";
import OverlayMessage from "./OverlayMessage";
import leftBlueBorder from "../../assets/icons/border/blue_border/left.png";
import WinSound from "../../assets/audios/Conclusion/winsound.wav";
import LoseSound from "../../assets/audios/Conclusion/losesound.wav";
import DrawSound from "../../assets/audios/Conclusion/drawsound.wav";
import ButtonClickSound from "../../assets/audios/Conclusion/buttonclick.wav";
import TimerSound from "../../assets/audios/Conclusion/timer.wav";
import MapChangeSound from "../../assets/audios/Conclusion/mapchange.wav";
import topBlueBorder from "../../assets/icons/border/blue_border/top.png";
import rightBlueBorder from "../../assets/icons/border/blue_border/right.png";
import bottomBlueBorder from "../../assets/icons/border/blue_border/bottom.png";
import leftGoldBorder from "../../assets/icons/border/gold_border/left.png";
import topGoldBorder from "../../assets/icons/border/gold_border/top.png";
import SwapSound from "../../assets/audios/Conclusion/mapchange.wav";
import rightGoldBorder from "../../assets/icons/border/gold_border/right.png";
import bottomGoldBorder from "../../assets/icons/border/gold_border/bottom.png";
import OverlayMessageRound from "./OverlayMessageRound";

//Importing Data file for gifs
import { GifData, ConclusionData } from "../../utils/GifsUpdate/GifData";

//Importing css file
import Styles from "./Index.module.scss";
import WinEffect from "./WinEffect";
import AnimatedNumber from "react-animated-numbers";
import { useRef } from "react";
import ReactPlayer from "react-player";

const database = getDatabase(app);
const fireStore = getFirestore(app);

function preloadImage(src) {
  // if (src === undefined) return;
  // return new Promise((resolve, reject) => {
  //   const img = new Image();
  //   img.onload = function () {
  //     resolve(img);
  //   };
  //   img.onerror = img.onabort = function () {
  //     reject(src);
  //   };
  //   img.src = src;
  //   window[src] = img;
  // });
  var req = new XMLHttpRequest();
  req.open("GET", src, true);
  req.responseType = "blob";

  req.onload = function () {
    // Onload is triggered even on 404
    // so we need to check the status code
    if (this.status === 200) {
      var videoBlob = this.response;
      var vid = URL.createObjectURL(videoBlob); // IE10+
      // Video is now downloaded
      // and we can set it as source on the video element
      // window[src] = vid;
      // video.src = vid;
    }
  };
  req.onerror = function () {
    // Error
  };

  req.send();
}

// async function preloadAudio(url) {
//   return new Promise((resolve, reject) => { cwq
//     const audio = new Audio();
//     audio.onload = function () {
//       resolve(audio);
//     };
//     audio.onerror = audio.onabort = function () {
//       reject(url);
//     };
//     audio.src = url;
//     window[url] = audio;
//   });
// }s
// function preloadAudio(url) {
//   var audio = new Audio();
//   // once this file loads, it will call loadedAudio()
//   // the file will be kept by the browser as cache
//   audio.addEventListener("canplaythrough", loadedAudio, true);
//   audio.src = url;
//   audio.loop = true;
//   audio.play();
//   // window[url] = audio;
// }
function loadedAudio() {
  console.log("Loaded One");
}

async function preloadAudio(incomingAudio) {
  const audio = new Audio(incomingAudio.url);
  audio.onload = async function () {
    await resolve(audio);
  };
  audio.onerror = audio.onabort = function () {
    reject(incomingAudio.url);
  };
  audio.src = incomingAudio.url;
  if (incomingAudio.type === "countdown") {
    audio.loop = true;
  }
  window[incomingAudio.url] = audio;
  return { ...incomingAudio, audio: audio };
}

const TablePage = () => {
  const currentTable = useParams().number;
  const tableTime = parseInt(useParams().time);
  const audioRef = useRef();
  const winRef = useRef();
  const divRef = useRef(null);

  const navigate = useNavigate();
  const audioFiles = [
    { type: "win", url: WinSound },
    { type: "lose", url: LoseSound },
    { type: "draw", url: DrawSound },
    { type: "countdown", url: TimerSound },
  ];

  const conclusionGifs = [];

  const userAuthID = localStorage.getItem("userAuthID");
  const [liveUserSnapshots, loadingLiveUsers, error] = useList(
    ref(database, `users/table${currentTable}/players`)
  );
  var liveUsers = liveUserSnapshots
    ? liveUserSnapshots?.filter(
        (snapshots, index, self) =>
          index === self.findIndex((t) => t.key === snapshots.key)
      )
    : [];

  const [time, setTime] = useState(null);
  const [letUserIn, setLetUserIn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSound, setCurrentSound] = useState("");
  const [timerOn, setTimerOn] = useState(false);
  const [play] = useSound(WinSound);
  const [playLose] = useSound(LoseSound);
  const [TimerPlay, { stop, pause }] = useSound(TimerSound, {
    interrupt: true,
  });
  const [tableAmount, setTableAmount] = useAtom(InputTableAmount);
  const [preloadedAudio, setPreloadedAudio] = useState([]);
  const [tempAllocations, setTempAllocations] = useState({});
  const [finalResultCalled, setFinalResultCalled] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playerBox, setPlayerBox] = useState(0);
  const [result, setResult] = useState("");
  const [box1Ratio, setBox1Ratio] = useState(0);
  const [box2Ratio, setBox2Ratio] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isSpectator, setIsSpectator] = useAtom(InputIsSpectator);
  const [lockChoice, setLockChoice] = useAtom(InputTableLockChoice);
  const [fromLivePage, setFromLivePage] = useAtom(InputFromLivePage);

  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);

  const [open, setModalOpen] = useAtom(InputIsModalOpen);
  const [modalHeader, setModalHeader] = useAtom(InputModalHeader);
  const [modalContent, setModalContent] = useAtom(InputModalContent);
  const [modalType, setModalType] = useAtom(InputModalType);

  const [tableType, setTableType] = useState("VERTICAL");
  const [tableBgColor, setTableBgColor] = useState("#0E192D");
  const [tableButtonsType, setTableButtonsType] = useState("GRAY_12");
  const [tableResultType, setTableResultType] = useState("BACKGROUND_COLORED");
  const [btn1Clicked, setBtn1Clicked] = useState(false);
  const [btn2Clicked, setBtn2Clicked] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(true);

  const [isBonusRound, setIsBonusRound] = useState(false);
  const [isFreeRound, setIsFreeRound] = useState(false);

  //Creating a new useState to go through each map of gifs 1 by another
  const [index, setIndex] = useState(0);
  //creating a usestate to manage when to show flip animation
  const [isFlip, setIsFlip] = useState(false);
  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const pressOneRef = useRef(null);
  const pressTwoRef = useRef(null);

  const [isCoinShowing, setIsCoinShowing] = useState(true);

  const audioPlayer = (type) => {
    switch (type) {
      case "win":
        setTimeout(() => {
          play();
        }, 500);
        break;
      case "lose":
        setTimeout(() => {
          playLose();
        }, 1000);
        break;
      case "countdown":
        // if (audioRef.current) audioRef.current.loop = true;
        // audioRef?.current?.play();
        TimerPlay();
        setTimerOn(true);
        break;
      case "draw":
        preloadedAudio.filter((item) => item.type === "draw")[0]?.audio?.play();
        break;
      case "buttonclick":
        // if (audioRef.current) audioRef.current.src = ButtonClickSound;
        audioRef?.current?.play();
      case "mapchange":
        // if (audioRef.current) audioRef.current.src = MapChangeSound;
        audioRef?.current?.play();
      case "swapsound":
        // if (audioRef.current) audioRef.current.src = SwapSound;
        audioRef?.current?.play();
      default:
        stop();
        pause();
        // setTimerOn(false);
        if (audioRef.current) audioRef?.current?.pause();
        preloadedAudio.forEach((sound) => {
          sound?.audio?.pause();
        });
        break;
    }
  };

  // useEffect(() => {
  //   let isCancelled = false;
  //   async function effect() {
  //     if (isCancelled) {
  //       return;
  //     }
  //     const imagesPromiseList = [];
  //     for (const i of GifData) {
  //       imagesPromiseList.push(preloadImage(i.thummbnailOne));
  //       imagesPromiseList.push(preloadImage(i.thumbnailTwo));
  //       imagesPromiseList.push(preloadImage(i.pressedOne));
  //       imagesPromiseList.push(preloadImage(i.pressedTwo));
  //       imagesPromiseList.push(preloadImage(i.waitingOne));
  //       imagesPromiseList.push(preloadImage(i.waitingTwo));
  //       imagesPromiseList.push(preloadImage(i.thumbnail));
  //     }
  //     await Promise.all(imagesPromiseList);
  //     const conclusionImagesPromiseList = [];

  //     for (const i of Object.values(ConclusionData)) {
  //       conclusionImagesPromiseList.push(preloadImage(i));
  //     }
  //     await Promise.all(conclusionImagesPromiseList);
  //     const audioPromiseList = [];
  //     audioFiles.map(async (audio) => {
  //       const data = await preloadAudio(audio);
  //       setPreloadedAudio((prevState) => [...prevState, data]);
  //     });

  //     // await Promise.all(audioFiles);
  //     if (isCancelled) {
  //       return;
  //     }
  //     setAssetsLoaded(true);
  //   }
  //   effect();
  //   return () => {
  //     isCancelled = true;
  //   };
  // }, []);

  // useEffect(() => {
  //   GifData.map((item) => {
  //     [
  //       "thumbnail",
  //       "pressedOne",
  //       "pressedTwo",
  //       "waitingOne",
  //       "waitingTwo",
  //     ].forEach((keyItem) => {
  //       fetch(item[keyItem])
  //         .then((response) => response.blob())
  //         .then((blob) => {
  //           const url = blob;
  //           setTempAllocations((prevAllocation) => {
  //             let tempAlloc = { ...prevAllocation };
  //             tempAlloc[keyItem] = url;
  //             // window[url] = url;
  //             return {
  //               ...tempAlloc,
  //             };
  //           });
  //         })
  //         .catch((error) => {
  //           console.error("Error fetching video:", error);
  //         });
  //     });
  //   });
  // }, []);

  // useEffect(() => {
  // if ("caches" in window) {
  //   caches.keys().then((names) => {
  //     console.log("Cache", window);
  //   });
  // }
  // });
  // Final Result Calc
  const finalResult = async () => {
    var liveUsers = liveUserSnapshots.filter(
      (snapshots, index, self) =>
        index === self.findIndex((t) => t.key === snapshots.key)
    );
    const userRef = doc(fireStore, "users", userAuthID);
    var box1Count = 0,
      box2Count = 0;
    liveUsers.map((snapshot) => {
      if (snapshot.val().boxClicked === 1) ++box1Count;
      if (snapshot.val().boxClicked === 2) ++box2Count;
    });
    var totalPlayer = box1Count + box2Count === 0 ? 1 : box1Count + box2Count;

    // Winning box of current game
    var win = box1Count < box2Count ? 1 : box1Count > box2Count ? 2 : 0;

    const box1Res = ((box1Count / totalPlayer) * 100).toFixed(0);
    const box2Res = ((box2Count / totalPlayer) * 100).toFixed(0);
    setBox1Ratio(box1Res);
    setBox2Ratio(box2Res);

    if (!isSpectator) {
      if (win === 0) {
        setResult("draw");
        audioPlayer("draw");
        await updateDoc(userRef, {
          [`allGamesPlayed.draws`]: increment(1),
        });
        console.log("match drawn");
        setLoseCount(0);
        setWinCount(0);
        setTimeout(() => updateTableDesign(), 3000);
      } else if (playerBox === win) {
        setResult("win");
        audioPlayer("win");
        const updatedBalance = tokenBalance + tableAmount;
        setTokenBalance((prevState) => prevState + tableAmount);
        isBonusRound
          ? await updateDoc(userRef, { bonusBalance: updatedBalance })
          : await updateDoc(userRef, { tokenBalance: updatedBalance });
        await updateDoc(userRef, {
          [`allGamesPlayed.wins`]: increment(1),
        });
        setLoseCount(0);
        setWinCount(winCount + 1);
        if (winCount + 1 === 10) {
          updateDoc(userRef, {
            [`reward2status.table`]: currentTable,
            [`reward2status.result`]: "win",
            [`reward2status.current`]: "unclaimed",
          });
        }
      } else if (playerBox !== win) {
        setResult("lose");
        audioPlayer("lose");
        const updatedBalance =
          isFreeRound || isBonusRound
            ? tokenBalance
            : tokenBalance - tableAmount;

        if (updatedBalance >= 0) {
          setTokenBalance(updatedBalance);
          updateDoc(userRef, {
            tokenBalance: updatedBalance,
          });
          console.log("heree");
        } else {
          setBonusBalance(tableAmount - tokenBalance);
          setTokenBalance(0);
          audioPlayer("draw");
          updateDoc(userRef, {
            bonusBalance: bonusBalance - (tableAmount - tokenBalance),
            tokenBalance: 0,
          });
          console.log("heree2");
        }

        // isBonusRound
        //   ? await updateDoc(userRef, { bonusBalance: updatedBalance })
        //   : await updateDoc(userRef, { tokenBalance: updatedBalance })

        if (loseCount + 1 === 10) {
          updateDoc(userRef, {
            [`reward2status.table`]: currentTable,
            [`reward2status.result`]: "lose",
            [`reward2status.current`]: "unclaimed",
          });
        } else if (loseCount + 1 === 3) {
          setTimeout(() => setIsBonusRound(true), 2000);
        } else if (loseCount + 1 === 8) {
          setTimeout(() => setIsFreeRound(true), 2000);
        }
      }
      await updateDoc(userRef, {
        [`allGamesPlayed.loses`]: increment(1),
      });
      if (!isBonusRound || !isFreeRound) setLoseCount(loseCount + 1);
      setWinCount(0);
    }
    await updateDoc(userRef, {
      [`allGamesPlayed.secondsPlayed`]: increment(tableTime),
    });

    // Current player result and updating token balance accordingly

    if (!isSpectator) {
      await updateDoc(userRef, {
        [`tablesPlayedCount.table${currentTable}Count`]: increment(1),
      });

      await updateDoc(userRef, {
        [`allGamesPlayed.total`]: increment(1),
      });

      // updating the table played count
      const path = `users/table${currentTable}/playCount`;
      runTransaction(ref(database, path), (currentValue) => {
        if (currentValue === null) {
          // If the value does not exist, initialize it to 1
          return 1;
        } else {
          // Otherwise, increment the value
          return currentValue + 1;
        }
      });
    }
  };

  // Box Clicks
  const handleBox1Click = () => {
    const player = document.getElementById("player");
    player?.setAttribute("style", "top: -150px");
    // audioPlayer("buttonclick");

    set(
      ref(
        database,
        "users/" + `table${currentTable}/` + "players/" + userAuthID
      ),
      {
        boxClicked: 1,
      }
    );

    setPlayerBox(1);
  };
  const handleBox2Click = () => {
    const player = document.getElementById("player");
    // audioPlayer("buttonclick");
    player?.setAttribute("style", "top: 48px");

    set(
      ref(
        database,
        "users/" + `table${currentTable}/` + "players/" + userAuthID
      ),
      {
        boxClicked: 2,
      }
    );

    setPlayerBox(2);
  };
  const handleButton1Click = (e) => {
    // e.stopPropagation()
    setBtn1Clicked(true);
    setBtn2Clicked(false);
    // audioPlayer("buttonclick");
    set(
      ref(
        database,
        "users/" + `table${currentTable}/` + "players/" + userAuthID
      ),
      {
        boxClicked: 1,
      }
    );
    setPlayerBox(1);
  };
  const handleButton2Click = () => {
    !lockChoice && setBtn2Clicked(true);
    !lockChoice && setBtn1Clicked(false);
    // audioPlayer("buttonclick");
    set(
      ref(
        database,
        "users/" + `table${currentTable}/` + "players/" + userAuthID
      ),
      {
        boxClicked: 2,
      }
    );

    setPlayerBox(2);
  };

  // Removing User
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      const userRef = ref(
        database,
        `users/table${currentTable}/players/${userAuthID}`
      );
      remove(userRef);
      setFromLivePage(false);
    }
  };
  const unMountCleanUp = async () => {
    const userRef = ref(
      database,
      `users/table${currentTable}/players/${userAuthID}`
    );
    await remove(userRef);
    console.log("unmounted called");
  };

  // Utils
  const calculateRingProgress = () => {
    const progress = (time / tableTime) * 100;
    return progress;
  };
  const handleShareClick = (e) => {
    e.stopPropagation();
    setModalHeader("Share and earn bonus! 💸");
    setModalContent("Share your referral link and earn bonus");
    setModalType("share");
    setModalOpen(true);
  };
  const getServerTime = () => {
    return Math.floor(Date.now() / 1000);
  };

  const updateTableDesign = () => {
    const tableTypeRef = ref(database, `users/table${currentTable}/tableType`);
    const tableDesignRef = ref(database, `users/table${currentTable}/design/`);
    const randomTable = generateRandomTable();
    set(tableTypeRef, randomTable.tableType);
    if (randomTable.tableType !== "COINMOVE") {
      set(tableDesignRef, {
        bgColor: randomTable.bgColor,
        buttonsType: randomTable.buttonsType,
        resultType: randomTable.resultType,
      });
    }
  };

  // Bot choices set up
  function generateRandomChoices() {
    const numbers = [];
    for (let i = 0; i < 3; i++) {
      numbers.push(Math.floor(Math.random() * 2) + 1);
    }
    return numbers;
  }

  const resetBotChoices = () => {
    const randomChoice = generateRandomChoices();

    randomChoice.forEach((choice, index) => {
      set(
        ref(
          database,
          "users/" + `table${currentTable}/` + "players/" + `bot${index}`
        ),
        {
          boxClicked: choice,
        }
      );
    });
  };

  // use Effects

  const handleClick = (e) => {
    const divWidth = divRef.current.getBoundingClientRect().width;
    const halfDivWidth = divWidth / 2;
    const mouseXPos =
      window.innerWidth <= 560
        ? e.nativeEvent.offsetX * 2
        : e.nativeEvent.offsetX;
    if (mouseXPos <= halfDivWidth) {
      if (!lockChoice) {
        setWhichPart("first");
        pressOneRef.current.play();
        setIsOneWaiting(false);
        setIsTwoWaiting(false);
        handleButton1Click();
      }
    } else {
      if (!lockChoice) {
        setWhichPart("second");
        pressTwoRef.current.play();
        setIsOneWaiting(false);
        setIsTwoWaiting(false);
        handleButton2Click();
      }
    }
  };

  // timer
  useEffect(() => {
    // Get a reference to the Firebase Realtime Database 'timer' node
    const timerRef = ref(database, `timer${currentTable}`);

    // Read the initial value of the timer from the Firebase Realtime Database
    get(timerRef).then((snapshot) => {
      const initialTime = snapshot.val();
      if (initialTime !== 0) {
        setTime(initialTime);
      }
    });
    // Listen for updates to the timer value
    onValue(timerRef, (snapshot) => {
      setTime(snapshot.val());
    });

    // Clean up the Firebase Realtime Database reference when the component unmounts
    return () => {
      audioPlayer();
      onValue(timerRef, () => {}); // Remove the listener
      set(ref(getDatabase(), `timer${currentTable}`), tableTime); // Update the timer value on disconnect
      onDisconnect(ref(getDatabase(), `timer${currentTable}`)).cancel(); // Cancel the onDisconnect event
      // This thing has been changed to make sure user always enters at 10
      // if (time !== null) {
      // }
    };
  }, []);

  // timer, result, pause
  useEffect(() => {
    if (time === null) {
      audioPlayer();
      return;
    }

    // Automatically decrement the timer value every second
    let intervalId;
    if (time > 0 && !isPaused) {
      audioPlayer("countdown");
      if (!timerOn) {
        console.log("played");
      }
      intervalId = setInterval(() => {
        set(ref(getDatabase(), `timer${currentTable}`), time - 1);
      }, 1000);
      if (time === tableTime) {
        resetBotChoices();
        setPlayerBox(0);
      }
      if (time === 5) {
        if (tableTime !== 10) {
          setLockChoice(true);
          if (playerBox === -1 || playerBox === 0) {
            setIsSpectator(true);
            set(
              ref(
                database,
                "users/" + `table${currentTable}/` + "players/" + userAuthID
              ),
              {
                boxClicked: 0,
              }
            );
          }
        }
      }
      if (time === 3) {
        if (tableTime === 10) {
          setLockChoice(true);
          if (playerBox === -1 || playerBox === 0) {
            setIsSpectator(true);
            audioPlayer("draw");
            set(
              ref(
                database,
                "users/" + `table${currentTable}/` + "players/" + userAuthID
              ),
              {
                boxClicked: 0,
              }
            );
          }
        }
      }
    } else if (time === 0) {
      setFinalResultCalled(true);
      !finalResultCalled && finalResult();
      setIsPaused(true);
      setModalOpen(false);
      setShowResult(true);
      setIsCoinShowing(true);
      audioPlayer();
      setTimeout(() => {
        set(ref(getDatabase(), `timer${currentTable}`), tableTime);
        setIsPaused(false);
        setFinalResultCalled(false);
        setShowResult(false);
        setIsSpectator(false);
        setLockChoice(false);

        //Starting the gif map again from 0 if it reached last index otherwise incresing 1 in it.
        if (index < GifData.length - 1) {
          setIndex(index + 1);
        } else {
          setIndex(0);
        }

        // vertical table
        setBtn1Clicked(false);
        setBtn2Clicked(false);

        isFreeRound && setIsFreeRound(false);
        isBonusRound && setIsBonusRound(false);

        // getting times played
        get(ref(database, `users/table${currentTable}/playCount`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const playCount = snapshot.val();
              if (playCount % 25 === 0) {
                console.log("25th game");
                updateTableDesign();
              }
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });

        // horizontal table
        const player = document.getElementById("player");
        player?.setAttribute("style", "top: -51px");

        if (tokenBalance + bonusBalance < tableAmount) {
          navigate(`/table/${currentTable}/error`);
          setModalOpen(false);
        }
      }, 7000);
    }

    // Clean up the interval when the component unmounts or the timer value becomes null
    return () => clearInterval(intervalId);
  }, [time, isPaused, finalResultCalled]);

  // Table Design Setup
  useEffect(() => {
    const tableTypeRef = ref(database, `users/table${currentTable}/tableType`);
    const bgColorRef = ref(
      database,
      `users/table${currentTable}/design/bgColor`
    );
    const buttonsTypeRef = ref(
      database,
      `users/table${currentTable}/design/buttonsType`
    );
    const resultTypeRef = ref(
      database,
      `users/table${currentTable}/design/resultType`
    );

    onValue(tableTypeRef, (snapshot) => {
      const tableType = snapshot.val();

      if (tableType) {
        setTableType(tableType);
      }
    });
    onValue(buttonsTypeRef, (snapshot) => {
      const buttonsType = snapshot.val();

      if (buttonsType) {
        setTableButtonsType(buttonsType);
      }
    });
    onValue(resultTypeRef, (snapshot) => {
      const resultType = snapshot.val();

      if (resultType) {
        setTableResultType(resultType);
      }
    });
    onValue(bgColorRef, (snapshot) => {
      const bgColorVal = snapshot.val();

      if (bgColorVal) {
        setTableBgColor(bgColorVal);
      }
    });
  }, [tableType, tableBgColor, tableButtonsType, tableResultType, tableType]);

  // closing of tab listener
  useEffect(() => {
    // tableAmountSet()
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unMountCleanUp();
    };
  }, []);

  // Token Balance
  useEffect(() => {
    const userRef = doc(fireStore, "users", userAuthID);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const updatedTokenBalance = parseFloat(doc.data().tokenBalance);
        const updatedBonusBalance = parseFloat(doc.data().bonusBalance);
        setTokenBalance(updatedTokenBalance);
        setBonusBalance(updatedBonusBalance);

        if (updatedTokenBalance + updatedBonusBalance < tableAmount) {
          if (time > 0) navigate(`/table/${currentTable}/error`);
        }

        const currTableGamesPlayed =
          doc.data().tablesPlayedCount?.[`table${currentTable}Count`];

        // console.log(currTableGamesPlayed)

        if (currTableGamesPlayed % 20 === 0) {
          setIsFreeRound(true);
        }
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [box1Ratio]);

  // choose page redirect
  useEffect(() => {
    !fromLivePage && navigate("/live");
  }, [fromLivePage]);

  const b1Style = "h-[120px] w-[150px]";
  const b2Style = "h-[120px] w-[150px]";

  const leftBtnStyle = "relative left-[6%] xsm:left-[18%] h-[400px] w-[250px]";

  const rightBtnStyle =
    "relative right-[5%] top-[-11%] xsm:top-[-1%] xsm:right-[18%] h-[400px] w-[254px]";

  //to show waiting gif
  const [isOneWaiting, setIsOneWaiting] = useState(null);
  const [isTwoWaiting, setIsTwoWaiting] = useState(null);
  const [whichPart, setWhichPart] = useState("");

  useEffect(() => {
    return () => {
      console.log("exeec");
      preloadedAudio
        .filter((item) => item.type === "countdown")[0]
        ?.audio?.pause();
    };
  }, []);

  useEffect(() => {
    if (isOneWaiting && firstRef.current) {
      firstRef.current.play();
    }
  }, [firstRef, isOneWaiting]);

  useEffect(() => {
    if (isTwoWaiting && secondRef.current) {
      secondRef.current.play();
    }
  }, [secondRef, isTwoWaiting]);

  useEffect(() => {
    if (isPaused) {
      const timer = setTimeout(() => {
        setIndex(-1);
        audioPlayer("swapsound");
        window[GifData[index]?.pressedOne] = undefined;
        window[GifData[index]?.pressedTwo] = undefined;
        window[GifData[index]?.waitingOne] = undefined;
        window[GifData[index]?.waitingTwo] = undefined;
        if (GifData[index]?.styles.variant === "SingleBox") {
          window[GifData[index]?.thumbnail] = undefined;
        } else {
          window[GifData[index]?.thummbnailOne] = undefined;
          window[GifData[index]?.thumbnailTwo] = undefined;
        }
        setIsFlip(true);
      }, 4500);

      return () => {
        clearTimeout(timer);
      };
    } else {
      const timerTwo = setTimeout(() => {
        setIsFlip(false);
      }, 0);

      return () => {
        clearTimeout(timerTwo);
      };
    }
  }, [isPaused]);

  function handleOneClick() {
    if (!lockChoice) {
      setWhichPart("first");
      setIsOneWaiting(false);
    }
  }

  function handleTwoClick() {
    if (!lockChoice) {
      setWhichPart("second");
      setIsTwoWaiting(false);
    }
  }

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (whichPart === "first") {
  //       setIsOneWaiting(true);
  //     }
  //   }, GifData[index]?.timerOne);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [isOneWaiting, whichPart]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (whichPart === "second") {
  //       setIsTwoWaiting(true);
  //     }
  //   }, GifData[index]?.timerTwo);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [isTwoWaiting, whichPart]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCoinShowing(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isPaused]);

  return userAuthID ? (
    loadingLiveUsers === true || loading === true || !assetsLoaded ? (
      <LoadingSpinner />
    ) : (
      <div className="sm:w-[500px] h-[100vh] sm:mx-auto overflow-y-scroll overflow-x-hidden scrollbar-hide">
        {/* <audio ref={audioRef} preload="auto" src={TimerSound} /> */}
        <audio ref={winRef} preload="auto" src={WinSound} />
        <div className="flex justify-between my-2 mx-1">
          <Link to="/live">
            <div className="mt-[5px]">
              <ArrowLeftCircleIcon className="w-7 h-7 bg text-gray-500 arrow-svg" />
            </div>
          </Link>
          <div className="flex w-fit border ml-12 border-gray-300 px-3 py-1 bg-white rounded-xl shadow-sm ml-2">
            <div
              className={`font-medium mr-2 text-lg ${
                isPaused && !isSpectator
                  ? result === "win"
                    ? "text-green-600"
                    : result === "lose" && "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <AnimatedNumber
                includeComma
                transitions={(index) => ({
                  type: "spring",
                  duration: index + 0.8,
                })}
                animationType={"calm"}
                config={{ tension: 89, friction: 40 }}
                animateToNumber={tokenBalance + bonusBalance}
              />
            </div>
            {/* <span
              className={`font-medium mr-2 text-lg py-[1px] ${
                isPaused && !isSpectator
                  ? result === "win"
                    ? "text-green-600"
                    : result === "lose" && "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {tokenBalance + bonusBalance}
            </span> */}
            <BitcoinIcon className="mt-[5px] w-[20px] h-[20px] text-yellow-500" />
          </div>
          <div className="flex w-fit border border-gray-300 px-3 py-1 bg-white rounded-xl shadow-sm">
            <span className="font-medium mr-1 text-lg text-gray-600">
              {tableAmount}
            </span>
            <span>
              <CircleStackIcon className="my-[5px] w-[20px] h-[18px] text-yellow-500" />
            </span>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          {isSpectator ? (
            <OverlayMessage
              // message="SPECTATOR 👁️"
              message={ConclusionData.spectator}
              messageStyle="font-semibold text-gray-600"
              type={tableType}
              scale={2}
            />
          ) : isPaused ? (
            <div
              className="text-center"
              // className={result == "" ? Styles.NotVisible : 'text-center'}
            >
              {result === "win" ? (
                isBonusRound ? (
                  <OverlayMessage
                    // message="YOU WON! 🎉"
                    message={ConclusionData.bonusWinner}
                    x
                    scale={1}
                    bonus={true}
                  />
                ) : (
                  <OverlayMessage
                    // message="YOU WON! 🎉"
                    message={ConclusionData.YouWin}
                    scale={1}
                  />
                )
              ) : result === "lose" ? (
                <OverlayMessage
                  // message="YOU LOSE! 🚩"
                  message={ConclusionData.YouLose}
                  scale={1}
                />
              ) : result === "draw" ? (
                <OverlayMessage
                  // message="DRAWN 🏳️"
                  message={ConclusionData.draw}
                  scale={1}
                  bonus={true}
                />
              ) : (
                <div className={Styles.NotVisible}> </div>
              )}
            </div>
          ) : (
            lockChoice && (
              <OverlayMessage
                // message="LOCKED 🔒"
                message={ConclusionData.lock}
                scale={2}
              />
            )
          )}
        </div>

        <div style={{ position: "relative" }}>
          {isFreeRound ? (
            <OverlayMessageRound
              message={ConclusionData.freeRound}
              messageStyle={"font-bold text-md text-yellow-500 "}
            />
          ) : (
            isBonusRound && (
              <OverlayMessageRound
                message={ConclusionData.bonusRound}
                messageStyle={"font-bold text-md text-blue-500 "}
              />
            )
          )}
        </div>
        <div className="relative" style={{ position: "relative" }}>
          {isBonusRound && (
            <div>
              <img
                loading="eager"
                className="absolute top-0 right-0 h-[80vh] w-[15px] xsm:w-[20px] mt-4 z-10"
                src={rightBlueBorder}
                alt="right border"
              />
              <img
                loading="eager"
                className="absolute bottom-[-83vh] xsm:bottom-[-84vh] left-0 w-full pl-[2px] z-10"
                src={bottomBlueBorder}
                alt="bottom border"
              />
              <img
                loading="eager"
                className="absolute top-0 left-0 h-[80vh] w-[15px] xsm:w-[20px] mt-4"
                src={leftBlueBorder}
                alt="left border"
              />
              <img
                loading="eager"
                className="absolute top-0 right-0 w-full"
                src={topBlueBorder}
                alt="top border"
              />
            </div>
          )}
        </div>
        <div className="relative">
          {isFreeRound && (
            <div>
              <img
                loading="eager"
                className="absolute top-0 right-0  h-[81vh] xsm:h-[80vh] w-[12px] xsm:w-[13px] xsm:mr-[1px] mt-3 xsm:mt-4  z-10"
                src={rightGoldBorder}
                alt="right border"
              />
              <img
                loading="eager"
                className="absolute bottom-[-83vh] xsm:bottom-[-83vh] left-0 w-full ml-[1px] xsm:ml z-10"
                src={bottomGoldBorder}
                alt="bottom border"
              />
              <img
                loading="eager"
                className="absolute top-0 left-0 h-[81vh] xsm:h-[80vh] w-[12px] xsm:w-[13px] mt-3 xsm:mt-4"
                src={leftGoldBorder}
                alt="left border"
              />
              <img
                loading="eager"
                className="absolute top-0 right-0 w-full"
                src={topGoldBorder}
                alt="top border"
              />
            </div>
          )}
        </div>
        {tableType === "VERTICAL" || tableType == "HORIZONTAL" ? (
          <div
            style={{ position: "relative", background: isFlip && "black" }}
            className={`${
              isBonusRound || isFreeRound
                ? Styles.MainSection
                : Styles.MainSectionWithoutFree
            } ${Styles[GifData[index]?.styles?.className]}`}
          >
            <div
              // className="flex h-[80vh] w-full mb-10 "
              className={isFlip ? Styles.BoxFlip : Styles.Box}
            >
              {/* box1 */}
              {GifData[index]?.styles?.variant === "SingleBox" ? (
                <div
                  ref={divRef}
                  onClick={handleClick}
                  className={Styles.MainBox}
                >
                  <div
                    className="flex justify-between"
                    style={{ width: "100%" }}
                  >
                    <div
                      // className="self-start"
                      style={{ zIndex: "50" }}
                    >
                      <div className="h-fit flex py-1 px-2 rounded-lg ml-4 mt-4 bg-red-500">
                        <UserGroupIcon className="w-4 h-5 text-white mr-2" />
                        <span className="font-semibold text-white text-[14px]">
                          {liveUsers.length}{" "}
                          <span className="text-[13px]">LIVE</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="mr-2 mt-3" style={{ zIndex: 50 }}>
                        <ProgressRing
                          progress={calculateRingProgress()}
                          timer={time}
                          tableTime={tableTime}
                        />
                      </div>
                    </div>
                  </div>
                  {/* {btn1Clicked ? (
                    isPaused ? (
                      box1Ratio > box2Ratio ? (
                        <video
                          playing={true}
                          src={URL.createObjectURL(tempAllocations.waitingOne)}
                          width={"500px"}
                          height={"100vh"}
                        />
                      ) : box1Ratio < box2Ratio ? (
                        <div className={Styles?.BitCoinOne}>
                          <img
                            loading="eager"
                            style={{
                              transform: "scale(1.1)",
                              marginTop: "13rem",
                              scale: 1.5,
                            }}
                            url={ConclusionData?.BitCoinOne}
                            className={Styles?.LeftPotionGifWinner}
                          />
                          <WinEffect side="left" value={tableAmount} />
                        </div>
                      ) : (
                        <video
                          playing={true}
                          url={URL.createObjectURL(tempAllocations?.waitingOne)}
                          width={"500px"}
                          height={"100vh"}
                        />
                      )
                    ) : (
                      <video
                        width={"500px"}
                        height={"100vh"}
                        playing={true}
                        loop={true}
                        // controls
                        preload={true}
                        autoPlay
                        // onEnded={handleVideoEnd}
                        src={
                          !isOneWaiting
                            ? URL.createObjectURL(tempAllocations.pressedOne)
                            : URL.createObjectURL(tempAllocations.waitingOne)
                        }
                        type="video/mp4"
                      />
                    )
                  ) : btn2Clicked ? (
                    isPaused ? (
                      box1Ratio < box2Ratio ? (
                        <video
                          playing={true}
                          src={URL.createObjectURL(tempAllocations?.waitingTwo)}
                          width={"500px"}
                          height={"100vh"}
                        />
                      ) : box1Ratio > box2Ratio ? (
                        isCoinShowing && (
                          <div className={Styles.BitCoinPortion}>
                            <img
                              loading="eager"
                              src={ConclusionData.BitCoinTwo}
                              className={Styles.rightPortionBitCoin}
                            />
                            <WinEffect side="right" value={tableAmount} />
                          </div>
                        )
                      ) : (
                        <ReactPlayer
                          playing={true}
                          url={URL.createObjectURL(tempAllocations?.waitingTwo)}
                          loop={true}
                          width={"500px"}
                          height={"100vh"}
                        />
                      )
                    ) : !isTwoWaiting ? (
                      <ReactPlayer
                        playing={true}
                        url={URL.createObjectURL(tempAllocations?.pressedTwo)}
                        width={"500px"}
                        height={"100vh"}
                      />
                    ) : (
                      <ReactPlayer
                        playing={true}
                        url={URL.createObjectURL(tempAllocations?.waitingTwo)}
                        loop={true}
                        width={"500px"}
                        height={"100vh"}
                      />
                    )
                  ) : (
                    <video
                      playing={false}
                      src={URL.createObjectURL(tempAllocations?.thumbnail)}
                      width={"500px"}
                      height={"100vh"}
                    />
                  )} */}
                  {
                    <>
                      {/* {isPaused ? (
                        box1Ratio > box2Ratio ? (
                          <div className={Styles.BitCoinPortion}>
                            <img
                              loading="eager"
                              src={ConclusionData.BitCoinTwo}
                              className={Styles.rightPortionBitCoin}
                            />
                            <WinEffect side="right" value={tableAmount} />
                          </div>
                        ) : (
                          <div className={Styles?.BitCoinOne}>
                            <img
                              loading="eager"
                              style={{
                                transform: "scale(1.1)",
                                marginTop: "13rem",
                                scale: 1.5,
                              }}
                              url={ConclusionData?.BitCoinOne}
                              className={Styles?.LeftPotionGifWinner}
                            />
                            <WinEffect side="left" value={tableAmount} />
                          </div>
                        )
                      ) : (
                        <></>
                      )} */}
                      <video
                        ref={pressOneRef}
                        preload="auto"
                        style={{
                          display:
                            isOneWaiting || btn2Clicked ? "none" : "block",
                        }}
                        // src={URL.createObjectURL(tempAllocations.pressedOne)}
                        src={GifData[index].pressedOne}
                        width={"500px"}
                        height={"100vh"}
                        onEnded={() => setIsOneWaiting(true)}
                        playsinline
                        onLoad={() => {
                          console.log("Data is loaded!");
                          setLoading(false);
                        }}
                      />
                      <video
                        ref={pressTwoRef}
                        style={{
                          display:
                            isTwoWaiting || btn1Clicked ? "none" : "block",
                        }}
                        src={GifData[index].pressedTwo}
                        width={"500px"}
                        height={"100vh"}
                        preload="auto"
                        onEnded={() => setIsTwoWaiting(true)}
                        playsinline
                        onLoad={() => {
                          console.log("Data is loaded!");
                          setLoading(false);
                        }}
                      />
                      <video
                        ref={firstRef}
                        // autoPlay
                        loop
                        style={{ display: !isOneWaiting ? "none" : "block" }}
                        // src={URL.createObjectURL(tempAllocations?.waitingOne)}
                        src={GifData[index].waitingOne}
                        width={"500px"}
                        height={"100vh"}
                        preload="auto"
                        playsinline
                      />
                      <video
                        ref={secondRef}
                        loop
                        style={{ display: !isTwoWaiting ? "none" : "block" }}
                        // src={URL.createObjectURL(tempAllocations?.waitingTwo)}
                        src={GifData[index].waitingTwo}
                        width={"500px"}
                        preload="auto"
                        height={"100vh"}
                        playsinline
                      />
                    </>
                  }
                </div>
              ) : (
                <>
                  <div
                    className={Styles.box1main}
                    onClick={(e) => !lockChoice && handleButton1Click(e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      zIndex:
                        btn1Clicked &&
                        GifData[index]?.styles?.enableZindexing &&
                        15,
                    }}
                  >
                    <div
                      className="self-start"
                      style={{ zIndex: 50, position: "absolute" }}
                    >
                      <div className="h-fit flex py-1 px-2 rounded-lg ml-4 mt-4 bg-red-500">
                        <UserGroupIcon className="w-4 h-5 text-white mr-2" />
                        <span className="font-semibold text-white text-[14px]">
                          {liveUsers.length}{" "}
                          <span className="text-[13px]">LIVE</span>
                        </span>
                      </div>
                    </div>
                    {console.log("isOne Waiting  ", isOneWaiting)}
                    {console.log("isTwo Waiting ", isTwoWaiting)}
                    <span className={`text-[30px] text-gray-600 font-semibold`}>
                      {console.log(tableButtonsType)}
                      {tableButtonsType === "YELLOW_LR" ||
                      tableButtonsType == "TURQ_12" ||
                      tableButtonsType === "PINK_LR" ||
                      tableButtonsType === "GRAY_12" ? (
                        btn1Clicked ? (
                          isPaused ? (
                            box1Ratio > box2Ratio ? (
                              <img
                                loading="eager"
                                src={GifData[index]?.waitingOne}
                                className={
                                  GifData[index]?.sideOneTwo
                                    ? Styles?.SpecialHotCold
                                    : Styles?.LeftPotionGif
                                }
                              />
                            ) : box1Ratio < box2Ratio ? (
                              <div className={Styles?.BitCoinOne}>
                                <img
                                  loading="eager"
                                  // style={{
                                  //   transform: "scale(1.1)",
                                  //   marginTop: "13rem",
                                  //   scale: 1.5,
                                  // }}
                                  src={ConclusionData?.BitCoinOne}
                                  className={Styles?.LeftPotionGifWinner}
                                />
                                <WinEffect side="left" value={tableAmount} />
                              </div>
                            ) : (
                              <img
                                loading="eager"
                                src={GifData[index].waitingOne}
                                className={
                                  GifData[index].sideOneTwo
                                    ? Styles.SpecialHotCold
                                    : Styles.LeftPotionGif
                                }
                              />
                            )
                          ) : !isOneWaiting ? (
                            <img
                              loading="eager"
                              src={GifData[index].pressedOne}
                              className={
                                GifData[index].sideOneTwo
                                  ? Styles.SpecialHotCold
                                  : Styles.LeftPotionGif
                              }
                            />
                          ) : (
                            <img
                              loading="eager"
                              src={GifData[index].waitingOne}
                              className={
                                GifData[index].sideOneTwo
                                  ? Styles.SpecialHotCold
                                  : Styles.LeftPotionGif
                              }
                            />
                          )
                        ) : (
                          <img
                            loading="eager"
                            onClick={() => handleOneClick()}
                            src={GifData[index]?.thummbnailOne}
                            className={
                              GifData[index]?.sideOneTwo
                                ? Styles.SpecialHotCold
                                : Styles.LeftPotionGif
                            }
                          />
                        )
                      ) : (
                        " "
                      )}
                      {/* box1 res */}
                      <div
                        // className={`flex flex-row relative top-[10%] left-[10%] justify-center ${
                        //   showResult ? "visible" : "invisible"
                        // } `}
                        className={
                          isPaused ? Styles.Result : Styles.HiddenResult
                        }
                      >
                        <div
                        // className="rounded-md border border-gray-300 text-gray-600 shadow-md px-3 py-1 bg-white  text-[17px]"
                        >
                          {box1Ratio} %
                        </div>
                      </div>
                    </span>
                  </div>
                  <div
                    className={Styles.BoxMain2}
                    onClick={() => !lockChoice && handleButton2Click()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      zIndex:
                        btn2Clicked &&
                        GifData[index]?.styles?.enableZindexing &&
                        15,
                    }}
                  >
                    <div
                      className="self-end mr-2 mt-3 mb-[48px]"
                      style={{ zIndex: 50 }}
                    >
                      <ProgressRing
                        progress={calculateRingProgress()}
                        timer={time}
                        tableTime={tableTime}
                      />
                    </div>
                    <span className="text-[30px] mb-[50px] text-gray-600 font-semibold ">
                      {tableButtonsType === "YELLOW_LR" ||
                      tableButtonsType === "PINK_LR" ||
                      tableButtonsType === "TURQ_12" ||
                      tableButtonsType === "GRAY_12" ? (
                        btn2Clicked ? (
                          isPaused ? (
                            box1Ratio < box2Ratio ? (
                              <img
                                loading="eager"
                                style={
                                  GifData[index]?.designChangeTwo
                                    ? {
                                        transform: "scale(0.8)",
                                        marginTop: "-25px",
                                      }
                                    : GifData[index]?.rotateTwo
                                    ? {
                                        transform: "rotateY(180deg)",
                                      }
                                    : {}
                                }
                                src={GifData[index]?.waitingTwo}
                                className={
                                  GifData[index]?.sideOneTwo
                                    ? Styles.SpecialHotColdTwo
                                    : Styles.rightPortionGif
                                }
                              />
                            ) : box1Ratio > box2Ratio ? (
                              isCoinShowing && (
                                <div className={Styles.BitCoin}>
                                  <img
                                    loading="eager"
                                    src={ConclusionData.BitCoinTwo}
                                    className={Styles.rightPortionWinBitCoin}
                                    style={{
                                      transform: "scale(1.1)",
                                      marginTop: "10rem",
                                      scale: 1.5,
                                    }}
                                  />
                                  <WinEffect side="right" value={tableAmount} />
                                </div>
                              )
                            ) : (
                              <img
                                loading="eager"
                                style={
                                  GifData[index].designChangeTwo
                                    ? {
                                        transform: "scale(0.8)",
                                        marginTop: "-25px",
                                      }
                                    : GifData[index].rotateTwo
                                    ? {
                                        transform: "rotateY(180deg)",
                                      }
                                    : {}
                                }
                                src={GifData[index].waitingTwo}
                                className={
                                  GifData[index].sideOneTwo
                                    ? Styles.SpecialHotColdTwo
                                    : Styles.rightPortionGif
                                }
                              />
                            )
                          ) : !isTwoWaiting ? (
                            <img
                              loading="eager"
                              src={GifData[index].pressedTwo}
                              style={
                                GifData[index].designChangeTwo
                                  ? {
                                      transform: "scale(0.8)",
                                      marginTop: "-25px",
                                    }
                                  : GifData[index].rotateTwo
                                  ? {
                                      transform: "rotateY(180deg)",
                                    }
                                  : {}
                              }
                              className={
                                GifData[index].sideOneTwo
                                  ? Styles.SpecialHotColdTwo
                                  : Styles.rightPortionGif
                              }
                            />
                          ) : (
                            <img
                              loading="eager"
                              src={GifData[index]?.waitingTwo}
                              style={
                                GifData[index]?.designChangeTwo
                                  ? {
                                      transform: "scale(0.8)",
                                      marginTop: "-25px",
                                    }
                                  : GifData[index]?.rotateTwo
                                  ? {
                                      transform: "rotateY(180deg)",
                                    }
                                  : {}
                              }
                              className={
                                GifData[index]?.sideOneTwo
                                  ? Styles.SpecialHotColdTwo
                                  : Styles.rightPortionGif
                              }
                            />
                          )
                        ) : (
                          <img
                            loading="eager"
                            src={GifData[index]?.thumbnailTwo}
                            style={
                              GifData[index]?.designChangeTwo
                                ? {
                                    transform: "scale(0.8)",
                                    marginTop: "-25px",
                                  }
                                : GifData[index]?.rotateTwo
                                ? {
                                    transform: "rotateY(180deg)",
                                  }
                                : {}
                            }
                            onClick={handleTwoClick}
                            className={
                              GifData[index]?.sideOneTwo
                                ? Styles.SpecialHotColdTwo
                                : Styles.rightPortionGif
                            }
                          />
                        )
                      ) : (
                        " "
                      )}
                      {/* box2 res */}
                      {console.log("box 2 vote is ", box2Ratio)}
                      <div
                        className={
                          isPaused ? Styles.Result : Styles.HiddenResult
                        }
                      >
                        <div>{box2Ratio} %</div>
                      </div>
                    </span>
                  </div>
                </>
              )}

              <span className="fixed bottom-[85px] right-0 md:right-[28%] lg:right-[34%] sm:bottom-[15%] mb-4 mr-4">
                <div
                  className="border-[1px] p-3 border-gray-700 rounded-full shadow-md bg-white"
                  onClick={(e) => handleShareClick(e)}
                >
                  <ShareIcon className="w-6 h-5 text-gray-700" />
                </div>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-col mt-6 h-[70vh] w-full">
            <div className="w-full mb-5">
              <div className="flex justify-between">
                <div className="h-fit flex py-1 px-2 rounded-lg ml-4 mt-4 bg-red-500">
                  <UserGroupIcon className="w-4 h-5 text-white mr-2" />
                  <span className="font-semibold text-white text-[14px]">
                    {liveUsers.length} <span className="text-[13px]">LIVE</span>
                  </span>
                </div>

                <div className="mr-2 mt-2" style={{ zIndex: 50 }}>
                  <ProgressRing
                    progress={calculateRingProgress()}
                    timer={time}
                    tableTime={tableTime}
                    outside={true}
                  />
                </div>
              </div>
            </div>
            {/* box1 */}
            <div
              className={`relative z-0 
            ${
              isSpectator
                ? "border-[3px] border-black"
                : "border-[2px] border-gray-400"
            } 
            h-[44%] rounded-t-md flex flex-col justify-center items-center text-2xl cursor-pointer ${
              isPaused
                ? playerBox === 0
                  ? box1Ratio < box2Ratio
                    ? "bg-green-500"
                    : box1Ratio > box2Ratio
                    ? "bg-red-500"
                    : "bg-gray-400"
                  : box1Ratio === box2Ratio
                  ? "bg-gray-400"
                  : playerBox === 1 && box1Ratio < box2Ratio
                  ? "bg-green-500"
                  : playerBox === 1 && box1Ratio > box2Ratio
                  ? "bg-red-500"
                  : "bg-[#3A3B3C]"
                : "bg-[#3A3B3C]"
            }`}
              onClick={() => !lockChoice && handleBox1Click()}
            >
              <span className="text-[30px] text-white font-semibold">1</span>
            </div>

            {/* box1 res */}
            <div
              className={`relative top-[-70px] left-[-35%] z-10 w-full flex flex-row justify-center  ${
                showResult ? "visible" : "invisible"
              } `}
            >
              <div className="rounded-md border border-gray-300 text-gray-600 shadow-md px-3 py-1 bg-white">
                {box1Ratio} %
              </div>
            </div>

            {/* player */}
            <div
              id="player"
              className={`relative top-[-51px] z-10 w-full flex flex-row justify-center ${
                isSpectator ? "invisible" : "visible"
              } `}
            >
              <BitcoinIcon className="w-[35px] h-[35px] rounded-full text-yellow-500 bg-white shadow-lg" />
            </div>

            {/* box2 res */}
            <div
              className={`relative top-[-35px] left-[-35%] z-10 w-full flex flex-row justify-center ${
                showResult ? "visible" : "invisible"
              }`}
            >
              <div className="rounded-md border border-gray-300 text-gray-600 shadow-md px-3 py-1 bg-white">
                {box2Ratio} %
              </div>
            </div>

            {/* box2 */}
            <div
              className={`relative top-[-103px] z-0 
            ${
              isSpectator
                ? "border-x-[3px] border-b-[3px] border-black"
                : "border-x-[2px] border-b-[2px] border-gray-400"
            } 
            h-[44%] flex flex-col justify-center items-center text-2xl rounded-b-md cursor-pointer ${
              isPaused
                ? playerBox === 0
                  ? box1Ratio < box2Ratio
                    ? "bg-red-500"
                    : box1Ratio > box2Ratio
                    ? "bg-green-500"
                    : "bg-gray-400"
                  : box1Ratio === box2Ratio
                  ? "bg-gray-400"
                  : playerBox === 2 && box1Ratio < box2Ratio
                  ? "bg-red-500"
                  : playerBox === 2 && box1Ratio > box2Ratio
                  ? "bg-green-500"
                  : "bg-[#3A3B3C]"
                : "bg-[#3A3B3C]"
            }`}
              onClick={() => !lockChoice && handleBox2Click()}
            >
              <span className="text-[30px] font-semibold mt-11 text-white">
                2
              </span>
              <span className="z-10 relative top-[17%] left-[39%] cursor-pointer">
                <div
                  className="border-[1px] p-3 border-gray-400 rounded-full shadow-md bg-gray-50"
                  onClick={(e) => handleShareClick(e)}
                >
                  <ShareIcon className="w-6 h-5 text-gray-500" />
                </div>
              </span>
            </div>
          </div>
        )}
        <button
          onClick={play}
          id="win-sound"
          style={{ visibility: "hidden" }}
        ></button>
        <Popup />
      </div>
    )
  ) : (
    <NotAuthorised />
  );
};

export default TablePage;
