import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className='flex flex-col justify-center items-center h-[75vh]'>
      <img
        src='https://cdn-icons-png.flaticon.com/512/8281/8281994.png'
        className='w-[170px] mb-3 lg:w-[200px]'
      />
      <div className='text-center'>
        <div className='text-[17px] font-semibold text-[#FF4D68] mb-2'>
          PAGE NOT FOUND!
        </div>
        <Link
          to='/live'
          className='text-md font-medium text-[#4E6AFF] underline cursor-pointer'
        >
          Go Back
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
