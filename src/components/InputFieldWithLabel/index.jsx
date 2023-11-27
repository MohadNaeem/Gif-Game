import React from 'react'
import PropTypes from 'prop-types'
import { InfoIcon, ExclamationIcon } from '../../assets/icons'
import { useRecoilState } from 'recoil'
import { Atom } from '../../Atom/Atom'

const InputWithLabel = ({
  name,
  labelText,
  labelTextSize = '14px',
  labelStyling = '',
  marginLabelField = '4px',
  placeholderText,
  inputType = 'text',
  setValue,
  width = '214px',
  height = '36px',
  isRequired = false,
  inputState,
  setInputState,
  validation,
  errors,
  customError,
  showErrorMessage = true,
  errorInfo = false,
  trigger,
  onChangeTrigger = true,
  authRole = '',
}) => {

  const [darkMode, setDarkMode] = useRecoilState(Atom)
  return (
    <div className=''>
      <div className='flex flex-row'>
        <label
          htmlFor={name}
          className={` w-fit block text-[${labelTextSize}] text-[#182021] flex justify-start ${labelStyling}`}
          style={darkMode ? {color:'white'} : {}}
        >
          {labelText}
          {isRequired && <span className='text-red-600'>*</span>}
        </label>
        <div className='ml-[1px] mt-[4px] flex flex-row'>
          <div>
            {Boolean(errorInfo) && errors !== undefined && (
              <InfoIcon
                className={`h-[${labelTextSize}] mr-[5px] w-[${labelTextSize}]text-[#646464] font-bold`}
                aria-hidden='true'
              />
            )}
          </div>
          <div>
            {(errors !== undefined || customError !== undefined) && (
              <ExclamationIcon
                className={`h-[14px] w-[14px] text-[#D86161]`}
                aria-hidden='true'
              />
            )}
          </div>
        </div>
      </div>
      <div className={` mt-[${marginLabelField}] rounded-[5px]`}>
        <input
          type={inputType}
          name={name}
          id={name}
          placeholder={placeholderText}
          {...validation}
          className={`block text-[${labelTextSize}] appearance-none rounded-[3px] text-[#182021] font-normal placeholder-gray-400 border p-[8px]
                     hover:outline-none hover:ring-0 
                    ${
                      errors === undefined && customError === undefined
                        ? 'hover:border-[#00A1FF] hover:ring-[#00A1FF] border-gray-300 focus:border-[#00A1FF] hover:ring-[1px] focus:ring-[#00A1FF]'
                        : 'hover:border-[#D86161] hover:ring-[#D86161] border-[#D86161] focus:border-[#D86161] focus:ring-[#D86161]'
                    }
                    focus:outline-none focus:ring-[1.5px]`}
          style={darkMode ? {
            width: `${width}`,
            height: `${height}`,
            backgroundColor:'black', color:"white", border:'1px solid goldenrod'
          } : {
            width: `${width}`,
            height: `${height}`,
          }}
          value={inputState}
          onChange={(e) => {
            setInputState(e.target.value)
            if (e !== null) {
              setValue(name, e.target.value)
            } else {
              setValue(name, undefined)
            }
            onChangeTrigger && trigger([name])
          }}
        />
      </div>
      {showErrorMessage && errors !== undefined && (
        <div className='flex items-center h-[16px]'>
          <p className='mt-[4px] text-[12px] text-[#D86161]' id='name-error'>
            {errors.message}
          </p>
        </div>
      )}
      {customError !== undefined && (
        <div className='flex items-center h-[16px]'>
          <p className='mt-[4px] text-[12px] text-[#D86161]' id='name-error'>
            {customError}
          </p>
        </div>
      )}
    </div>
  )
}

export default InputWithLabel

InputWithLabel.propTypes = {
  name: PropTypes.string,
  labelText: PropTypes.string,
  placeholderText: PropTypes.string,
  inputType: PropTypes.string,
  labelTextSize: PropTypes.string,
  labelStyling: PropTypes.string,
  marginLabelField: PropTypes.string,
  setValue: PropTypes.any,
  width: PropTypes.string,
  height: PropTypes.string,
  isRequired: PropTypes.bool,
  validation: PropTypes.any,
  errors: PropTypes.any,
  errorInfo: PropTypes.any,
  showErrorMessage: PropTypes.bool,
  trigger: PropTypes.any,
  inputState: PropTypes.any,
  setInputState: PropTypes.any,
  authRole: PropTypes.string,
}

InputWithLabel.defaultProps = {
  labelTextSize: '14px',
  inputType: 'text',
  labelStyling: '',
  marginLabelField: '4px',
  width: '214px',
  height: '36px',
  isRequired: false,
  showErrorMessage: true,
  errorInfo: false,
  authRole: '',
}
