import { Loader } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader className="h-10 w-10 animate-spin" />
    </div>
  );
}
