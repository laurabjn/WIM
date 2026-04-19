import { CreateSupportRequestDto } from '../dto/create-support-request.dto';

export interface SupportRequestEntity {
  id: string;
  userId: string;
  topic: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportRequestRepository {
  create(
    input: CreateSupportRequestDto,
  ): Promise<SupportRequestEntity>;
}