import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import LoginSchema from '../validation/login.schema'
import RegisterSchema from '../validation/register.schema'
import { login, register } from '../api/auth'
import { ME_PAGE } from '../constants/history.constants'
import { loginSuccess } from '../store/user'
import './vexa-auth.scss'

function VexaMark() {
  return (
    <span className='vexa-mark' aria-hidden='true'>
      <svg viewBox='0 0 40 40' role='presentation'>
        <path d='M8 10h7l5 14 5-14h7L23 31h-6L8 10Z' fill='currentColor' />
        <path d='M29 8h4v4h-4z' fill='currentColor' opacity='.55' />
      </svg>
    </span>
  )
}

function FieldIcon({ kind }) {
  if (kind === 'mail') {
    return <svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='5' width='18' height='14' rx='3' /><path d='m4 7 8 6 8-6' /></svg>
  }
  if (kind === 'user') {
    return <svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='8' r='4' /><path d='M4 20a8 8 0 0 1 16 0' /></svg>
  }
  return <svg viewBox='0 0 24 24' aria-hidden='true'><rect x='4' y='10' width='16' height='11' rx='3' /><path d='M8 10V7a4 4 0 0 1 8 0v3' /><path d='M12 14v3' /></svg>
}

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const history = useHistory()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('vexa-theme') || 'dark'
    } catch (error) {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.lang = 'fa'
    document.documentElement.dir = 'rtl'
    document.documentElement.setAttribute('data-theme', theme)
    document.title = isRegister ? 'ساخت حساب | Vexa' : 'ورود | Vexa'
    try {
      window.localStorage.setItem('vexa-theme', theme)
    } catch (error) {
      // Theme still works for this page even if storage is unavailable.
    }
  }, [theme, isRegister])

  async function handleSubmit(values, { setErrors, setStatus }) {
    setStatus(undefined)
    try {
      const response = isRegister ? await register(values) : await login(values)
      if (!response || !response.data) {
        setStatus({ message: 'پاسخی از سرور دریافت نشد. دوباره تلاش کن.' })
        return
      }
      dispatch(loginSuccess(response.data))
      history.push(ME_PAGE)
    } catch (error) {
      const data = error && error.response && error.response.data
      const fieldErrors = {}
      if (Array.isArray(data && data.errors)) {
        data.errors.forEach((item) => {
          if (item && item.field && item.message) fieldErrors[item.field] = item.message
        })
      } else if (data && data.errors && typeof data.errors === 'object') {
        Object.assign(fieldErrors, data.errors)
      }
      if (error && error.response && error.response.status === 401 && !isRegister) {
        fieldErrors.email = data && data.message ? data.message : 'ایمیل یا گذرواژه درست نیست.'
      }
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors)
      const networkFailure = !error || !error.response
      setStatus({
        message: (data && data.message) ||
          (networkFailure
            ? 'ارتباط با سرور برقرار نشد. اینترنت را بررسی کن و دوباره امتحان کن.'
            : 'ورود انجام نشد. اطلاعات را بررسی کن و دوباره تلاش کن.'),
      })
    }
  }

  return (
    <main className='vexa-auth-shell'>
      <div className='vexa-auth-glow vexa-auth-glow-one' aria-hidden='true' />
      <div className='vexa-auth-glow vexa-auth-glow-two' aria-hidden='true' />

      <header className='vexa-auth-topbar'>
        <Link className='vexa-brand' to='/' aria-label='Vexa، صفحه ورود'>
          <VexaMark />
          <span className='vexa-brand-copy'>
            <strong>Vexa</strong>
            <small>فضای گفت‌وگوی تو</small>
          </span>
        </Link>
        <button
          className='vexa-theme-button'
          type='button'
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'فعال کردن تم تیره' : 'فعال کردن تم روشن'}
          title={theme === 'light' ? 'تم تیره' : 'تم روشن'}
        >
          {theme === 'light' ? (
            <svg viewBox='0 0 24 24' aria-hidden='true'><path d='M20.2 15.1A8.6 8.6 0 0 1 8.9 3.8 8.8 8.8 0 1 0 20.2 15.1Z' /></svg>
          ) : (
            <svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='4' /><path d='M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' /></svg>
          )}
        </button>
      </header>

      <div className='vexa-auth-layout'>
        <section className='vexa-auth-story'>
          <div className='vexa-story-content'>
            <div className='vexa-story-pill'><span className='vexa-live-dot' /> یک جای تازه برای آدمای خودت</div>
            <h1>گفت‌وگوهایت،<br /><span>حس‌وحال خودت.</span></h1>
            <p className='vexa-story-intro'>
              یه فضای جمع‌وجور و خودمونی برای پیام دادن، پیدا کردن دوستات و ادامه دادن حرف‌هایی که دوست داری.
            </p>

            <div className='vexa-preview-window' aria-label='پیش‌نمایش ظاهری گفت‌وگو'>
              <div className='vexa-preview-top'>
                <div className='vexa-preview-brand'><VexaMark /><span>گوشه‌ی دوستان</span></div>
                <span className='vexa-preview-label'>پیش‌نمایش</span>
              </div>
              <div className='vexa-preview-room'>
                <div className='vexa-preview-avatar avatar-green'>آ</div>
                <div className='vexa-preview-message'>
                  <div className='vexa-preview-message-head'><strong>آراد</strong><span>همین الان</span></div>
                  <p>خب بچه‌ها، امشب چه برنامه‌ای داریم؟ ✨</p>
                </div>
              </div>
              <div className='vexa-preview-room'>
                <div className='vexa-preview-avatar avatar-purple'>ن</div>
                <div className='vexa-preview-message'>
                  <div className='vexa-preview-message-head'><strong>نیلو</strong><span>همین الان</span></div>
                  <p>من هستم! فقط لینک رو بفرستین 😄</p>
                </div>
              </div>
              <div className='vexa-preview-composer'>
                <span>یه پیام بنویس...</span>
                <span className='vexa-preview-send' aria-hidden='true'>↑</span>
              </div>
            </div>

            <div className='vexa-story-benefits'>
              <div><span className='vexa-benefit-icon'>✦</span><span><strong>ساده و مرتب</strong><small>بدون شلوغی اضافه</small></span></div>
              <div><span className='vexa-benefit-icon'>↗</span><span><strong>برای هر صفحه</strong><small>موبایل و دسکتاپ</small></span></div>
              <div><span className='vexa-benefit-icon'>◈</span><span><strong>انتخاب با تو</strong><small>پوسته روشن یا تیره</small></span></div>
            </div>
          </div>
          <div className='vexa-story-footer'><span>VEXA / YOUR SPACE</span><span>نسخه‌ی وب</span></div>
        </section>

        <section className='vexa-auth-main' aria-labelledby='vexa-auth-title'>
          <div className='vexa-auth-card'>
            <div className='vexa-card-mobile-brand'><VexaMark /><span>Vexa</span></div>
            <div className='vexa-auth-heading'>
              <span className='vexa-eyebrow'>{isRegister ? 'شروع از اینجا' : 'دوباره اینجایی؟'}</span>
              <h2 id='vexa-auth-title'>{isRegister ? 'حساب خودت رو بساز' : 'خوش برگشتی!'}</h2>
              <p>{isRegister ? 'چند تا مورد کوتاه رو پر کن تا شروع کنیم.' : 'اطلاعات حسابت رو وارد کن و برگرد پیش دوستات.'}</p>
            </div>

            <Formik
              initialValues={isRegister ? { email: '', username: '', password: '' } : { email: '', password: '' }}
              validationSchema={isRegister ? RegisterSchema : LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className='vexa-auth-form' noValidate>
                  <div className='vexa-field'>
                    <label htmlFor='vexa-email'>ایمیل</label>
                    <div className='vexa-input-wrap'>
                      <Field id='vexa-email' name='email' type='email' autoComplete='email' placeholder='name@example.com' dir='ltr' />
                      <span className='vexa-input-icon'><FieldIcon kind='mail' /></span>
                    </div>
                    <ErrorMessage name='email' component='span' className='vexa-field-error' />
                  </div>

                  {isRegister && (
                    <div className='vexa-field'>
                      <label htmlFor='vexa-username'>نام کاربری</label>
                      <div className='vexa-input-wrap'>
                        <Field id='vexa-username' name='username' type='text' autoComplete='username' placeholder='اسم دلخواهت' />
                        <span className='vexa-input-icon'><FieldIcon kind='user' /></span>
                      </div>
                      <ErrorMessage name='username' component='span' className='vexa-field-error' />
                      <small className='vexa-field-hint'>یه اسم کوتاه که دوست داری باهاش شناخته بشی.</small>
                    </div>
                  )}

                  <div className='vexa-field'>
                    <div className='vexa-label-row'>
                      <label htmlFor='vexa-password'>گذرواژه</label>
                      <button className='vexa-quiet-button' type='button' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? 'پنهان کردن' : 'نمایش گذرواژه'}
                      </button>
                    </div>
                    <div className='vexa-input-wrap'>
                      <Field id='vexa-password' name='password' type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'حداقل ۸ نویسه' : 'گذرواژه‌ات رو وارد کن'} dir='ltr' />
                      <span className='vexa-input-icon'><FieldIcon kind='lock' /></span>
                    </div>
                    <ErrorMessage name='password' component='span' className='vexa-field-error' />
                  </div>

                  {status && status.message && (
                    <div className='vexa-form-status' role='alert'>{status.message}</div>
                  )}

                  <button className='vexa-submit-button' type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <><span className='vexa-spinner' /> در حال بررسی...</> : <>{isRegister ? 'ساخت حساب کاربری' : 'ورود به Vexa'} <span aria-hidden='true'>←</span></>}
                  </button>

                  <div className='vexa-auth-switch'>
                    <span>{isRegister ? 'از قبل حساب داری؟' : 'هنوز حساب نساختی؟'}</span>
                    <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'ورود به حساب' : 'ثبت‌نام کن'}</Link>
                  </div>
                </Form>
              )}
            </Formik>

            <div className='vexa-card-divider'><span>VEXA</span></div>
            <p className='vexa-card-note'><span aria-hidden='true'>✳</span> ساده شروع کن؛ بقیه‌اش رو قدم‌به‌قدم می‌سازیم.</p>
          </div>
          <div className='vexa-mobile-caption'>Vexa · فضای گفت‌وگوی تو</div>
        </section>
      </div>
    </main>
  )
}
