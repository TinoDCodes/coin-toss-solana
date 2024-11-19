"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { BetEvent } from "@/utils/types";

export default function HelpersPage() {
  const supabase = createClient();

  const testDbInsert = async () => {
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

      console.log("Event created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      return { error: error };
    }
  };

  return (
    <div className="wrapper h-full flex flex-col items-center justify-center gap-5">
      <Button
        variant="default"
        size="lg"
        className="bg-green-400 text-white hover:bg-green-300"
        onClick={testDbInsert}
      >
        Test Db Insert
      </Button>
    </div>
  );
}