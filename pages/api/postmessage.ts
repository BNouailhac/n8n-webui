// pages/api/trigger-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Example: extract data from request body
    const payload = req.body

    // Webhook URL (keep this in env variables for security!)
    const webhookUrl = process.env.WEBHOOK_URL as string
    const headers = new Headers();

    headers.append("Content-Type", "application/json");
    headers.append("apiKey", process.env.APIKEY as string);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`)
    }

    const result = await response.json().catch(() => null)

    res.status(200).json({ result })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
