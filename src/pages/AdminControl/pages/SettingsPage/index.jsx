import React, { useEffect, useState } from 'react'
import { AdjustmentsHorizontalIcon, CogIcon } from '@heroicons/react/24/solid'
import app from '../../../../config/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { ref, set, get, getDatabase } from 'firebase/database'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { Link } from 'react-router-dom'
import MfaVerification from '../../../../components/GoogleAuthenticator'

const fireStore = getFirestore(app) // firebase firestore
const database = getDatabase(app) // firebase database
const SettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const [payoutProfit, setPayoutProfit] = useState(0)
  const [bonusRoundTime, setBonusRoundTime] = useState(0)
  const [freeRoundTime, setFreeRoundTime] = useState(0)
  const [freeRoundCount, setFreeRoundCount] = useState(0)

  const [level1time, setLevel1Time] = useState(0)
  const [level2time, setLevel2Time] = useState(0)
  const [level3time, setLevel3Time] = useState(0)

  const [level1Bots, setLevel1Bots] = useState(0)
  const [level2Bots, setLevel2Bots] = useState(0)
  const [level3Bots, setLevel3Bots] = useState(0)
  const [botWin, setBotWin] = useState(0)

  const [withdrawFee, setWithdrawFee] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')

  const [reward1, setReward1] = useState(0)
  const [reward2times, setReward2times] = useState(0)
  const [reward2, setReward2] = useState(0)
  const [reward3, setReward3] = useState(0)
  const [reward4, setReward4] = useState(0)
  const [reward5Hrs, setReward5Hrs] = useState(0)
  const [reward5, setReward5] = useState(0)

  const docRef = doc(fireStore, 'public', 'settings')

  const handlePayoutProfit = () => {
    updateDoc(docRef, { payoutProfits: +payoutProfit })
  }

  const handleRoundSettings = (index) => {
    if (index === 0) {
      updateDoc(docRef, { bonusRoundTime: +bonusRoundTime })
    } else if (index === 1) {
      updateDoc(docRef, { freeRoundCount: +freeRoundCount })
    } else if (index === 2) {
      console.log(freeRoundTime)
      updateDoc(docRef, { freeRoundTime: +freeRoundTime })
    }
  }

  const handleLevelTimeSettings = (level) => {
    if (level === 1) {
      updateDoc(docRef, { level1time: +level1time })
    } else if (level === 2) {
      updateDoc(docRef, { level2time: +level2time })
    } else if (level === 3) {
      updateDoc(docRef, { level3time: +level3time })
    }
  }

  const handleBotSettings = async (index) => {
    const removeBotsFromTable = async (tableNumber) => {
      const tableKey = `table${tableNumber}`;
      const tableRef = ref(database, `users/${tableKey}/players`);
  
      try {
        const snapshot = await get(tableRef);
        const players = snapshot.val();
        if (!players) return;
  
        const bots = {};
        for (const playerKey in players) {
          if (playerKey.startsWith("bot")) {
            bots[playerKey] = null; // Set the bot player to null to remove them
          }
        }
  
        await set(tableRef, bots);
      } catch (error) {
        console.error("Error retrieving or removing players:", error);
      }
    };

    if (index === 1) {
      const tableNumbers = [1, 2, 3]; // Table numbers for level1bot
    for (const tableNumber of tableNumbers) {
      await removeBotsFromTable(tableNumber);
    }

    const bots = {}; // Object to store the bot players
    for (let i = 0; i < level1Bots; i++) {
      const botNumber = `bot${i}`;
      bots[botNumber] = { boxClicked: 1 }; // Assigning a default value for boxClicked
    }

    for (const tableNumber of tableNumbers) {
      const tableKey = `table${tableNumber}`;
      const tableRef = ref(database, `users/${tableKey}/players`);
      await set(tableRef, bots);
    }
      updateDoc(docRef, { level1Bots: +level1Bots })
    } else if (index === 2) {
      const tableNumbers = [4, 5, 6]; // Table numbers for level2bot
    for (const tableNumber of tableNumbers) {
      await removeBotsFromTable(tableNumber);
    }

    const bots = {};
    for (let i = 0; i < level2Bots; i++) {
      const botNumber = `bot${i}`;
      bots[botNumber] = { boxClicked: 1 };
    }

    for (const tableNumber of tableNumbers) {
      const tableKey = `table${tableNumber}`;
      const tableRef = ref(database, `users/${tableKey}/players`);
      await set(tableRef, bots);
    }
      updateDoc(docRef, { level2Bots: +level2Bots })
    } else if (index === 3) {
      const tableNumbers = [7, 8, 9]; // Table numbers for level3bot
    for (const tableNumber of tableNumbers) {
      await removeBotsFromTable(tableNumber);
    }

    const bots = {};
    for (let i = 0; i < level3Bots; i++) {
      const botNumber = `bot${i}`;
      bots[botNumber] = { boxClicked: 1 };
    }

    for (const tableNumber of tableNumbers) {
      const tableKey = `table${tableNumber}`;
      const tableRef = ref(database, `users/${tableKey}/players`);
      await set(tableRef, bots);
    }
      updateDoc(docRef, { level3Bots: +level3Bots })
    } else if (index === 4) {
      updateDoc(docRef, { botWinPercentage: +botWin })
    }
  }

  const handlePaymentSettings = (index) => {
    if (index === 1) {
      updateDoc(docRef, { withdrawFeePercentage: +withdrawFee })
    } else if (index === 2) {
      updateDoc(docRef, { adminWallet: walletAddress })
    }
  }

  const handleRewardSettings = (index) => {
    if (index === 1) {
      updateDoc(docRef, { reward1: +reward1 })
    } else if (index === 2) {
      updateDoc(docRef, { reward2: +reward2, reward2times: +reward2times })
    } else if (index === 3) {
      updateDoc(docRef, { reward3: +reward3 })
    } else if (index === 4) {
      updateDoc(docRef, { reward4: +reward4 })
    } else if (index === 5) {
      updateDoc(docRef, { reward5: +reward5, reward5Hrs: +reward5Hrs })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const docRef = doc(fireStore, 'public', 'settings')
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const data = docSnapshot.data()

      if (data) {
        setPayoutProfit(data.payoutProfits ?? 0)
        setBonusRoundTime(data.bonusRoundTime ?? 0)
        setFreeRoundCount(data.freeRoundCount ?? 0)
        setFreeRoundTime(data.freeRoundTime ?? 0)

        setLevel1Time(data.level1time ?? 0)
        setLevel2Time(data.level2time ?? 0)
        setLevel3Time(data.level3time ?? 0)

        setLevel1Bots(data.level1Bots ?? 0)
        setLevel2Bots(data.level2Bots ?? 0)
        setLevel3Bots(data.level3Bots ?? 0)
        setBotWin(data.botWinPercentage ?? 0)

        setWithdrawFee(data.withdrawFeePercentage ?? 0)
        setWalletAddress(data.adminWallet ?? '')

        setReward1(data.reward1 ?? 0)
        setReward2times(data.reward2times ?? 0)
        setReward2(data.reward2 ?? 0)
        setReward3(data.reward3 ?? 0)
        setReward4(data.reward4 ?? 0)
        setReward5Hrs(data.reward5Hrs ?? 0)
        setReward5(data.reward5 ?? 0)
      }
    } else {
      console.log('No such document!')
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    return () => {}
  }, [])

  const adminAuthID = localStorage.getItem('adminAuthID')

  return adminAuthID ? (
    loading ? (
      <div className='p-4 lg:ml-64'>
        <LoadingSpinner />
      </div>
    ) : (
      <div className='p-4 lg:ml-64'>
        <h1 className='font-bold mb-6 text-xl flex'>
          SETTINGS <CogIcon className='w-6 h-6 mt-[3px] ml-2' />{' '}
        </h1>

        <div>
          <div className='font-semibold mb-5 text-blue-600 flex'>
            TABLE SETTINGS{' '}
            <AdjustmentsHorizontalIcon className='w-5 h-5 mt-[3px] ml-2' />{' '}
          </div>

          <div className='flex w-[70%] justify-between mb-6'>
            <div className='flex mr-8'>
              <div className='py-1'>Payouts from profits</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px] h-[33px]'
                value={payoutProfit}
                onChange={(e) => setPayoutProfit(e.target.value)}
              />
              <div className='py-1'>%</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handlePayoutProfit()}
            >
              Save
            </div>
          </div>

          <div className='font-medium mb-4 text-blue-600'>Rounds</div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1'>Bonus every</div>
              <input
                value={bonusRoundTime}
                onChange={(e) => setBonusRoundTime(e.target.value)}
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
              />
              <div className='py-1'>minutes</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRoundSettings(0)}
            >
              Save
            </div>
          </div>

          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1'>Free round for users every</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={freeRoundTime}
                onChange={(e) => setFreeRoundTime(e.target.value)}
              />
              <div className='py-1'>games</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRoundSettings(1)}
            >
              Save
            </div>
          </div>

          <div className='flex w-[70%] justify-between mb-6'>
            <div className='flex mr-8'>
              <div className='py-1'>Free round every</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={freeRoundCount}
                onChange={(e) => setFreeRoundCount(e.target.value)}
              />
              <div className='py-1'>minutes</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRoundSettings(2)}
            >
              Save
            </div>
          </div>

          <div className='font-medium mb-4 text-blue-600'>Change Time</div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-4'>Level 1</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={level1time}
                onChange={(e) => setLevel1Time(e.target.value)}
              />
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleLevelTimeSettings(1)}
            >
              Save
            </div>
          </div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-4'>Level 2</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={level2time}
                onChange={(e) => setLevel2Time(e.target.value)}
              />
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleLevelTimeSettings(2)}
            >
              Save
            </div>
          </div>
          <div className='flex w-[70%] justify-between mb-6'>
            <div className='flex mr-8'>
              <div className='py-1 mr-4'>Level 3</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={level3time}
                onChange={(e) => setLevel3Time(e.target.value)}
              />
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleLevelTimeSettings(3)}
            >
              Save
            </div>
          </div>

          <div className='font-medium mb-4 text-blue-600'>Bot Settings</div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1'>Number of bots</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={level1Bots}
                onChange={(e) => setLevel1Bots(e.target.value)}
              />
              <div className='py-1'>on Level 1</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleBotSettings(1)}
            >
              Save
            </div>
          </div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1'>Number of bots</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={level2Bots}
                onChange={(e) => setLevel2Bots(e.target.value)}
              />
              <div className='py-1'>on Level 2</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleBotSettings(2)}
            >
              Save
            </div>
          </div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1'>Number of bots</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={level3Bots}
                onChange={(e) => setLevel3Bots(e.target.value)}
              />
              <div className='py-1'>on Level 3</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleBotSettings(3)}
            >
              Save
            </div>
          </div>

          <div className='flex w-[70%] justify-between mb-6'>
            <div className='flex mr-8'>
              <div className='py-1'>Bot Winning</div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={botWin}
                onChange={(e) => setBotWin(e.target.value)}
              />
              <div className='py-1'>%</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleBotSettings(4)}
            >
              Save
            </div>
          </div>
        </div>

        <hr className='h-[2px] bg-gray-400'></hr>

        <div>
          <div className='font-semibold my-4 text-blue-600 flex'>
            PAYMENT SETTINGS{' '}
            <MfaVerification />
            <AdjustmentsHorizontalIcon className='w-5 h-5 mt-[3px] ml-2' />{' '}
          </div>
          <div className='flex w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-4'>Withdraw Platform fee </div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={withdrawFee}
                onChange={(e) => setWithdrawFee(e.target.value)}
              />
              <div className='py-1 mr-4'>%</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handlePaymentSettings(1)}
            >
              Save
            </div>
          </div>
          <div className='flex w-[70%] justify-between mb-6'>
            <div className='flex mr-8'>
              <div className='py-1 mr-4'>Admin Wallet </div>
              <input
                className='mx-2 border border-gray-300 rounded-md px-2 w-[300px]'
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handlePaymentSettings(2)}
            >
              Save
            </div>
          </div>
        </div>

        <hr className='h-[2px] bg-gray-400'></hr>

        <div>
          <div className='font-semibold my-4 text-blue-600 flex'>
            REWARDS SETTINGS{' '}
            <AdjustmentsHorizontalIcon className='w-5 h-5 mt-[3px] ml-2' />{' '}
          </div>
          <div className='font-medium text-blue-600 py-1 mr-3 '>Reward 1 </div>
          <div className='flex  w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-1'>Referral bonus </div>
            </div>

            <div className='flex mr-8'>
              <div className='py-1 mr-2'>€</div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward1}
                onChange={(e) => setReward1(e.target.value)}
              />
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRewardSettings(1)}
            >
              Save
            </div>
          </div>

          <div className='font-medium text-blue-600 py-1 mr-3 '>Reward 2 </div>
          <div className='flex  w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-1'>Win or loose </div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward2times}
                onChange={(e) => setReward2times(e.target.value)}
              />
              <div className='py-1 mr-4'>times</div>
            </div>

            <div className='flex mr-8'>
              <div className='py-1 mr-1'>BONUS €</div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward2}
                onChange={(e) => setReward2(e.target.value)}
              />
              <div className='py-1 mr-4'></div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRewardSettings(2)}
            >
              Save
            </div>
          </div>

          <div className='font-medium text-blue-600 py-1 mr-3 '>Reward 3 </div>
          <div className='flex  w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-1'>Unlock 2 star tables </div>
            </div>

            <div className='flex mr-8'>
              <div className='py-1 mr-2'>BONUS</div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward3}
                onChange={(e) => setReward3(e.target.value)}
              />
              <div className='py-1 mr-4'>%</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRewardSettings(3)}
            >
              Save
            </div>
          </div>

          <div className='font-medium text-blue-600 py-1 mr-3 '>Reward 4 </div>
          <div className='flex  w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-1'>Unlock 3 star tables </div>
            </div>

            <div className='flex mr-8'>
              <div className='py-1 mr-2'>BONUS</div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward4}
                onChange={(e) => setReward4(e.target.value)}
              />
              <div className='py-1 mr-4'>%</div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRewardSettings(4)}
            >
              Save
            </div>
          </div>

          <div className='font-medium text-blue-600 py-1 mr-3 '>Reward 5 </div>
          <div className='flex  w-[70%] justify-between mb-4'>
            <div className='flex mr-8'>
              <div className='py-1 mr-1'>Play </div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward5Hrs}
                onChange={(e) => setReward5Hrs(e.target.value)}
              />
              <div className='py-1 mr-4'>hour(s)</div>
            </div>

            <div className='flex mr-8'>
              <div className='py-1 mr-1'>BONUS €</div>
              <input
                className='mr-2 border border-gray-300 rounded-md px-2 w-[70px]'
                value={reward5}
                onChange={(e) => setReward5(e.target.value)}
              />
              <div className='py-1 mr-4'></div>
            </div>

            <div
              className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 hover:bg-blue-600 active:bg-blue-800'
              onClick={() => handleRewardSettings(5)}
            >
              Save
            </div>
          </div>
        </div>
      </div>
    )
  ) : (
    <div>
      <div className='flex flex-col justify-center h-[70vh] text-center items-center'>
        <div className='font-bold text-[21px] mb-[20px]'>Not Authorised</div>
        <Link to='/login' className='text-blue-500 font-bold'>
          Go back
        </Link>
      </div>
    </div>
  )
}

export default SettingsPage
