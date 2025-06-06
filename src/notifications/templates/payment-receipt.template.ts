interface PaymentReceiptData {
  familyName: string;
  amount: number;
  paymentDate: string;
  paymentId: string;
  period: string;
  studentName: string;
  transactionId?: string;
  items: {
    description: string;
    amount: number;
  }[];
}

export const getPaymentReceiptTemplate = (data: PaymentReceiptData): string => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align: right">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

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
          background-color: #28a745;
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
          color: #28a745;
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
        .receipt-link {
          display: inline-block;
          background-color: #28a745;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
        }
        .total-row {
          font-weight: bold;
          background-color: #f8f9fa;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Payment Receipt</h1>
      </div>
      <div class="content">
        <p>Dear ${data.familyName},</p>
        
        <p>Thank you for your payment. Please find your receipt below.</p>
        
        <div class="amount">
          Total Amount: $${data.amount.toFixed(2)}
        </div>
        
        <div class="details">
          <p><strong>Payment Information:</strong></p>
          <p>Receipt Number: ${data.paymentId}</p>
          <p>Date: ${data.paymentDate}</p>
          <p>Student: ${data.studentName}</p>
          <p>Period: ${data.period}</p>
          ${data.transactionId ? `<p>Transaction ID: ${data.transactionId}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td>Total</td>
              <td style="text-align: right">$${data.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <p>This receipt serves as proof of payment. Please keep it for your records.</p>
        
        <a href="#" class="receipt-link">Download Receipt</a>
        
        <p>If you have any questions about this payment, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>School Administration</p>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}; 