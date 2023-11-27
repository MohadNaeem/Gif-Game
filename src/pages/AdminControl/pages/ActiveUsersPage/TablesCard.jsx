import React from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import Table from './Table'
import stopWatch from '../../../../assets/img/stopwatch.png'

const TablesCard = ({ starNum, time, lockTime = 5, tablesData, minLimit }) => {
  const stars = Array(starNum).fill(0)

  return (
    <div className='border border-gray-200 rounded-md p-3 pb-5 bg-white shadow-sm mb-4'>
      <div>
        <div className='flex justify-between pr-4'>
          <div className='flex pl-3'>
            <span className='text-[13px] text-gray-500 font-bold py-[4px] mr-2'>
              LEVEL
            </span>
            {stars.map((_, index) => (
              <StarIcon key={index} className='h-6 w-6 text-yellow-400' />
            ))}
          </div>
          <div className='flex'>
            <img
              src={stopWatch}
              className='relative top-[-5%] left-[50%] h-[40px] w-[40px]'
            />
            <div className='relative z-10 top-[33%] flex flex-col h-fit text-gray-800 font-semibold border border-white rounded-full px-[px] text-[10px] bg-white'>
              <span className='text-center'>{time}</span>
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
