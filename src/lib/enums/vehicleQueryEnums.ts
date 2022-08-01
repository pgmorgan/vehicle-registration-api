/*  I have limited ordering of GET calls to fetch vehicles by
 *  these two model field values for simplicity and expedience for this assessment */
export enum OrderBy {
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
}

export enum OrderByDirection {
  ASC = "asc",
  DESC = "desc",
}
