"use client";

import { useState } from "react";
import {
  BookOpen,
  X,
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
  ShieldAlert,
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Eye,
} from "lucide-react";

export type UserRoleType = "admin" | "employee" | "contractor" | "owner";

interface UserManualModalProps {
  role: UserRoleType;
  triggerLabel?: string;
  className?: string;
}

export default function UserManualModal({
  role,
  triggerLabel = "User Manual",
  className = "",
}: UserManualModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("overview");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Role metadata and title config
  const roleConfig = {
    admin: {
      badge: "Administrator Master Guide",
      title: "The Curve — Administrator User Manual",
      subtitle:
        "Full control over projects, blocks, units, activity catalogs, team allocations, payments, reports, and audit logs.",
    },
    employee: {
      badge: "Site Engineer / Supervisor Guide",
      title: "The Curve — Site Engineer Operational Manual",
      subtitle:
        "Provision unit work activities, assign contractors, record site inspections, upload geo-tagged photos, and update progress.",
    },
    contractor: {
      badge: "Contractor Portal Guide",
      title: "The Curve — Contractor Work & Task Guide",
      subtitle:
        "Access assigned work orders, check unit specifications, track completion milestones, and view disbursement records.",
    },
    owner: {
      badge: "Owner & Investor Guide",
      title: "The Curve — Owner & Investor Dashboard Manual",
      subtitle:
        "Monitor real-time project progress, review unit inspection photos, track financial disbursements, and download milestone summaries.",
    },
  }[role];

  // Manual sections based on role
  const sections = getRoleSections(role);

  // Filter sections by search query
  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "px-3.5 py-2 rounded-full bg-[#FFE5CC] hover:bg-[#FF7903] text-[#933D00] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all border border-[#FFD4AA] min-h-[38px] cursor-pointer"
        }
      >
        <BookOpen className="w-4 h-4 text-[#FF7903]" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FF7903] text-white flex items-center justify-center shadow-md shadow-[#FF7903]/20 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {roleConfig.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v2.0</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {roleConfig.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search manual..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Navigation Sidebar + Content Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Table of Contents / Sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 p-3 sm:p-4 overflow-y-auto space-y-1 shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Topics
                </p>
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      selectedSection === sec.id
                        ? "bg-[#FF7903] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-[#FFE5CC]/50"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        selectedSection === sec.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6">
                {filteredSections.find((s) => s.id === selectedSection) ? (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {filteredSections.find((s) => s.id === selectedSection)?.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {filteredSections.find((s) => s.id === selectedSection)?.description}
                      </p>
                    </div>

                    {/* Screenshot if available in section */}
                    {filteredSections.find((s) => s.id === selectedSection)?.image && (
                      <div className="space-y-1.5">
                        <div
                          className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs cursor-pointer"
                          onClick={() =>
                            setLightboxImage(
                              filteredSections.find((s) => s.id === selectedSection)?.image
                                ?.src || null
                            )
                          }
                        >
                          <img
                            src={
                              filteredSections.find((s) => s.id === selectedSection)?.image
                                ?.src
                            }
                            alt="Guide Screenshot"
                            className="w-full h-auto object-cover max-h-[300px]"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-slate-900 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" /> Enlarge
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 italic text-center">
                          {filteredSections.find((s) => s.id === selectedSection)?.image?.caption}
                        </p>
                      </div>
                    )}

                    <div className="prose prose-slate prose-xs max-w-none text-slate-700 space-y-4">
                      {filteredSections.find((s) => s.id === selectedSection)?.renderedContent}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No matching topics found</p>
                    <p className="text-xs text-slate-500">
                      Try searching for keywords like "provision", "progress", "payment", or "password".
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>The Curve Real Estate Work Management System</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={lightboxImage}
              alt="Screenshot Preview"
              className="max-w-full max-h-[85vh] mx-auto rounded-2xl shadow-2xl border border-white/20"
            />
            <p className="text-white text-xs text-center mt-3 bg-black/60 px-4 py-1 rounded-full w-max mx-auto">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
// Content Definitions for Each Role
// ----------------------------------------------------------------------

interface Section {
  id: string;
  title: string;
  description?: string;
  content: string;
  keywords?: string[];
  image?: {
    src: string;
    caption: string;
  };
  renderedContent: React.ReactNode;
}

function getRoleSections(role: UserRoleType): Section[] {
  if (role === "admin") {
    return [
      {
        id: "overview",
        title: "1. Work Activities & Disbursement Console",
        description: "Direct activity status oversight and milestone payments",
        keywords: ["admin", "console", "payments", "activities", "overview"],
        content: "Select Project, Block, Unit and record direct contractor milestone disbursements.",
        image: {
          src: "/manual/admin_console_guide.jpg",
          caption: "Admin Work Activities & Payment Console with unit filtering, status, and disbursement controls.",
        },
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              The <strong>Work Activities &amp; Payment Console</strong> is the primary operational hub on your Administrator Dashboard.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li><strong>Select Unit:</strong> Pick Project, Block/Tower, and Unit Number from the top dropdowns.</li>
              <li><strong>Check Progress:</strong> View progress % bars and status badges (Pending, In Progress, Completed).</li>
              <li><strong>Assign Contractor:</strong> Click <em>+ Assign Contractor</em> to bind trade agencies to unassigned tasks.</li>
              <li><strong>Record Payment:</strong> Click <em>Record Payment</em> to disburse funds. The dialog auto-locks to the task and contractor.</li>
            </ol>
          </div>
        ),
      },
      {
        id: "projects-blocks-units",
        title: "2. Projects, Blocks & Team Allocations",
        description: "Creating hierarchy and assigning field supervisors",
        keywords: ["create project", "block", "unit", "team", "engineer", "contractor"],
        content: "Structure development towers, units, and link Site Engineers and Contractors.",
        image: {
          src: "/manual/team_hierarchy_guide.jpg",
          caption: "Project Configuration showing Towers/Blocks inventory and Team Allocation.",
        },
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <ol className="list-decimal list-inside space-y-2 font-medium text-slate-700">
              <li>Navigate to <code>/admin/projects</code> and create your development project.</li>
              <li>Add <strong>Blocks/Towers</strong> (e.g., Tower A) and configure <strong>Units</strong> (floor, area sq.ft, flat type).</li>
              <li>Under <strong>Manage Team</strong>, assign Site Engineers, Trade Contractors (with company agency names), and Project Owners.</li>
            </ol>
          </div>
        ),
      },
      {
        id: "reports-exports",
        title: "3. Reports & Financial Exports",
        description: "Exporting ledgers, vouchers, and downloading PDF/CSV files",
        keywords: ["reports", "export", "csv", "pdf", "financials"],
        content: "Generate contractor payment vouchers, audit summaries, and export CSV/PDF reports.",
        image: {
          src: "/manual/reports_export_guide.jpg",
          caption: "Reports and Exports ledger with filter options and PDF/CSV download buttons.",
        },
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>Under <code>/admin/reports</code>:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Filter payment vouchers by Project and Date Range (Last 30 Days, Last 90 Days, All Time).</li>
              <li>Inspect <strong>Total Budget</strong>, <strong>Disbursed Funds</strong>, and <strong>Remaining Balance</strong>.</li>
              <li>Click <strong>Export CSV</strong> for spreadsheets or <strong>Download PDF Report</strong> for print-ready vouchers.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "security-deletions",
        title: "4. Security & Password Protected Deletions",
        description: "Preventing accidental data loss with mandatory authentication",
        keywords: ["password", "delete", "security", "protect", "audit"],
        content: "All delete actions require your account password. Full audit logs record every sensitive mutation.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-950">Mandatory Password Confirmation</p>
                <p className="mt-0.5">
                  Deleting any project, tower, unit, activity, payment, or user account strictly requires entering your administrator password.
                </p>
              </div>
            </div>
            <p>
              All mutations are recorded permanently in the <strong>Audit Logs</strong> (<code>/admin/audit-logs</code>).
            </p>
          </div>
        ),
      },
    ];
  }

  if (role === "employee") {
    return [
      {
        id: "overview",
        title: "1. Site Engineer Field Operations",
        description: "Daily workflow for unit checklists and physical inspections",
        keywords: ["engineer", "employee", "overview", "site", "inspection"],
        content: "Site Engineers supervise unit construction, verify milestone completion, and upload site photos.",
        image: {
          src: "/manual/site_inspection_guide.jpg",
          caption: "Site Engineer Inspection dialog with 0-100% progress slider, milestone buttons, and verified photos.",
        },
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>As a <strong>Site Engineer</strong>, you supervise physical construction on site:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>Open your assigned project from the Site Engineer dashboard.</li>
              <li>Select any Unit to open its active work checklist.</li>
              <li>Click <strong>Record Inspection</strong> on any task to adjust the verified progress percentage (0-100%).</li>
              <li>Upload live camera photos from the job site and add physical verification notes.</li>
              <li>Submit the inspection to synchronize with the Admin and Owner portals.</li>
            </ol>
          </div>
        ),
      },
      {
        id: "provisioning",
        title: "2. Provisioning Activities to a Unit",
        description: "3 flexible ways to add tasks to any unit",
        keywords: ["provision", "template", "copy", "custom", "add activity"],
        content: "Use Single Custom Activity, Batch Template Checklist, or Copy From Another Unit.",
        renderedContent: (
          <div className="space-y-3 text-xs sm:text-sm font-medium text-slate-700">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
              <p className="font-bold text-blue-900">Mode A: Single Custom Activity</p>
              <p className="text-xs text-blue-800 mt-1">
                Type a custom task name, set estimated cost and specific floor notes.
              </p>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <p className="font-bold text-emerald-900">Mode B: Batch from Master Templates</p>
              <p className="text-xs text-emerald-800 mt-1">
                Check off multiple master activities (RCC, Plaster, MEP, Tiling) and batch provision them at once.
              </p>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <p className="font-bold text-amber-900">Mode C: Copy From Another Unit (Clone)</p>
              <p className="text-xs text-amber-800 mt-1">
                Clone all activities and estimated rates from another completed or configured unit in the project.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "assign-contractor",
        title: "3. Assigning Contractors to Activities",
        description: "Allocating work orders to registered trade agencies",
        keywords: ["contractor", "assign", "delegate", "reassign"],
        content: "Use the Contractor dropdown on any activity row to assign or change the executing contractor.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              Select the contractor agency from the dropdown on any unit activity row. Assigned tasks immediately appear in the contractor's personal portal.
            </p>
          </div>
        ),
      },
    ];
  }

  if (role === "contractor") {
    return [
      {
        id: "overview",
        title: "1. Contractor Portal Overview",
        description: "Viewing assigned works and specifications",
        keywords: ["contractor", "work", "tasks", "my work"],
        content: "Contractors can view all units and work activities assigned to their trade agency across projects.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              Welcome to the <strong>Contractor Portal</strong>. Sign in with your mobile number to view:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Assigned tasks grouped by Project, Tower, and Unit.</li>
              <li>Unit technical specifications and milestone target dates.</li>
              <li>Official milestone completion percentages verified by Site Engineers.</li>
              <li>Payment disbursement history released to your agency.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "inspection-process",
        title: "2. Inspection & Sign-off Protocol",
        description: "How completed work is reviewed and signed off",
        keywords: ["inspection", "sign off", "engineer", "verification"],
        content: "When work on site is completed, notify the Site Engineer to conduct an inspection.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <p className="font-bold">Engineer Verification Requirement</p>
              <p>
                To maintain audit compliance, inspection reports and progress updates are officially verified and signed off by the Site Engineer on site before payment release.
              </p>
            </div>
          </div>
        ),
      },
    ];
  }

  // Owner Role
  return [
    {
      id: "overview",
      title: "1. Owner & Investor Dashboard",
      description: "Transparency into construction progress and financials",
      keywords: ["owner", "investor", "progress", "financials"],
      content: "Owners have comprehensive real-time transparency into project milestones, inspection photos, and financial payment records.",
      image: {
        src: "/manual/reports_export_guide.jpg",
        caption: "Owner financial portfolio and disbursement tracking overview.",
      },
      renderedContent: (
        <div className="space-y-4 text-xs sm:text-sm">
          <p>
            Welcome to the <strong>Owner &amp; Investor Portal</strong>. Monitor your real estate assets in real-time:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-blue-950">Overall Completion</p>
              <p className="text-xs text-blue-800">Real-time aggregate progress across all blocks and units.</p>
            </div>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-emerald-950">Financial Balances</p>
              <p className="text-xs text-emerald-800">Total budget, funds disbursed, and remaining dues.</p>
            </div>
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-purple-950">Photo Evidence Timeline</p>
              <p className="text-xs text-purple-800">Time-stamped inspection photos directly from the field.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "financial-tracking",
      title: "2. Financial Disbursement Tracking",
      description: "Reviewing payment records and milestone balances",
      keywords: ["finances", "payments", "balance", "cost", "budget"],
      content: "Review all payments disbursed to contractors and vendors with full reference numbers.",
      renderedContent: (
        <div className="space-y-4 text-xs sm:text-sm">
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li><strong>Total Estimated Budget:</strong> Sum of all unit activity estimates for your project.</li>
            <li><strong>Total Paid:</strong> Cumulative disbursements released to contractors.</li>
            <li><strong>Remaining Balance:</strong> Funds remaining to be disbursed against pending milestones.</li>
          </ul>
        </div>
      ),
    },
  ];
}
