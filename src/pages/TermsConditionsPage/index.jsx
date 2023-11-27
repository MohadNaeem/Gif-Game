import React, { useState, useEffect } from 'react'
import { getDoc, doc, getFirestore } from 'firebase/firestore'
import app from '../../config/firebase'
import { Link } from 'react-router-dom'
import NotAuthorised from '../../components/NotAuthorised'

const fireStore = getFirestore(app)

const TermsConditionsPage = () => {
  const [content, setContent] = useState('')

  const fetchContent = async () => {
    const contentRef = doc(fireStore, 'public', 'termsAndConditions')
    try {
      const contentSnap = await getDoc(contentRef)
      if (contentSnap.exists()) {
        setContent(contentSnap.data().html)
      }
    } catch (error) {
      console.log(error, 'No doc found')
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return (
    <div className='p-3'>
      <div className='text-center font-bold text-xl pb-5'>
        Terms and Conditions
      </div>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  )
}

export default TermsConditionsPage
