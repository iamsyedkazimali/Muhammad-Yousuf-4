import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to database changes so the public website reflects
 * admin edits instantly, without a refresh.
 */
export function useRealtimeContent() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("content-sync")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        qc.invalidateQueries({ queryKey: ["public"] });
        qc.invalidateQueries({ queryKey: ["admin"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
