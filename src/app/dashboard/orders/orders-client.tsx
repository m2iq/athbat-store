"use client";

import { useToast } from "@/components/toast";
import {
    CheckCircle,
    Clock,
    Loader2,
    MessageCircle,
    RefreshCw,
    Send,
    ShoppingBag,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Order {
  id: string;
  user_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_amount: number;
  status: string;
  admin_reply: string | null;
  created_at: string;
  profiles?: { full_name: string; phone: string } | null;
}

const STATUS_MAP: Record<
  string,
  { label: string; icon: typeof CheckCircle; class: string; bg: string }
> = {
  completed: {
    label: "مكتمل",
    icon: CheckCircle,
    class: "bg-green-50 text-green-700",
    bg: "border-green-200",
  },
  pending: {
    label: "قيد الانتظار",
    icon: Clock,
    class: "bg-yellow-50 text-yellow-700",
    bg: "border-yellow-200",
  },
};

export default function OrdersClient() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Reply modal state
  const [replyOrder, setReplyOrder] = useState<Order | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Delete confirm modal state
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auto-refresh
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "فشل تحميل الطلبات");
        return;
      }

      const data = await res.json();
      setOrders(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [loadOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, ...updated } : o)),
        );
        toast.success("تم تحديث حالة الطلب");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "فشل تحديث الحالة");
      }
    } catch {
      toast.error("خطأ في تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendReply = async () => {
    if (!replyOrder || !replyText.trim()) {
      toast.warning("يرجى كتابة رسالة الرد");
      return;
    }

    setSendingReply(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: replyOrder.id,
          admin_reply: replyText.trim(),
          status: "completed",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === replyOrder.id ? { ...o, ...updated } : o)),
        );
        toast.success("تم حفظ الرد وإتمام الطلب");
        setReplyOrder(null);
        setReplyText("");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "فشل إرسال الرد");
      }
    } catch {
      toast.error("خطأ في إرسال الرد");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrder) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/orders?id=${deleteOrder.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
        setTotal((prev) => prev - 1);
        toast.success("تم حذف الطلب بنجاح");
        setDeleteOrder(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "فشل حذف الطلب");
      }
    } catch {
      toast.error("خطأ في حذف الطلب");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            الطلبات
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} طلب</p>
        </div>
        <button
          onClick={() => loadOrders()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          تحديث
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "pending", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-10 ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "الكل" : (STATUS_MAP[s]?.label ?? s)}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد طلبات</p>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="lg:hidden space-y-3">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm ${statusInfo.bg}`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {order.product_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${statusInfo.class}`}
                    >
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-[10px] shrink-0">
                      {(order.profiles?.full_name || "؟")[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {order.profiles?.full_name ?? "—"}
                      </p>
                      <p className="text-gray-400">
                        {order.profiles?.phone ?? ""}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-gray-500">المبلغ:</span>
                    <span className="font-bold text-gray-900">
                      {new Intl.NumberFormat("ar-IQ").format(
                        order.total_amount,
                      )}{" "}
                      د.ع
                    </span>
                  </div>

                  {/* Admin reply */}
                  {order.admin_reply && (
                    <div className="mb-3 p-2.5 bg-blue-50 rounded-lg">
                      <p className="text-[10px] text-blue-600 font-medium mb-0.5">
                        رد الإدارة:
                      </p>
                      <p className="text-xs text-blue-800">
                        {order.admin_reply}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-[10px] text-gray-400 mb-3">
                    {new Date(order.created_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500/30 outline-none disabled:opacity-50 min-h-9"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="completed">مكتمل</option>
                    </select>

                    <button
                      onClick={() => {
                        setReplyOrder(order);
                        setReplyText(order.admin_reply || "");
                      }}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors min-h-9"
                    >
                      <MessageCircle size={14} />
                      رد
                    </button>

                    <button
                      onClick={() => setDeleteOrder(order)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors min-h-9"
                    >
                      <Trash2 size={14} />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      رقم الطلب
                    </th>
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      العميل
                    </th>
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      المنتج
                    </th>
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      المبلغ
                    </th>
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      الحالة
                    </th>
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      التاريخ
                    </th>
                    <th className="text-right px-4 xl:px-6 py-3 font-medium text-gray-500">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusInfo =
                      STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 xl:px-6 py-4 font-mono text-xs text-gray-500">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {order.profiles?.full_name ?? "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.profiles?.phone ?? ""}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 font-medium text-gray-900">
                          {order.product_name}
                        </td>
                        <td className="px-4 xl:px-6 py-4 font-bold text-gray-900">
                          {new Intl.NumberFormat("ar-IQ").format(
                            order.total_amount,
                          )}{" "}
                          د.ع
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}
                          >
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                          {order.admin_reply && (
                            <p
                              className="text-[10px] text-blue-600 mt-1 truncate max-w-30"
                              title={order.admin_reply}
                            >
                              رد: {order.admin_reply}
                            </p>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString(
                            "ar-SA",
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateStatus(order.id, e.target.value)
                              }
                              disabled={updatingId === order.id}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500/30 outline-none disabled:opacity-50"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="completed">مكتمل</option>
                            </select>

                            <button
                              onClick={() => {
                                setReplyOrder(order);
                                setReplyText(order.admin_reply || "");
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="رد على العميل"
                            >
                              <MessageCircle size={16} />
                            </button>

                            <button
                              onClick={() => setDeleteOrder(order)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="حذف الطلب"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reply Modal */}
      {replyOrder && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setReplyOrder(null);
              setReplyText("");
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 animate-slide-in">
            <button
              onClick={() => {
                setReplyOrder(null);
                setReplyText("");
              }}
              className="absolute top-4 left-4 p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-400" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              الرد على العميل
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              طلب #{replyOrder.id.slice(0, 8)} —{" "}
              {replyOrder.profiles?.full_name ?? "عميل"}
            </p>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">المنتج:</span>
                <span className="font-medium text-gray-800">
                  {replyOrder.product_name}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">المبلغ:</span>
                <span className="font-bold text-gray-800">
                  {new Intl.NumberFormat("ar-IQ").format(
                    replyOrder.total_amount,
                  )}{" "}
                  د.ع
                </span>
              </div>
              {replyOrder.profiles?.phone && (
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">الهاتف:</span>
                  <span className="font-medium text-gray-800" dir="ltr">
                    {replyOrder.profiles.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Reply textarea */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                رسالة الرد (كود أو رسالة)
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="اكتب الكود أو الرد هنا... (سيظهر للعميل في التطبيق)"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-11"
              >
                {sendingReply ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sendingReply ? "جاري الإرسال..." : "حفظ الرد وإتمام الطلب"}
              </button>

              <button
                onClick={() => {
                  setReplyOrder(null);
                  setReplyText("");
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors min-h-11"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteOrder && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteOrder(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6 animate-slide-in text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 size={24} className="text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">حذف الطلب</h3>
            <p className="text-sm text-gray-500 mb-1">
              هل أنت متأكد من حذف طلب{" "}
              <span className="font-bold text-gray-700">
                {deleteOrder.product_name}
              </span>
              ؟
            </p>
            <p className="text-xs text-gray-400 mb-5">
              #{deleteOrder.id.slice(0, 8)} — هذا الإجراء لا يمكن التراجع عنه
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors min-h-11"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>

              <button
                onClick={() => setDeleteOrder(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors min-h-11"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
