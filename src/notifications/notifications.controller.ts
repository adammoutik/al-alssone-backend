import { Controller, Post, Body, Logger, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { getPaymentReminderTemplate } from './templates/payment-reminder.template';
import { getPaymentOverdueTemplate } from './templates/payment-overdue.template';
import { getPaymentReceiptTemplate } from './templates/payment-receipt.template';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications with optional filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'SENT', 'FAILED'], description: 'Filter by notification status' })
  @ApiQuery({ name: 'familyId', required: false, description: 'Filter by family ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a list of notifications matching the filters',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          paymentId: { type: 'string' },
          familyId: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'SENT', 'FAILED'] },
          scheduledFor: { type: 'string', format: 'date-time' },
          sentAt: { type: 'string', format: 'date-time' },
          subject: { type: 'string' },
          message: { type: 'string' },
          errorMessage: { type: 'string' }
        }
      }
    }
  })
  async getNotifications(
    @Query('status') status?: string,
    @Query('familyId') familyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificationsService.findAll({
      status,
      familyId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns notification statistics including total, sent, failed, and pending counts',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        sent: { type: 'number' },
        failed: { type: 'number' },
        pending: { type: 'number' },
        lastWeekStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', format: 'date' },
              count: { type: 'number' },
              sent: { type: 'number' },
              failed: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async getNotificationStats() {
    return this.notificationsService.getStats();
  }

  @Post('test')
  @ApiOperation({ summary: 'Create a test notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The notification has been successfully created',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        paymentId: { type: 'string' },
        familyId: { type: 'string' },
        status: { type: 'string', enum: ['PENDING', 'SENT', 'FAILED'] },
        scheduledFor: { type: 'string', format: 'date-time' },
        subject: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  async testNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { 
          type: 'string',
          format: 'email',
          description: 'Recipient email address'
        }
      },
      required: ['to']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Test email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Failed to send test email',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        details: { type: 'string' },
        code: { type: 'string' }
      }
    }
  })
  async testEmail(@Body() body: { to: string }) {
    try {
      this.logger.log(`Attempting to send test email to ${body.to}`);
      this.logger.log('Mail configuration:', {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_SECURE,
        user: process.env.MAIL_USER,
      });

      await this.mailerService.sendMail({
        to: body.to,
        subject: 'Test Email',
        text: 'This is a test email from your application.',
      });
      
      this.logger.log('Test email sent successfully');
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send test email:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.stack,
        code: error.code
      };
    }
  }

  @Post('test-payment-reminder')
  @ApiOperation({ summary: 'Send a test payment reminder email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test payment reminder sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            familyName: { type: 'string' },
            daysUntilDue: { type: 'number' },
            amount: { type: 'number' },
            dueDate: { type: 'string', format: 'date' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Failed to send test payment reminder',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        details: { type: 'string' },
        code: { type: 'string' }
      }
    }
  })
  async testPaymentReminder() {
    try {
      const testData = {
        familyName: 'Test Family',
        daysUntilDue: Math.floor(Math.random() * 7) + 1,
        amount: Math.floor(Math.random() * 1000) + 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      };

      const htmlContent = getPaymentReminderTemplate(testData);

      await this.mailerService.sendMail({
        to: 'farawla.mtk@gmail.com',
        subject: `Payment Reminder: ${testData.daysUntilDue} day${testData.daysUntilDue > 1 ? 's' : ''} until due`,
        html: htmlContent,
      });

      return { 
        success: true, 
        message: 'Test payment reminder sent successfully',
        data: testData
      };
    } catch (error) {
      this.logger.error('Failed to send test payment reminder:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.stack,
        code: error.code
      };
    }
  }

  @Post('test-overdue')
  @ApiOperation({ summary: 'Send a test payment overdue email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test payment overdue email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            familyName: { type: 'string' },
            amount: { type: 'number' },
            dueDate: { type: 'string' },
            daysOverdue: { type: 'number' },
            studentName: { type: 'string' },
            period: { type: 'string' }
          }
        }
      }
    }
  })
  async testOverdue() {
    try {
      const testData = {
        familyName: 'Test Family',
        amount: Math.floor(Math.random() * 1000) + 100,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 5 days ago
        daysOverdue: 5,
        studentName: 'John Doe',
        period: '2024-03',
      };

      const htmlContent = getPaymentOverdueTemplate(testData);

      await this.mailerService.sendMail({
        to: 'farawla.mtk@gmail.com',
        subject: `Payment Overdue: ${testData.daysOverdue} days overdue`,
        html: htmlContent,
      });

      return { 
        success: true, 
        message: 'Test payment overdue email sent successfully',
        data: testData
      };
    } catch (error) {
      this.logger.error('Failed to send test payment overdue email:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.stack,
        code: error.code
      };
    }
  }

  @Post('test-receipt')
  @ApiOperation({ summary: 'Send a test payment receipt email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test payment receipt email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            familyName: { type: 'string' },
            amount: { type: 'number' },
            paymentDate: { type: 'string' },
            paymentId: { type: 'string' },
            period: { type: 'string' },
            studentName: { type: 'string' },
            paymentMethod: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  amount: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  async testReceipt() {
    try {
      const testData = {
        familyName: 'Test Family',
        amount: Math.floor(Math.random() * 1000) + 100,
        paymentDate: new Date().toLocaleDateString(),
        paymentId: 'TEST-' + Math.random().toString(36).substr(2, 9),
        period: '2024-03',
        studentName: 'John Doe',
        paymentMethod: 'Bank Transfer',
        items: [
          {
            description: 'Tuition Fee - 2024-03',
            amount: Math.floor(Math.random() * 1000) + 100,
          },
          {
            description: 'Activity Fee - 2024-03',
            amount: 50,
          }
        ],
      };

      const htmlContent = getPaymentReceiptTemplate(testData);

      await this.mailerService.sendMail({
        to: 'farawla.mtk@gmail.com',
        subject: 'Payment Receipt',
        html: htmlContent,
      });

      return { 
        success: true, 
        message: 'Test payment receipt email sent successfully',
        data: testData
      };
    } catch (error) {
      this.logger.error('Failed to send test payment receipt email:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.stack,
        code: error.code
      };
    }
  }
} 