import React from 'react'
import { Link } from 'react-router-dom'

const TransactionsPage = () => {
  const adminAuthID = localStorage.getItem('adminAuthID')
  return adminAuthID ? (
    <div className='p-4 sm:ml-64'>Transactions </div>
  ) : (
    <div className='flex flex-col justify-center h-[70vh] text-center items-center'>
      <div className='font-bold text-[21px] mb-[20px]'>Not Authorised</div>
      <Link to='/login' className='text-blue-500 font-bold'>
        Go back
      </Link>
    </div>
  )
}

export default TransactionsPage
