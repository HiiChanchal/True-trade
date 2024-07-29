import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";
import { NoWhiteSpace } from "src/decorator/validator/no-white-space.decorator";

export class PasswordDto {
    @ApiProperty()
    @MinLength(8, { message: 'Password should be minimum 8 character.' })
    @NoWhiteSpace({ message: 'Password should not contain whitespace.' })
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
}