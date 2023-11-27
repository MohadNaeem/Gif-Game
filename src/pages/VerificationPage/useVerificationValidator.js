import { useForm } from 'react-hook-form'

export const useVerificationValidator = () => {
  const formHook = useForm()
  const { register } = formHook

  const fields = {
    firstName: {
      ...register('firstName', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    lastName: {
      ...register('lastName', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    dobDate: {
      ...register('dobDate', {
        required: {
          value: true,
          message: 'Select Date',
        },
      }),
    },
    dobMonth: {
      ...register('dobMonth', {
        required: {
          value: true,
          message: 'Select Month',
        },
      }),
    },
    dobYear: {
      ...register('dobYear', {
        required: {
          value: true,
          message: 'Select Year',
        },
      }),
    },
    country: {
      ...register('country', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    residentialAddress: {
      ...register('residentialAddress', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    city: {
      ...register('city', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    postalCode: {
      ...register('postalCode', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    occupation: {
      ...register('occupation', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
  }
  return { fields, ...formHook }
}
