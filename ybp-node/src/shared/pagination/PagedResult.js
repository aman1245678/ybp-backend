/** Envelope returned by admin/portal list endpoints. */
export class PagedResult {
  /**
   * @param {unknown[]} items
   * @param {number} page
   * @param {number} pageSize
   * @param {number} totalCount
   */
  constructor(items, page, pageSize, totalCount) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
  }

  get totalPages() {
    return this.pageSize <= 0 ? 0 : Math.ceil(this.totalCount / this.pageSize);
  }

  get hasPrevious() {
    return this.page > 1;
  }

  get hasNext() {
    return this.page < this.totalPages;
  }

  static empty(page, pageSize) {
    return new PagedResult([], page, pageSize, 0);
  }
}
