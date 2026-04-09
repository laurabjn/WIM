import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProfileInput } from 'src/application/profile/dto/update-my-profile.dto';
import { GetMyProfileUseCase } from 'src/application/profile/use-cases/get-my-profile.usecase';
import { GetPublicProfileUseCase } from 'src/application/profile/use-cases/get-public-profile.usecase';
import { UpdateMyProfileUseCase } from 'src/application/profile/use-cases/update-my-profile.usecase';
import { UploadMyAvatarUseCase } from 'src/application/profile/use-cases/upload-my-avatar.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('users')
export class ProfileController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly uploadMyAvatarUseCase: UploadMyAvatarUseCase,
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@Req() req: any) {
  console.log('REQ.USER in /users/me/profile:', req.user);
    return this.getMyProfileUseCase.execute(req.user.sub);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateProfileInput) {
    return this.updateMyProfileUseCase.execute(req.user.sub, dto);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    return this.uploadMyAvatarUseCase.execute(req.user.sub, avatarUrl);
  }

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    return this.getPublicProfileUseCase.execute(id);
  }
}