import React, { Fragment, useEffect } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

const SelectOneDropdown = ({
  control,
  setValue,
  value,
  selectFieldLabel,
  selectFieldName,
  labelTextSize = '14px',
  labelStyling = '',
  optionData,
  registerField,
  showErrorMessage = true,
  errorInfo = false,
  errors,
  trigger,
  required,
  setOption,
  option,
  noLabel = false,
  height = '40px',
  width = '214px',
  iconSize = '14px',
  placeholder = 'Select an Option',
  listWidth = '120px',
}) => {
  
  const [darkMode, setDarkMode] = useRecoilState(Atom)

  useEffect(() => {
    setValue(selectFieldName, option)
  }, [])

  return (
    <div>
      <Controller
        name={selectFieldName}
        control={control}
        rules={registerField}
        render={() => (
          <div className=''>
            <Listbox
              value={option}
              onChange={(e) => {
                setOption(e)
                if (Boolean(e) && e !== null) {
                  setValue(selectFieldName, e)
                } else {
                  setValue(selectFieldName, undefined)
                }

                trigger([selectFieldName])
              }}
            >
              {({ open }) => (
                <div className='flex flex-col gap-[4px]'>
                  <Listbox.Label className='block overflow-hidden text-ellipsis'>
                    <div className='flex flex-row'>
                      <div
                        className={`w-fit block text-[${labelTextSize}] text-[#182021] flex justify-start ${labelStyling} ` }
                      style={darkMode ?{color:'white'}:{}}
                      >
                        {noLabel ? (
                          <span className='hidden'>.</span>
                        ) : (
                          selectFieldLabel
                        )}
                        {required && <span className='text-red-600'>*</span>}
                      </div>

                      <div className='ml-[4px] mt-[2px] flex flex-row gap-[5px]'>
                        <div>
                          {Boolean(errorInfo) && errors !== undefined && (
                            <InformationCircleIcon
                              className={`h-[${iconSize}] w-[${iconSize}] text-[#646464] font-bold`}
                              aria-hidden='true'
                            />
                          )}
                        </div>
                        <div>
                          {errors !== undefined && !noLabel && (
                            <ExclamationCircleIcon
                              className={`h-[${iconSize}] w-[${iconSize}] text-[#d76161] font-bold`}
                              aria-hidden='true'
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Listbox.Label>
                  <div className='relative'>
                    <Listbox.Button
                      className={`border Grey8 px-[12px] py-[8px] flex justify-between cursor-default text-fontDark
                                             rounded-[5px] border bg-white text-[${labelTextSize}]
                                             hover:outline-none hover:ring-0 
                                                ${
                                                  errors === undefined
                                                    ? 'hover:border-[#00a1ff] hover:ring-[#00a1ff] hover:ring-[1px] border-gray-300 focus:border-[#00a1ff] focus:ring-[#00a1ff]'
                                                    : 'hover:border-[#d76161] hover:ring-[#d76161] border-[#d76161] focus:border-[#d76161] focus:ring-[#d76161]'
                                                }
                                                focus:outline-none focus:ring-[1.5px]`}
                      style={darkMode ?{
                        width: `${width}`,
                        height: `${height}`,
                        backgroundColor:'black',
                        border:"1px solid goldenrod"
                      } : {
                        width: `${width}`,
                        height: `${height}`,
                      }}
                    >
                      <span className='flex items-center truncate'>
                        {option?.title === undefined ? (
                          <p className='text-gray-400' style={darkMode ?{color:'white'}: {}}>{placeholder}</p>
                        ) : null}
                        <span className=' block truncate' style={darkMode ?{color: 'white'} : {}}>{option?.title}</span>
                      </span>
                      <span className='pointer-events-none flex items-center'>
                        <ChevronDownIcon
                          className={`h-5 w-5 ${
                            errors !== undefined
                              ? 'text-[#d76161]'
                              : 'text-gray-400'
                          }`}
                          aria-hidden='true'
                        />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <Listbox.Options
                        className={`absolute z-10 max-h-56 overflow-auto rounded-[5px] bg-white text-[${labelTextSize}] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base1 w-[${listWidth}]`}
                      >
                        {optionData.map((data, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `${
                                active
                                  ? 'text-white bg-[#00a1ff]'
                                  : 'text-gray-900'
                              }
                                'relative cursor-default select-none py-2 pl-3 pr-9'`
                            }
                            value={data}
                          >
                            {({ selected, active }) => (
                              <>
                                <div className='flex flex-row items-center'>
                                  <span
                                    className={`${
                                      selected ? 'font-semibold' : 'font-normal'
                                    }
                                      'mr-4 block truncate'`}
                                  >
                                    {data.title}{' '}
                                  </span>
                                  <span
                                    className={`
                                      ${
                                        active ? 'text-white' : 'text-[#00a1ff]'
                                      }
                                      'absolute ml-3 inset-y-0 right-0 flex items-center'
                                    `}
                                  >
                                    {selected ? (
                                      <CheckIcon
                                        className='h-5 w-5'
                                        aria-hidden='true'
                                      />
                                    ) : null}
                                  </span>
                                </div>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              )}
            </Listbox>
            {showErrorMessage && errors !== undefined && (
              <div className='flex items-center  h-[16px]'>
                <p
                  className='mt-[4px] ml-[2px] text-[12px] text-[#D86161]'
                  id='name-error'
                >
                  {errors.message}
                </p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}
export default SelectOneDropdown

SelectOneDropdown.propTypes = {
  control: PropTypes.any,
  setValue: PropTypes.any,
  selectFieldLabel: PropTypes.string,
  labelTextSize: PropTypes.string,
  labelStyling: PropTypes.string,
  selectFieldName: PropTypes.any,
  optionData: PropTypes.any,
  registerField: PropTypes.any,
  errors: PropTypes.any,
  errorInfo: PropTypes.any,
  showErrorMessage: PropTypes.bool,
  trigger: PropTypes.any,
  required: PropTypes.bool,
  value: PropTypes.any,
  setOption: PropTypes.any,
  option: PropTypes.any,
  height: PropTypes.string,
  width: PropTypes.string,
  placeholder: PropTypes.string,
  iconSize: PropTypes.string,
}
SelectOneDropdown.defaultProps = {
  labelTextSize: '14px',
  labelStyling: '',
  showErrorMessage: true,
  errorInfo: false,
  height: '40px',
  width: '214px',
  iconSize: '14px',
  placeholder: 'Select an Option',
}
