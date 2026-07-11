import { Query, Document } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  populate?: string | string[];
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const paginate = async <T extends Document>(
  query: Query<T[], T>,
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const countQuery = query.model.find().merge(query);
  const total = await countQuery.countDocuments();

  let dataQuery = query.skip(skip).limit(limit);

  if (options.sort) {
    dataQuery = dataQuery.sort(options.sort);
  }

  if (options.select) {
    dataQuery = dataQuery.select(options.select);
  }

  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((field) => {
        dataQuery = dataQuery.populate(field);
      });
    } else {
      dataQuery = dataQuery.populate(options.populate);
    }
  }

  const data = await dataQuery;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
