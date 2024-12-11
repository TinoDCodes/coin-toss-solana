"use client";

import { createClient } from "@/utils/supabase/client";
import { BetEvent, Market, Selection } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";

export function useEventData() {
  const supabase = createClient();

  const {
    data: eventData,
    error: eventError,
    isPending: isEventFetching,
  } = useQuery({
    queryKey: ["coin-toss-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("result", "pending")
        .single();

      if (error) throw new Error(error.message);

      const event: BetEvent = data;

      return event;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });

  const eventId = eventData?.id;

  const {
    data: selections,
    error: selectionsError,
    isPending: isSelectionsPending,
  } = useQuery({
    queryKey: ["selections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("selections")
        .select("*")
        .eq("event_id", eventId);

      if (error) throw new Error(error.message);

      if (data.length < 2 || data.length > 2)
        throw new Error("Error gathering event selections!");

      const heads: Selection = data.find((item) => item.title === "heads");
      const tails: Selection = data.find((item) => item.title === "tails");

      return [heads, tails];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds
    // The query will not execute until the eventId exists.
    enabled: !!eventId,
  });

  const {
    data: headsMarket,
    error: headsMarketError,
    isPending: isHeadsMarketPending,
  } = useQuery({
    queryKey: ["heads-market"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("event_id", eventId)
        .eq("selection_id", selections![0].id)
        .single();

      if (error) throw new Error(error.message);

      const market: Market = data;
      return market;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds
    // The query will not execute until the selections exist.
    enabled: !!selections,
  });

  const {
    data: tailsMarket,
    error: tailsMarketError,
    isPending: isTailsMarketPending,
  } = useQuery({
    queryKey: ["tails-market"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("event_id", eventId)
        .eq("selection_id", selections![1].id)
        .single();

      if (error) throw new Error(error.message);

      const market: Market = data;
      return market;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds
    // The query will not execute until the selections exist.
    enabled: !!selections,
  });

  return {
    eventData,
    eventError,
    isEventFetching,
    selections,
    selectionsError,
    isSelectionsPending,
    headsMarket,
    headsMarketError,
    isHeadsMarketPending,
    tailsMarket,
    tailsMarketError,
    isTailsMarketPending,
  };
}
