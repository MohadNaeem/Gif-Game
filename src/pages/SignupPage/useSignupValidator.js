import { useForm } from 'react-hook-form'

export const useSignupValidator = () => {
  const formHook = useForm()
  const { register } = formHook

  const fields = {
    email: {
      ...register('email', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
        pattern: {
          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          message: 'Please enter valid email format',
        },
      }),
    },
    username: {
      ...register('username', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
    password: {
      ...register('password', {
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
    agreeTnC: {
      ...register('agreeTnC', {
        required: {
          value: true,
          message: 'Check the required field',
        },
      }),
    },
    signupCode: {
      ...register('signupCode', {
        required: {
          value: false,
        },
      }),
    },
  }

  return { fields, ...formHook }
}
