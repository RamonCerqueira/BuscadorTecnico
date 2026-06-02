import { Body, Controller, Get, Patch, Query, UseGuards, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { KycService } from './kyc.service';
import { UploadSelfieDto } from './dto/upload-selfie.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly kycService: KycService
  ) {}

  @Get('professionals')
  listProfessionals(
    @Query('category') category?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.usersService.findAllProfessionals(category, cursor, parsedLimit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.sub);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  getMeStats(@CurrentUser() user: AuthUser) {
    return this.usersService.getTechnicianStats(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: AuthUser, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, body);
  }

  @Get('search')
  searchNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string
  ) {
    return this.usersService.findNearbyTechnicians(
      Number(lat),
      Number(lng),
      radius ? Number(radius) : undefined
    );
  }

  @Post('upload-selfie')
  @UseGuards(JwtAuthGuard)
  async uploadSelfie(@CurrentUser() user: AuthUser, @Body() body: UploadSelfieDto) {
    return this.kycService.verifySelfieLiveness(user.sub, body.selfieUrl);
  }

  @Get('compliance-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getComplianceLogs() {
    return this.usersService.getComplianceLogs();
  }

  @Post('kyc/trigger')
  @UseGuards(JwtAuthGuard)
  async triggerKyc(@CurrentUser() user: AuthUser) {
    // Trigger real visual background check asynchronously to keep response fast
    this.kycService.triggerBackgroundCheck(user.sub);
    return {
      success: true,
      message: 'Checagem real de KYC e antecedentes criminais reiniciada com sucesso.'
    };
  }
}
