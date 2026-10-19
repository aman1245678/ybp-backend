/** Normalized paging/sorting input for admin list endpoints. */
export class PageRequest {
  static MaxPageSize = 100;
  static DefaultPageSize = 20;

  /**
   * @param {object} [opts]
   * @param {number} [opts.page]
   * @param {number} [opts.pageSize]
   * @param {string|null} [opts.sortBy]
   * @param {boolean} [opts.sortDescending]
   * @param {string|null} [opts.search]
   */
  constructor(opts = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? PageRequest.DefaultPageSize;

    this.page = page < 1 ? 1 : page;
    this.pageSize =
      pageSize < 1
        ? PageRequest.DefaultPageSize
        : pageSize > PageRequest.MaxPageSize
          ? PageRequest.MaxPageSize
          : pageSize;
    this.sortBy = opts.sortBy ?? null;
    this.sortDescending = Boolean(opts.sortDescending);
    this.search = opts.search ?? null;
  }

  get skip() {
    return (this.page - 1) * this.pageSize;
  }
}
