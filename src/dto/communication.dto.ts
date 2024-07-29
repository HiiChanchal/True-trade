import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator";
import { CommunicationCategoryEnum, CommunicationTypeEnum, PlatformEnum } from "src/enum/common.enum";

export class NotificationDto {
    @ApiProperty()
    @IsString({ message: "Title must be a string" })
    @IsNotEmpty({ message: 'Title is required' })
    title: string;
    @ApiProperty()
    @IsString({ message: "Body must be a string" })
    @IsNotEmpty({ message: 'Body is required' })
    body: string;
}
export class EmailDto {
    @ApiProperty()
    @IsString({ message: "Subject must be a string" })
    @IsNotEmpty({ message: 'Subject is required' })
    subject: string;
    @ApiProperty()
    @IsString({ message: "Body must be a string" })
    @IsNotEmpty({ message: 'Body is required' })
    body: string;
}
export class SendNotificationDto extends NotificationDto {
    @ApiProperty({ type: [String] })
    @IsEmail({}, { each: true, message: "Each value in users must be a valid email." })
    @IsArray()
    @ArrayMinSize(0)
    users: string[];
    @ApiProperty({ type: [String], enum: PlatformEnum })
    @IsEnum(PlatformEnum, { each: true })
    @IsArray()
    @ArrayMinSize(1)
    platform: string[];
    @ApiProperty({ enum: CommunicationCategoryEnum })
    @IsIn(Object.values(CommunicationCategoryEnum))
    @IsNotEmpty({ message: 'Category is required.' })
    category: string;
}
export class SendEmailDto extends EmailDto {
    @ApiProperty({ type: [String] })
    @IsEmail({}, { each: true, message: "Each value should be valid email." })
    @IsArray()
    @ArrayMinSize(0)
    users: string[]
}
export class SearchCommunicationDto {
    @ApiProperty({ enum: CommunicationTypeEnum })
    @IsIn(Object.values(CommunicationTypeEnum))
    @IsNotEmpty({ message: 'Communication Type is required.' })
    type: string;
}