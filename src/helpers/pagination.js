/**
 * @name PaginationPlugin
 * @param {*} schema
 * @param {*} [options]
 * @param {*} [options.limit = 10]
 * @constructor
 */
const PaginationPlugin = (schema, options) => {
  options = options || {};
  /**
   * @name paginate
   * @param {*} [params]
   * @param {*} [params.limit = 10]
   * @param {*} [params.page = 1]
   * @return {Promise<{limit, page: number, results: *}>} Paginated data
   */
  schema.query.paginate = async function paginate(params) {
    params = params || {};
    const pgConfig = {
      limit: parseInt(params.limit, 10) || options.limit || 10,
      page: Math.max(parseInt(params.page, 10) || 1, 1),
    };
    const offset = (pgConfig.page - 1) * pgConfig.limit;

    const [results, total] = await Promise.all([
      this.limit(pgConfig.limit).skip(offset),
      this.model.countDocuments(this.getQuery()),
    ]);
    const p = pgConfig.page;
    pgConfig.item_count = results.length;
    pgConfig.number_of_pages = Math.ceil(total / pgConfig.limit) || 1;
    pgConfig.previous_page = p > 1 ? Math.min(p - 1, pgConfig.number_of_pages) : null;
    pgConfig.next_page = p < pgConfig.number_of_pages ? p + 1 : null;
    pgConfig.total = total;
    return { results, ...pgConfig };
  };
};

export default PaginationPlugin;
