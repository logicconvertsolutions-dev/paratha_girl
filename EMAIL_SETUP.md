# Email Notifications Setup

## Overview
Order notifications are now integrated into the app. Emails are sent to:
1. **Customer** when order is placed (COD or card payment)
2. **Admin** when order is placed
3. **Customer** when order status changes to "confirmed"

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys** in the dashboard
4. Create a new API key (copy the value)

### 2. Add Environment Variables

Add to your `.env.local` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=your-email@example.com
```

Replace:
- `re_xxxxxxxxxxxxxxxxxxxxx` with your actual Resend API key
- `your-email@example.com` with the email address where you want to receive admin notifications

### 3. Verify Email Domain (Optional but Recommended for Production)

For production, verify your email domain in Resend:
1. In Resend dashboard, go to **Domains**
2. Add your domain
3. Add the DNS records to your domain provider
4. Update the `from` email in [src/lib/email.ts](src/lib/email.ts) to use your verified domain

Currently, emails send from: `orders@parathagirl.com` (requires domain verification)

### 4. Testing

With `RESEND_API_KEY` set:
- Create a COD order → Customer and admin will receive emails
- Create a card payment order → Emails sent when payment succeeds
- Admin changes order status to "confirmed" → Customer receives confirmation email

### 5. Email Templates

Templates are customizable in [src/lib/email.ts](src/lib/email.ts):
- `sendCustomerOrderEmail()` - Initial order confirmation for customer
- `sendAdminOrderEmail()` - New order notification for admin
- `sendOrderConfirmedEmail()` - Order confirmed notification for customer

Edit HTML in these functions to customize branding, layout, and content.

## Fallback Behavior

If `RESEND_API_KEY` is not set:
- Emails are **not sent** (logged as warning)
- App continues to work normally
- No errors are thrown

This allows development/testing without an email service configured.

## Troubleshooting

### Emails not sending
1. Verify `RESEND_API_KEY` is set in `.env.local`
2. Check server logs for email send errors
3. Verify customer email addresses are valid
4. Check Resend dashboard for delivery failures

### Custom Email Domain
1. In Resend dashboard, verify your domain
2. Update `from` address in [src/lib/email.ts](src/lib/email.ts) line 48
3. Test with a new order

## Production Considerations

1. **Use verified domain** - Email deliverability improves with domain verification
2. **Monitor Resend dashboard** - Track delivery rates and bounce rates
3. **Update tracking link** - In [src/lib/email.ts](src/lib/email.ts), change `http://localhost:3002` to your production domain
4. **Add unsubscribe link** (optional) - For compliance with email regulations
5. **Test email addresses** - Use Resend test email feature before production
