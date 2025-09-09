"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<{
    status: string;
    isActive: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription({
            status: data.status || "inactive",
            isActive: data.status === "active",
          });
        } else {
          setSubscription({
            status: "inactive",
            isActive: false,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription({
          status: "inactive",
          isActive: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [session]);

  return { subscription, loading };
}
