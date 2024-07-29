import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { PaginationDto } from "./pagination.dto";
import { TransactionStatusEnum } from "src/enum/transaction.enum";
import { IsIn, IsNotEmpty, ValidateIf } from "class-validator";
import { OptionalImageDto } from "./file.dto";
import { DateRangeDto, OptionalDateRangeDto } from "./date.dto";
import { SearchDto } from "./search.dto";

export class TransactionStatusDto {
    @ApiProperty({ enum: [TransactionStatusEnum.INITIATED, TransactionStatusEnum.ACCEPTED, TransactionStatusEnum.REJECTED] })
    @IsIn([TransactionStatusEnum.INITIATED, TransactionStatusEnum.ACCEPTED, TransactionStatusEnum.REJECTED])
    status: string;
}
export class DepositRequestDto extends IntersectionType(TransactionStatusDto,OptionalDateRangeDto,PaginationDto,SearchDto) {
}

export class WithdrawRequestDto extends IntersectionType(TransactionStatusDto, PaginationDto,OptionalDateRangeDto,SearchDto) {
}

export class WithdrawDownloadDto extends IntersectionType(TransactionStatusDto,OptionalDateRangeDto,SearchDto){}
export class DepositDownloadDto extends IntersectionType(TransactionStatusDto,OptionalDateRangeDto,SearchDto){}
export class UpdateDepositRequestDto {
    @ApiProperty({ enum: [TransactionStatusEnum.ACCEPTED, TransactionStatusEnum.REJECTED] })
    @IsIn([TransactionStatusEnum.ACCEPTED, TransactionStatusEnum.REJECTED])
    status: string;
    @ApiProperty({ type: Number, required: true })
    amount: number;
    @ApiPropertyOptional()
    remark?: string;
}
export class UpdateWithdrawRequestDto extends OptionalImageDto {
    @ApiProperty({ enum: [TransactionStatusEnum.ACCEPTED, TransactionStatusEnum.REJECTED] })
    @IsIn([TransactionStatusEnum.ACCEPTED, TransactionStatusEnum.REJECTED])
    status: string;
    @ApiPropertyOptional()
    @IsNotEmpty({ message: "Transaction id is required." })
    @ValidateIf(o => o.status == TransactionStatusEnum.ACCEPTED)
    transactionId?: string;
    @ApiPropertyOptional()
    remark?: string;
}