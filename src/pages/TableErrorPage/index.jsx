import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getFirestore,
} from 'firebase/firestore'
import app from '../../config/firebase'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ref, remove, getDatabase } from 'firebase/database'
import { CurrencyEuroIcon } from '@heroicons/react/24/solid'
const fireStore = getFirestore(app)
const database = getDatabase(app)

const checkTokenBalanceAndNavigate = async (
  userAuthID,
  currentTable,
  navigate
) => {
  const tableAmount =
    currentTable === '1'
      ? 1
      : currentTable === '2'
      ? 5
      : currentTable === '3'
      ? 10
      : currentTable === '4'
      ? 25
      : currentTable === '5'
      ? 50
      : 100
  const userRef = doc(fireStore, 'users', userAuthID)
  const userSnap = await getDoc(userRef)
  if (
    userSnap.exists() &&
    Number(userSnap.data().tokenBalance) >= tableAmount
  ) {
    navigate('/live')
  }
}

const TableErrorPage = () => {
  const currentTable = useParams().number
  const error = useParams().error
  const navigate = useNavigate()
  const userAuthID = localStorage.getItem('userAuthID')

  const [tableAmount, setTableAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const tableAmountSet = () => {
    currentTable === '1'
      ? setTableAmount(0.25)
      : currentTable === '2'
      ? setTableAmount(0.5)
      : currentTable === '3'
      ? setTableAmount(1)
      : currentTable === '4'
      ? setTableAmount(5)
      : currentTable === '5'
      ? setTableAmount(10)
      : currentTable === '6'
      ? setTableAmount(25)
      : currentTable === '7'
      ? setTableAmount(50)
      : currentTable === '8'
      ? setTableAmount(100)
      : currentTable === '9' && setTableAmount(500)
  }

  useEffect(() => {
    tableAmountSet()
    const userRef = ref(
      database,
      `users/table${currentTable}/players/${userAuthID}`
    )
    remove(userRef)
    checkTokenBalanceAndNavigate(userAuthID, currentTable, navigate)
    return () => {}
  }, [])

  return loading ? (
    <LoadingSpinner />
  ) : (
    <>
      <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
        <div className='relative  w-[320px]'>
          {/*content*/}
          <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
            {/*header*/}
            <div className='flex items-start justify-between px-5 py-3 border-b border-solid border-slate-200 rounded-t'>
              <h3 className='text-lg font-semibold text-red-500'>
                Not enough token balance
              </h3>
            </div>
            {/*body*/}
            <div className='relative flex-auto'>
              <p className='mx-5 my-3 text-gray-900 text-md leading-relaxed'>
                Please have your token balance atleast{' '}
                <span className='font-semibold'>
                  {tableAmount}{' '}
                  {tableAmount > 1 ? <span>tokens </span> : <span>token</span>}{' '}
                </span>
                to continue playing this game.
              </p>
            </div>
            {/*footer*/}
            <div className='flex items-center justify-end p-3 border-t border-solid border-slate-200 rounded-b'>
              <button
                className='text-red-400 background-transparent font-bold uppercase px-6 py-2 text-[13px] outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                type='button'
                onClick={() => navigate('/live')}
              >
                Close
              </button>
              <button
                type='button'
                className='bg-amber-400 cursor-pointer text-[13px] flex w-fit text-white font-bold py-2 px-3 rounded-full active:border-green-300'
                onClick={() => navigate('/deposit')}
              >
                <span className='mr-1'>DEPOSIT </span>
                <CurrencyEuroIcon className='w-5 h-5 text-white' />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='opacity-60 fixed inset-0 z-40 bg-black'></div>
    </>
  )
}

export default TableErrorPage
