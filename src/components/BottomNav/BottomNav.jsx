import React, { useEffect, useState } from "react";
import BottomNavItem from "./BottomNavItem.jsx";
import { useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import { useRecoilState } from "recoil";
import { Atom } from "../../Atom/Atom.jsx";

const BottomNav = () => {
  const path = useLocation().pathname;
  const { formatMessage } = useIntl();

  const [darkMode, setDarkMode] = useRecoilState(Atom);

  // #daa520

  useEffect(() => {
    const index =
      path === "/myaccount"
        ? 1
        : path === "/deposit"
        ? 2
        : path === "/live"
        ? 3
        : path === "/rewards"
        ? 4
        : path === "/withdraw" && 5;
    {
      darkMode
        ? document
            .getElementById(`nav-item-${index}`)
            ?.setAttribute("style", "color: #daa520; ")
        : document
            .getElementById(`nav-item-${index}`)
            ?.setAttribute("style", "color: #f87171; ");
    }

    {
      darkMode ?
      document
      .getElementById(`nav-item-text-${index}`)
      ?.setAttribute("style", "color: #daa520;") :
      document
      .getElementById(`nav-item-text-${index}`)
      ?.setAttribute("style", "color: #f87171;")  }

    for (var i = 1; i <= 5; ++i) {
      if (i != index) {
        const element = document.getElementById(`nav-item-${i}`);
        const elementText = document.getElementById(`nav-item-text-${i}`);
        element?.setAttribute("style", "color: #6b7280");
        elementText?.setAttribute("style", "color: #6b7280");
      }
    }
  }, [path]);

  return (
    <>
      {path.includes("/signup") ||
      path.includes("/admin") ||
      path === "/login" ? (
        <></>
      ) : (
        <div
          id="bottomNav"
          className="bg-gray-50 fixed z-50 bottom-0 flex flex-row w-full py-1"
          style={
            darkMode
              ? {
                  boxShadow: "2px 2px 15px #372222ae",
                  backgroundColor: "black",
                }
              : { boxShadow: "0px 1px 5px #d1d5db, 0px -1px 5px #d1d5db" }
          }
        >
          <div className="text-center cursor-pointer basis-1/5 flex-col py-1">
            <BottomNavItem
              title={formatMessage({ id: "myAccount" })}
              path="/myaccount"
              index={1}
            />
          </div>
          <div className="text-center cursor-pointer  basis-1/5 flex-col py-1">
            <BottomNavItem
              title={formatMessage({ id: "Deposit" })}
              path="/deposit"
              index={2}
            />
          </div>
          <div className="text-center cursor-pointer basis-1/5 flex-col py-1">
            <BottomNavItem
              title={formatMessage({ id: "GoLive" })}
              path="/live"
              index={3}
            />
          </div>
          <div className="text-center cursor-pointer basis-1/5 flex-col py-1">
            <BottomNavItem
              title={formatMessage({ id: "Rewards" })}
              path="/rewards"
              index={4}
            />
          </div>
          <div className="text-center cursor-pointer basis-1/5 flex-col py-1">
            <BottomNavItem
              title={formatMessage({ id: "Withdraw" })}
              path="/withdraw"
              index={5}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
