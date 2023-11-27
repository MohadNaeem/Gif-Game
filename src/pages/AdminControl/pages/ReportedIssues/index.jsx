import React, { useEffect, useState } from 'react'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import app from '../../../../config/firebase'
import { Link } from 'react-router-dom'

const fireStore = getFirestore(app)

const ReportedIssuesPage = () => {
  const color = 'blue'
  const [openTab, setOpenTab] = useState(1)
  const [allIssues, setAllIssues] = useState([])
  const [unResolvedIssues, setUnResolvedIssues] = useState([])
  const [resolvedIssues, setResolvedIssues] = useState([])
  const [clicked, setClicked] = useState(false)

  const fetchAllIssues = () => {
    // Get a reference to the 'public/reports/reportedIssues' collection
    const issuesRef = collection(
      fireStore,
      'public',
      'reports',
      'reportedIssues'
    )

    const querySnapshot = query(issuesRef, orderBy('time', 'desc'))

    getDocs(querySnapshot)
      .then((querySnapshot) => {
        const issuesArray = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          }
        })
        // Filter out the entries with 'status: unresolved'
        const filteredIssues = issuesArray.filter(
          (issue) => issue.status !== 'resolved'
        )
        const filteredIssuesRes = issuesArray.filter(
          (issue) => issue.status !== 'unresolved'
        )

        setUnResolvedIssues(filteredIssues)
        setResolvedIssues(filteredIssuesRes)
        setAllIssues(issuesArray)
      })
      .catch((error) => {
        console.log('Error fetching documents: ', error)
      })
  }

  const readableTime = (microTime) => {
    const milliTime = microTime / 1000
    const cyprusTimezoneOffset = 2 // In hours
    const date = new Date(milliTime)
    const cyprusTime = new Date(
      date.getTime() + cyprusTimezoneOffset * 60 * 60 * 1000
    )
    const hours = cyprusTime.getUTCHours()
    const minutes = cyprusTime.getUTCMinutes()
    const seconds = cyprusTime.getUTCSeconds()
    const formattedTime = `${hours}:${minutes}:${seconds}`

    return formattedTime
  }

  const handleUnResolveClick = async (id) => {
    const issueRef = doc(fireStore, 'public', 'reports', 'reportedIssues', id)
    try {
      await updateDoc(issueRef, {
        status: 'unresolved',
      })
      console.log('Issue status updated successfully!')
    } catch (error) {
      console.error('Error updating issue status: ', error)
    }
    setClicked(!clicked)
  }

  const handleResolveClick = async (id) => {
    const issueRef = doc(fireStore, 'public', 'reports', 'reportedIssues', id)
    try {
      await updateDoc(issueRef, {
        status: 'resolved',
      })
      console.log('Issue status updated successfully!')
    } catch (error) {
      console.error('Error updating issue status: ', error)
    }
    setClicked(!clicked)
  }

  useEffect(() => {
    fetchAllIssues()
  }, [clicked])

  const adminAuthID = localStorage.getItem('adminAuthID')

  return adminAuthID ? (
    <div className='p-4 lg:ml-64'>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <ul
            className='flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row'
            role='tablist'
          >
            <li className='-mb-px mr-2 last:mr-0 flex-auto text-center'>
              <a
                className={
                  'text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ' +
                  (openTab === 1
                    ? 'text-white bg-' + color + '-600'
                    : 'text-blue-600 bg-white')
                }
                onClick={(e) => {
                  e.preventDefault()
                  setOpenTab(1)
                }}
                data-toggle='tab'
                href='#link1'
                role='tablist'
              >
                All
              </a>
            </li>
            <li className='-mb-px mr-2 last:mr-0 flex-auto text-center'>
              <a
                className={
                  'text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ' +
                  (openTab === 2
                    ? 'text-white bg-blue-600'
                    : 'text-' + color + '-600 bg-white')
                }
                onClick={(e) => {
                  e.preventDefault()
                  setOpenTab(2)
                }}
                data-toggle='tab'
                href='#link2'
                role='tablist'
              >
                Unresolved
              </a>
            </li>
            <li className='-mb-px mr-2 last:mr-0 flex-auto text-center'>
              <a
                className={
                  'text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal ' +
                  (openTab === 3
                    ? 'text-white bg-' + color + '-600'
                    : 'text-' + color + '-600 bg-white')
                }
                onClick={(e) => {
                  e.preventDefault()
                  setOpenTab(3)
                }}
                data-toggle='tab'
                href='#link3'
                role='tablist'
              >
                resolved
              </a>
            </li>
          </ul>
          <div className='relative flex flex-col '>
            <div className=' flex-auto'>
              <div className='tab-content tab-space'>
                <div className={openTab === 1 ? 'block' : 'hidden'} id='link1'>
                  <div className='flex flex-col'>
                    {allIssues.map((issue, index) => {
                      return (
                        <div
                          key={index}
                          className='border px-4 py-5 min-w-0 break-words bg-white w-full mb-6 shadow-sm rounded'
                        >
                          <div>
                            <span className='text-blue-500'>Comment: </span>
                            <span>{issue.comments}</span>
                          </div>

                          <div>
                            <span className='text-blue-500'>File URL: </span>
                            {issue.url ? (
                              <span>
                                <a
                                  href={issue.url}
                                  target='_blank'
                                  className='text-sky-500 underline'
                                >
                                  Link
                                </a>
                              </span>
                            ) : (
                              <span className='text-gray-500'>
                                No URL attached
                              </span>
                            )}
                          </div>
                          <div>
                            <span className='text-blue-500'>User ID: </span>
                            <span>
                            <Link to={`/admin/user/${issue.userId}`} className='text-blue-600 font-medium'>
                            {issue.userId}
                              </Link>
                            </span>
                          </div>
                          <div>
                            <span className='text-blue-500'>Time: </span>
                            <span>
                              {issue.time.toDate().toLocaleDateString()}{' '}
                              {issue.time.toDate().toLocaleTimeString()}
                            </span>
                          </div>
                          <div>
                            <span className='text-blue-500'>Status: </span>
                            <span>{issue.status}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className={openTab === 2 ? 'block' : 'hidden'} id='link2'>
                  <div className='flex flex-col'>
                    {unResolvedIssues.map((issue, index) => {
                      return (
                        <div
                          key={index}
                          className='border px-4 py-5 min-w-0 break-words bg-white w-full mb-6 shadow-sm rounded flex justify-between'
                        >
                          <div>
                            <div>
                              <span className='text-blue-500'>Comment: </span>
                              <span>{issue.comments}</span>
                            </div>

                            <div>
                              <span className='text-blue-500'>File URL: </span>
                              {issue.url ? (
                                <span>
                                  <a
                                    href={issue.url}
                                    target='_blank'
                                    className='text-sky-500 underline'
                                  >
                                    Link
                                  </a>
                                </span>
                              ) : (
                                <span className='text-gray-500'>
                                  No URL attached
                                </span>
                              )}
                            </div>
                            <div>
                              <span className='text-blue-500'>User ID: </span>
                              <span>{issue.userId}</span>
                            </div>
                            <div>
                              <span className='text-blue-500'>Time: </span>
                              <span>
                                {issue.time.toDate().toLocaleDateString()}{' '}
                                {issue.time.toDate().toLocaleTimeString()}
                              </span>
                            </div>
                            <div>
                              <span className='text-blue-500'>Status: </span>
                              <span>{issue.status}</span>
                            </div>
                          </div>
                          <div
                            className='cursor-pointer bg-blue-500 h-fit text-white px-4 py-2 rounded-lg font-semibold'
                            onClick={() => handleResolveClick(issue.id)}
                          >
                            Resolve
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className={openTab === 3 ? 'block' : 'hidden'} id='link3'>
                  <div className='flex flex-col'>
                    {resolvedIssues.map((issue, index) => {
                      return (
                        <div
                          key={index}
                          className='border px-4 py-5 min-w-0 break-words bg-white w-full mb-6 shadow-sm rounded flex justify-between'
                        >
                          <div>
                            <div>
                              <span className='text-blue-500'>Comment: </span>
                              <span>{issue.comments}</span>
                            </div>

                            <div>
                              <span className='text-blue-500'>File URL: </span>
                              {issue.url ? (
                                <span>
                                  <a
                                    href={issue.url}
                                    target='_blank'
                                    className='text-sky-500 underline'
                                  >
                                    Link
                                  </a>
                                </span>
                              ) : (
                                <span className='text-gray-500'>
                                  No URL attached
                                </span>
                              )}
                            </div>
                            <div>
                              <span className='text-blue-500'>User ID: </span>
                              <span>{issue.userId}</span>
                            </div>
                            <div>
                              <span className='text-blue-500'>Time: </span>
                              <span>
                                {issue.time.toDate().toLocaleDateString()}{' '}
                                {issue.time.toDate().toLocaleTimeString()}
                              </span>
                            </div>
                            <div>
                              <span className='text-blue-500'>Status: </span>
                              <span>{issue.status}</span>
                            </div>
                          </div>
                          <div
                            className='cursor-pointer bg-blue-500 h-fit text-white px-4 py-2 rounded-lg font-semibold'
                            onClick={() => handleUnResolveClick(issue.id)}
                          >
                            Unresolve
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default ReportedIssuesPage
