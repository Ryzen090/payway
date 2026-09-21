import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { ListQuery } from '../../common/base/list.query';
import { TicketDocument } from './entities/ticket.entity';
import ListResponse from '../../common/base/list.response';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class TicketService extends BaseService<
  TicketDocument,
  TicketRepository
> {
  constructor(repository: TicketRepository) {
    super(repository);
  }

  list(listQuery: ListQuery): Promise<ListResponse<TicketDocument>> {
    return this.repository.getList(listQuery, {});
  }
}
