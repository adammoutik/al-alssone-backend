import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { Notification, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FamiliesService } from '../families/families.service';
import { PaymentsService } from '../payments/payments.service';
import { getPaymentReminderTemplate } from './templates/payment-reminder.template';
import { getPaymentOverdueTemplate } from './templates/payment-overdue.template';
import { getPaymentReceiptTemplate } from './templates/payment-receipt.template';
import { Payment } from '../payments/entities/payment.entity';

type PaymentWithId = Payment & { _id: Types.ObjectId };

interface FindAllOptions {
  status?: string;
  familyId?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly mailerService: MailerService,
    private readonly familiesService: FamiliesService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  async findAll(options: FindAllOptions = {}): Promise<Notification[]> {
    const query: any = {};

    if (options.status) {
      query.status = options.status;
    }

    if (options.familyId) {
      query.familyId = options.familyId;
    }

    if (options.startDate || options.endDate) {
      query.scheduledFor = {};
      if (options.startDate) {
        query.scheduledFor.$gte = options.startDate;
      }
      if (options.endDate) {
        query.scheduledFor.$lte = options.endDate;
      }
    }

    return this.notificationModel
      .find(query)
      .populate('familyId')
      .populate('paymentId')
      .sort({ scheduledFor: -1 })
      .exec();
  }

  async getStats() {
    const total = await this.notificationModel.countDocuments();
    const sent = await this.notificationModel.countDocuments({ status: NotificationStatus.SENT });
    const failed = await this.notificationModel.countDocuments({ status: NotificationStatus.FAILED });
    const pending = await this.notificationModel.countDocuments({ status: NotificationStatus.PENDING });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStats = await this.notificationModel.aggregate([
      {
        $match: {
          scheduledFor: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledFor" } },
          count: { $sum: 1 },
          sent: {
            $sum: { $cond: [{ $eq: ["$status", NotificationStatus.SENT] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", NotificationStatus.FAILED] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      lastWeekStats
    };
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async createPaymentReminders(
    paymentId: string,
    familyId: string,
    dueDate: Date,
  ): Promise<void> {
    const reminderDays = [7, 3, 1]; // Send reminders 7, 3, and 1 day before due date
    const payment = await this.paymentsService.findOne(paymentId);
    const family = await this.familiesService.findOne(familyId);

    for (const days of reminderDays) {
      const scheduledDate = new Date(dueDate);
      scheduledDate.setDate(scheduledDate.getDate() - days);

      const notification = await this.create({
        paymentId: paymentId as any,
        familyId: familyId as any,
        scheduledFor: scheduledDate,
        subject: `Payment Reminder: ${days} day${days > 1 ? 's' : ''} until due`,
        message: `This is a reminder that your payment is due in ${days} day${days > 1 ? 's' : ''}.`,
        daysBeforeDue: days,
      });

      this.logger.log(`Created reminder for payment ${paymentId} scheduled for ${scheduledDate}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const pendingNotifications = await this.notificationModel
      .find({
        status: NotificationStatus.PENDING,
        scheduledFor: { $lte: now },
      })
      .populate('familyId')
      .populate('paymentId');

    for (const notification of pendingNotifications) {
      try {
        const family = await this.familiesService.findOne(notification.familyId.toString());
        const payment = (await this.paymentsService.findOne(notification.paymentId.toString())) as PaymentWithId;
        
        if (!family || !family.email) {
          throw new Error('Family not found or no email address available');
        }

        const htmlContent = getPaymentReminderTemplate({
          familyName: family.familyName,
          daysUntilDue: notification.daysBeforeDue,
          amount: payment.amountPaid,
          dueDate: payment.period,
        });

        await this.mailerService.sendMail({
          to: family.email,
          subject: notification.subject,
          html: htmlContent,
        });

        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        await notification.save();

        this.logger.log(`Successfully sent notification ${notification._id} to ${family.email}`);
      } catch (error) {
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = error.message;
        await notification.save();

        this.logger.error(
          `Failed to send notification ${notification._id}: ${error.message}`,
        );
      }
    }
  }

  async sendPaymentOverdue(paymentId: string): Promise<void> {
    try {
      const payment = (await this.paymentsService.findOne(paymentId)) as PaymentWithId;
      const family = await this.familiesService.findOne(payment.familyId.toString());
      const student = await this.paymentsService.getStudentDetails(payment.studentId.toString());

      if (!family || !family.email) {
        throw new Error('Family not found or no email address available');
      }

      const dueDate = new Date(payment.period);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const htmlContent = getPaymentOverdueTemplate({
        familyName: family.familyName,
        amount: payment.amountPaid,
        dueDate: dueDate.toLocaleDateString(),
        daysOverdue,
        studentName: student.firstName + ' ' + student.lastName,
        period: payment.period,
      });

      await this.mailerService.sendMail({
        to: family.email,
        subject: `Payment Overdue: ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        html: htmlContent,
      });

      this.logger.log(`Payment overdue notice sent to ${family.email} for payment ${paymentId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment overdue notice for payment ${paymentId}:`, error);
      throw error;
    }
  }

  async sendPaymentReceipt(paymentId: string): Promise<void> {
    try {
      const payment = await this.paymentsService.findOne(paymentId) as Payment;
      const family = await this.familiesService.findOne(payment.familyId.toString());
      const student = await this.paymentsService.getStudentDetails(payment.studentId.toString());

      if (!family || !family.email) {
        throw new Error('Family not found or no email address available');
      }

      const htmlContent = getPaymentReceiptTemplate({
        familyName: family.familyName,
        amount: payment.amountPaid,
        paymentDate: new Date().toLocaleDateString(),
        paymentId: payment._id.toString(),
        period: payment.period,
        studentName: student.firstName + ' ' + student.lastName,
        items: [
          {
            description: `Tuition Fee - ${payment.period}`,
            amount: payment.amountPaid,
          },
        ],
      });

      await this.mailerService.sendMail({
        to: family.email,
        subject: 'Payment Receipt',
        html: htmlContent,
      });

      this.logger.log(`Payment receipt sent to ${family.email} for payment ${paymentId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment receipt for payment ${paymentId}:`, error);
      throw error;
    }
  }
} 