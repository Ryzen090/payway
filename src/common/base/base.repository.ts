import { Model, PopulateOptions } from 'mongoose';

import ListResponse from './list.response';
import { ListQuery, QueryCondition } from './list.query';

export abstract class BaseRepository<TModel> {
  protected readonly model: Model<TModel>;

  protected constructor(model: Model<TModel>) {
    this.model = model;
  }

  async getDetail(
    condition: Record<string, any> = {},
    selects?: string,
    options?: PopulateOptions | PopulateOptions[],
  ) {
    let query = this.model.findOne(condition);

    if (options) {
      query = query.populate(options);
    }

    if (selects) {
      query = query.select(selects);
    }

    return query.exec();
  }

  async getUpdate(condition: Record<string, any>, data: any) {
    return this.model.findOneAndUpdate(condition, data, { new: true }).exec();
  }

  async getList(
    query: ListQuery,
    filters: QueryCondition = {},
  ): Promise<ListResponse<TModel>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const limit = query.limit ?? pageSize;

    const skip = (page - 1) * limit;

    const condition = filters.condition ?? {};

    const total = await this.model.countDocuments(condition).exec();

    let mongooseQuery = this.model.find(condition).skip(skip).limit(limit);

    if (filters.populate) {
      mongooseQuery = mongooseQuery.populate(filters.populate);
    }

    const result = await mongooseQuery.exec();

    return new ListResponse(result, total, page, pageSize, limit);
  }
}
