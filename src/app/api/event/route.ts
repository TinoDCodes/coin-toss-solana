import { createServiceRoleClient } from "@/utils/supabase/admin";

type FlipResult = "heads" | "tails";

/**
 * Handles the GET request for the coin toss API.
 *
 * This API endpoint performs the following actions:
 * 1. Secures the route by verifying the `authorization` header using a secret.
 * 2. Updates the result of all "pending" events with a randomly generated coin toss result.
 * 3. Creates a new coin toss event scheduled for the next hour.
 *
 * Security:
 * - Requires a `Bearer` token in the `authorization` header that matches `CRON_SECRET`.
 *
 * Responses:
 * - 401: Unauthorized access if the token is invalid.
 * - 400: Failure due to coin toss update or event creation error.
 * - 201: Success response with details of the newly created event.
 *
 * @param request - The incoming HTTP request.
 * @returns A JSON response indicating success or failure of the operations.
 */
export async function GET(request: Request) {
  /*--------- SECURE THE API ROUTE ----------*/
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  /*--------------------------------------------*/

  const supabase = createServiceRoleClient();

  try {
    /*---------- PERFORM COIN TOSS ----------*/
    const flip = Math.random();
    const result: FlipResult = flip <= 0.5 ? "heads" : "tails";

    const { data: tossData, error: tossError } = await supabase
      .from("events")
      .update({
        result,
      })
      .eq("result", "pending");

    if (tossError) {
      return Response.json(
        { success: false, tossError },
        {
          status: 400,
          statusText: "Failed to perform coin toss!",
        }
      );
    }
    /*--------------------------------------------*/

    /*---------- CREATE A NEW EVENT ----------*/
    // Calculate the next hour
    const now = new Date();
    const nextHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() + 1,
      0, // Minutes
      0 // Seconds
    ).toISOString(); // Convert to ISO format for database storage

    // Insert the event into the database
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert([
        {
          title: `Coin Toss %${nextHour}%`,
          date_time: nextHour,

          sport: "Esports",
          result: "pending",
        },
      ]);

    if (eventError) {
      return Response.json(
        { success: false, eventError },
        {
          status: 400,
          statusText: "Failed to create new coin toss event!",
        }
      );
    }

    // Return a success response with the new event details
    return Response.json(
      { success: true, event: eventData },
      {
        status: 201,
      }
    );
  } catch (error) {
    // Handle unexpected errors
    return Response.json(
      { success: false, error },
      {
        status: 400,
      }
    );
  }
}
