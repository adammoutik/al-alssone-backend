import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { FamiliesModule } from '../families/families.module';
import { ConfigService } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { PaymentsModule } from '../payments/payments.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST') as string,
          port: parseInt(configService.get<string>('MAIL_PORT') as string, 10),
          secure: configService.get<string>('MAIL_SECURE') === 'true',
          auth: {
            user: configService.get<string>('MAIL_USER') as string,
            pass: configService.get<string>('MAIL_PASS') as string,
          },
          debug: true,
          logger: true,
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM') as string,
        },
      }),
      inject: [ConfigService],
    }),
    FamiliesModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}