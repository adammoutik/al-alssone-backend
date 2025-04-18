import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: mongoose.Model<User>) {}
  async create(createUserDto: CreateUserDto) {
    //check if createUserDto is valid
    if(!createUserDto){
      throw new ConflictException('Missing required fields');
    }
    // The work factor defines the number of iterations the underlying hash function performs when hashing a password
    const workFactory =  6;
    const password = createUserDto.password;
    
    try {
      if(await this.userModel.findOne({email:createUserDto.email})){
        throw new ConflictException('Email already exists');
      }
      
      const salt = await bcrypt.genSalt(workFactory);
      const hash = await bcrypt.hash(password, salt);
      createUserDto.password = hash
      const newUser = this.userModel.create(createUserDto);
      return newUser;
    } catch (error) {
      
      throw error;
      
    }

    
    
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({
      email: email,
    });
    return user;
  }
  

  async comparePassword(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
