import { createServiceRoleClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();

  const { betId, eventId, selectionId, stake, odds, walletAddress, status } =
    await request.json();

  if (
    !betId ||
    !eventId ||
    !selectionId ||
    !stake ||
    !odds ||
    !walletAddress ||
    !status
  ) {
    return Response.json(
      { sucess: false },
      {
        status: 400,
        statusText: "Missing bet data fields, cannot insert record!",
      }
    );
  }

  const { data, error } = await supabase.from("bets").insert([
    {
      bet_id: betId,
      event_id: eventId,
      selection_id: selectionId,
      stake: stake,
      odds: odds,
      wallet_address: walletAddress,
      status: status,
    },
  ]);

  if (error) {
    return Response.json(
      { sucess: false },
      { status: 400, statusText: "Faiiled to insert bet record!" }
    );
  }

  return Response.json({ success: true, bet: data, betId }, { status: 200 });
}
