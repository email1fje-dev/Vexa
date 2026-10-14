import * as yup from 'yup'

export default yup.object().shape({
  username: yup.string().min(3, 'نام کاربری باید حداقل ۳ نویسه داشته باشد').max(20, 'نام کاربری نمی‌تواند بیشتر از ۲۰ نویسه باشد').trim().required('وارد کردن نام کاربری الزامی است'),

  email: yup
    .string()
    .email('لطفاً یک نشانی ایمیل معتبر وارد کن')
    .lowercase()
    .required('وارد کردن ایمیل الزامی است')
    .defined(),

  password: yup
    .string()
    .min(6, 'گذرواژه باید حداقل ۶ نویسه داشته باشد')
    .max(100, 'گذرواژه نمی‌تواند بیشتر از ۱۰۰ نویسه باشد')
    .required('Password is required')
    .defined(),
})
