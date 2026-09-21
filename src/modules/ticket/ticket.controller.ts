import { TicketService } from './ticket.service';
import { Ticket } from './entities/ticket.entity';
import { Controller, Get, Query } from '@nestjs/common';
import { ListQuery } from '../../common/base/list.query';
import ListResponse from '../../common/base/list.response';
import { Success } from '../../common/decorator/response.decorator';

@Controller({ version: '1', path: 'ticket' })
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Get()
  @Success()
  list(@Query() listQuery: ListQuery): Promise<ListResponse<Ticket>> {
    return this.service.list(listQuery);
  }
}
