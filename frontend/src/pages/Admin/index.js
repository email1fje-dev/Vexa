import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import client from '../../api/client'
import { GetMe } from '../../hooks/redux'

export default function AdminPanel() {
  const session = GetMe()
  const currentUser = session?.user
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setLoading(false)
      return
    }

    let active = true
    client
      .get('/api/v1/users?limit=100&page=1')
      .then(({ data }) => {
        if (active) setUsers(Array.isArray(data?.results) ? data.results : [])
      })
      .catch(() => {
        if (active) setError('بارگذاری کاربران ناموفق بود. دسترسی API و اتصال سرور را بررسی کن.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [currentUser?.role])

  if (currentUser?.role !== 'admin') return <Redirect to='/channels' />

  return (
    <main dir='rtl' style={{ minHeight: '100vh', width: '100%', padding: 24, background: '#080d09', color: '#f1f8f2', fontFamily: 'Tahoma, Segoe UI, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>پنل مدیریت Vexa</h1>
          <p style={{ color: '#a7b8aa', marginTop: 8 }}>مدیریت کاربران و بررسی وضعیت حساب‌ها</p>
        </div>
        <a href='/channels' style={{ color: '#07130a', background: '#22c55e', borderRadius: 10, padding: '10px 16px', textDecoration: 'none', fontWeight: 700 }}>بازگشت به Vexa</a>
      </header>

      <section style={{ border: '1px solid #294432', background: '#101812', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 19 }}>کاربران ثبت‌شده</h2>
          <button type='button' onClick={() => window.location.reload()} style={{ background: '#1b3322', color: '#dcfce7', border: '1px solid #31563a', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>تازه‌سازی</button>
        </div>

        {loading && <p style={{ color: '#a7b8aa', padding: '18px 0' }}>در حال دریافت اطلاعات…</p>}
        {!loading && error && <p role='alert' style={{ color: '#fca5a5', padding: '18px 0' }}>{error}</p>}
        {!loading && !error && (
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ color: '#a7b8aa', borderBottom: '1px solid #294432' }}>
                  <th style={{ padding: 12 }}>نام کاربری</th>
                  <th style={{ padding: 12 }}>ایمیل</th>
                  <th style={{ padding: 12 }}>نقش</th>
                  <th style={{ padding: 12 }}>تأییدشده</th>
                  <th style={{ padding: 12 }}>شناسه</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id || item.email} style={{ borderBottom: '1px solid #1d2a20' }}>
                    <td style={{ padding: 12, fontWeight: 700 }}>{item.username}{item.isVerifiedBadge ? ' 🔵' : ''}</td>
                    <td style={{ padding: 12 }}>{item.email}</td>
                    <td style={{ padding: 12 }}>{item.role === 'admin' ? 'مدیر' : 'کاربر'}</td>
                    <td style={{ padding: 12 }}>{item.isEmailVerified ? 'بله' : 'خیر'}</td>
                    <td style={{ padding: 12, color: '#a7b8aa' }}>#{item.shortId}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan='5' style={{ padding: 16, color: '#a7b8aa' }}>کاربری برای نمایش پیدا نشد.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p style={{ color: '#718575', fontSize: 12, marginTop: 16 }}>دسترسی این صفحه با نقش مدیر و مجوزهای API سمت سرور کنترل می‌شود.</p>
    </main>
  )
}
