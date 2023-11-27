import { CreditCardIcon } from '@heroicons/react/24/solid'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { atom, useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { BitcoinIcon } from '../../assets/icons'
import LoadingSpinner from '../../components/LoadingSpinner'
import app from '../../config/firebase'
import VerificationPage from '../VerificationPage'
import BitcoinDeposit from './BitcoinDeposit'
import StripeDeposit from './StripeDeposit'
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

const auth = getAuth(app)
const fireStore = getFirestore(app)



export const InputIsVerified = atom(false)

export function Tabs() {
  const [user, loadingUser] = useAuthState(auth)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0)
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0)
  const [isVerified, setIsVerified] = useAtom(InputIsVerified)
  const tabsRef = useRef([])

  const [darkMode, setDarkMode] = useRecoilState(Atom)

  const fetchVerificationStatus = async () => {
    const userRef = doc(fireStore, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      userSnap.data().hasVerifiedStep1 === undefined
        ? setIsVerified(false)
        : setIsVerified(userSnap.data().hasVerifiedStep1)
    }
  }

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[activeTabIndex]
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0)
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0)
    }

    setTabPosition()
    window.addEventListener('resize', setTabPosition)

    return () => window.removeEventListener('resize', setTabPosition)
  }, [activeTabIndex])

  useEffect(() => {
    user && fetchVerificationStatus()
  }, [user, isVerified])

  const tabsData = [
    {
      label: (
        <div className='flex justify-center text-[15px]' style={darkMode ? {color:"goldenrod"} : {}}>
          BITCOIN <BitcoinIcon className='w-4 h-4 ml-2 mt-1' />{' '}
        </div>
      ),
    },
    {
      label: (
        <div className='flex justify-center text-[15px]' style={darkMode ? {color:"goldenrod"} : {}}>
          STRIPE <CreditCardIcon className='w-4 h-4 ml-3 mt-1' />{' '}
        </div>
      ),
    },
  ]

  return loadingUser ? (
    <LoadingSpinner />
  ) : (
    <div>
      <div className='relative'>
        <div className='flex space-x-3 border-b '>
          {tabsData.map((tab, idx) => {
            return (
              <button
                key={idx}
                ref={(el) => (tabsRef.current[idx] = el)}
                className='pt-2 pb-3 w-[50%]'
                onClick={() => setActiveTabIndex(idx)}
              >
                <span
                  className={`font-semibold ${
                    activeTabIndex === idx ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
        <span
          className='absolute bottom-0 block h-1 bg-red-400 transition-all duration-300'
          style={darkMode ? {backgroundColor:"goldenrod" ,left: tabUnderlineLeft, width: tabUnderlineWidth } : {left: tabUnderlineLeft, width: tabUnderlineWidth}}
        />
      </div>
      <div className='py-4'>
        {!isVerified ? (
          <VerificationPage />
        ) : activeTabIndex === 0 ? (
          <BitcoinDeposit />
        ) : (
          <StripeDeposit />
        )}
      </div>
    </div>
  )
}
