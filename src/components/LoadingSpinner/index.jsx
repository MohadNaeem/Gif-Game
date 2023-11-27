import React, { Fragment } from 'react'
import './index.css'
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

const LoadingSpinner = () => {

  const [darkMode, setDarkMode] = useRecoilState(Atom);
  
  return  (
  <div style={darkMode ? {backgroundColor:'black', height:'100vh'}:{}}>
    <div className='spinner center'>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
      <div className='spinner-blade'></div>
    </div>
  </div>
)}

export default LoadingSpinner
