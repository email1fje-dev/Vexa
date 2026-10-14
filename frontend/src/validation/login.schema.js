import * as yup from 'yup'

export default yup.object().shape({
  email: yup
    .string()
    .email('لطفاً یک نشانی ایمیل معتبر وارد کن')
    .lowercase()
    .required('وارد کردن ایمیل الزامی است')
    .defined(),
  password: yup
    .string()
    .min(6, 'گذرواژه باید حداقل ۶ نویسه داشته باشد')
    .max(100)
    .required('وارد کردن گذرواژه الزامی است')
    .defined(),
})
