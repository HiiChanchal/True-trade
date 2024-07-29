import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsMongoId, IsNotEmpty, IsNumber, IsPositive, MinLength, ValidateIf } from "class-validator";
import { Types } from "mongoose";
import { ProfileStatusEnum } from "src/enum/role.enum";
import { UsernameDto } from "./auth.dto";
import { OptionalImageDto } from "./file.dto";
import { PaginationDto } from "./pagination.dto";
import { NotificationTypeEnum } from "src/enum/notification.enum";

export class NameDto {
    @ApiProperty()
    @MinLength(2)
    @IsNotEmpty({ message: 'Full name is required.' })
    firstName: string;
    @ApiPropertyOptional()
    lastName?: string;
}

export class TermsDto {
    @ApiProperty()
    @Transform((data: any) => {
        return data.value === 'true' || data.value === true || data.value === 1 || data.value === '1' || data.value === 'yes'
    })
    @IsBoolean()
    accept: boolean;
}

export class ProfileStatusDto {
    @ApiProperty({ enum: [ProfileStatusEnum.PENDING, ProfileStatusEnum.APPROVED, ProfileStatusEnum.REJECTED] })
    @IsIn([ProfileStatusEnum.PENDING, ProfileStatusEnum.APPROVED, ProfileStatusEnum.REJECTED])
    @IsNotEmpty({ message: 'Status is required.' })
    status: string;
    @ApiPropertyOptional()
    reason?: string;
}

export class UserInterestDto {
    @ApiProperty({ type: [String] })
    @IsMongoId({ each: true, message: "Each value should be valid category." })
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Types.ObjectId)
    interest: Types.ObjectId[]
}

export class UserUpdateDto extends IntersectionType(NameDto, UsernameDto, OptionalImageDto) {

}
export class WalletDto {
    @ApiProperty()
    @IsPositive({ message: 'Amount should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount should be number.' })
    @IsNotEmpty({ message: 'Amount is required.' })
    @Type(() => Number)
    amount: number;
    @ApiProperty()
    @IsNotEmpty({ message: 'Payment method is required.' })
    paymentMethodId: string;
}

export class UserNotificationRequestDto extends PaginationDto {
    @ApiPropertyOptional({ enum: [NotificationTypeEnum.SIGNAL, NotificationTypeEnum.OTHERS] })
    @IsIn([NotificationTypeEnum.SIGNAL, NotificationTypeEnum.OTHERS])
    @ValidateIf(o => o.type)
    type?: string;
}

export class ActiveDto {
    @ApiProperty()
    @Transform((data: any) => {
        return data.value === 'true' || data.value === true || data.value === 1 || data.value === '1' || data.value === 'yes'
    })
    @IsBoolean()
    active: boolean;
}