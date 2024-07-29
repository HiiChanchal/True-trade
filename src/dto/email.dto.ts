import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
    @ApiProperty()
    @IsEmail({}, { message: 'Email is not valid.' })
    @IsNotEmpty({ message: 'Email is required.' })
    email: string;
}