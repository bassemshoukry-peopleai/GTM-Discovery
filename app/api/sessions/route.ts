import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCustomerInvite } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerName, customerEmail } = await req.json()

  if (!customerName || !customerEmail) {
    return NextResponse.json({ error: 'Customer name and email are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      consultant_id: session.user.email,
      consultant_email: session.user.email,
      consultant_name: session.user.name,
      customer_name: customerName,
      customer_email: customerEmail,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const discoveryLink = `${appUrl}/discover/${data.id}`

  sendCustomerInvite({
    customerEmail,
    customerName,
    consultantName: session.user.name ?? null,
    discoveryLink,
  }).catch(err => console.error('Failed to send invite email:', err))

  return NextResponse.json({ session: data })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const consultantId = session.user.email

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('consultant_id', consultantId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }

  return NextResponse.json({ sessions: data })
}
