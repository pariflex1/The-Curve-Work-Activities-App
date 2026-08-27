"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Building2,
  HardHat,
  Users,
  Coins,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Lock,
  Download,
  Eye,
  Sliders,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export type UserRoleType = "admin" | "employee" | "contractor" | "owner";

interface ManualStep {
  title: string;
  desc: string;
}

interface ManualSection {
  id: string;
  title: string;
  badge?: string;
  content: string;
  image?: {
    src: string;
    caption: string;
  };
  steps: ManualStep[];
  tips?: string;
}

export default function AdminManualPage() {
  const [selectedRole, setSelectedRole] = useState<UserRoleType>("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("overview");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const roleConfig = {
    admin: {
      badge: "Administrator Master Guide",
      title: "The Curve — Administrator Operations Manual",
      subtitle:
        "Comprehensive guide for managing projects, structural blocks, unit activities, contractor allocations, payment disbursements, reports, and security audit logs.",
    },
    employee: {
      badge: "Site Engineer Guide",
      title: "The Curve — Site Engineer Field Operations Manual",
      subtitle:
        "Step-by-step workflow for unit activity provisioning, contractor task assignment, milestone progress reporting, and photo-verified inspections.",
    },
    contractor: {
      badge: "Contractor Portal Guide",
      title: "The Curve — Contractor Task & Disbursement Guide",
      subtitle:
        "Guide for trade contractors to track assigned work orders, check unit technical specifications, monitor completion status, and review payment disbursements.",
    },
    owner: {
      badge: "Owner & Investor Guide",
      title: "The Curve — Owner & Investor Transparency Manual",
      subtitle:
        "Executive oversight guide to monitor real-time project progress, inspect verified site photos, track financial disbursements, and review audit records.",
    },
  }[selectedRole];

  const sections = getRoleSections(selectedRole);

  const filteredSections = sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query) ||
      s.steps.some(
        (st) =>
          st.title.toLowerCase().includes(query) ||
          st.desc.toLowerCase().includes(query)
      )
    );
  });

  const activeSection =
    filteredSections.find((s) => s.id === selectedSectionId) ||
    filteredSections[0] ||
    sections[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/60">
                {roleConfig.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.0 (Latest)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              System User Manual &amp; Visual Operations Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {roleConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, workflows, tips..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Role Navigation Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "admin" as UserRoleType, label: "Administrator", icon: ShieldCheck, desc: "Master controls" },
          { id: "employee" as UserRoleType, label: "Site Engineer", icon: Layers, desc: "Field inspections" },
          { id: "contractor" as UserRoleType, label: "Contractor", icon: HardHat, desc: "Assigned tasks" },
          { id: "owner" as UserRoleType, label: "Project Owner", icon: Coins, desc: "Executive oversight" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedRole === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedRole(tab.id);
                setSelectedSectionId("overview");
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between text-left cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                  <span className="text-xs sm:text-sm font-bold">{tab.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <span className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Documentation Viewer: Left Index | Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Left Side: Topic Navigator */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topics ({filteredSections.length})
            </span>
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredSections.map((section) => {
              const isSelected = activeSection?.id === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700"
                  }`}
                >
                  <span className="truncate">{section.title}</span>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Guide Content with Screenshot */}
        <div className="lg:col-span-8 space-y-6 lg:pl-2">
          {activeSection ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {activeSection.badge || "Instruction"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeSection.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {activeSection.content}
                </p>
              </div>

              {/* Embedded Screenshot / Visual Guide */}
              {activeSection.image && (
                <div className="space-y-2">
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 shadow-xs">
                    <img
                      src={activeSection.image.src}
                      alt={activeSection.image.caption}
                      className="w-full h-auto object-cover max-h-[360px] cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                      onClick={() => setLightboxImage(activeSection.image?.src || null)}
                    />
                    <div
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => setLightboxImage(activeSection.image?.src || null)}
                    >
                      <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 shadow-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Click to enlarge screenshot
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic text-center">
                    📸 Figure: {activeSection.image.caption}
                  </p>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Instructions
                </h3>
                {activeSection.steps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 pl-7 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Best Practice Tips */}
              {activeSection.tips && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Best Practice Tip</span>
                  </div>
                  <p className="leading-relaxed pl-5.5 text-slate-700">
                    {activeSection.tips}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No matching topics found. Try searching with different keywords.
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Screenshots */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={lightboxImage}
              alt="Screenshot Preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <p className="text-white text-xs mt-3 bg-black/60 px-4 py-1.5 rounded-full">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Role-Specific Manual Data
// -----------------------------------------------------------------------------
function getRoleSections(role: UserRoleType): ManualSection[] {
  switch (role) {
    case "admin":
      return [
        {
          id: "overview",
          title: "1. Administrator Work Activities & Payment Console",
          badge: "Console & Payments",
          content:
            "Central control center to monitor unit work activities, verify progress %, assign contractors, and disburse milestone payments directly.",
          image: {
            src: "/manual/admin_console_guide.jpg",
            caption: "Admin Work Activities & Payment Console showing project filters, activity table, status, and disbursement actions.",
          },
          steps: [
            {
              title: "Select Project, Block & Unit",
              desc: "Use the top filters on the Dashboard to instantly scope the console to a specific Project (e.g. Skyline Heights), Tower/Block, and Unit (e.g. Flat 302).",
            },
            {
              title: "View Live Work Activities Checklist",
              desc: "Review real-time completion status badges (Pending, In Progress, Completed), verified progress % bars, and assigned contractor trade agencies.",
            },
            {
              title: "Assign or Reassign Contractors",
              desc: "Click '+ Assign Contractor' on any unassigned activity row to link the registered contractor company.",
            },
            {
              title: "Record Direct Milestone Payment",
              desc: "Click 'Record Payment' on an active task to disburse funds. The modal locks to the task, pre-selects the contractor, and accepts amount, mode, and reference notes.",
            },
          ],
          tips: "Financial calculations update instantly upon payment submission. All payments are permanently recorded in Reports and Audit Logs.",
        },
        {
          id: "projects-hierarchy",
          title: "2. Real Estate Hierarchy & Team Allocations",
          badge: "Hierarchy & Team",
          content:
            "Create multi-tier real estate developments: Projects → Towers/Blocks → Units/Flats, and allocate field personnel.",
          image: {
            src: "/manual/team_hierarchy_guide.jpg",
            caption: "Project Configuration screen showing Towers/Blocks inventory and Team Allocation for Site Engineers & Contractors.",
          },
          steps: [
            {
              title: "Navigate to Projects",
              desc: "Click 'Projects' from the left sidebar navigation to view and create development projects.",
            },
            {
              title: "Structure Blocks & Towers",
              desc: "Open any project and click 'Add Block' to define towers (e.g., Tower A, Tower B) with customized sort ordering.",
            },
            {
              title: "Configure Unit Inventory",
              desc: "Inside any block, click 'Add Unit' to specify the unit number, floor, area in sq.ft, and configuration (e.g., 2 BHK, 3 BHK).",
            },
            {
              title: "Allocate Site Engineers & Contractors",
              desc: "Use the 'Manage Team' section to link Site Engineers and Contractors (with Trade Agency names) to the project.",
            },
          ],
          tips: "Team members only see data for projects they are explicitly allocated to, ensuring clean tenant isolation.",
        },
        {
          id: "user-accounts",
          title: "3. User Accounts & Credential Management",
          badge: "Security & Users",
          content:
            "Issue secure mobile-based accounts to Site Engineers, Contractors, and Project Owners with one-click password resets.",
          steps: [
            {
              title: "Open User Accounts Tab",
              desc: "Access '/admin/users' to inspect all registered platform accounts with active role filters.",
            },
            {
              title: "Create User Account",
              desc: "Provide Full Name, 10-digit Mobile Number, assigned Role, and use the 'Generate Password' tool for instant secure credentials.",
            },
            {
              title: "Instant Password Resets",
              desc: "Click 'Reset Password' on any user row to set a new password instantly without waiting for email tokens.",
            },
            {
              title: "Password-Protected Account Deletion",
              desc: "Deleting an account requires entering your Administrator login password to prevent accidental removals.",
            },
          ],
          tips: "Users log in using their 10-digit mobile number across web and mobile PWA applications.",
        },
        {
          id: "activity-master",
          title: "4. Master Construction Activity Catalog",
          badge: "Catalog Templates",
          content:
            "Standardize construction milestones, trade codes, and measurement units across the enterprise.",
          steps: [
            {
              title: "Access Activity Master",
              desc: "Navigate to '/admin/activity-master' to view standard templates (Foundation, RCC, Plaster, MEP, Tiling, Painting).",
            },
            {
              title: "Add New Standard Activity",
              desc: "Define Activity Code, Activity Name, Category, Unit of Measurement (Sq.Ft, R.Ft, Lump Sum, Nos), and default order.",
            },
            {
              title: "Independent Unit Provisioning",
              desc: "Master catalog changes do not overwrite existing unit activity records, ensuring total historical integrity.",
            },
          ],
          tips: "Active templates in this catalog appear directly in the Site Engineer's batch provisioning checklist.",
        },
        {
          id: "reports-exports",
          title: "5. Comprehensive Reports & Data Exports",
          badge: "Financial Analytics",
          content:
            "Generate printable executive summaries, contractor payment ledgers, and download CSV data exports.",
          image: {
            src: "/manual/reports_export_guide.jpg",
            caption: "Reports and Exports dashboard showing financial summary cards, contractor payment voucher ledger, and CSV/PDF export options.",
          },
          steps: [
            {
              title: "Navigate to Reports & Exports",
              desc: "Open '/admin/reports' from the menu navigation.",
            },
            {
              title: "Filter by Project & Date Range",
              desc: "Select specific projects or date intervals (Last 30 Days, Last 90 Days, or All Time).",
            },
            {
              title: "Review Financial Summary Cards",
              desc: "Inspect Total Project Budget, Total Disbursed Funds, and Remaining Balance Due in real-time.",
            },
            {
              title: "Export CSV or Download PDF",
              desc: "Click 'Export CSV' for spreadsheet analysis in Excel or 'Download PDF Report' for print-ready executive vouchers.",
            },
          ],
          tips: "Reports include contractor names, activity milestones, disbursement dates, payment modes, and voucher reference numbers.",
        },
        {
          id: "audit-logs",
          title: "6. Immutable Audit Trail & Security Logs",
          badge: "Audit & Compliance",
          content:
            "Every sensitive database mutation (payments, deletions, allocations, progress updates) is immutably logged with actor details.",
          steps: [
            {
              title: "Inspect Audit Logs",
              desc: "Go to '/admin/audit-logs' to review timestamped activity entries.",
            },
            {
              title: "Filter by Action & Actor",
              desc: "Filter logs by action type (CREATE_PAYMENT, DELETE_UNIT, UPDATE_PROGRESS, USER_RESET_PASSWORD).",
            },
            {
              title: "Inspect Payload Diffs",
              desc: "Expand any log record to view exact before/after data states.",
            },
          ],
          tips: "Audit records are immutable and cannot be edited or deleted by any user role.",
        },
      ];

    case "employee":
      return [
        {
          id: "overview",
          title: "1. Site Engineer Field Operations & Inspections",
          badge: "Field Inspections",
          content:
            "Site Engineers supervise construction on-site, provision unit task checklists, assign trade contractors, and file verified photo inspection reports.",
          image: {
            src: "/manual/site_inspection_guide.jpg",
            caption: "Site Engineer Inspection modal with 0-100% progress slider, milestone buttons, field notes, and camera photo verification.",
          },
          steps: [
            {
              title: "Log in to Site Engineer Dashboard",
              desc: "Sign in with your registered mobile number to see all projects assigned to your supervision.",
            },
            {
              title: "Select Unit Work Checklist",
              desc: "Open any project block and select the target unit to view the active construction checklist.",
            },
            {
              title: "Conduct Site Inspection",
              desc: "Click 'Record Inspection' on any activity to open the verified inspection dialog.",
            },
            {
              title: "Set Progress % & Upload Photos",
              desc: "Use the progress slider (0% to 100%) or quick milestone buttons (25%, 50%, 75%, 100%), enter site notes, and upload camera photos as visual verification.",
            },
            {
              title: "Submit Inspection Report",
              desc: "Click 'Submit Inspection Report' to instantly update the project progress and contractor status.",
            },
          ],
          tips: "Take clear photos in good lighting. Uploaded photos are instantly visible to the Administrator and Project Owner.",
        },
        {
          id: "provisioning",
          title: "2. Provisioning Unit Activities (3 Modes)",
          badge: "Task Provisioning",
          content:
            "Easily configure tasks for any unit using 3 flexible provisioning workflows.",
          steps: [
            {
              title: "Mode A: Single Custom Activity",
              desc: "Type a custom task name, specify estimated budget, and bind unit notes directly.",
            },
            {
              title: "Mode B: Batch from Master Templates",
              desc: "Check off multiple standard templates (RCC, Plaster, Flooring, Painting) and provision them in bulk with one click.",
            },
            {
              title: "Mode C: Clone from Another Unit",
              desc: "Copy all configured activities and estimated costs from an existing configured flat in the same project.",
            },
          ],
          tips: "Cloning from standard typical units saves significant setup time on high-rise residential towers.",
        },
        {
          id: "contractor-delegation",
          title: "3. Assigning & Managing Trade Contractors",
          badge: "Contractor Delegation",
          content:
            "Delegate specific unit activities to assigned trade contractors (plumbing, electrical, civil, tiling).",
          steps: [
            {
              title: "Open Unit Activity Row",
              desc: "Locate the activity on the unit checklist.",
            },
            {
              title: "Select Contractor Agency",
              desc: "Choose the trade contractor company from the dropdown menu (e.g., Apex Electricals).",
            },
            {
              title: "Contractor Instant Sync",
              desc: "The task immediately appears in the contractor's mobile portal under their active work queue.",
            },
          ],
          tips: "Only contractors allocated to the project by the Administrator will appear in the dropdown list.",
        },
      ];

    case "contractor":
      return [
        {
          id: "overview",
          title: "1. Contractor Portal & Work Orders",
          badge: "Contractor Portal",
          content:
            "Dedicated portal for trade agencies to track assigned unit tasks, check specifications, and review milestone disbursements.",
          steps: [
            {
              title: "Sign in with Mobile Number",
              desc: "Log in to access all work orders assigned to your trade agency across active projects.",
            },
            {
              title: "View Assigned Unit Tasks",
              desc: "Tasks are organized by Project, Tower/Block, and Unit number with clear milestone targets.",
            },
            {
              title: "Check Verified Progress %",
              desc: "Monitor official milestone progress percentages and engineer inspection logs.",
            },
            {
              title: "Payment Disbursement Ledger",
              desc: "Review disbursements released to your company with payment modes, dates, and voucher references.",
            },
          ],
          tips: "Upon completing work on site, request the Site Engineer to conduct an inspection to record verified completion.",
        },
        {
          id: "inspection-protocol",
          title: "2. Inspection & Sign-off Protocol",
          badge: "Verification Protocol",
          content:
            "Understand how milestone completions are verified and signed off for payment release.",
          steps: [
            {
              title: "Complete On-Site Work",
              desc: "Finish the physical construction milestone according to technical specifications.",
            },
            {
              title: "Notify Site Engineer",
              desc: "Request on-site physical inspection from the supervising Site Engineer.",
            },
            {
              title: "Inspection Sign-Off",
              desc: "The engineer captures verification photos, logs notes, and records the completion percentage in the system.",
            },
          ],
          tips: "Disbursements are processed by the Administrator following verified engineer inspection sign-off.",
        },
      ];

    case "owner":
      return [
        {
          id: "overview",
          title: "1. Owner & Investor Executive Dashboard",
          badge: "Executive Transparency",
          content:
            "Real-time visibility into overall project health, tower-by-tower progress, financial disbursements, and verified photo timeline.",
          steps: [
            {
              title: "Sign in to Owner Dashboard",
              desc: "Access your portfolio to view overall project progress percentages and active block milestones.",
            },
            {
              title: "Track Financial Disbursements",
              desc: "Monitor Total Estimated Budget, Total Funds Disbursed, and Remaining Balance Due in real-time.",
            },
            {
              title: "Inspect Verified Site Photo Gallery",
              desc: "Browse high-resolution, time-stamped inspection photos uploaded directly from the job site by engineers.",
            },
            {
              title: "Review Milestone Breakdown",
              desc: "Drill down into individual towers and flats to see granular completion status for civil, electrical, and finishing tasks.",
            },
          ],
          tips: "The Owner Portal provides read-only executive transparency with live data synchronization.",
        },
      ];
  }
}
