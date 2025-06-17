import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios';
import { UsersService } from 'src/users/users.service';
import * as Mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './schemas/token.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Token.name) private tokenModel: Model<Token>
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(createAuthDto: CreateAuthDto) {
    const { identifier, password } = createAuthDto;
    try {
      const user = await this.usersService.findOneByEmailOrUsername(identifier);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.usersService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Delete any existing tokens for this user
      await this.tokenModel.deleteMany({ userId: user._id });

      const { _id, firstName, lastName, role, email, username } = user;
      const userData = { _id, firstName, lastName, email, username, role };
      const payload = { sub: user._id, user: userData };

      try {
        const expiresIn = '1d';
        const signedToken = await this.jwtService.signAsync(payload, {
          expiresIn,
        });

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now

        // Store token in database
        await this.tokenModel.create({
          token: signedToken,
          userId: user._id,
          expiresAt,
        });

        return {
          accessToken: signedToken,
          user: userData,
          expiresIn,
        };
      } catch (error) {
        console.error('JWT Signing Error:', error);
        throw new Error('Failed to generate authentication token');
      }
    } catch (error) {
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const tokenDoc = await this.tokenModel.findOne({ token });
      if (!tokenDoc) {
        return false;
      }

      // Check if token is expired
      if (tokenDoc.expiresAt < new Date()) {
        await this.tokenModel.deleteOne({ _id: tokenDoc._id });
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async logout(token: string): Promise<void> {
    await this.tokenModel.deleteOne({ token });
  }
}
