import React, {useState} from 'react'
import Styles from "./Index.module.css"
import { useRecoilState } from 'recoil';
import { Atom } from '../../Atom/Atom';

export const Header = ({ title }) => {
  const [darkMode, setDarkMode] = useRecoilState(Atom);
  return (
    <h1
    className={darkMode ? Styles.Main_Dark_Section :Styles.Main_Section}
    // className='mb-4 text-center text-[18px] font-medium leading-tight text-primary'
    >

      {title}
    </h1>
  )
}
