import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { PaginationDto } from "./pagination.dto";
import { ArrayMinSize, IsArray, IsIn, IsMongoId, IsNotEmpty, IsString, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Types } from "mongoose";
import { SearchDto } from "./search.dto";
import { SignalStatusDto } from "./signal.dto";
import { SubscriptionPlanDurationEnum, SubscriptionStatusEnum } from "src/enum/subscription.enum";

export class SearchProviderForTraderDto extends IntersectionType(SearchDto, PaginationDto) {
    @ApiPropertyOptional()
    @IsMongoId({ message: 'Not a valid category.' })
    @IsNotEmpty({ message: 'Category is required.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.category)
    category?: string;
}

export class TraderSubscriptionPlanDto {
    @ApiProperty()
    @IsMongoId({ message: 'Not a valid plan.' })
    @IsNotEmpty({ message: 'Plan is required.' })
    @Type(() => Types.ObjectId)
    plan: string;
    @ApiProperty({ type: String, enum: SubscriptionPlanDurationEnum })
    @IsIn(Object.values(SubscriptionPlanDurationEnum))
    @IsNotEmpty({ message: 'Duration must be required' })
    duration: string
}
export class TraderSubscriptionDto {
    @ApiProperty()
    @IsMongoId({ message: 'Not a valid provider.' })
    @IsNotEmpty({ message: 'Provider is required.' })
    @Type(() => Types.ObjectId)
    provider: string;
    @ApiProperty({ type: [TraderSubscriptionPlanDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => TraderSubscriptionPlanDto)
    plans: TraderSubscriptionPlanDto[]
}
export class SearchTraderSignalDto extends IntersectionType(SearchDto, SignalStatusDto, PaginationDto) {
    @ApiPropertyOptional()
    @IsMongoId({ message: 'Not a valid category.' })
    @IsNotEmpty({ message: 'Category is required.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.category)
    category?: string;
}

export class UnsubscribeDto {
    @ApiProperty({ type: [String] })
    @IsMongoId({ each: true, message: "Each value should be valid subscription." })
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Types.ObjectId)
    subscription: Types.ObjectId[]
}
export class SearchTraderSubscriptionDto extends SearchDto {
    @ApiProperty({ type: String, enum: Object.values([SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE]), required: true })
    @IsIn([SubscriptionStatusEnum.ACTIVE, SubscriptionStatusEnum.INACTIVE])
    @IsString({ message: 'Status must be a string' })
    status: string;
}