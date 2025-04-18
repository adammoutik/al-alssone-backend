import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios';
import { UsersService } from 'src/users/users.service';
import * as Mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './schemas/token.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(private readonly httpService: HttpService,private usersService : UsersService, private jwtService: JwtService, @InjectModel(Token.name) private tokenModel : Mongoose.Model<Token>) {}
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
    const { email, password } = createAuthDto;
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid password Or email');
      }
      const isPasswordValid = await this.usersService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password Or email');
      }
      // Generate token and save it to the database


      let token = await this.tokenModel.findOne({userId:user._id});
      if(token){
        await this.tokenModel.findByIdAndDelete(token._id);
      }
      const { _id, firstName, lastName, role } = user;
      const userData = { _id, firstName, lastName, email, role }
      const payload = {sub:user._id,user:userData}
      const signedToken = await this.jwtService.signAsync(payload);

   
      await this.tokenModel.create({ token: signedToken, userId: user._id });
      return {
        accesstoken: signedToken,
    }
    } catch (error) {
      throw error;
    }
  }
  
}
