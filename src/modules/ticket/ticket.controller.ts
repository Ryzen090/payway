import { TicketService } from './ticket.service';
import { Ticket } from './entities/ticket.entity';
import { ListQuery } from '../../common/base/list.query';
import { CreateTicketDTO } from './dto/create-ticket.dto';
import ListResponse from '../../common/base/list.response';
import { Success, Update } from '../../common/decorator/response.decorator';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';

@Controller({ version: '1', path: 'ticket' })
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Get()
  @Success()
  list(@Query() listQuery: ListQuery): Promise<ListResponse<Ticket>> {
    return this.service.list(listQuery);
  }

  @Get(':id')
  @Success()
  Detail(@Param('id') id: string): Promise<Ticket> {
    return this.service.detail(id);
  }

  @Patch(':id')
  @Success()
  @Update()
  Update(
    @Param('id') id: string,
    @Body() dto: CreateTicketDTO,
  ): Promise<Ticket> {
    return this.service.update(id, dto);
  }
}
