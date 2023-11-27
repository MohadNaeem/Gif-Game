import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import app from '../../../../config/firebase'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import axios from '../../../../config/axios'
import MyAccountPage from '../../../MyAccountPage';

const fireStore = getFirestore(app)
const UserPage = ({ match }) => {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false)
  const { userId } = useParams(); // Move useParams inside the fetchUser function

  const fetchHighestPlayedTable = (tablesPlayedCount) => {
    let highestCountTable = ''
    let highestCount = 0
    if (tablesPlayedCount !== undefined) {
      for (const [table, count] of Object.entries(tablesPlayedCount)) {
        if (count > highestCount) {
          highestCount = count
          highestCountTable = table
        }
      }
    }
    return highestCountTable.slice(0, -5)
  }

  const convertTime = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000) // Multiply by 1000 to convert seconds to milliseconds
    const options = {
      timeZone: 'Europe/Nicosia',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
    const formattedTime = date.toLocaleString('en-US', options)
    return formattedTime
  }

  function formatTime(seconds) {
    let days = Math.floor(seconds / (3600 * 24))
    let hours = Math.floor(seconds / 3600) % 24
    let minutes = Math.floor(seconds / 60) % 60
    let remainingSeconds = seconds % 60

    return (
      (days > 0 ? days + 'D ' : '') +
      (hours < 10 ? '0' : '') +
      hours +
      ':' +
      (minutes < 10 ? '0' : '') +
      minutes +
      ':' +
      (remainingSeconds < 10 ? '0' : '') +
      remainingSeconds
    )
  }

  const fetchPlayTime = (tablesPlayed) => {
    const star1tablesPlayed =
      (tablesPlayed?.table1Count ?? 0) +
      (tablesPlayed?.table2Count ?? 0) +
      (tablesPlayed?.table3Count ?? 0)
    const star2tablesPlayed =
      (tablesPlayed?.table4Count ?? 0) +
      (tablesPlayed?.table5Count ?? 0) +
      (tablesPlayed?.table6Count ?? 0)
    const star3tablesPlayed =
      (tablesPlayed?.table7Count ?? 0) +
      (tablesPlayed?.table8Count ?? 0) +
      (tablesPlayed?.table9Count ?? 0)

    const totalSecPlayed =
      star1tablesPlayed * 10 + star2tablesPlayed * 15 + star3tablesPlayed * 45

    return formatTime(totalSecPlayed)
  }

  useEffect(() => {
    // Fetch the user data based on the user ID from the URL parameter (match.params.id)
    const fetchUser = async () => {
      setLoading(true);

  try {
    const userDocRef = doc(fireStore, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();

      // Fetch the wallet data for the user
      const walletUrl = `/getWallet/${userId}`;
      const response = await axios.get(walletUrl);
      const walletData = response.data.address;

      userData.walletAddress = walletData;
      
      setUser(userData);
      console.log('User', user);
      setLoading(false);
    } else {
      console.log('User not found');
      setLoading(false);
      // Handle the case when the user does not exist
    }
  } catch (error) {
     setLoading(false);
    console.log('Error fetching user:', error);
    // Handle the error appropriately
  }
    };

    fetchUser();
  }, []);
  const adminAuthID = localStorage.getItem('adminAuthID')
    return adminAuthID ? (
        loading ? (
          <LoadingSpinner />
        ) : (
          <MyAccountPage userData={user}/>
          // <div className='p-4 sm:ml-64'>
          //   <div className='flex flex-col'>
          //     <div className='overflow-x-auto'>
          //       <div className='p-1.5 w-full inline-block align-middle'>
          //         <div className='overflow-hidden border rounded-lg'>
          //           <table className='min-w-full divide-y divide-gray-200'>
          //             <thead className='bg-gray-50'>
          //               <tr>
          //                 <th
          //                   scope='col'
          //                   className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
          //                 >
          //                   ID
          //                 </th>
    
          //                 <th
          //                   scope='col'
          //                   className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
          //                 >
          //                   Referred by
          //                 </th>
    
          //                 <th
          //                   scope='col'
          //                   className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
          //                 >
          //                   Account Balance
          //                 </th>
    
          //                 <th
          //                   scope='col'
          //                   className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
          //                 >
          //                   Games
          //                 </th>
    
          //                 <th
          //                   scope='col'
          //                   className='px-6 py-3 text-xs font-bold text-right text-gray-500 uppercase '
          //                 >
          //                   Active Balance
          //                 </th>
          //               </tr>
          //             </thead>
          //             <tbody className='divide-y divide-gray-200'>
          //                 <tr>
          //                   <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap flex flex-col'>
          //                     <div className='flex'>
          //                       ID:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                           {userId}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Short ID:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.shortID}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Registered at:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {convertTime(user.registeredAt) ===
          //                         'Invalid Date'
          //                           ? ''
          //                           : convertTime(user.registeredAt)}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Email:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.email}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Name:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.name}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Phone:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.phone}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Country:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.country}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Wallet Address:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.walletAddress}
          //                       </div>
          //                     </div>
          //                   </td>
    
          //                   <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap'>
          //                     {user.referrerID}
          //                   </td>
    
          //                   <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap'>
          //                     <div className='flex'>
          //                       Current Balance:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.tokenBalance}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Current Bonus:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {isNaN(user.bonusBalance)
          //                           ? 0 :user.bonusBalance}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Total Deposit:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'></div>
          //                     </div>
          //                     <div className='flex'>
          //                       Total Withdraws:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'></div>
          //                     </div>
          //                     <div className='flex'>
          //                       Total Bonus:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'></div>
          //                     </div>
          //                   </td>
    
          //                   <td className='px-6 text-sm text-right whitespace-nowrap '>
          //                     <div className='flex'>
          //                       Total:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.allGamesPlayed?.total ?? 0}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Wins:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.allGamesPlayed?.wins ?? 0}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Loses:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {user.allGamesPlayed?.loses ?? 0}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Most Played:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {fetchHighestPlayedTable(
          //                           user.tablesPlayedCount
          //                         )}
          //                       </div>
          //                     </div>
          //                     <div className='flex'>
          //                       Total Time Played:{' '}
          //                       <div className='text-blue-600 font-medium ml-2'>
          //                         {fetchPlayTime(user.tablesPlayedCount)}
          //                       </div>
          //                     </div>
          //                   </td>
    
          //                   <td className='px-6 py-4 text-sm font-medium text-right whitespace-nowrap'>
          //                     <a
          //                       className='text-green-500 hover:text-green-700'
          //                       href='#'
          //                     >
          //                       {user.tokenBalance}
          //                     </a>
          //                   </td>
          //                 </tr>
          //             </tbody>
          //           </table>
          //         </div>
          //       </div>
          //     </div>
          //   </div>
          // </div>
        )
      ) : (
        <div className='flex flex-col justify-center h-[70vh] text-center items-center'>
          <div className='font-bold text-[21px] mb-[20px]'>Not Authorised</div>
          <Link to='/login' className='text-blue-500 font-bold'>
            Go back
          </Link>
        </div>
      )
    }

export default UserPage;
