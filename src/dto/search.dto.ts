import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, ValidateIf } from "class-validator";

export class SearchDto {
    @ApiPropertyOptional()
    @IsString({ message: 'Name should be string.' })
    @ValidateIf(o => o.search)
    search?: string;
}