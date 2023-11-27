import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
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
import { useState } from 'react'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import axios from '../../../../config/axios'
import './index.css';

const fireStore = getFirestore(app)

const AppUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchedUser, setSearchedUser] = useState(null);
  console.log(filteredUsers);
  

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

  const fetchUsers = async () => {
    setLoading(true)
    const rootCollectionRef = collection(fireStore, '/users')
    const usersQuery = query(rootCollectionRef)
    // orderBy('registeredAt'))

    const snapshots = await getDocs(usersQuery)
    const arr = []

    snapshots.forEach((doc) => {
      arr.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    // // Fetch the data from the root collection
    // getDocs(rootCollectionRef).then((querySnapshot) => {
    //   querySnapshot.forEach((doc) => {
    //     arr.push({ id: doc.id })
    //   })
    // })// Fetch the wallet data for each user
    console.log("arr", arr);
    const walletUrl = `/Wallet`;
    const response = await axios.get(walletUrl);
    const walletPromises = arr.map(async (user) => {
      try {
        const userId = user.id;
        const wallet = response.data.find(item => item.id === userId);
        const walletData = wallet ? wallet.data.address : ''; // Get the address if wallet exists, otherwise set to blank
        console.log({ userId: userId, walletData: walletData });
        user.data.walletAddress = walletData;
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        user.data.walletAddress = ''; // Set walletAddress to blank
      }
      return user;
    });

    // Wait for all wallet requests to complete
    const usersWithWallet = await Promise.all(walletPromises);
    console.log(usersWithWallet)
    setUsers(usersWithWallet);
    //setFilteredUsers(usersWithWallet); // Update filteredUsers as well
    setLoading(false)
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

  const handleSearchQueryChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    // Filter users based on the search query
    const filtered = users.filter((user) => {
      console.log(user, "userData in search");
      const { id, data } = user;
      const { shortID, email, name, country, registeredAt, walletAddress } = data;
      const registeredAtConverted  = convertTime(registeredAt);
      return (
        id.toString().toLowerCase().includes(query) ||
        (shortID && shortID.toLowerCase().includes(query)) ||
        (email && email.toLowerCase().includes(query)) ||
        (data.phone && data.phone.toLowerCase().includes(query)) ||
        (name && name.toLowerCase().includes(query)) ||
        (country && country.toLowerCase().includes(query)) ||
        (registeredAtConverted &&
          registeredAtConverted.toString().toLowerCase().includes(query)) ||
        (walletAddress && walletAddress.toLowerCase().includes(query))
      );
    });
  
    setFilteredUsers(filtered);
    console.log(filtered);
  
    // Check if the search query matches a single user
    const searchedUser = filtered.length === 1 ? filtered[0] : null;
    setSearchedUser(searchedUser);
    console.log(searchedUser);
  };


      // const [data, setData] = useState(users); // Your data array
      const [sortOrder, setSortOrder] = useState('asc');
      const keySortMap = [{
        "label": "Active Balance",
        "key":"active",
        "sortOrder":"asc"
      }]

  const handleSort = (key) => {
    const sortedData = filteredUsers && filteredUsers.length ? filteredUsers : users;
    console.log(filteredUsers, "filteredUsers");
    console.log(users, "users");

    if(key == "active"){
      if (sortOrder === 'asc') {
        sortedData.sort((a, b) => a.data.tokenBalance - b.data.tokenBalance); // Example: Sort numbers in ascending order
        setSortOrder('desc');
      } else {
        sortedData.sort((a, b) => b.data.tokenBalance - a.data.tokenBalance); // Example: Sort numbers in descending order
        setSortOrder('asc');
      }
    }

    console.log(sortedData, "sortedData");
    setFilteredUsers(sortedData);
  };
  console.log(filteredUsers, "sortedData outside");

  useEffect(() => {
    fetchUsers()
  }, [])

  const adminAuthID = localStorage.getItem('adminAuthID')

  return adminAuthID ? (
    loading ? (
      <LoadingSpinner />
    ) : (

      <div className='p-4 sm:ml-64'>
        <div className='flex flex-col'>
          <div className='overflow-x-auto'>
            <div className='p-1.5 w-full inline-block align-middle'>
            <div className='search-bar'>
        <input
          type='text'
          placeholder='Search users...'
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
      </div>
              <div className='overflow-hidden border rounded-lg'>
              
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
                      >
                        ID
                      </th>

                      <th
                        scope='col'
                        className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
                      >
                        Referred by
                      </th>

                      <th
                        scope='col'
                        className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
                      >
                                    <span>
                          {sortOrder === 'asc' ? (
                            <span onClick={()=>handleSort("account")}>&#x25B2;</span> // Upward-pointing triangle
                          ) : (
                            <span onClick={()=>handleSort("account")}>&#x25BC;</span> // Downward-pointing triangle
                          )}
                        </span>
                        Account Balance
              
                      </th>

                      <th
                        scope='col'
                        className='px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase '
                      >
                        Games
                      </th>

                      <th
                        scope='col'
                        className='px-6 py-3 text-xs font-bold text-right text-gray-500 uppercase '
                      >
                              <span>
                          {sortOrder === 'asc' ? (
                            <span onClick={()=>handleSort("active")}>&#x25B2;</span> // Upward-pointing triangle
                          ) : (
                            <span onClick={()=>handleSort("active")}>&#x25BC;</span> // Downward-pointing triangle
                          )}
                        </span>
                        Active Balance
                  
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                      {searchQuery !== '' ? 
                           filteredUsers.map((user, index) => (
                          <tr key={index}>
                            <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap flex flex-col'>
                          <div className='flex'>
                            ID:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              <Link to={`/admin/user/${user.id}`} className='text-blue-600 font-medium'>
                                {user.id}
                              </Link>
                            </div>
                          </div>
                          <div className='flex'>
                            Short ID:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.shortID}
                            </div>
                          </div>
                          <div className='flex'>
                            Registered at:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {convertTime(user.data.registeredAt) ===
                              'Invalid Date'
                                ? ''
                                : convertTime(user.data.registeredAt)}
                            </div>
                          </div>
                          <div className='flex'>
                            Email:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.email}
                            </div>
                          </div>
                          <div className='flex'>
                            Name:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.name}
                            </div>
                          </div>
                          <div className='flex'>
                            Phone:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.phone}
                            </div>
                          </div>
                          <div className='flex'>
                            Country:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.country}
                            </div>
                          </div>
                          <div className='flex'>
                            Wallet Address:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.walletAddress}
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap'>
                          {user.data.referrerID}
                        </td>

                        <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap'>
                          <div className='flex'>
                            Current Balance:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.tokenBalance}
                            </div>
                          </div>
                          <div className='flex'>
                            Current Bonus:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {isNaN(user.data.bonusBalance)
                                ? 0
                                : user.data.bonusBalance}
                            </div>
                          </div>
                          <div className='flex'>
                            Total Deposit:{' '}
                            <div className='text-blue-600 font-medium ml-2'></div>
                          </div>
                          <div className='flex'>
                            Total Withdraws:{' '}
                            <div className='text-blue-600 font-medium ml-2'></div>
                          </div>
                          <div className='flex'>
                            Total Bonus:{' '}
                            <div className='text-blue-600 font-medium ml-2'></div>
                          </div>
                        </td>

                        <td className='px-6 text-sm text-right whitespace-nowrap '>
                          <div className='flex'>
                            Total:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.allGamesPlayed?.total ?? 0}
                            </div>
                          </div>
                          <div className='flex'>
                            Wins:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.allGamesPlayed?.wins ?? 0}
                            </div>
                          </div>
                          <div className='flex'>
                            Loses:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.allGamesPlayed?.loses ?? 0}
                            </div>
                          </div>
                          <div className='flex'>
                            Most Played:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {fetchHighestPlayedTable(
                                user.data.tablesPlayedCount
                              )}
                            </div>
                          </div>
                          <div className='flex'>
                            Total Time Played:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {fetchPlayTime(user.data.tablesPlayedCount)}
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4 text-sm font-medium text-right whitespace-nowrap'>
                          <a
                            className='text-green-500 hover:text-green-700'
                            href='#'
                          >
                            {user.data.tokenBalance}
                          </a>
                        </td>
                          </tr>
                        ))
                        : users.map((user, index) => (
                      <tr key={index}>
                        <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap flex flex-col'>
                          <div className='flex'>
                            ID:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              <Link to={`/admin/user/${user.id}`} className='text-blue-600 font-medium'>
                                {user.id}
                              </Link>
                            </div>
                          </div>
                          <div className='flex'>
                            Short ID:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.shortID}
                            </div>
                          </div>
                          <div className='flex'>
                            Registered at:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {convertTime(user.data.registeredAt) ===
                              'Invalid Date'
                                ? ''
                                : convertTime(user.data.registeredAt)}
                            </div>
                          </div>
                          <div className='flex'>
                            Email:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.email}
                            </div>
                          </div>
                          <div className='flex'>
                            Name:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.name}
                            </div>
                          </div>
                          <div className='flex'>
                            Phone:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.phone}
                            </div>
                          </div>
                          <div className='flex'>
                            Country:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.country}
                            </div>
                          </div>
                          <div className='flex'>
                            Wallet Address:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.walletAddress}
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap'>
                          {user.data.referrerID}
                        </td>

                        <td className='px-6 py-4 text-sm text-gray-800 whitespace-nowrap'>
                          <div className='flex'>
                            Current Balance:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.tokenBalance}
                            </div>
                          </div>
                          <div className='flex'>
                            Current Bonus:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {isNaN(user.data.bonusBalance)
                                ? 0 : user.data.bonusBalance}
                            </div>
                          </div>
                          <div className='flex'>
                            Total Deposit:{' '}
                            <div className='text-blue-600 font-medium ml-2'></div>
                          </div>
                          <div className='flex'>
                            Total Withdraws:{' '}
                            <div className='text-blue-600 font-medium ml-2'></div>
                          </div>
                          <div className='flex'>
                            Total Bonus:{' '}
                            <div className='text-blue-600 font-medium ml-2'></div>
                          </div>
                        </td>

                        <td className='px-6 text-sm text-right whitespace-nowrap '>
                          <div className='flex'>
                            Total:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.allGamesPlayed?.total ?? 0}
                            </div>
                          </div>
                          <div className='flex'>
                            Wins:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.allGamesPlayed?.wins ?? 0}
                            </div>
                          </div>
                          <div className='flex'>
                            Loses:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {user.data.allGamesPlayed?.loses ?? 0}
                            </div>
                          </div>
                          <div className='flex'>
                            Most Played:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {fetchHighestPlayedTable(
                                user.data.tablesPlayedCount
                              )}
                            </div>
                          </div>
                          <div className='flex'>
                            Total Time Played:{' '}
                            <div className='text-blue-600 font-medium ml-2'>
                              {fetchPlayTime(user.data.tablesPlayedCount)}
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4 text-sm font-medium text-right whitespace-nowrap'>
                          <a
                            className='text-green-500 hover:text-green-700'
                            href='#'
                          >
                            {user.data.tokenBalance}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default AppUsersPage
