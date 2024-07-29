import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { EmailDto } from "./email.dto";
import { NoWhiteSpace } from "src/decorator/validator/no-white-space.decorator";
import { Type } from "class-transformer";

export class StripeCustomerDto extends EmailDto {
    @ApiProperty()
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;
}
export class StripeCustomerCardDto {
    @ApiProperty()
    @NoWhiteSpace({ message: 'Space is not allowed in Card number.' })
    @IsString({ message: "Card number must be a string" })
    @IsNotEmpty({ message: 'Card number is required' })
    number: string;
    @ApiProperty()
    @IsInt({ message: "Card expiry month must be a integer" })
    @IsNotEmpty({ message: 'Card expiry month is required' })
    @Type(() => Number)
    exp_month: number;
    @ApiProperty()
    @IsInt({ message: "Card expiry year must be a integer" })
    @IsNotEmpty({ message: 'Card expiry year is required' })
    @Type(() => Number)
    exp_year: number;
    @ApiProperty()
    @NoWhiteSpace({ message: 'Space is not allowed in Card cvc.' })
    @IsString({ message: "Card cvc must be a string" })
    @IsNotEmpty({ message: 'Card cvc is required' })
    cvc: string;
}