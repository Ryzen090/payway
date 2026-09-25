import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import BaseError from '../../common/error/base.errors';
import { ListQuery } from '../../common/base/list.query';
import { TicketDocument } from './entities/ticket.entity';
import ListResponse from '../../common/base/list.response';
import { BaseService } from '../../common/base/base.service';
import { GeneralError } from '../../common/error/enum.errors';
import { UpdateTicketDTO } from './dto/update-ticket.dto';

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

  async detail(id: string): Promise<TicketDocument> {
    const ticket = await this.repository.getDetail({
      _id: id,
    });

    if (!ticket) {
      throw BaseError.NotFound(GeneralError.NOT_FOUND);
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDTO): Promise<TicketDocument> {
    const product = await this.repository.getUpdate({ _id: id }, dto);

    if (!product) {
      throw BaseError.NotFound(GeneralError.NOT_FOUND);
    }

    return product;
  }
}
