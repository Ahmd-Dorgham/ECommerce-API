export class ApiFeatures {
  //mongooseQuery : Product.find()
  //query         : req.query
  constructor(mongooseQuery, query) {
    this.mongooseQuery = mongooseQuery;
    this.query = query;
  }

  sort() {
    this.mongooseQuery.sort(this.query.sort);
    return this;
  }
  //page =1 , 2 , 3
  //limit=2 , 2 , 2
  //skip=0  , 2 , 4 , ... (page-1)* limit

  pagination() {
    const { page = 1, limit = 5 } = this.query;
    const skip = (page - 1) * limit;

    this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }

  filters() {
    const { page = 1, limit = 5, sort, ...filters } = this.query;
    const filtersAsString = JSON.stringify(filters);
    const replacedFilters = filtersAsString.replaceAll(/lt|gt|lte|gte|regex|ne|eq/g, (ele) => `$${ele}`);
    const parsedFilters = JSON.parse(replacedFilters);

    this.mongooseQuery.find(parsedFilters);

    return this;
  }
  //   {
  //   page: 2,
  //   limit: 10,
  //   sort: "-price",
  //   price: { lt: 100 },
  //   name: { regex: "apple" },
  //   category: "electronics"
  // }
}
