import { createServiceRoleClient } from "@/utils/supabase/admin";

type FlipResult = "heads" | "tails";

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();

  const flip = Math.random();

  const result: FlipResult = flip < 0.5 ? "heads" : "tails";

  const { data, error } = await supabase
    .from("events")
    .update({
      result: result,
    })
    .eq("result", "pending");

  if (error) {
    return Response.json(
      { success: false, error },
      {
        status: 400,
      }
    );
  }

  return Response.json(
    {
      success: true,
      result,
    },
    {
      status: 200,
    }
  );
}
