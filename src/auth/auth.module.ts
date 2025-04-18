import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { TokenSchema } from './schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [UsersModule,HttpModule,MongooseModule.forFeature([{name:"Token",schema:TokenSchema}])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
