"use client";

import Header from "@/components/header";
import { useSidebar } from "@/components/sidebar";
import RechargeCodesClient from "./recharge-codes-client";

export default function RechargeCodesPage() {
  const { setOpen } = useSidebar();

  return (
    <>
      <Header title="رموز الشحن" onMenuClick={() => setOpen(true)} />
      <div className="p-3 sm:p-6 lg:p-8">
        <RechargeCodesClient />
      </div>
    </>
  );
}
