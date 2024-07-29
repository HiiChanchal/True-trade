import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { PasswordDto } from "./password.dto";
import { EmailDto } from "./email.dto";
import { ProfileStatusEnum } from "src/enum/role.enum";
import { SearchDto } from "./search.dto";
import { PaginationDto } from "./pagination.dto";


export class AdminDto extends IntersectionType(EmailDto, PasswordDto) {
    @ApiProperty()
    @IsString({ message: "First Name must be a string" })
    @IsNotEmpty({ message: 'first name is required' })
    firstName: string;
    @ApiPropertyOptional()
    @IsString({ message: "last name must be a string" })
    @IsNotEmpty({ message: 'last name is required' })
    @ValidateIf(o => o.lastName)
    lastName: string;
}

export class SearchProviderDto extends IntersectionType(SearchDto, PaginationDto) {
    @ApiPropertyOptional({ enum: ProfileStatusEnum })
    @IsIn(Object.values(ProfileStatusEnum))
    @ValidateIf(o => o.status)
    status?: string;
}


export class SearchTraderDto extends IntersectionType(SearchDto, PaginationDto) {
}