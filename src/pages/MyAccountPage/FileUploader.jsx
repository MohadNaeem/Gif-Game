import { useState } from 'react'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import {
  getDoc,
  updateDoc,
  doc,
  getFirestore,
  collection,
  setDoc,
  addDoc,
  arrayUnion,
} from 'firebase/firestore'
import app from '../../config/firebase'

// Initialize Firebase
const storage = getStorage(app)
const fireStore = getFirestore(app)

function FileUploader({ userId, type, onUploadComplete, declineMsg = false }) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showErrorMsg, setShowErrorMsg] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showProgress, setShowProgress] = useState(false)
  const [showDeclineMsg, setShowDeclineMsg] = useState(declineMsg)

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return

    if (selectedFile.size > 10 * 1024 * 1024) {
      setShowErrorMsg(true)
      setErrorMsg('File size should be less than 10 MB')

      setFile(null)
      return
    } else {
      setShowErrorMsg(false)
      setFile(selectedFile)
      setShowProgress(true)
    }

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(
      storage,
      `documentVerification/${type}Proof/${selectedFile.name}`
    )

    // Upload the file to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, selectedFile)

    // Listen for upload progress
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Update progress state with current progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(progress)
      },
      (error) => {
        console.error(error)
      },
      async () => {
        // Upload complete
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        onUploadComplete(downloadURL)
        const userRef = doc(fireStore, 'users', userId)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          type === 'ID'
            ? await updateDoc(userRef, {
                IDProofUrl: downloadURL,
                IDProofApprove: null,
              })
            : type === 'address' &&
              (await updateDoc(userRef, {
                addressProofUrl: downloadURL,
                addressProofApprove: null,
              }))
        }

        setShowDeclineMsg(false)

        const docRef = doc(fireStore, 'public', 'verifyDocuments')
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          await updateDoc(docRef, {
            unapproved: arrayUnion(userId),
          })
        } else {
          await setDoc(docRef, {
            unapproved: arrayUnion(userId),
          })
        }
      }
    )
  }

  return (
    <div className='flex flex-col mb-2'>
      <div className='sm:flex sm:flex-row flex-col justify-between'>
        <div className='w-[40%]'>
          <input
            type='file'
            onChange={handleFileChange}
            className='mr-5 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding py-[0.32rem] px-3 text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100  file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[margin-inline-end:0.75rem] file:[border-inline-end-width:1px] file:cursor-pointer hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-[0_0_0_1px] focus:shadow-primary focus:outline-none shadow-sm cursor-pointer'
          />
        </div>
        {showProgress && (
          <div className='py-1 text-sm font-medium'>
            {progress.toFixed(2)}% uploaded
          </div>
        )}
      </div>
      {showErrorMsg && <div className='text-red-500 text-sm'>{errorMsg}</div>}
      {showDeclineMsg && (
        <div className='text-[13px] text-red-500 mt-2'>
          This document was not approved. Please upload a valid document proof.
        </div>
      )}
    </div>
  )
}

export default FileUploader
