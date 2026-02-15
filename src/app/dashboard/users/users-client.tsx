"use client";

import { useToast } from "@/components/toast";
import {
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Search,
  Shield,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  is_blocked: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function UsersClient() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "فشل تحميل المستخدمين");
        return;
      }
      const data = await res.json();
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleBlock = async (user: User) => {
    setTogglingId(user.id);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          is_blocked: !user.is_blocked,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "فشل تحديث الحالة");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u,
        ),
      );
      toast.success(
        user.is_blocked ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم",
      );
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ").format(amount) + " د.ع";
  };

  return (
    <div>
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">المستخدمون</h2>
            <p className="text-xs text-gray-500">
              {loading ? "جارٍ التحميل..." : `${total} مستخدم مسجل`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            dir="rtl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all min-h-11"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">جارٍ تحميل المستخدمين...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Users size={32} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {debouncedSearch ? "لا توجد نتائج" : "لا يوجد مستخدمون"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {debouncedSearch
                ? "جرّب كلمة بحث أخرى"
                : "لم يسجل أي مستخدم بعد"}
            </p>
          </div>
        </div>
      )}

      {/* Users Table - Desktop */}
      {users.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      المستخدم
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      البريد الإلكتروني
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      الهاتف
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      الرصيد
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      التسجيل
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      الحالة
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                                (
                                  e.target as HTMLImageElement
                                ).nextElementSibling?.classList.remove(
                                  "hidden",
                                );
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center ${user.avatar_url ? "hidden" : ""}`}
                          >
                            <UserCircle
                              size={20}
                              className="text-blue-600"
                            />
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-40">
                            {user.full_name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail size={14} className="shrink-0 text-gray-400" />
                          <span className="truncate max-w-44 text-xs">
                            {user.email || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone size={14} className="shrink-0 text-gray-400" />
                          <span className="text-xs" dir="ltr">
                            {user.phone || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Wallet
                            size={14}
                            className="shrink-0 text-teal-500"
                          />
                          <span className="text-xs font-semibold text-teal-700">
                            {formatBalance(user.wallet_balance)}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {user.is_blocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <Ban size={12} />
                            محظور
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle size={12} />
                            نشط
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleBlock(user)}
                          disabled={togglingId === user.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 min-h-9 ${
                            user.is_blocked
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {togglingId === user.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : user.is_blocked ? (
                            <>
                              <Shield size={14} />
                              إلغاء الحظر
                            </>
                          ) : (
                            <>
                              <Ban size={14} />
                              حظر
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Cards - Mobile */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0 ${user.avatar_url ? "hidden" : ""}`}
                    >
                      <UserCircle size={22} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {user.full_name || "—"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {user.is_blocked ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <Ban size={10} />
                      محظور
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle size={10} />
                      نشط
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">الهاتف</p>
                    <p className="text-xs font-medium text-gray-800 mt-0.5" dir="ltr">
                      {user.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الرصيد</p>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      {formatBalance(user.wallet_balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">التسجيل</p>
                    <p className="text-xs font-medium text-gray-800 mt-0.5">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleBlock(user)}
                    disabled={togglingId === user.id}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 min-h-10 ${
                      user.is_blocked
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {togglingId === user.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : user.is_blocked ? (
                      <>
                        <Shield size={14} />
                        إلغاء الحظر
                      </>
                    ) : (
                      <>
                        <Ban size={14} />
                        حظر
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-1">
              <p className="text-xs text-gray-500">
                صفحة {page} من {totalPages} — {total} مستخدم
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-9 min-w-9 flex items-center justify-center"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                        page === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-9 min-w-9 flex items-center justify-center"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Loading overlay for page transitions */}
          {loading && users.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="text-blue-600 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
