interface PaymentOverdueData {
  familyName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  studentName: string;
  period: string;
}

export const getPaymentOverdueTemplate = (data: PaymentOverdueData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #dc3545;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .amount {
          font-size: 24px;
          color: #dc3545;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .details {
          background-color: white;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .payment-link {
          display: inline-block;
          background-color: #dc3545;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .warning {
          color: #dc3545;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Payment Overdue Notice</h1>
      </div>
      <div class="content">
        <p>Dear ${data.familyName},</p>
        
        <p class="warning">This is to inform you that your payment is overdue by ${data.daysOverdue} day${data.daysOverdue > 1 ? 's' : ''}.</p>
        
        <div class="amount">
          Amount Due: $${data.amount.toFixed(2)}
        </div>
        
        <div class="details">
          <p><strong>Payment Details:</strong></p>
          <p>Student: ${data.studentName}</p>
          <p>Period: ${data.period}</p>
          <p>Due Date: ${data.dueDate}</p>
          <p>Days Overdue: ${data.daysOverdue}</p>
        </div>
        
        <p>Please arrange for the payment as soon as possible to avoid any late fees or service interruptions.</p>
        
        <a href="#" class="payment-link">Make Payment Now</a>
        
        <p>If you have already made this payment, please disregard this notice. If you have any questions or need assistance, please contact us immediately.</p>
        
        <p>Best regards,<br>School Administration</p>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}; 