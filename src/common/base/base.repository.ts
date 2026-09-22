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
    filters: QueryCondition = {},
  ): Promise<ListResponse<TModel>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const limit = query.limit ?? pageSize;

    const skip = (page - 1) * limit;

    const total = await this.model.countDocuments({}).exec();

    const result = await this.model
      .find({})
      .populate(filters.populate || '')
      .skip(skip)
      .limit(limit)
      .exec();

    return new ListResponse(result, total, page, pageSize, limit);
  }
}
