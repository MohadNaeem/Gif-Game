import {
  ArchiveBoxArrowDownIcon,
  TrophyIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom";
import { LiveIcon, BitcoinIcon } from "../../assets/icons";
import ButtonClickSound from "../../assets/audios/Conclusion/buttonclick.wav";
import useSound from "use-sound";

const BottomNavItem = ({ title, path, index }) => {
  const { formatMessage } = useIntl();

  const [darkMode, setDarkMode] = useRecoilState(Atom);
  const [play] = useSound(ButtonClickSound);

  return (
    <Link to={path} onClick={() => play()}>
      <div className="flex justify-center">
        {title == formatMessage({ id: "GoLive" }) ? (
          <LiveIcon
            id="nav-item-3"
            className="w-[60px] h-[28px] text-gray-500"
          />
        ) : title === formatMessage({ id: "Rewards" }) ? (
          <TrophyIcon
            id="nav-item-4"
            className="w-[60px] h-[28px] text-gray-500 "
          />
        ) : title === formatMessage({ id: "Deposit" }) ? (
          <BitcoinIcon
            id="nav-item-2"
            className="w-[60px] pb-[1px] h-[28px] text-gray-500"
          />
        ) : title === formatMessage({ id: "Withdraw" }) ? (
          <ArchiveBoxArrowDownIcon
            id="nav-item-5"
            className="w-[60px] h-[29px] text-gray-500"
          />
        ) : (
          title === formatMessage({ id: "myAccount" }) && (
            <UserCircleIcon
              id="nav-item-1"
              className="w-[60px] h-[29px] text-gray-500"
            />
          )
        )}
      </div>
      <div
        className="text-[9px] mt-[2px] md:text-[12px] text-gray-500 font-semibold"
        id={`nav-item-text-${index}`}
      >
        {title}
      </div>
    </Link>
  );
};

export default BottomNavItem;
