import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { StateProvider } from "@/components/StateProvider";
import StatusBar from "@/components/StatusBar";
import { isAuthenticated } from "@/lib/auth";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) redirect("/");
  const state = await getState();

  return (
    <StateProvider initialState={state}>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <StatusBar />
        <main className="flex-1 px-4 pb-32 pt-4">{children}</main>
        <BottomNav />
      </div>
    </StateProvider>
  );
}
