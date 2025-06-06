export const getPaymentReminderTemplate = (data: {
  familyName: string;
  daysUntilDue: number;
  amount: number;
  dueDate: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .amount { font-size: 24px; color: #4CAF50; font-weight: bold; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Reminder</h1>
    </div>
    <div class="content">
      <p>Dear ${data.familyName},</p>
      <p>This is a friendly reminder that your payment of <span class="amount">${data.amount}€</span> is due in ${data.daysUntilDue} day${data.daysUntilDue > 1 ? 's' : ''}.</p>
      <p>Due date: ${data.dueDate}</p>
      <p>Please ensure your payment is made on time to avoid any late fees.</p>
      <p>If you have already made this payment, please disregard this reminder.</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`; 