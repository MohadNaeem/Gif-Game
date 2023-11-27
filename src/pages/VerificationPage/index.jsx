import React, { useState, useEffect } from 'react'
import InputWithLabel from '../../components/InputFieldWithLabel'
import { useVerificationValidator } from './useVerificationValidator'
import { monthsList, daysList, yearsList, countryList } from './data'
import SelectOneDropdown from '../../components/SelectOneDropdown'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import {
  doc,
  getFirestore,
  updateDoc,
  increment,
  getDoc,
} from 'firebase/firestore'
import app from '../../config/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth } from 'firebase/auth'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAtom } from 'jotai'
import { InputIsVerified } from '../DepositPage/Tabs'
import { InputIsVerifiedWithdraw } from '../WithdrawPage/Tabs'
import { InputAdminWallet } from '../DepositPage/.'
import axios from '../../config/axios'
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

const fireStore = getFirestore(app)
const auth = getAuth(app)

const VerificationPage = () => {
  const [user, loadingUser] = useAuthState(auth)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dobDate, setDobDate] = useState({})
  const [dobMonth, setDobMonth] = useState({})
  const [dobYear, setDobYear] = useState({})
  const [country, setCountry] = useState('')
  const [residentialAddress, setResidentialAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [occupation, setOcccupation] = useState('')
  const [isVerified, setIsVerified] = useAtom(InputIsVerified)
  const [depositAddress, setDepositAddress] = useAtom(InputAdminWallet)
  const [isVerifiedWithdraw, setIsVerifiedWithdraw] = useAtom(
    InputIsVerifiedWithdraw
  )
  const [saveLoading, setSaveLoading] = useState(false)

  const [darkMode, setDarkMode] = useRecoilState(Atom);

  const {
    fields,
    trigger,
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useVerificationValidator()

  const saveUserObject = async (object) => {
    setSaveLoading(true)
    setSaveLoading(true)
    try {
      console.log(user.id)
      const userRef = doc(fireStore, 'users', user.uid)
      await updateDoc(userRef, object)
      console.log('Object saved successfully!')
      setSaveLoading(false)
      setIsVerified(true)
      setIsVerifiedWithdraw(true)
      axios.post('/createWallet', {"uid": user.uid})
      .then(response => {
        console.log('Response:', response.data);
        setDepositAddress(response.data.address)
        console.log(depositAddress);
        // Do something with the response data
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle the error
      });
    } catch (error) {
      console.error('Error saving object: ', error)
    }
  }

  const onSubmitVerification = (data) => {
    const object = {
      hasVerifiedStep1: true,
      bonusBalance: increment(10),
      firstName: data.firstName,
      lastName: data.lastName,
      dob: dobDate.title + ' ' + dobMonth.title + ' ' + dobYear.title,
      country: data.country.title,
      residentialAddress: data.residentialAddress,
      city: data.city,
      postalCode: data.postalCode,
      occupation: data.occupation,
    }
    console.log(object)
    saveUserObject(object)
  }

  const fetchUserData = async () => {
    const userRef = doc(fireStore, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const dob = userSnap.data().dob.split(' ')
      setDobDate({ id: 101, title: dob[0] })
      setDobMonth({ id: 101, title: dob[1] })
      setDobYear({ id: 101, title: dob[2] })
    }
  }

  useEffect(() => {
    user && fetchUserData()
  }, [user])

  return loadingUser ? (
    <LoadingSpinner />
  ) : (
    <div className='px-2'>
      <div className='font-semibold text-[21px]' style={darkMode ? {color:'white'}:{}}>Verification</div>
      <div className='text-[14px]' style={darkMode ? {color:'white'}:{}}>
        Please verify your details once and earn €10 bonus. In the event your
        details change, level 1 verification can be updated at a later date.
      </div>
      <div className='my-5'>
        <hr className='h-[2px] bg-gray-200 border-0' />
      </div>
      <form onSubmit={handleSubmit(onSubmitVerification)}>
        <div className='flex w-full justify-between mb-5'>
          <div className='w-[50%] mr-4'>
            <InputWithLabel
              name='firstName'
              labelText='First Name'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling= {darkMode ?'font-[500] text-white-500' : 'font-[500] text-gray-500' }
              isRequired={true}
              placeholderText='ex. John'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.firstName }}
              errors={errors.firstName}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={firstName}
              setInputState={setFirstName}
            />
          </div>
          <div className='w-[50%]'>
            <InputWithLabel
              name='lastName'
              labelText='Last Name'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='ex. Doe'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.lastName }}
              errors={errors.lastName}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={lastName}
              setInputState={setLastName}
            />
          </div>
        </div>

        <div className=' mb-5'>
          <div className='text-[14px] font-[500] text-[#182021] flex' style={darkMode ? {color:'white'}: {}}>
            Date of birth
            <span className='text-red-600'>*</span>
            {(errors.dobDate || errors.dobMonth || errors.dobYear) && (
              <ExclamationCircleIcon
                className={`h-[14px] w-[14px] text-[#d76161] font-bold mt-1 ml-1`}
                aria-hidden='true'
              />
            )}
          </div>
          <div className='flex w-full justify-between'>
            <div className='w-[33%] mr-4'>
              <SelectOneDropdown
                required={false}
                height='36px'
                width='100%'
                labelStyling='font-[500]'
                control={control}
                setValue={setValue}
                optionData={daysList}
                errors={errors.dobDate}
                option={dobDate}
                setOption={setDobDate}
                selectFieldName='dobDate'
                selectFieldLabel='Date of Birth'
                isRequired={false}
                placeholder='Day'
                trigger={trigger}
                noLabel={true}
              />
            </div>
            <div className='w-[33%] mr-4'>
              <SelectOneDropdown
                required={false}
                height='36px'
                width='100%'
                labelStyling='font-[500]'
                control={control}
                setValue={setValue}
                optionData={monthsList}
                errors={errors.dobMonth}
                option={dobMonth}
                noLabel={true}
                setOption={setDobMonth}
                selectFieldName='dobMonth'
                selectFieldLabel='Month of birth'
                placeholder='Month'
                trigger={trigger}
              />
            </div>
            <div className='w-[33%]'>
              <SelectOneDropdown
                required={false}
                height='36px'
                width='100%'
                labelStyling='font-[500]'
                control={control}
                setValue={setValue}
                optionData={yearsList}
                errors={errors.dobYear}
                option={dobYear}
                noLabel={true}
                setOption={setDobYear}
                selectFieldName='dobYear'
                selectFieldLabel='Year of birth'
                placeholder='Year'
                trigger={trigger}
              />
            </div>
          </div>
        </div>

        <div className='flex w-full justify-between mb-5'>
          <div className='w-[100%]'>
            <SelectOneDropdown
              required={true}
              height='36px'
              width='100%'
              labelStyling='font-[500] text-fontDark'
              control={control}
              setValue={setValue}
              optionData={countryList}
              errors={errors.country}
              option={country}
              setOption={setCountry}
              selectFieldName='country'
              selectFieldLabel='Country'
              isRequired={true}
              placeholder='ex. United States'
              trigger={trigger}
              listWidth='300px'
            />
          </div>
        </div>

        <div className='flex w-full justify-between mb-5'>
          <div className='w-[100%]'>
            <InputWithLabel
              name='residentialAddress'
              labelText='Residential Address'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='ex. house, street, town, or neighborhood'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.residentialAddress }}
              errors={errors.residentialAddress}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={residentialAddress}
              setInputState={setResidentialAddress}
            />
          </div>
        </div>

        <div className='flex w-full justify-between mb-5'>
          <div className='w-[50%] mr-4'>
            <InputWithLabel
              name='city'
              labelText='City'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='ex. New York'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.city }}
              errors={errors.city}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={city}
              setInputState={setCity}
            />
          </div>
          <div className='w-[50%]'>
            <InputWithLabel
              name='postalCode'
              labelText='Postal Code'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='ex. 6042'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.postalCode }}
              errors={errors.postalCode}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={postalCode}
              setInputState={setPostalCode}
            />
          </div>
        </div>

        <div className='flex w-full justify-between mb-5'>
          <div className='w-[100%]'>
            <InputWithLabel
              name='occupation'
              labelText='Occupation (Your job/work)'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='ex. Software Engineer'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.occupation }}
              errors={errors.occupation}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={occupation}
              setInputState={setOcccupation}
            />
          </div>
        </div>

        <div className='flex flex-row-reverse mb-[60px]'>
          <button
            type='submit'
            className='border px-4 py-2 bg-green-500 rounded-md font-semibold text-white text-[15px]'
          >
            {saveLoading ? 'Loading...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VerificationPage
