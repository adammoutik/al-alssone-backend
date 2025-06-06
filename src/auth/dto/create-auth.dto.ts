import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsStrongPassword } from "class-validator";

export class CreateAuthDto {
    @ApiProperty({ example: 'user@example.com or username' })
    @IsString()
    identifier: string;

    @ApiProperty({ example: 'hashedpassword' })
    @IsStrongPassword()
    password: string;
}
