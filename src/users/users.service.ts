import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneByEmailOrUsername(identifier: string) {
    const user = await this.userModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });
    return user;
  }
  

  async comparePassword(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find().select('-password').exec();
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // If password is being updated, hash it
      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt(6);
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
      }

      // If email is being updated, check for uniqueness
      if (updateUserDto.email) {
        const existingUser = await this.userModel.findOne({ 
          email: updateUserDto.email,
          _id: { $ne: id }
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).select('-password').exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
