import React, { useState, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import app from '../../../../config/firebase'
import { Link } from 'react-router-dom'

const fireStore = getFirestore(app)
const TermsConditionsSet = () => {
  const [editorContent, setEditorContent] = useState('')
  const [initialContent, setInitialContent] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [displayMessage, setDisplayMessage] = useState('')

  const fetchInitialContent = async () => {
    const contentRef = doc(fireStore, 'public', 'termsAndConditions')
    try {
      const contentSnap = await getDoc(contentRef)
      if (contentSnap.exists()) {
        setInitialContent(contentSnap.data().html)
      }
    } catch (error) {
      console.log(error, 'No doc found')
    }
  }

  const handleSaveOnClick = async () => {
    setSaveLoading(true)
    const contentRef = doc(fireStore, 'public', 'termsAndConditions')
    const contentSnap = await getDoc(contentRef)

    try {
      if (contentSnap.exists()) {
        await updateDoc(contentRef, {
          html: editorContent,
        })
      } else {
        await setDoc(contentRef, {
          html: editorContent,
        })
      }
      setDisplayMessage('Saved Successfully!')
    } catch (e) {}
    setSaveLoading(false)
  }

  useEffect(() => {
    fetchInitialContent()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayMessage('')
    }, 5000)
    return () => clearTimeout(timer)
  }, [displayMessage])

  const handleEditorChange = (content) => {
    setEditorContent(content)
  }

  const adminAuthID = localStorage.getItem('adminAuthID')

  return adminAuthID ? (
    <div className='p-4 sm:ml-64'>
      <div className='text-center font-semibold text-xl pb-5'>
        Set Terms and Conditions
      </div>
      <div className='shadow-lg mb-8'>
        <Editor
          apiKey='5fdt201c69bf7k7cpnbv6bs05w9qb0fw20qc1tzy95ynl9st'
          initialValue={initialContent}
          init={{
            skin: 'snow',
            height: 600,
            menubar: false,
            textcolor_rows: '10',
            toolbar:
              'undo redo | styleselect | fontsizeselect| code | bold italic | alignleft aligncenter alignright alignjustify | outdent indent ',
          }}
          onEditorChange={handleEditorChange}
        />
      </div>
      <div className='flex  flex-row-reverse mb-4'>
        <div className='flex flex-col'>
          <button
            className='w-fit bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl'
            onClick={handleSaveOnClick}
          >
            {saveLoading ? <span>Saving...</span> : <span>Save</span>}
          </button>
        </div>
      </div>

      <div className='text-right font-bold text-green-500'>
        {displayMessage}
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

export default TermsConditionsSet
