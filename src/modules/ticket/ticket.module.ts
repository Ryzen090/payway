import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketSchema } from './entities/ticket.entity';
import { SchemaProvider } from '../../providers/model.providers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchemaProvider.TICKET, schema: TicketSchema },
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
})
export class TicketModule {}
