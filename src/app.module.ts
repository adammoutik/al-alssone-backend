import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesModule } from './families/families.module';
import { FeesModule } from './fees/fees.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(),
    ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }),
  MongooseModule.forRoot(process.env.DB_URL as string),
  HttpModule.register({
    timeout: 5000,
    maxRedirects: 5,
  }),
  FamiliesModule,
  FeesModule,
  PaymentsModule,
  UsersModule,
  StudentsModule,
  AuthModule,],
  controllers: [AppController],
  providers: [AppService
    // ,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    //       }
  ],
})
export class AppModule {}
