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
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
} from "lucide-react";

export type UserRoleType = "admin" | "employee" | "contractor" | "owner";

export default function AdminManualPage() {
  const [selectedRole, setSelectedRole] = useState<UserRoleType>("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("overview");

  const roleConfig = {
    admin: {
      badge: "Administrator Manual",
      title: "The Curve — Administrator Master Manual",
      subtitle: "Full control over projects, structural blocks, unit checklists, activity master templates, contractor assignments, payment disbursements, and audit logs.",
    },
    employee: {
      badge: "Site Engineer / Supervisor Guide",
      title: "The Curve — Site Engineer Operations Manual",
      subtitle: "Provision unit work activities, assign contractors, record site inspections, upload geo-tagged photos, and update progress milestones.",
    },
    contractor: {
      badge: "Contractor Portal Guide",
      title: "The Curve — Contractor Work & Task Guide",
      subtitle: "Access assigned work orders, check unit specifications, track completion milestones, and view inspection history.",
    },
    owner: {
      badge: "Owner / Investor Guide",
      title: "The Curve — Owner & Investor Dashboard Manual",
      subtitle: "Monitor real-time project progress, review unit inspection photos, track financial disbursements, and download milestone summaries.",
    },
  }[selectedRole];

  const sections = getRoleSections(selectedRole);

  const filteredSections = sections.filter(
    (s) =>
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const activeSection = sections.find((s) => s.id === selectedSection) || filteredSections[0] || sections[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {roleConfig.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">v1.2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              System User Manual &amp; Operations Guide
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
            placeholder="Search guides &amp; instructions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Role Navigation Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "admin" as UserRoleType, label: "Administrator", icon: ShieldCheck },
          { id: "employee" as UserRoleType, label: "Site Engineer", icon: Layers },
          { id: "contractor" as UserRoleType, label: "Contractor", icon: HardHat },
          { id: "owner" as UserRoleType, label: "Project Owner", icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedRole === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedRole(tab.id);
                setSelectedSection("overview");
              }}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-black text-white border-black shadow-md ring-2 ring-slate-900/10"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500"}`} />
                <span className="text-xs sm:text-sm font-bold">{tab.label}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Main Documentation Viewer: Left Index | Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Left Side: Topic Navigator */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Topics Index ({filteredSections.length})
          </span>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredSections.map((section) => {
              const isSelected = activeSection?.id === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
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

        {/* Right Side: Detailed Guide Content */}
        <div className="lg:col-span-8 space-y-6 lg:pl-2">
          {activeSection ? (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Topic Guide
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeSection.title}
                </h2>
              </div>

              {/* Instructions List / Cards */}
              <div className="space-y-3.5">
                {activeSection.steps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 pl-7 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro Tips & Notes */}
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
              No matching topic found. Try another search keyword.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Role-Specific Manual Content Definitions
// -----------------------------------------------------------------------------
function getRoleSections(role: UserRoleType) {
  switch (role) {
    case "admin":
      return [
        {
          id: "overview",
          title: "System Overview & Administration Architecture",
          content: "The Curve system provides centralized oversight for construction management, team assignments, activity masters, and milestone disbursements.",
          steps: [
            {
              title: "Project & Site Configuration",
              desc: "Create and manage projects, define towers/blocks, and generate unit inventories across floors.",
            },
            {
              title: "Activity Master Catalog",
              desc: "Manage standard construction codes, units of measurement, and default trade templates.",
            },
            {
              title: "Direct Activity Payment Disbursements",
              desc: "Use the Work Activities & Disbursement Console on the Dashboard to record payments against verified progress percentages.",
            },
            {
              title: "Immutable Audit Logs",
              desc: "Track every payment, user deletion, credential reset, and milestone change with actor timestamps.",
            },
          ],
          tips: "Always ensure contractors are assigned to unit activities before recording payments to maintain accurate contractor financial ledgers.",
        },
        {
          id: "user-management",
          title: "Creating & Managing User Accounts",
          content: "Issue secure login credentials to Site Engineers, Contractors, and Project Owners.",
          steps: [
            {
              title: "Navigate to User Accounts",
              desc: "Open the User Accounts tab from the left menu to view the full directory.",
            },
            {
              title: "Create Account",
              desc: "Fill in Full Name, 10-digit Mobile Number, Role (Engineer, Contractor, Owner, Admin), and generate a secure password.",
            },
            {
              title: "Password Resets",
              desc: "Administrators can set a new password at any time without email verification.",
            },
          ],
          tips: "Mobile numbers are used as the primary login identifier across mobile apps and web.",
        },
        {
          id: "payments-workflow",
          title: "Milestone Disbursements & Payment Ledger",
          content: "Record milestone disbursements directly to assigned contractors based on verified site progress.",
          steps: [
            {
              title: "Open Payment Console on Dashboard",
              desc: "Select the target Project and Unit from the Dashboard console.",
            },
            {
              title: "Click 'Record Payment'",
              desc: "The modal automatically locks to the selected activity and pre-selects the assigned contractor.",
            },
            {
              title: "Enter Amount & Mode",
              desc: "Enter the disbursement amount (blank by default), choose payment mode (NEFT/RTGS, UPI, Cheque, Cash), and save.",
            },
          ],
          tips: "If an activity is unassigned, click '+ Assign Contractor' first to bind the contractor before disbursing funds.",
        },
      ];

    case "employee":
      return [
        {
          id: "overview",
          title: "Site Engineer Daily Operations & Checklists",
          content: "Site Engineers supervise unit construction, verify milestone completion, and upload site photos.",
          steps: [
            {
              title: "Access Assigned Projects",
              desc: "Sign in with your mobile number to view all development projects assigned to you.",
            },
            {
              title: "Unit Work Activities Checklist",
              desc: "Select any unit to view its live checklist of structural and finishing activities.",
            },
            {
              title: "Update Verified Progress %",
              desc: "Adjust the progress slider from 0% to 100% based on physical on-site inspection.",
            },
            {
              title: "Upload Inspection Photos",
              desc: "Capture or upload live camera photos to document completed milestones.",
            },
          ],
          tips: "Take clear, well-lit photos showing completed milestones for owner verification.",
        },
      ];

    case "contractor":
      return [
        {
          id: "overview",
          title: "Contractor Task Portal & Completion Reports",
          content: "Civil, electrical, plumbing, and finishing contractors use this portal to track assigned tasks.",
          steps: [
            {
              title: "View Assigned Work Orders",
              desc: "Sign in to see all unit activities assigned specifically to your company.",
            },
            {
              title: "Track Milestone Progress",
              desc: "Check completion percentages and inspect site requirements before starting work.",
            },
            {
              title: "Disbursement History",
              desc: "View verified payments and outstanding milestone balances.",
            },
          ],
          tips: "Coordinate with Site Engineers on-site to inspect work before requesting final milestone disbursements.",
        },
      ];

    case "owner":
      return [
        {
          id: "overview",
          title: "Owner Financial Portfolio & Milestone Audit",
          content: "Project owners and investors monitor real-time construction progress and financial health.",
          steps: [
            {
              title: "Portfolio Summary",
              desc: "View aggregated project budget, total disbursed funds, and remaining balance due.",
            },
            {
              title: "Site Inspection Gallery",
              desc: "Review high-resolution verified inspection photos uploaded by field engineers.",
            },
            {
              title: "Disbursement Audit",
              desc: "Inspect the complete payment register across all contractors and construction milestones.",
            },
          ],
          tips: "Click on any project to drill down into block-level and unit-level progress breakdowns.",
        },
      ];
  }
}
