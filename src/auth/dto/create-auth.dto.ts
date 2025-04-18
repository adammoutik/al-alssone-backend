import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";



export class CreateAuthDto {

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;
    //hashedpass
    @ApiProperty({ example: 'hashedpassword' })
    @IsStrongPassword()
    password: string; // hashed password of the user

    @ApiProperty({ example: 'user12' })
    @IsString()
    username: string;
}
