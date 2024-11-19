import { createServiceRoleClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();

  try {
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
    const { data, error } = await supabase.from("events").insert([
      {
        title: `Coin Toss %${nextHour}%`,
        date_time: nextHour,

        sport: "Esports",
        result: "pending",
      },
    ]);

    if (error) throw error;

    return Response.json(
      { success: true, event: data },
      {
        status: 201,
      }
    );
  } catch (error) {
    return Response.json(
      { success: false, error },
      {
        status: 400,
      }
    );
  }
}
