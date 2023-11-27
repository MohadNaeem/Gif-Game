import React from 'react'
import { Link } from 'react-router-dom'
import ChooseTablePage from '../../../ChooseTablePage'
import TablesCard from './TablesCard'

const ActiveUsersPage = () => {
  const adminAuthID = localStorage.getItem('adminAuthID')
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
  ]

  return adminAuthID ? (
    <div className='p-4 sm:ml-64'>
      <div className='flex flex-row-reverse mb-5'>
        <div className='flex flex-col'>
          <div>
            <span>Account Balance: __</span>
            <span></span>
          </div>
          <div>
            <span>Total Deposits: __</span>
            <span></span>
          </div>
          <div>
            <span>Total Withdraws: __</span>
            <span></span>
          </div>
        </div>
      </div>
      <div className='w-[50%] mx-auto'>
        <TablesCard
          starNum={1}
          lockTime={3}
          time={10}
          tablesData={tablesData.slice(0, 3)}
          minLimit={0.25}
        />
        <TablesCard
          starNum={2}
          time={15}
          tablesData={tablesData.slice(3, 6)}
          minLimit={5}
        />
        <TablesCard
          starNum={3}
          time={45}
          tablesData={tablesData.slice(6, 9)}
          minLimit={50}
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col justify-center h-[70vh] text-center items-center'>
      <div className='font-bold text-[21px] mb-[20px]'>Not Authorised</div>
      <Link to='/login' className='text-blue-500 font-bold'>
        Go back
      </Link>
    </div>
  )
}

export default ActiveUsersPage
