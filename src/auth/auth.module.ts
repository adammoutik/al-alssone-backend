import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { TokenSchema } from './schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({
    global: true,
    secret: process.env.JWT,
    signOptions: { expiresIn: '1d' },
  }),UsersModule,HttpModule,MongooseModule.forFeature([{name:"Token",schema:TokenSchema}])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
