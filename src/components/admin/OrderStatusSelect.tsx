"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/constants";
import { updateOrderStatusAction } from "@/app/admin/(authed)/orders/actions";

export function OrderStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onChange = (status: string) => {
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatusAction(id, status);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <div>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono-tight bg-transparent border border-line py-2 px-3 outline-none focus:border-ink disabled:opacity-50"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.toLowerCase()}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 font-mono-tight text-vermillion">{error}</p>
      )}
    </div>
  );
}
