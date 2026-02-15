"use client";

import Header from "@/components/header";
import { useSidebar } from "@/components/sidebar";
import OrdersClient from "./orders-client";

export default function OrdersPage() {
  const { setOpen } = useSidebar();

  return (
    <>
      <Header title="الطلبات" onMenuClick={() => setOpen(true)} />
      <div className="p-3 sm:p-6 lg:p-8">
        <OrdersClient />
      </div>
    </>
  );
}
