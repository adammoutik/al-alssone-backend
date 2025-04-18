import { IsEmail, IsString, IsStrongPassword } from "class-validator";



export class CreateAuthDto {

    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string; // hashed password of the user

    @IsString()
    username: string;
}
