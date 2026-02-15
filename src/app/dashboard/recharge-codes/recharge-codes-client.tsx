"use client";

import { useToast } from "@/components/toast";
import {
    CheckCircle2,
    ClipboardCopy,
    Loader2,
    Plus,
    Ticket,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface RechargeCode {
  id: string;
  code_hash: string;
  amount: number;
  is_used: boolean;
  used_by: string | null;
  batch_id: string;
  expires_at: string | null;
  created_at: string;
}

interface GenerateResult {
  batch_id: string;
  codes: string[];
  amount: number;
  count: number;
}

export default function RechargeCodesClient() {
  const toast = useToast();
  const [codes, setCodes] = useState<RechargeCode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerateResult | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [amount, setAmount] = useState("5000");
  const [expiresDays, setExpiresDays] = useState("90");

  const loadCodes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (statusFilter !== "all")
        params.set("status", statusFilter === "used" ? "used" : "unused");
      const res = await fetch(`/api/recharge-codes?${params}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "فشل تحميل الرموز");
        return;
      }

      const data = await res.json();
      setCodes(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleGenerate = async () => {
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      toast.error("المبلغ يجب أن يكون أكبر من صفر");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/recharge-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          count: 1,
          expires_days: parseInt(expiresDays) || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setGeneratedResult(data);
        setShowForm(false);
        loadCodes();
        toast.success("تم توليد الكود بنجاح");
      } else {
        toast.error(data.error || "فشل توليد الكود");
      }
    } catch {
      toast.error("خطأ في توليد الكود");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ الكود!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            رموز الشحن
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} رمز إجمالي</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setGeneratedResult(null);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all min-h-11"
        >
          <Plus size={18} />
          توليد كود جديد
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm animate-fade-in">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ticket size={20} className="text-blue-600" />
            توليد كود شحن
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                المبلغ (د.ع)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm min-h-11"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                صلاحية (أيام)
              </label>
              <input
                type="number"
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm min-h-11"
                placeholder="90"
              />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-11"
          >
            {generating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {generating ? "جاري التوليد..." : "توليد كود"}
          </button>
        </div>
      )}

      {/* Generated Code Result */}
      {generatedResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-600" size={20} />
            <h3 className="text-sm sm:text-lg font-bold text-green-800">
              تم توليد كود بقيمة {generatedResult.amount} د.ع
            </h3>
          </div>
          <div className="flex items-center gap-3 bg-white border border-green-200 rounded-xl p-4">
            <p className="flex-1 font-mono text-lg sm:text-xl text-center font-bold text-gray-900 select-all tracking-wider">
              {generatedResult.codes[0]}
            </p>
            <button
              onClick={() => copyCode(generatedResult.codes[0])}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shrink-0"
            >
              <ClipboardCopy size={16} />
              نسخ
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "unused", "used"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "الكل" : s === "unused" ? "غير مستخدم" : "مستخدم"}
          </button>
        ))}
      </div>

      {/* Codes Table / Cards */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Ticket size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد رموز</p>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="lg:hidden space-y-2">
            {codes.map((code) => (
              <div
                key={code.id}
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-xs text-gray-500">
                    {code.id.slice(0, 8)}
                  </p>
                  <p className="font-bold text-sm text-gray-900">
                    {code.amount} د.ع
                  </p>
                </div>
                <div className="text-left">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      code.is_used
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {code.is_used ? "مستخدم" : "نشط"}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(code.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-right px-6 py-3 font-medium text-gray-500">
                      ID
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">
                      المبلغ
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">
                      الحالة
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">
                      الدُفعة
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">
                      الصلاحية
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">
                      تاريخ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr
                      key={code.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {code.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {code.amount} د.ع
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            code.is_used
                              ? "bg-gray-100 text-gray-500"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {code.is_used ? "مستخدم" : "نشط"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">
                        {code.batch_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString(
                              "ar-SA",
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(code.created_at).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
