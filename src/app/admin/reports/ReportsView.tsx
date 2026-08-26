"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  HardHat,
  Home,
  CheckCircle2,
  Clock,
  Coins,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface ActivityReportItem {
  id: string;
  projectId: string;
  projectName: string;
  blockName: string;
  unitId: string;
  unitNumber: string;
  unitType: string;
  activityName: string;
  category: string;
  contractorName: string;
  contractorCompany: string;
  estimatedCost: number;
  progressPercentage: number;
  status: string;
  totalPaid: number;
  balanceDue: number;
  payments: {
    id: string;
    amount: number;
    payment_date: string;
    payment_type: string | null;
    paid_to: string | null;
    notes: string | null;
  }[];
}

export interface PaymentReportItem {
  id: string;
  projectId: string;
  projectName: string;
  blockName: string;
  unitNumber: string;
  activityName: string;
  contractorName: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  notes: string;
}

interface ReportsViewProps {
  activities: ActivityReportItem[];
  payments: PaymentReportItem[];
  projectOptions: { id: string; name: string }[];
  contractorOptions: string[];
  unitOptions: { unitId: string; label: string; projectId: string }[];
  categoryOptions: string[];
}

type ReportType = "activities" | "payments" | "unit_summary" | "contractor_summary";

export default function ReportsView({
  activities,
  payments,
  projectOptions,
  contractorOptions,
  unitOptions,
  categoryOptions,
}: ReportsViewProps) {
  const [reportType, setReportType] = useState<ReportType>("activities");

  // Customization Filters State
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedContractor, setSelectedContractor] = useState<string>("all");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reset Filters
  function handleResetFilters() {
    setSelectedProjectId("all");
    setSelectedContractor("all");
    setSelectedUnitId("all");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
  }

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      // 1. Project
      if (selectedProjectId !== "all" && item.projectId !== selectedProjectId) return false;
      // 2. Contractor
      if (selectedContractor !== "all") {
        const cMatch =
          item.contractorName.toLowerCase().includes(selectedContractor.toLowerCase()) ||
          item.contractorCompany.toLowerCase().includes(selectedContractor.toLowerCase());
        if (!cMatch) return false;
      }
      // 3. Unit
      if (selectedUnitId !== "all" && item.unitId !== selectedUnitId) return false;
      // 4. Category
      if (selectedCategory !== "all" && item.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      // 5. Status
      if (selectedStatus !== "all") {
        if (selectedStatus === "completed" && item.progressPercentage < 100) return false;
        if (selectedStatus === "in_progress" && (item.progressPercentage === 0 || item.progressPercentage >= 100)) return false;
        if (selectedStatus === "not_started" && item.progressPercentage > 0) return false;
      }
      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ =
          item.activityName.toLowerCase().includes(q) ||
          item.unitNumber.toLowerCase().includes(q) ||
          item.blockName.toLowerCase().includes(q) ||
          item.contractorName.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      return true;
    });
  }, [activities, selectedProjectId, selectedContractor, selectedUnitId, selectedCategory, selectedStatus, searchQuery]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      // 1. Project
      if (selectedProjectId !== "all" && item.projectId !== selectedProjectId) return false;
      // 2. Contractor
      if (selectedContractor !== "all" && !item.contractorName.toLowerCase().includes(selectedContractor.toLowerCase())) return false;
      // 3. Date Range
      if (fromDate && item.paymentDate < fromDate) return false;
      if (toDate && item.paymentDate > toDate) return false;
      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ =
          item.activityName.toLowerCase().includes(q) ||
          item.unitNumber.toLowerCase().includes(q) ||
          item.contractorName.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q) ||
          item.paymentType.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      return true;
    });
  }, [payments, selectedProjectId, selectedContractor, fromDate, toDate, searchQuery]);

  // Unit Summary Aggregation
  const unitSummaryData = useMemo(() => {
    const map = new Map<string, {
      unitKey: string;
      projectName: string;
      blockName: string;
      unitNumber: string;
      totalActivities: number;
      completedActivities: number;
      totalEstimatedCost: number;
      totalDisbursed: number;
      balance: number;
      avgProgress: number;
    }>();

    filteredActivities.forEach((act) => {
      const key = `${act.projectId}-${act.unitId}`;
      const existing = map.get(key);

      const isCompleted = act.progressPercentage >= 100;

      if (existing) {
        existing.totalActivities += 1;
        if (isCompleted) existing.completedActivities += 1;
        existing.totalEstimatedCost += act.estimatedCost;
        existing.totalDisbursed += act.totalPaid;
        existing.balance = existing.totalEstimatedCost - existing.totalDisbursed;
      } else {
        map.set(key, {
          unitKey: key,
          projectName: act.projectName,
          blockName: act.blockName,
          unitNumber: act.unitNumber,
          totalActivities: 1,
          completedActivities: isCompleted ? 1 : 0,
          totalEstimatedCost: act.estimatedCost,
          totalDisbursed: act.totalPaid,
          balance: act.estimatedCost - act.totalPaid,
          avgProgress: act.progressPercentage,
        });
      }
    });

    return Array.from(map.values()).map((u) => ({
      ...u,
      avgProgress: u.totalActivities > 0 ? Math.round((u.completedActivities / u.totalActivities) * 100) : 0,
    }));
  }, [filteredActivities]);

  // Contractor Summary Aggregation
  const contractorSummaryData = useMemo(() => {
    const map = new Map<string, {
      contractorName: string;
      totalAssignedTasks: number;
      completedTasks: number;
      totalEstimatedCost: number;
      totalDisbursed: number;
      balanceDue: number;
    }>();

    filteredActivities.forEach((act) => {
      const cName = act.contractorName || "Unassigned";
      const existing = map.get(cName);
      const isCompleted = act.progressPercentage >= 100;

      if (existing) {
        existing.totalAssignedTasks += 1;
        if (isCompleted) existing.completedTasks += 1;
        existing.totalEstimatedCost += act.estimatedCost;
        existing.totalDisbursed += act.totalPaid;
        existing.balanceDue = existing.totalEstimatedCost - existing.totalDisbursed;
      } else {
        map.set(cName, {
          contractorName: cName,
          totalAssignedTasks: 1,
          completedTasks: isCompleted ? 1 : 0,
          totalEstimatedCost: act.estimatedCost,
          totalDisbursed: act.totalPaid,
          balanceDue: act.estimatedCost - act.totalPaid,
        });
      }
    });

    return Array.from(map.values());
  }, [filteredActivities]);

  // KPI Calculations for active filtered dataset
  const kpis = useMemo(() => {
    const totalEst = filteredActivities.reduce((acc, a) => acc + a.estimatedCost, 0);
    const totalPaid = filteredActivities.reduce((acc, a) => acc + a.totalPaid, 0);
    const balance = totalEst - totalPaid;
    const avgProgress =
      filteredActivities.length > 0
        ? Math.round(
            filteredActivities.reduce((acc, a) => acc + a.progressPercentage, 0) / filteredActivities.length
          )
        : 0;

    return {
      totalEst,
      totalPaid,
      balance,
      avgProgress,
      totalActivities: filteredActivities.length,
      totalPayments: filteredPayments.reduce((acc, p) => acc + p.amount, 0),
    };
  }, [filteredActivities, filteredPayments]);

  // Print Handler
  function handlePrint() {
    window.print();
  }

  // CSV Export Handler
  function handleExportCSV() {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `The_Curve_Report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`;

    if (reportType === "activities") {
      headers = [
        "Project",
        "Block",
        "Unit Number",
        "Unit Type",
        "Activity Name",
        "Category",
        "Contractor",
        "Progress %",
        "Estimated Cost (INR)",
        "Disbursed (INR)",
        "Balance Due (INR)",
      ];
      rows = filteredActivities.map((a) => [
        `"${a.projectName}"`,
        `"${a.blockName}"`,
        `"${a.unitNumber}"`,
        `"${a.unitType}"`,
        `"${a.activityName}"`,
        `"${a.category}"`,
        `"${a.contractorName}"`,
        a.progressPercentage,
        a.estimatedCost,
        a.totalPaid,
        a.balanceDue,
      ]);
    } else if (reportType === "payments") {
      headers = [
        "Payment Date",
        "Project",
        "Block",
        "Unit",
        "Activity",
        "Paid To (Contractor)",
        "Amount (INR)",
        "Payment Mode",
        "Transaction Notes",
      ];
      rows = filteredPayments.map((p) => [
        p.paymentDate,
        `"${p.projectName}"`,
        `"${p.blockName}"`,
        `"${p.unitNumber}"`,
        `"${p.activityName}"`,
        `"${p.contractorName}"`,
        p.amount,
        `"${p.paymentType}"`,
        `"${p.notes || ""}"`,
      ]);
    } else if (reportType === "unit_summary") {
      headers = [
        "Project",
        "Block",
        "Unit Number",
        "Total Activities",
        "Completed Activities",
        "Avg Progress %",
        "Total Estimated Cost (INR)",
        "Total Disbursed (INR)",
        "Balance Due (INR)",
      ];
      rows = unitSummaryData.map((u) => [
        `"${u.projectName}"`,
        `"${u.blockName}"`,
        `"${u.unitNumber}"`,
        u.totalActivities,
        u.completedActivities,
        u.avgProgress,
        u.totalEstimatedCost,
        u.totalDisbursed,
        u.balance,
      ]);
    } else if (reportType === "contractor_summary") {
      headers = [
        "Contractor Name / Company",
        "Total Assigned Tasks",
        "Completed Tasks",
        "Total Estimated Budget (INR)",
        "Total Disbursed (INR)",
        "Balance Payable (INR)",
      ];
      rows = contractorSummaryData.map((c) => [
        `"${c.contractorName}"`,
        c.totalAssignedTasks,
        c.completedTasks,
        c.totalEstimatedCost,
        c.totalDisbursed,
        c.balanceDue,
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Printable Report Branded Header (Visible during Print / PDF Export) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/the-curve-logo.webp" alt="The Curve" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-black">THE CURVE CONSULTANTS</h1>
              <p className="text-xs uppercase font-bold text-slate-700">Real Estate Work &amp; Financial Disbursements Report</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Generated on: {new Date().toLocaleString("en-IN")}</p>
            <p className="text-slate-600">Report Scope: {reportType.toUpperCase().replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Screen Header & Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-5 sm:w-6 h-5 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reports &amp; Analytics
            </h1>
          </div>
        </div>

        {/* Action Buttons: Print & CSV Export */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        {[
          { id: "activities" as ReportType, label: "Work Activities Ledger", desc: "Granular unit-level tasks", icon: Building2 },
          { id: "payments" as ReportType, label: "Financial Payments Register", desc: "Verified disbursements ledger", icon: Coins },
          { id: "unit_summary" as ReportType, label: "Unit Progress Matrix", desc: "Aggregated unit completion", icon: Home },
          { id: "contractor_summary" as ReportType, label: "Contractor Balances", desc: "Contractor totals & payables", icon: HardHat },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-black text-white border-black shadow-md ring-2 ring-slate-900/10"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-700"}`} />
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="font-bold text-xs sm:text-sm">{tab.label}</p>
              <p className={`text-[11px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Interactive Customization & Filter Control Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-5 print:hidden">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Filters
            </h3>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-black font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Project Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="all">🏢 All Projects ({projectOptions.length})</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Contractor Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Contractor
            </label>
            <select
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="all">🔨 All Contractors ({contractorOptions.length})</option>
              {contractorOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Unit Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Project Unit
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="all">🏠 All Units ({unitOptions.length})</option>
              {unitOptions
                .filter((u) => selectedProjectId === "all" || u.projectId === selectedProjectId)
                .map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.label}
                  </option>
                ))}
            </select>
          </div>

          {/* 4. Activity Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Activity Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="all">📂 All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Status Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Progress Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="all">⚡ All Statuses</option>
              <option value="completed">✅ 100% Completed</option>
              <option value="in_progress">⏳ In Progress (1-99%)</option>
              <option value="not_started">⚪ Not Started (0%)</option>
            </select>
          </div>

          {/* 6. Date Range: From */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* 7. Date Range: To */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* 8. Search Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Unit, task, note..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filtered Financial & Progress Summary KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
            Filtered Est. Budget
          </span>
          <p className="text-2xl font-extrabold font-mono text-slate-900">
            ₹{kpis.totalEst.toLocaleString("en-IN")}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Across {filteredActivities.length} items</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block mb-1">
            Total Disbursed (Paid)
          </span>
          <p className="text-2xl font-extrabold font-mono text-emerald-700">
            ₹{kpis.totalPaid.toLocaleString("en-IN")}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {kpis.totalEst > 0 ? Math.round((kpis.totalPaid / kpis.totalEst) * 100) : 0}% of budget
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 block mb-1">
            Outstanding Payable
          </span>
          <p className="text-2xl font-extrabold font-mono text-purple-700">
            ₹{kpis.balance.toLocaleString("en-IN")}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Estimated − Paid</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">
            Verified Progress Avg.
          </span>
          <p className="text-2xl font-extrabold font-mono text-blue-700">
            {kpis.avgProgress}%
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Selected milestone avg.</span>
        </div>
      </div>

      {/* Main Report Table Display */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
              {reportType.replace("_", " ")} Report
            </h3>
          </div>
        </div>

        {/* TAB 1: WORK ACTIVITIES REPORT */}
        {reportType === "activities" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">Project &amp; Unit</th>
                  <th className="py-3 px-3">Activity / Task</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Assigned Contractor</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3 text-right">Est. Cost</th>
                  <th className="py-3 px-3 text-right">Disbursed</th>
                  <th className="py-3 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{a.blockName} — Unit {a.unitNumber}</span>
                        <span className="text-[11px] text-slate-500">{a.projectName}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{a.activityName}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold uppercase border border-slate-200">
                          {a.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {a.contractorName ? `🏢 ${a.contractorName}` : <span className="text-amber-700 font-bold">⚠️ Unassigned</span>}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          a.progressPercentage >= 100 ? "bg-emerald-100 text-emerald-800" : a.progressPercentage > 0 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {a.progressPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{a.estimatedCost.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        ₹{a.totalPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                        ₹{a.balanceDue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                      No activities match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: FINANCIAL PAYMENTS REGISTER */}
        {reportType === "payments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Project &amp; Unit</th>
                  <th className="py-3 px-3">Activity</th>
                  <th className="py-3 px-3">Paid To (Contractor)</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3 text-right">Amount Paid</th>
                  <th className="py-3 px-3">Reference Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {p.paymentDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{p.blockName} — Unit {p.unitNumber}</span>
                        <span className="text-[11px] text-slate-500">{p.projectName}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{p.activityName}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">🏢 {p.contractorName}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-base">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs max-w-xs truncate">{p.notes || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      No payments match the selected date or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: UNIT PROGRESS MATRIX */}
        {reportType === "unit_summary" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">Project &amp; Unit</th>
                  <th className="py-3 px-3">Total Tasks</th>
                  <th className="py-3 px-3">Completed</th>
                  <th className="py-3 px-3">Avg Progress</th>
                  <th className="py-3 px-3 text-right">Total Est. Cost</th>
                  <th className="py-3 px-3 text-right">Total Disbursed</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unitSummaryData.length > 0 ? (
                  unitSummaryData.map((u) => (
                    <tr key={u.unitKey} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{u.blockName} — Unit {u.unitNumber}</span>
                        <span className="text-[11px] text-slate-500">{u.projectName}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{u.totalActivities} Tasks</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">{u.completedActivities} Done</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{u.avgProgress}%</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{u.totalEstimatedCost.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        ₹{u.totalDisbursed.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                        ₹{u.balance.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      No units match the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CONTRACTOR SUMMARY */}
        {reportType === "contractor_summary" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">Contractor / Trade Partner</th>
                  <th className="py-3 px-3">Assigned Tasks</th>
                  <th className="py-3 px-3">Completed</th>
                  <th className="py-3 px-3 text-right">Total Est. Budget</th>
                  <th className="py-3 px-3 text-right">Total Disbursed</th>
                  <th className="py-3 px-3 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractorSummaryData.length > 0 ? (
                  contractorSummaryData.map((c) => (
                    <tr key={c.contractorName} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        🏢 {c.contractorName}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{c.totalAssignedTasks} Activities</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">{c.completedTasks} Done</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{c.totalEstimatedCost.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        ₹{c.totalDisbursed.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                        ₹{c.balanceDue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                      No contractors found for the selected scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Signature & Sign-Off Block (Visible during Print / PDF Export) */}
      <div className="hidden print:block pt-12 mt-12 border-t border-slate-300 text-xs">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="border-t border-slate-400 pt-2 font-bold">Prepared By (Site Engineer)</p>
          </div>
          <div>
            <p className="border-t border-slate-400 pt-2 font-bold">Verified By (Project Lead)</p>
          </div>
          <div>
            <p className="border-t border-slate-400 pt-2 font-bold">Approved By (Administrator)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
