import type { Order } from '@/types'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@parathagirl.com'
const RESEND_API_KEY = process.env.RESEND_API_KEY

/**
 * Send order confirmation email to customer
 */
export async function sendCustomerOrderEmail(order: Order) {
  if (!order.customer_email) {
    console.warn('No customer email provided for order', order.id)
    return
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  const fulfillmentText =
    order.fulfillment_type === 'pickup'
      ? `<p><strong>Pickup Location:</strong> ${order.delivery_address || 'TBA'}</p>`
      : `<p><strong>Delivery Address:</strong> ${order.delivery_address || 'TBA'}</p>`

  const scheduledText = order.scheduled_for
    ? `<p><strong>Scheduled For:</strong> ${new Date(order.scheduled_for).toLocaleString()}</p>`
    : '<p><strong>Delivery Time:</strong> ASAP</p>'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0a0e27; color: #fff; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-id { font-size: 18px; font-weight: bold; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .track-link { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0a0e27; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🥙 Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${order.customer_name},</p>
          <p>Your order has been received and is being prepared!</p>
          
          <div class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</div>
          
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr style="background: #e8e8e8;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr style="background: #f0f0f0; font-weight: bold;">
                <td colspan="2" style="padding: 8px; text-align: right;">Total:</td>
                <td style="padding: 8px; text-align: right;">$${order.total_amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <h3>Delivery Information</h3>
          ${fulfillmentText}
          ${scheduledText}
          ${order.payment_method === 'cod' ? '<p><strong>Payment Method:</strong> Cash on Delivery</p>' : ''}

          <a href="http://localhost:3002/order/${order.id}" class="track-link">
            Track Your Order
          </a>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If you have any questions, please reply to this email.
          </p>
        </div>
        <div class="footer">
          <p>Paratha Girl © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: order.customer_email,
    subject: `Order Confirmed - Paratha Girl #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  })
}

/**
 * Send order notification email to admin
 */
export async function sendAdminOrderEmail(order: Order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.product_name} (x${item.quantity}) - $${item.subtotal.toFixed(2)}</li>`
    )
    .join('')

  const fulfillmentInfo =
    order.fulfillment_type === 'pickup'
      ? `Pickup @ ${order.delivery_address}`
      : `Delivery to: ${order.delivery_address}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0a0e27; color: #fff; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-id { font-size: 18px; font-weight: bold; margin: 10px 0; color: #0a0e27; }
        .status-badge { display: inline-block; padding: 6px 12px; background: #4CAF50; color: white; border-radius: 4px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 New Order Received</h1>
        </div>
        <div class="content">
          <div class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</div>
          <span class="status-badge">${order.status.toUpperCase()}</span>

          <h3>Customer Info</h3>
          <p>
            <strong>Name:</strong> ${order.customer_name}<br/>
            <strong>Email:</strong> ${order.customer_email}<br/>
            <strong>Phone:</strong> ${order.customer_phone}
          </p>

          <h3>Items</h3>
          <ul>${itemsHtml}</ul>
          <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>

          <h3>Fulfillment</h3>
          <p>${fulfillmentInfo}</p>
          ${order.scheduled_for ? `<p><strong>Scheduled:</strong> ${new Date(order.scheduled_for).toLocaleString()}</p>` : '<p><strong>Delivery:</strong> ASAP</p>'}

          <h3>Payment</h3>
          <p><strong>Method:</strong> ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>

          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Order - Paratha Girl #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  })
}

/**
 * Send order confirmed email to customer (when status changes to confirmed)
 */
export async function sendOrderConfirmedEmail(order: Order) {
  if (!order.customer_email) {
    console.warn('No customer email provided for order', order.id)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: #fff; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-id { font-size: 18px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${order.customer_name},</p>
          <p>Great news! Your order has been confirmed and is now being prepared.</p>
          
          <div class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</div>
          
          <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>

          <p>
            ${
              order.fulfillment_type === 'pickup'
                ? `We'll let you know when your order is ready for pickup!`
                : `Your order will be delivered soon. Track your order below.`
            }
          </p>

          <a href="http://localhost:3002/order/${order.id}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            Track Your Order
          </a>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: order.customer_email,
    subject: `Order Confirmed - Paratha Girl #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  })
}

/**
 * Low-level email sending function using Resend API
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send for:', to)
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Paratha Girl <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', data)
      return { success: false, error: data }
    }

    console.log('Email sent successfully:', data.id)
    return { success: true, id: data.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
