export default class ListResponse<T> {
  items: T[];
  total?: number;
  limit?: number;
  page?: number;
  pageSize?: number;

  constructor(
    items: T[],
    total: number,
    page?: number,
    pageSize?: number,
    limit?: number,
  ) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.limit = limit;
  }

  toJSON() {
    return {
      items: this.items,
      total: this.total,
      limit: this.limit,
      page: this.page,
      pageSize: this.pageSize,
    };
  }

  promise(): Promise<ListResponse<T>> {
    return Promise.resolve(this);
  }
}
