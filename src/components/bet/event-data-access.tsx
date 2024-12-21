"use client";

import { createClient } from "@/utils/supabase/client";
import { BetEvent, Market, Selection } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch event data, selections, and markets from the Supabase database.
 * It queries data for an event (pending result), its selections, and the corresponding markets
 * for "heads" and "tails" selections.
 *
 * @returns {Object} An object containing event data, selections, and market data for heads and tails.
 */
export function useEventData() {
  const supabase = createClient();

  // ------------- Fetch Event Data -------------
  /**
   * Query to fetch the event with a "pending" result from the Supabase database.
   * The event is expected to be a BetEvent type.
   */
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

      const event: BetEvent = data; // Type cast data to BetEvent type

      return event;
    },
    staleTime: 30 * 1000, // Cache event data for 30 seconds
    refetchInterval: 30 * 1000, // Refetch event data every 30 seconds
  });

  const eventId = eventData?.id; // Extract the event ID for further queries

  // ------------- Fetch Selections Data -------------
  /**
   * Query to fetch selections associated with the event (heads and tails).
   * The query will only run if `eventId` exists.
   */
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
        throw new Error("Error gathering event selections!"); // Ensure only two selections (heads and tails)

      const heads: Selection = data.find((item) => item.title === "heads");
      const tails: Selection = data.find((item) => item.title === "tails");

      return [heads, tails]; // Return the selections for heads and tails
    },
    staleTime: 30 * 1000, // Cache selections for 30 seconds
    refetchInterval: 30 * 1000, // Refetch selections every 30 seconds
    enabled: !!eventId, // Only run this query if the event ID exists
  });

  // ------------- Fetch Heads Market Data -------------
  /**
   * Query to fetch the market for the "heads" selection.
   * This query will only run if `selections` exist.
   */
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

      const market: Market = data; // Type cast data to Market type
      return market;
    },
    staleTime: 30 * 1000, // Cache heads market data for 30 seconds
    refetchInterval: 30 * 1000, // Refetch heads market data every 30 seconds
    enabled: !!selections, // Only run this query if selections exist
  });

  // ------------- Fetch Tails Market Data -------------
  /**
   * Query to fetch the market for the "tails" selection.
   * This query will only run if `selections` exist.
   */
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

      const market: Market = data; // Type cast data to Market type
      return market;
    },
    staleTime: 30 * 1000, // Cache tails market data for 30 seconds
    refetchInterval: 30 * 1000, // Refetch tails market data every 30 seconds
    enabled: !!selections, // Only run this query if selections exist
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
