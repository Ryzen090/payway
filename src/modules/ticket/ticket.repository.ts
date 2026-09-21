import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TicketDocument } from './entities/ticket.entity';
import { SchemaProvider } from '../../providers/model.providers';
import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class TicketRepository extends BaseRepository<TicketDocument> {
  constructor(
    @InjectModel(SchemaProvider.TICKET)
    ticketModel: Model<TicketDocument>,
  ) {
    super(ticketModel);
  }
}
