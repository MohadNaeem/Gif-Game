import React, { useEffect, useState } from "react";
import Styles from "./OverlayMessageRound.module.css";

const OverlayMessageRound = ({ message, messageStyle, type }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);

    const timerTwo = setTimeout(() => {
      setShow(false);
    }, 2300);

    return () => {
      clearTimeout(timer);
      clearTimeout(timerTwo);
    };
  }, []);
  
  return (
    <div className={show ? Styles.BonusFree : Styles.NotVisible}>
      <img className={Styles.BonusImage} src={message} />
    </div>
  );
};

export default OverlayMessageRound;
