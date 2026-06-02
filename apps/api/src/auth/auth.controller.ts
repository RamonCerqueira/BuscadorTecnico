import { Body, Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] as string;
    return this.authService.register(body, ip, userAgent);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // Máx 5 tentativas por minuto por IP
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @SkipThrottle() // Refresh de token não precisa de rate limit agressivo
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const data = await this.authService.googleLogin(req);
    // Redireciona de volta para o frontend com o token (ou via cookie)
    return res.redirect(`http://localhost:3000/login?token=${data.accessToken}`);
  }
}
