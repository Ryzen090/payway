import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import ListResponse from './list.response';
import { ListQuery, QueryCondition } from './list.query';

export abstract class BaseRepository<TModel extends mongoose.Document> {
  protected readonly model: Model<TModel>;

  protected constructor(model: Model<TModel>) {
    this.model = model;
  }

  async getList(
    query: ListQuery,
    filters?: QueryCondition,
  ): Promise<ListResponse<TModel>> {
    query.page = query.page ?? 1;
    query.pageSize = query.pageSize ?? 10;
    query.limit = query.limit ?? query.pageSize;

    if (!filters) {
      filters = {
        populate: undefined,
      };
    }

    let sort: any = undefined;

    let select: any = undefined;
    const _countQuery = this.model.countDocuments({});
    const total = await _countQuery.exec();
    const resultQuery = this.model
      .find({})
      .populate(filters?.populate || '')
      .select(select && select)
      .sort(sort && sort);

    const result = await resultQuery.exec();

    return new ListResponse(result, total, query.limit);
  }
}
