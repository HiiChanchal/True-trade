import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, ValidateIf } from "class-validator";
import { EmailDto } from "./email.dto";
import { NoWhiteSpace } from "src/decorator/validator/no-white-space.decorator";
import { Transform } from "class-transformer";

export class UsernameDto {
    @ApiProperty()
    @NoWhiteSpace({ message: 'Space is not allowed in username.' })
    @IsNotEmpty({ message: 'Username is required.' })
    username: string;
}
export class AuthDto extends UsernameDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
}
export class AuthEmailDto extends EmailDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
    @ApiProperty()
    @Transform((data: any) => {
        return data.value === 'true' || data.value === true || data.value === 1 || data.value === '1' || data.value === 'yes'
    })
    @IsBoolean()
    isNew: boolean;
}
export class SocialAuthDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Token is required.' })
    token: string;
    @ApiPropertyOptional()
    @IsEmail({}, { message: 'Email is not valid.' })
    @ValidateIf(o => o.email)
    email?: string;
    @ApiPropertyOptional()
    name?: string;
}