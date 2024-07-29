import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from "@nestjs/swagger";
import { HasAccess } from "src/decorator/access.decorator";
import { HasRoles } from "src/decorator/role.decorator";
import { CurrentUser } from "src/decorator/user.decorator";
import { OptionalDateRangeDto } from "src/dto/date.dto";
import { ImageDto } from "src/dto/file.dto";
import { SearchDto } from "src/dto/search.dto";
import { AdminSearchSignalDto } from "src/dto/signal.dto";
import { AccessEnum } from "src/enum/access.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { AdminService } from "src/services/admin.service";
import { AccessGuard } from "src/services/guard/access.guard";
import { JwtAuthGuard } from "src/services/guard/jwt-auth.guard";
import { RolesGuard } from "src/services/guard/role.guard";
import { FileFilterService } from "src/services/static/file-filter.service";

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('image')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/profile')))
    image(@Body() imageDto: ImageDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.adminService.image(file.filename, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('avatar')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/profile')))
    avatar(@Body() imageDto: ImageDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.adminService.avatar(file.filename, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('avatar/:id')
    @ApiParam({ name: 'id' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/profile')))
    updateAvatar(@Param('id') id: string, @Body() imageDto: ImageDto, @CurrentUser() user: IUser, @UploadedFile() file: Express.Multer.File) {
        return this.adminService.updateAvatar(id, file.filename, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.DASHBOARD)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('dashboard/user-statistics')
    userStatistics(@Query() query: OptionalDateRangeDto, @CurrentUser() user: IUser) {
        return this.adminService.userStatistics(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.DASHBOARD)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('dashboard/category-statistics')
    categoryStatistics(@Query() query: OptionalDateRangeDto, @CurrentUser() user: IUser) {
        return this.adminService.categoryStatistics(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRADES)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('signals')
    allSignals(@Query() query: AdminSearchSignalDto, @CurrentUser() user: IUser) {
        return this.adminService.allSignals(query, user);
    }
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('avatar')
    getAvatar(@CurrentUser() user: IUser) {
        return this.adminService.getAvatar(user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('user/search')
    searchUser(@Query() query: SearchDto, @CurrentUser() user: IUser) {
        return this.adminService.searchUser(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.DASHBOARD)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('download/statistics')
    downloadStatics(@Query() query: OptionalDateRangeDto, @CurrentUser() user: IUser) {
        return this.adminService.downloadStatics(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Delete('avatar/:id')
    @ApiParam({ name: 'id' })
    deleteAvatar(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.adminService.deleteAvatar(id, user);
    }
}