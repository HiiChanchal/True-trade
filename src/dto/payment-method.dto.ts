import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OptionalImageDto } from "./file.dto";
import { IsIn, IsMobilePhone, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { PaymentMethodTypeEnum } from "src/enum/payment-method.enum";

export class PaymentMethodDto extends OptionalImageDto {
    @ApiProperty()
    @IsString({ message: "Title must be a string" })
    @IsNotEmpty({ message: 'Title is required' })
    title: string;
    @ApiProperty({ enum: PaymentMethodTypeEnum })
    @IsIn(Object.values(PaymentMethodTypeEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
    @ApiPropertyOptional()
    @IsString({ message: "UPI Id must be a string" })
    @ValidateIf(o => o.upiId)
    upiId?: string;
    @ApiPropertyOptional()
    @IsString({ message: "Account Holder name must be a string" })
    @IsNotEmpty({ message: 'Account Holder is required' })
    @ValidateIf(o => o.type == PaymentMethodTypeEnum.BANK)
    accountHolderName?: string;
    @ApiPropertyOptional()
    @IsString({ message: "Bank name must be a string" })
    @IsNotEmpty({ message: 'Bank name is required' })
    @ValidateIf(o => o.type == PaymentMethodTypeEnum.BANK)
    bankName?: string;
    @ApiPropertyOptional()
    @IsString({ message: "Account number must be a string" })
    @IsNotEmpty({ message: 'Account number is required' })
    @ValidateIf(o => o.type == PaymentMethodTypeEnum.BANK)
    accountNumber: string;
    @ApiPropertyOptional()
    @IsString({ message: "ifsc Code must be a string" })
    @IsNotEmpty({ message: 'ifsc Code is required' })
    @ValidateIf(o => o.type == PaymentMethodTypeEnum.BANK)
    ifscCode: string;
    @ApiPropertyOptional()
    @IsString({ message: "Country Code must be a string" })
    @IsNotEmpty({ message: 'Country Code is required' })
    @ValidateIf(o => o.type == PaymentMethodTypeEnum.UPI)
    countryCode: String;
    @ApiPropertyOptional()
    @IsMobilePhone()
    @IsString({ message: "PhoneNumber must be a string" })
    @IsNotEmpty({ message: 'PhoneNumber is required' })
    @ValidateIf(o => o.type == PaymentMethodTypeEnum.UPI)
    phoneNumber: String;
}