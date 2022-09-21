import { Repository } from "@/repository";

import { getQuery, Query } from "./query";

type GetResolvers = (repository: Repository) => {
  query: Query;
};
export const getResolvers: GetResolvers = (repository) => {
  const query = getQuery(repository);

  return {
    query,
  };
};
