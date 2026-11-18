import type { QueryClient } from "@tanstack/react-query";
import type { IWork } from "../interfaces/works/IWork";
import type { IWorkPrice } from "../interfaces/workPrices/IWorkPrice";
import { worksKeys } from "./works";

const updateCachedPrices = async (
  client: QueryClient,
  matches: (work: IWork) => boolean,
  update: (work: IWork) => IWork,
) => {
  // Cancel only affected cached queries, so older responses cannot restore an obsolete price.
  await client.cancelQueries({
    queryKey: worksKeys.all(),
    predicate: (query) => {
      const data = query.state.data;
      return query.queryKey[1] === "list" && Array.isArray(data)
        ? data.some(matches)
        : query.queryKey[1] === "detail" &&
            Boolean(data && matches(data as IWork));
    },
  });
  client.setQueriesData<IWork[]>(
    {
      queryKey: worksKeys.list(),
      predicate: (query) =>
        Array.isArray(query.state.data) && query.state.data.some(matches),
    },
    (works) => works?.map((work) => (matches(work) ? update(work) : work)),
  );
  client.setQueriesData<IWork>(
    {
      queryKey: worksKeys.all(),
      predicate: (query) =>
        query.queryKey[1] === "detail" &&
        Boolean(query.state.data && matches(query.state.data as IWork)),
    },
    (work) => (work ? update(work) : work),
  );
};

export const cacheSavedWorkPrice = (client: QueryClient, price: IWorkPrice) => {
  const hasPrice = (work: IWork) =>
    Boolean(
      price.work_price_id &&
      work.work_prices?.some(
        (item) => item.work_price_id === price.work_price_id,
      ),
    );
  return updateCachedPrices(
    client,
    (work) => work.work_id === price.work || hasPrice(work),
    (work) => {
      const previous = work.work_prices?.find(
        (item) => item.work_price_id === price.work_price_id,
      );
      const prices = (work.work_prices ?? []).filter(
        (item) =>
          !price.work_price_id || item.work_price_id !== price.work_price_id,
      );
      if (work.work_id === price.work)
        prices.push({ deleted: false, ...previous, ...price });
      return { ...work, work_prices: prices };
    },
  );
};

export const cacheDeletedWorkPrice = (client: QueryClient, priceId: string) =>
  updateCachedPrices(
    client,
    (work) =>
      Boolean(
        work.work_prices?.some((price) => price.work_price_id === priceId),
      ),
    (work) => ({
      ...work,
      work_prices: work.work_prices?.filter(
        (price) => price.work_price_id !== priceId,
      ),
    }),
  );
