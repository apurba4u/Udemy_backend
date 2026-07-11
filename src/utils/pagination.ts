import { Query, Document, Model } from 'mongoose';

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

  // Get the model from the query to count documents properly
  const model: Model<T> = query.model;

  // Count total documents matching the query conditions
  const conditions = query.getFilter();
  const total = await model.countDocuments(conditions);

  // Build the data query
  let dataQuery = query.clone();

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

  const data = await dataQuery.skip(skip).limit(limit);

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
