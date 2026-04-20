'use server'

import { cookies }   from 'next/headers'
import { redirect }  from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' }
  }

  const cookieStore: any = cookies()
  if (cookieStore.set) {
    await cookieStore.set('admin_authed', 'true', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 8, // 8 hours
      path:     '/',
    })
  } else {
    cookieStore.set?.('admin_authed', 'true', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 8, // 8 hours
      path:     '/',
    })
  }

  redirect('/admin')
}

export async function adminLogout() {
  const cookieStore: any = cookies()
  if (cookieStore.delete) await cookieStore.delete('admin_authed')
  else cookieStore.delete?.('admin_authed')
  redirect('/admin/login')
}
