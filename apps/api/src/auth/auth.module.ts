import { Module, forwardRef, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { GoogleStrategy } from './google.strategy';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    forwardRef(() => UsersModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, GoogleStrategy],
  exports: [JwtAuthGuard, RolesGuard, JwtModule]
})
export class AuthModule {}
