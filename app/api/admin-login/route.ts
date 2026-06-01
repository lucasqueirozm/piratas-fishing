import { cookies } from 'next/headers'

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return Response.json({ ok: true })
}
