import React, { useState, useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid'
import Table from './Table'
import { InputStar1Lock, InputStar2Lock, InputStar3Lock } from '.'
import {
  InputIsModalOpen,
  InputModalContent,
  InputModalHeader,
  InputModalType,
} from '../../components/Popup'
import stopWatch from '../../assets/img/stopwatch.png'
import clock from "../../assets/img/darkClock.svg"
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

export const InputModalMinLimit = atom(5)

const TablesCard = ({ starNum, time, lockTime = 5, tablesData, minLimit }) => {
  const [star1lock] = useAtom(InputStar1Lock)
  const [star2lock] = useAtom(InputStar2Lock)
  const [star3lock] = useAtom(InputStar3Lock)
  const [currentLock, setCurrentLock] = useState(false)
  const [modalMinLimit, setModalMinLimit] = useAtom(InputModalMinLimit)
  const [isOpen, setIsOpen] = useAtom(InputIsModalOpen)
  const [modalHeader, setModalHeader] = useAtom(InputModalHeader)
  const [modalContent, setModalContent] = useAtom(InputModalContent)
  const [modalType, setModalType] = useAtom(InputModalType)
  const stars = Array(starNum).fill(0)

  const[darkMode, setDarkMode] = useRecoilState(Atom)

  useEffect(() => {
    starNum === 1
      ? setCurrentLock(false)
      : starNum === 2
      ? setCurrentLock(star2lock)
      : starNum === 3 && setCurrentLock(star3lock)
  }, [star1lock, star2lock, star3lock])

  const handleOnClickTableCard = () => {
    if (currentLock) {
      setModalMinLimit(minLimit)
      setModalHeader('Insufficient Funds')
      const contentHtmlString = `<div class='text-[17px]'>A minimum of €<span class='font-semibold'> ${minLimit}</span> deposit is required to unlock tables on this level.</div>`
      setModalContent(contentHtmlString)
      setModalType('lockStatus')

      setIsOpen(true)
    }
  }

  return (
    <div
      className={darkMode ? 'border border-lime-200 rounded-md p-3 pb-5 bg-black shadow-sm mb-4' :'border border-gray-200 rounded-md p-3 pb-5 bg-white shadow-sm mb-4'}
      onClick={handleOnClickTableCard}
    >
      <div>
        <div className='flex justify-between pr-4'>
          <div className='flex pl-3'>
            <span className={darkMode ? 'text-[13px] text-blue-500 font-bold py-[4px] mr-2' :'text-[13px] text-gray-500 font-bold py-[4px] mr-2'}>
              LEVEL
            </span>
            {stars.map((_, index) => (
              <StarIcon key={index} className='h-6 w-6 text-yellow-400' />
            ))}
          </div>
          <div className='flex'>
            <img
              src={darkMode ? clock:stopWatch}
              className='relative top-[-5%] left-[50%] h-[40px] w-[40px]'
            />
            <div className='relative z-10 top-[33%] flex flex-col h-fit text-gray-800 font-semibold border border-white rounded-full px-[px] text-[10px] bg-white' style={darkMode ? {backgroundColor:"black", color:'white', border:'none'}:{}}>
              <span className='text-center' >{time}</span>
            </div>
          </div>
        </div>
        <div className='flex w-full pl-3'>
          {tablesData.map((table, index) => {
            return (
              <Table
                key={index}
                index={index}
                starNum={starNum}
                tableTime={time}
                tableNum={table.tableNum}
                lockTime={lockTime}
                tableAmount={table.tableAmount}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TablesCard
