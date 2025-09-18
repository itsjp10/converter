export const runtime = 'nodejs'

import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data

    if (evt.type != 'user.created') {
      return NextResponse.json({ message: 'Event type not handled' })
    }
    console.log(prisma)
    const newUser = await prisma.user.create({
      data: {
        clerkId: id,
        name: evt.data.first_name,
      },
    });


    return NextResponse.json(newUser);
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}