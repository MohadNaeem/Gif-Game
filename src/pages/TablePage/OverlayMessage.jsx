import React, { useState, useEffect } from "react";
import Styles from "./OverlayMessage.module.css";

const OverlayMessage = ({ message, scale,  bonus, draw }) => {

  const [winner, setWinner] = useState(false)

  useEffect(()=>{
    const timer = setTimeout(()=>{
      setWinner(true);
    },500)

    return () => {
      clearTimeout(timer);
    };
  },[])

  useEffect(()=>{
    const timer = setTimeout(()=>{
      setWinner(false);
    },2350)

    return () => {
      clearTimeout(timer);
    };
  },[])

  return (
    <div className={Styles.MainBlock}>
      {scale == 1 ? (
        winner &&
        <img
          style={{
            transform: `scale(${scale})`,
          }}
          className={bonus ? Styles.BonusWinner : draw ?  Styles.DrawIcon: Styles.WinLose}
          src={message}
        />
      ) : (
        <img
          className={Styles.LockIcon}
          style={{
            transform: `scale(${scale})`,
          }}
          src={message}
        />
      )}
    </div>
  );
};

export default OverlayMessage;
