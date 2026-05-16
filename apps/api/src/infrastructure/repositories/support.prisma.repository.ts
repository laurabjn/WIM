import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { CreateSupportRequestDto } from 'src/application/support/dto/create-support-request.dto';
import {
  SupportRequestEntity,
  SupportRequestRepository,
} from 'src/application/support/ports/support-request.repository';

@Injectable()
export class PrismaSupportRequestRepository
  implements SupportRequestRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateSupportRequestDto,
  ): Promise<SupportRequestEntity> {
    const created = await this.prisma.supportRequest.create({
      data: {
        userId: input.userId,
        userEmail: input.userEmail,
        userFullName: input.userFullName,
        topic: input.topic,
        subject: input.subject,
        message: input.message,
      },
    });

    return created;
  }
}