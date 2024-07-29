import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasAccess } from 'src/decorator/access.decorator';
import { HasRoles } from 'src/decorator/role.decorator';
import { CurrentUser } from 'src/decorator/user.decorator';
import { DepositDownloadDto, DepositRequestDto, UpdateDepositRequestDto, UpdateWithdrawRequestDto, WithdrawDownloadDto, WithdrawRequestDto } from 'src/dto/transaction.dto';
import { AccessEnum } from 'src/enum/access.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IUser } from 'src/interface/user.interface';
import { AccessGuard } from 'src/services/guard/access.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { FileFilterService } from 'src/services/static/file-filter.service';
import { TransactionService } from 'src/services/transaction.service';
@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRANSACTION)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @UseInterceptors(FileInterceptor('image', FileFilterService.imageFilter('images/transaction')))
    @Post('withdraw/:id')
    updateWithdrawRequest(@Param('id') id: string, @Body() updateWithdrawRequestDto: UpdateWithdrawRequestDto, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: IUser) {
        return this.transactionService.updateWithdrawRequest(id, updateWithdrawRequestDto, file?.filename, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRANSACTION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('deposit/:id')
    updateDepositRequest(@Param('id') id: string, @Body() updateDepositRequestDto: UpdateDepositRequestDto, @CurrentUser() user: IUser) {
        return this.transactionService.updateDepositRequest(id, updateDepositRequestDto, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRANSACTION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('deposit')
    getDepositRequest(@Query() query: DepositRequestDto, @CurrentUser() user: IUser) {
        return this.transactionService.getDepositRequest(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRANSACTION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('withdraw')
    getWithdrawRequest(@Query() query: WithdrawRequestDto, @CurrentUser() user: IUser) {
        return this.transactionService.getWithdrawRequest(query, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRANSACTION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('deposit-download')
    downloadDeposit(@Query() query: DepositDownloadDto, @CurrentUser() user: IUser) {
        return this.transactionService.downloadDeposit(query);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.TRANSACTION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('withdraw-download')
    downloadWithdraw(@Query() query: WithdrawDownloadDto, @CurrentUser() user: IUser) {
        return this.transactionService.downloadWithdraw(query);
    }
}