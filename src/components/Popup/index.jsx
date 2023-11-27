import React, { useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { atom, useAtom } from 'jotai'
import { CurrencyEuroIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { InputFromWithdrawPage } from '../../pages/WithdrawPage/BitcoinWithdraw'
import { useIntl } from 'react-intl'

export const InputIsModalOpen = atom(false)
export const InputModalHeader = atom('')
export const InputModalContent = atom('')
export const InputModalType = atom('')

function Popup() {
  const [isOpen, setIsOpen] = useAtom(InputIsModalOpen)
  const [header] = useAtom(InputModalHeader)
  const [content] = useAtom(InputModalContent)
  const [type] = useAtom(InputModalType)
  const [copied, setCopied] = useState(false)
  const cancelButtonRef = useRef(null)
  const [fromWithdrawPage, setFromWithdrawPage] = useAtom(InputFromWithdrawPage);

  const { formatMessage } = useIntl();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cancelButtonRef.current &&
        !cancelButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [cancelButtonRef])

  function shortenId(longId) {
    const alphanumericOnly = longId.replace(/[^a-zA-Z0-9]/g, '')
    const shortId = alphanumericOnly.substring(0, 8)
    return shortId
  }

  const userAuthID = localStorage.getItem('userAuthID')

  const handleCopyLinkClick = () => {
    const url = `https://omo7-739e5.web.app/signup/${shortenId(userAuthID)}` //https://omo-v1.web.app/
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(!copied)
      })
      .catch((error) => {
        console.error('Failed to copy URL to clipboard: ', error)
      })
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='fixed inset-0 z-10 overflow-y-auto'
          onClose={() => setIsOpen(false)}
          initialFocus={cancelButtonRef}
        >
          <div className='min-h-screen px-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <Dialog.Overlay className='fixed inset-0 bg-black bg-opacity-50' />
            </Transition.Child>

            <span
              className='inline-block h-screen align-middle'
              aria-hidden='true'
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className='inline-block w-fit max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded'>
                <Dialog.Title
                  as='h3'
                  className='text-lg font-semibold leading-6 text-gray-900'
                >
                  {header}
                </Dialog.Title>

                <div className='mt-5'>
                  <div className='text-[15px] text-gray-600'>
                    <div dangerouslySetInnerHTML={{ __html: content }}></div>
                  </div>
                </div>

                {type === 'lockStatus' ? (
                  <div className='mt-5 w-full flex flex-row-reverse'>
                    <Link to='/deposit'>
                      <div
                        type='button'
                        className='bg-amber-400 cursor-pointer text-[13px] flex w-fit text-white font-bold py-2 px-3 rounded-full active:border-green-300'
                        onClick={() => setIsOpen(false)}
                        ref={cancelButtonRef}
                      >
                        <span className='mr-1 '>Unlock Now </span>
                        <CurrencyEuroIcon className='w-5 h-5 text-white' />
                      </div>
                    </Link>

                    <button
                      className='text-red-400 background-transparent font-bold uppercase px-6 py-2 text-[13px] outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                      type='button'
                      onClick={() => setIsOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Close
                    </button>
                  </div>
                ) : type === 'share' ? (
                  <div className='mt-5 w-full flex justify-center'>
                    <div
                      className='cursor-pointer w-fit flex bg-[#E7F1FF] px-3 py-2 font-medium rounded-full shadow-md'
                      onClick={handleCopyLinkClick}
                    >
                      <div className='text-[#3884FF] p-[1px] mr-2 text-[14px]'>
                        Copy Referral Link
                      </div>
                      <div className='text-blue-400 underline cursor-pointer w-fit'>
                        {!copied ? (
                          <span>
                            <i className='fa fa-copy'></i>
                          </span>
                        ) : (
                          <i className='fa fa-check'></i>
                        )}
                      </div>
                    </div>
                  </div>
                ) : type === 'verifyDoc' ? (
                  <div className='mt-5 w-full flex flex flex-row-reverse'>
                    <Link to='/myaccount'>
                      <div
                        className='cursor-pointer w-fit flex bg-gray-200 px-3 py-2 font-medium rounded-full border'
                        onClick={() => setFromWithdrawPage(true)}
                      >
                        <div className='text-red-400 p-[1px] mr-2 text-[13px]'>
                        {formatMessage({id: 'myAccount'})}
                        </div>
                        <div className='text-red-400 underline cursor-pointer w-fit'>
                          <UserCircleIcon className='w-5 h-5 mt-[2px]' />
                        </div>
                      </div>
                    </Link>
                    <button
                      className='text-red-400 background-transparent font-semibold uppercase px-6 py-2 text-[13px] outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                      type='button'
                      onClick={() => setIsOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Close
                    </button>
                  </div>
                ) : null}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Popup
