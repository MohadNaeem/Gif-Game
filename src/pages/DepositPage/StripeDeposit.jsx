import React, { useState, useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import TokenOptions from './TokenOptions'
import app from '../../config/firebase'
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore'
import {
  CheckBadgeIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid'
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

export const InputBuyTokens = atom(0)
export const InputTokenBalance = atom(0)
export const InputBuyTokenMessage = atom(false)

const fireStore = getFirestore(app)

const StripeDeposit = () => {
  const [tokens] = useAtom(InputBuyTokens)
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)
  const [showMessage, setShowMessage] = useAtom(InputBuyTokenMessage)

  const [darkMode, setDarkMode] = useRecoilState(Atom)

  const userAuthID = localStorage.getItem('userAuthID')

  const userRef =
    userAuthID !== null ? doc(fireStore, 'users', userAuthID) : null

  const fetchTokenBalance = async () => {
    setLoading(true)
    try {
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setTotalBalance(+userSnap.data().tokenBalance)
      }
    } catch (e) {
      setTotalBalance(0)
      console.log(e, 'No doc exist!')
    }
    setLoading(false)
  }

  useEffect(() => {
    userAuthID !== null && fetchTokenBalance()
    setShowMessage(false)
  }, [])

  const handleClickBuyNow = async () => {
    setBuyLoading(true)

    const userRef = doc(fireStore, 'users', userAuthID)
    const userSnap = await getDoc(userRef)
    const transactionRef = doc(collection(userRef, 'transactions'))

    setTotalBalance(totalBalance + tokens)

    await setDoc(transactionRef, {
      amount: tokens,
      type: 'deposit',
      time: serverTimestamp(),
    })

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        tokenBalance: increment(tokens),
      })
    } else {
      await setDoc(userRef, {
        tokenBalance: increment(tokens),
      })
    }
    // lock - unlock of levels
    if (
      userSnap.data().star1TablesLock === undefined &&
      totalBalance + tokens >= 0.25
    ) {
      await updateDoc(userRef, {
        star1TablesLock: false,
        [`tableUnlockDeposit.star1`]: tokens,
      })
    }
    if (
      userSnap.data().star2TablesLock === undefined &&
      totalBalance + tokens >= 5
    ) {
      await updateDoc(userRef, {
        star2TablesLock: false,
        [`tableUnlockDeposit.star2`]: tokens,
      })
    }
    if (
      userSnap.data().star3TablesLock === undefined &&
      totalBalance + tokens >= 50
    ) {
      await updateDoc(userRef, {
        star3TablesLock: false,
        [`tableUnlockDeposit.star3`]: tokens,
      })
    }
    setShowMessage(true)
    setBuyLoading(false)
  }
  return (
    <div style={{paddingBottom:'5rem'}}>
      <div className='flex flex-col h-[60vh] md:w-[80%] mx-auto p-4 md:p-7' style={darkMode ? {color:'white', colorWeight:'700'} : {}} >
        <div className='mb-[20px]'>
          <div className='flex justify-between mb-[20px]'>
            <div></div>
            <div className='flex'>
              <InformationCircleIcon
                width='16px'
                height='16px'
                fill='gray'
                className='text-red-500 mr-[10px] mt-[4px]'
              />
              <div>1 Token = 1 €</div>
            </div>
          </div>
          <div className='flex justify-between mb-[20px]'>
            <div>Current Balance</div>
            <div className='flex'>
              <div className='font-semibold text-green-500'>
                € {totalBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className='mb-[20px]'>
          <TokenOptions />
        </div>

        <div className='w-full flex w-full justify-center mb-[40px]'>
          <div className='flex flex-col'>
            <button
              className='w-[200px] mx-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mb-[10px]'
              onClick={handleClickBuyNow}
            >
              {buyLoading ? <span>Loading...</span> : <span>BUY NOW</span>}
            </button>
            {showMessage && (
              <div className=' flex justify-center'>
                {' '}
                <CheckBadgeIcon
                  width='18px'
                  height='18px'
                  className='mt-[2px] ml-[3px] mr-[5px] text-green-500'
                />{' '}
                <span className='text-green-500 font-bold'>
                  {tokens} tokens added to your balance!{' '}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StripeDeposit
