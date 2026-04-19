import { Injectable } from '@nestjs/common';
import { CreateSupportRequestDto } from '../dto/create-support-request.dto';
import {
  SupportRequestEntity,
  SupportRequestRepository,
} from '../ports/support-request.repository';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';

@Injectable()
export class CreateSupportRequestUseCase {
  constructor(
    private readonly supportRequestRepository: SupportRequestRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: string,
    input: CreateSupportRequestDto,
  ): Promise<SupportRequestEntity> {
    if (!userId) {
      throw new Error('Missing userId');
    }

    if (!input.topic?.trim()) {
      throw new Error('Topic is required');
    }

    if (!input.subject?.trim()) {
      throw new Error('Subject is required');
    }

    if (!input.message?.trim()) {
      throw new Error('Message is required');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const userFullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    return this.supportRequestRepository.create({
      userId: user.id,
      userEmail: user.email,
      userFullName: userFullName || null,
      topic: input.topic,
      subject: input.subject.trim(),
      message: input.message.trim(),
    });
  }
}