interface IPagedOutput<T> {
  data: T[];
  page?: number;
  perPage?: number;
  totalCount?: number;
}

export default IPagedOutput;
