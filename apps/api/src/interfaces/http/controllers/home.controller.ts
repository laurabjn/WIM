import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AddHomePhotoUseCase } from 'src/application/home/use-cases/add-home-photo.usecase';
import { CreateHomeUseCase } from 'src/application/home/use-cases/create-home.usecase';
import { DeleteHomeUseCase } from 'src/application/home/use-cases/delete-home.usecase';
import { GetHomeByIdUseCase } from 'src/application/home/use-cases/get-home-by-id.usecase';
import { ListMyHomesUseCase } from 'src/application/home/use-cases/list-my-homes.usecase';
import { UpdateHomeUseCase } from 'src/application/home/use-cases/update-home.usecase';
import { CreateHomeDto } from '../dtos/create-home.dto';
import { UpdateHomeDto } from '../dtos/home/update-home.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { ListPublicHomesUseCase } from 'src/application/home/use-cases/list-public-home.usecase';
import { RemoveFavoriteUseCase } from 'src/application/favorite/use-case/remove-favorite.usecae';
import { AddFavoriteUseCase } from 'src/application/favorite/use-case/add-favorite.usecase';

function editFileName(
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  callback(null, `${unique}${extname(file.originalname)}`);
}

function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return callback(new Error('Only image files are allowed'), false);
  }
  callback(null, true);
}

@Controller('homes')
export class HomeController {
  constructor(
    private readonly createHomeUseCase: CreateHomeUseCase,
    private readonly getHomeByIdUseCase: GetHomeByIdUseCase,
    private readonly listMyHomesUseCase: ListMyHomesUseCase,
    private readonly listPublicHomesUseCase: ListPublicHomesUseCase,
    private readonly updateHomeUseCase: UpdateHomeUseCase,
    private readonly deleteHomeUseCase: DeleteHomeUseCase,
    private readonly addHomePhotoUseCase: AddHomePhotoUseCase,
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
  ) {
    console.log('homecontroller created');
  }

  @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req: any, @Body() dto: CreateHomeDto) {
      console.log('CREATE HOME CALLED');
      const ownerId = req.user.sub ?? req.user.userId;

      if (!ownerId) {
        throw new UnauthorizedException();
      }

    console.log('CREATE HOME DTO:', dto);

    console.log('CREATE HOME PAYLOAD:', {
      ownerId,
      title: dto.title,
      description: dto.description,
      address: dto.address,
      city: dto.city,
      country: dto.country,
      latitude: dto.latitude,
      longitude: dto.longitude,
      capacity: dto.capacity,
      beds: dto.beds ?? 1,
      bedrooms: dto.bedrooms ?? 1,
      bathrooms: dto.bathrooms ?? 1,
      homeType: dto.homeType,
      amenities: dto.amenities ?? [],
      isAvailableForExchange: dto.isAvailableForExchange ?? false,
      pricePerNight: dto.pricePerNight,
      averageRating: null,
      reviewCount: 0,
      carExchangeAccepted: dto.carExchangeAccepted ?? false,
      vehicle: dto.carExchangeAccepted ? dto.vehicle ?? null : null,
    });
        
      return this.createHomeUseCase.execute({
        ownerId,
        title: dto.title,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,

        capacity: dto.capacity,
        beds: dto.beds ?? 1,
        bedrooms: dto.bedrooms ?? 1,
        bathrooms: dto.bathrooms ?? 1,

        homeType: dto.homeType,
        amenities: dto.amenities ?? [],
        isAvailableForExchange: dto.isAvailableForExchange ?? false,
        pricePerNight: dto.pricePerNight,
        averageRating: null,
        reviewCount: 0,
        
        carExchangeAccepted: dto.carExchangeAccepted ?? false,

        vehicle: dto.carExchangeAccepted ? dto.vehicle ?? null : null,
      });
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me/list')
  listMine(@Req() req: any) {
    const ownerId = req.user?.sub ?? req.user?.userId;

    if (!ownerId) {
      throw new UnauthorizedException();
    }

    return this.listMyHomesUseCase.execute(ownerId);
  }

  @Get()
  listPublicHomes() {
    return this.listPublicHomesUseCase.execute();
  }

  @Get('owner/:ownerId')
  getByOwnerId(@Param('ownerId') ownerId: string) {
    return this.listMyHomesUseCase.execute(ownerId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getHomeByIdUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateHomeDto) {
    return this.updateHomeUseCase.execute({
      homeId: id,
      requesterId: req.user.sub,
      ...dto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.deleteHomeUseCase.execute(id, req.user.sub);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  addFavorite(@Req() req: any, @Param('id') homeId: string) {
    return this.addFavoriteUseCase.execute(req.user.sub, homeId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  removeFavorite(@Req() req: any, @Param('id') homeId: string) {
    return this.removeFavoriteUseCase.execute(req.user.sub, homeId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/homes',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadPhoto(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.addHomePhotoUseCase.execute({
      homeId: id,
      requesterId: req.user.sub,
      url: `/uploads/homes/${file.filename}`,
    });
  }
}