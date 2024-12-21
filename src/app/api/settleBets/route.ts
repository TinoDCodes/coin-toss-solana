import { createServiceRoleClient } from "@/utils/supabase/admin";
import { Bet } from "@/utils/types";

export async function GET(request: Request) {
  /*--------- SECURE THE API ROUTE ----------*/
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.API_KEY}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  /*--------------------------------------------*/

  const supabase = createServiceRoleClient();

  try {
    const { data: betsData, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "open");

    if (betsError) {
      throw new Error(`Unable to retrieve bets! -- ${betsError.message}`);
    }

    const bets: Bet[] = betsData;

    // Extract unique event IDs and selection IDs from bets
    const eventIds = [...new Set(bets.map((bet) => bet.event_id))];
    const selectionIds = [...new Set(bets.map((bet) => bet.selection_id))];

    // Fetch all relevant events and selections in bulk
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds);

    if (eventsError) {
      throw new Error(`Unable to retrieve events! -- ${eventsError.message}`);
    }

    const { data: selectionsData, error: selectionsError } = await supabase
      .from("selections")
      .select("*")
      .in("id", selectionIds);

    if (selectionsError) {
      throw new Error(
        `Unable to retrieve selections! -- ${selectionsError.message}`
      );
    }

    const eventsMap = Object.fromEntries(
      eventsData.map((event) => [event.id, event])
    );
    const selectionsMap = Object.fromEntries(
      selectionsData.map((selection) => [selection.id, selection])
    );

    const currentDateTime = new Date().toISOString();

    // Process all bets in a single loop
    const updatedBets = bets
      .map((bet) => {
        const event = eventsMap[bet.event_id];
        const selection = selectionsMap[bet.selection_id];

        if (!event || !selection) {
          console.warn(
            `Missing event or selection for bet ID: ${bet.id}. Skipping...`
          );
          return null; // Skip invalid bets
        }

        // Skip bets for events that have not yet occurred
        if (new Date(event.date_time) > new Date(currentDateTime)) {
          console.log(
            `Event for bet ID: ${bet.id} has not yet occurred. Skipping...`
          );
          return null;
        }

        return {
          ...bet,
          status:
            event.result.toLocaleLowerCase() ===
            selection.title.toLocaleLowerCase()
              ? "won"
              : "lost",
          settled_at: currentDateTime,
        };
      })
      .filter(Boolean); // Remove null values for skipped bets

    console.log("updated bets: ", updatedBets);

    // Perform a batch upsert
    const { data: dbUpdates, error: updateError } = await supabase
      .from("bets")
      .upsert(updatedBets)
      .select();

    if (updateError) {
      throw new Error(
        `Failed to perform database upsert! -- ${updateError.message}`
      );
    }

    // Return a success response
    return Response.json(
      { success: true, dbUpdates },
      {
        status: 200,
      }
    );
  } catch (error) {
    // Handle unexpected errors
    return Response.json(
      { success: false, error },
      {
        status: 400,
        statusText: "An unexpected error occurred while settling bets.",
      }
    );
  }
}
