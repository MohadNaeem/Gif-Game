import { useForm } from 'react-hook-form'

export const useLoginInValidator = () => {
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
    password: {
      ...register('password', {
        required: {
          value: true,
          message: 'Enter the required field',
        },
      }),
    },
  }

  return { fields, ...formHook }
}
