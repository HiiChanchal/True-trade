import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty } from "class-validator";
import { SiteContentEnum } from "src/enum/common.enum";

export class SiteContentDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Title is required.' })
    title: string;
    @ApiProperty()
    @IsNotEmpty({ message: 'Content is required.' })
    content: string;
    @ApiProperty({ enum: SiteContentEnum })
    @IsIn(Object.values(SiteContentEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
}