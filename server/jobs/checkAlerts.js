import { getTriggeredAlerts, markAlertNotified } from "../db/queries.js"
import { sendMail } from "../mail.js"

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"

export async function checkAlerts() {
  const triggered = await getTriggeredAlerts()
  let sent = 0

  for (const alert of triggered) {
    try {
      await sendMail({
        to: alert.email,
        subject: `Price drop: ${alert.product_name} is now ₹${alert.price}`,
        text:
          `Good news! ${alert.product_name} is now ₹${alert.price} on ${alert.store}, ` +
          `at or below your target of ₹${alert.target_price}.\n\n` +
          `See the price history: ${CLIENT_URL}/product/${alert.product_id}\n`,
      })
      await markAlertNotified(alert.id)
      sent++
    } catch (err) {
      console.error(`Alert ${alert.id} failed:`, err.message)
    }
  }

  console.log(`Alerts: ${triggered.length} triggered, ${sent} sent`)
}