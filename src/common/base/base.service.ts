import mongoose from 'mongoose';
import { BaseRepository } from './base.repository';

export abstract class BaseService<
  TModel extends mongoose.Document,
  TRepository extends BaseRepository<TModel>,
> {
  protected readonly repository: TRepository;

  protected constructor(repository: TRepository) {
    this.repository = repository;
  }
}
