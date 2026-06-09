import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateRecommendations } from '@/lib/claude'
import { sendConsultantNotification, sendCustomerConfirmation } from '@/lib/email'
import { FormData } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { formData }: { formData: FormData } = await req.json()

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.status !== 'pending') {
    return NextResponse.json({ error: 'This form has already been submitted' }, { status: 400 })
  }

  const { error: responseError } = await supabaseAdmin
    .from('responses')
    .insert({ session_id: id, form_data: formData })

  if (responseError) {
    console.error('Error saving responses:', responseError)
    return NextResponse.json({ error: 'Failed to save responses' }, { status: 500 })
  }

  await supabaseAdmin
    .from('sessions')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', id)

  ;(async () => {
    try {
      const recommendations = await generateRecommendations(formData)

      await supabaseAdmin
        .from('results')
        .insert({ session_id: id, recommendations })

      await supabaseAdmin
        .from('sessions')
        .update({ status: 'complete', completed_at: new Date().toISOString() })
        .eq('id', id)

      const appUrl = process.env.NEXT_PUBLIC_APP_URL!

      await Promise.all([
        sendConsultantNotification({
          consultantEmail: session.consultant_email,
          consultantName: session.consultant_name,
          customerName: session.customer_name,
          customerEmail: session.customer_email,
          sessionId: id,
          appUrl,
        }),
        sendCustomerConfirmation({
          customerEmail: session.customer_email,
          customerName: session.customer_name,
          consultantName: session.consultant_name,
        }),
      ])
    } catch (err) {
      console.error('Error generating recommendations:', err)
      await supabaseAdmin
        .from('sessions')
        .update({ status: 'error' })
        .eq('id', id)
    }
  })()

  return NextResponse.json({ success: true })
}
