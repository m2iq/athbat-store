"use client";

import Header from "@/components/header";
import { useSidebar } from "@/components/sidebar";
import UsersClient from "./users-client";

export default function UsersPage() {
  const { setOpen } = useSidebar();

  return (
    <>
      <Header title="المستخدمون" onMenuClick={() => setOpen(true)} />
      <div className="p-3 sm:p-6 lg:p-8">
        <UsersClient />
      </div>
    </>
  );
}
