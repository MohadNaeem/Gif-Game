import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import app from '../../../../config/firebase'
import LoadingSpinner from '../../../../components/LoadingSpinner'

const fireStore = getFirestore(app)

const VerificationsPage = () => {
  const adminAuthID = localStorage.getItem('adminAuthID')
  const [allDocs, setAllDocs] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [clickedIda, setClickedIda] = useState(false)
  const [clickedAddressA, setClickedAddressA] = useState(false)

  const fetchAllDocs = async () => {
    const docRef = doc(fireStore, 'public', 'verifyDocuments')
    const docSnap = await getDoc(docRef)
    setAllDocs([])
    if (docSnap.data().unapproved) {
      const processedUserIds = new Set()
      await Promise.all(
        docSnap.data().unapproved.map(async (userId) => {
          if (!processedUserIds.has(userId)) {
            processedUserIds.add(userId)
            const userRef = doc(fireStore, 'users', userId)
            const userSnap = await getDoc(userRef)
            const data = {
              userId: userId,
              IDProofUrl: userSnap.data().IDProofUrl,
              IDProofApprove: userSnap.data().IDProofApprove,
              addressProofUrl: userSnap.data().addressProofUrl,
              addressProofApprove: userSnap.data().addressProofApprove,
              email: userSnap.data().email,
            }
            setAllDocs((prevAllDocs) => [...prevAllDocs, data])
          }
        })
      )
    }
    setLoadingData(false)
  }

  const handleOnClickIDapprove = (userId, status) => {
    setClickedIda(!clickedIda)
    const userRef = doc(fireStore, 'users', userId)
    updateDoc(userRef, {
      IDProofApprove: status,
    })
  }

  const handleOnClickAddressApprove = (userId, status) => {
    setClickedAddressA(!clickedAddressA)
    const userRef = doc(fireStore, 'users', userId)
    updateDoc(userRef, {
      addressProofApprove: status,
    })
  }

  useEffect(() => {
    fetchAllDocs()
  }, [clickedIda, clickedAddressA])

  return loadingData ? (
    <LoadingSpinner />
  ) : adminAuthID ? (
    <div className='p-4 sm:ml-64'>
      <div className='font-semibold mb-5 px-3'>VERIFY DOCUMENTS</div>

      {allDocs.map((doc, index) => (
        <div
          key={index}
          className='border border-gray-300 rounded-lg px-4 py-2 mb-4'
        >
          <div className='flex w-[55%] justify-between mb-3'>
            <div className='font-semibold w-[150px]'>User ID</div>
            <div>
              <Link to={`/admin/user/${doc.userId}`} className='text-blue-600 font-medium'>
                {doc.userId}
              </Link>
              </div>
          </div>

          <div className='flex w-[55%] justify-between mb-3'>
            <div className='font-semibold w-[150px]'>Email</div>
            <div>{doc.email}</div>
          </div>

          <div className='flex w-[100%] justify-between mb-2'>
            <div className='font-semibold w-[150px]'>ID Proof URL</div>
            <a
              href={doc.IDProofUrl}
              className='text-blue-500 underline pt-1'
              target='_blank'
            >
              Link
            </a>

            {doc.IDProofUrl ? (
              !doc.IDProofApprove ? (
                <div className='flex'>
                  <div
                    className='bg-green-400 text-white px-2 py-1 rounded-lg font-medium cursor-pointer mr-3'
                    onClick={() =>
                      handleOnClickIDapprove(doc.userId, 'approved')
                    }
                  >
                    Approve
                  </div>
                  <div
                    className='bg-red-400 text-white px-2 py-1 rounded-lg font-medium cursor-pointer'
                    onClick={() =>
                      handleOnClickIDapprove(doc.userId, 'declined')
                    }
                  >
                    Decline
                  </div>
                </div>
              ) : doc.IDProofApprove === 'approved' ? (
                <div className='font-semibold'>Approved</div>
              ) : (
                doc.IDProofApprove === 'declined' && (
                  <div className='font-semibold'>Declined</div>
                )
              )
            ) : (
              <div></div>
            )}
          </div>

          <div className='flex w-[100%] justify-between'>
            <div className='font-semibold w-[150px]'>Address Proof URL</div>
            {doc.addressProofUrl ? (
              <a
                href={doc.addressProofUrl}
                className='text-blue-500 underline pt-1'
                target='_blank'
              >
                Link
              </a>
            ) : (
              <div className='text-gray-500 font-semibold'>Not Uploaded</div>
            )}

            {doc.addressProofUrl ? (
              !doc.addressProofApprove ? (
                <div className='flex'>
                  <div
                    className='bg-green-400 text-white px-2 py-1 rounded-lg font-medium cursor-pointer mr-3'
                    onClick={() =>
                      handleOnClickAddressApprove(doc.userId, 'approved')
                    }
                  >
                    Approve
                  </div>
                  <div
                    className='bg-red-400 text-white px-2 py-1 rounded-lg font-medium cursor-pointer'
                    onClick={() =>
                      handleOnClickAddressApprove(doc.userId, 'declined')
                    }
                  >
                    Decline
                  </div>
                </div>
              ) : doc.addressProofApprove === 'approved' ? (
                <div className='font-semibold'>Approved</div>
              ) : (
                doc.addressProofApprove === 'declined' && (
                  <div className='font-semibold'>Declined</div>
                )
              )
            ) : (
              <div></div>
            )}
          </div>
        </div>
      ))}
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

export default VerificationsPage
