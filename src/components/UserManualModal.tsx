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
  CreditCard,
  Camera,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
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

  // Role metadata and title config
  const roleConfig = {
    admin: {
      badge: "Administrator Guide",
      title: "The Curve — Administrator User Manual",
      subtitle: "Full control over projects, blocks, units, activity catalogs, team allocations, payments, and audit logs.",
      color: "blue",
    },
    employee: {
      badge: "Site Engineer / Supervisor Guide",
      title: "The Curve — Site Engineer Operational Manual",
      subtitle: "Provision unit work activities, assign contractors, record site inspections, upload geo-tagged photos, and update progress.",
      color: "emerald",
    },
    contractor: {
      badge: "Contractor Portal Guide",
      title: "The Curve — Contractor Work & Task Guide",
      subtitle: "Access assigned work orders, check unit specifications, track completion milestones, and view inspection history.",
      color: "amber",
    },
    owner: {
      badge: "Owner / Investor Guide",
      title: "The Curve — Owner & Investor Dashboard Manual",
      subtitle: "Monitor real-time project progress, review unit inspection photos, track financial disbursements, and download milestone summaries.",
      color: "purple",
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
          "px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all border border-slate-700 min-h-[40px]"
        }
      >
        <BookOpen className="w-4 h-4 text-blue-400" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {roleConfig.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v1.2</span>
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
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
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
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedSection === sec.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${selectedSection === sec.id ? "opacity-100" : "opacity-0"}`} />
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

                    <div className="prose prose-slate prose-xs max-w-none text-slate-700 space-y-4">
                      {filteredSections.find((s) => s.id === selectedSection)?.renderedContent}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No matching topics found</p>
                    <p className="text-xs text-slate-500">Try searching for a different keyword like "add activity", "progress", "payment", or "password".</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Security Notice: All deletions require your account password.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
              >
                Close Manual
              </button>
            </div>
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
  renderedContent: React.ReactNode;
}

function getRoleSections(role: UserRoleType): Section[] {
  if (role === "admin") {
    return [
      {
        id: "overview",
        title: "1. System Overview & Hierarchy",
        description: "Core real estate architecture and role boundaries",
        keywords: ["admin", "hierarchy", "structure", "overview"],
        content: "Project structure includes Projects, Blocks/Towers, Units, and Unit Activities.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900 space-y-2">
              <p className="font-semibold text-blue-950">Structural Hierarchy:</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                  <Building2 className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <span>1. Project</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                  <Layers className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <span>2. Block / Tower</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                  <Building2 className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <span>3. Unit / Flat</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                  <Sparkles className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <span>4. Unit Activity</span>
                </div>
              </div>
            </div>
            <p>
              As an <strong>Administrator</strong>, you have full CRUD authority over the entire organization. You can create projects, configure structural blocks, generate units, manage the master catalog of construction tasks, disburse payments, and audit all platform actions.
            </p>
          </div>
        ),
      },
      {
        id: "projects-blocks-units",
        title: "2. Projects, Blocks & Units Setup",
        description: "Creating and structuring real estate developments",
        keywords: ["create project", "block", "unit", "floor", "area"],
        content: "How to add projects, towers, floors, and individual units.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <ol className="list-decimal list-inside space-y-3 font-medium text-slate-700">
              <li>
                <strong>Create Project:</strong> Navigate to <code>/admin/projects</code>, click <strong>"New Project"</strong>, and enter the name, location, and initial status.
              </li>
              <li>
                <strong>Add Blocks / Towers:</strong> Open the created project, click <strong>"Add Block"</strong>, name the tower (e.g. <em>Tower A</em>), and set its sort order.
              </li>
              <li>
                <strong>Add Units:</strong> Open a block, click <strong>"Add Unit"</strong>, specify the unit number (e.g. <em>101</em>), floor, unit type (e.g. <em>3 BHK</em>), area in sq.ft, and status.
              </li>
            </ol>
          </div>
        ),
      },
      {
        id: "activity-master",
        title: "3. Master Activity Catalog",
        description: "Standardizing construction milestones and rates",
        keywords: ["activity master", "catalog", "standard", "rcc", "foundation"],
        content: "Configure standard activity templates with codes, categories, and units of measurement.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              The <strong>Activity Master</strong> catalog defines standard construction tasks (e.g. Foundation, RCC, Brick Work, Plaster, MEP, Flooring, Painting).
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Go to <code>/admin/activity-master</code> to add or configure templates.</li>
              <li>Setting an activity to <em>Active</em> makes it immediately available in unit provisioning checklists.</li>
              <li>Changes to the master catalog do not alter existing unit activity records, ensuring total independence.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "team-allocation",
        title: "4. Team & Contractor Allocations",
        description: "Granting role-scoped access to engineers, contractors, and owners",
        keywords: ["team", "assign", "contractor", "engineer", "owner"],
        content: "Link users to projects to grant them visibility and task execution rights.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              Users only see data for projects they are assigned to. To allocate team members:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>Open any Project in the Admin dashboard.</li>
              <li>Click <strong>"Manage Team"</strong> in the top header.</li>
              <li>Switch between <em>Employees</em>, <em>Contractors</em>, or <em>Owners</em> tabs to link personnel.</li>
              <li>For Contractors, assign their trade / company agency name (e.g. <em>Apex Electricals</em>).</li>
            </ol>
          </div>
        ),
      },
      {
        id: "payments-finances",
        title: "5. Payments & Financial Management",
        description: "Disbursing contractor funds and tracking remaining balances",
        keywords: ["payment", "disbursement", "finance", "cost", "budget"],
        content: "Record milestone disbursements, select payment methods, and monitor automatic balance calculations.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              Track payments per project or linked directly to specific unit activities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Click <strong>"Record Payment"</strong> on the project dashboard or payments tab.</li>
              <li>Enter the amount paid, contractor/vendor name, payment mode (NEFT/Cheque/UPI/Cash), and reference note.</li>
              <li>Financial balances (<code>Total Estimated Budget - Total Paid = Remaining Balance</code>) recalculate automatically in real-time.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "security-deletions",
        title: "6. Security & Password Protected Deletions",
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
                  To prevent accidental loss of structural project data, deleting any project, block, unit, activity, payment, or team assignment strictly requires entering your login password.
                </p>
              </div>
            </div>
            <p>
              All events (updates, deletions, assignments) are permanently recorded in the <strong>Audit Logs</strong> (<code>/admin/audit-logs</code>) with timestamp, actor profile, and delta changes.
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
        title: "1. Site Engineer Workspace Overview",
        description: "Your daily hub for unit inspections and activity management",
        keywords: ["engineer", "employee", "overview", "site"],
        content: "Site Engineers have operational authority to provision activities, allocate contractors, and submit verified inspection progress.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>
              Welcome to the <strong>Site Engineer Dashboard</strong>. As an engineer or site supervisor:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-900">1. Provision Activities</span>
                <p className="text-xs text-slate-500">Set up standard and custom work checklists for every unit.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-900">2. Assign Contractors</span>
                <p className="text-xs text-slate-500">Link trade contractors to specific unit activities.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-900">3. Site Inspections</span>
                <p className="text-xs text-slate-500">Submit verified progress % reports with photo evidence.</p>
              </div>
            </div>
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
          <div className="space-y-4 text-xs sm:text-sm">
            <p>When you open any unit, click <strong>"Provision Activities"</strong>. You can choose from 3 modes:</p>
            <div className="space-y-3 font-medium text-slate-700">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <p className="font-bold text-blue-900">Mode A: Single / Custom Activity</p>
                <p className="text-xs text-blue-800 mt-1">
                  Select an activity from the searchable dropdown or type a brand new custom activity name. Set estimated cost and unit-specific notes.
                </p>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <p className="font-bold text-emerald-900">Mode B: Batch from Master Templates</p>
                <p className="text-xs text-emerald-800 mt-1">
                  Check off multiple activities at once (e.g. Foundation, RCC, Brick Work, Flooring) and optionally set estimated budgets in bulk.
                </p>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <p className="font-bold text-amber-900">Mode C: Copy From Another Unit (Clone)</p>
                <p className="text-xs text-amber-800 mt-1">
                  Clone all activities and estimated rates from another completed/configured unit in the project with a single click.
                </p>
              </div>
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
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>Open the Unit Activity List.</li>
              <li>Locate the activity (e.g. <em>Electrical Work</em>).</li>
              <li>Select the contractor company from the dropdown menu (e.g. <em>Apex Electricals</em>).</li>
              <li>The contractor will immediately see this task listed under their <strong>"My Work"</strong> portal.</li>
            </ol>
          </div>
        ),
      },
      {
        id: "inspection-reports",
        title: "4. Conducting Inspections & Photo Verification",
        description: "Recording on-site progress with verified camera photos",
        keywords: ["inspection", "photo", "camera", "progress", "verify"],
        content: "Click Record Inspection on any activity, adjust the progress slider (0-100%), add site notes, and upload verification photos.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <p>To record verified site progress:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>Click <strong>"Record Inspection"</strong> on the target activity.</li>
              <li>Adjust the progress slider (e.g. <em>75%</em>) or click quick milestone buttons.</li>
              <li>Status auto-synchronizes (<code>0% = Pending</code>, <code>1-99% = In Progress</code>, <code>100% = Completed</code>).</li>
              <li>Add mobile photos from the job site to build a permanent verifiable timeline.</li>
              <li>Click <strong>"Submit Inspection Report"</strong>.</li>
            </ol>
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
              Welcome to the <strong>Contractor Portal</strong>. This portal provides a focused, real-time list of all tasks assigned to your company.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Tasks are grouped by Project, Block, and Unit number.</li>
              <li>View unit specifications, scope of work, and current milestone completion %.</li>
              <li>Access site inspection verification records submitted by the Site Engineer.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "inspection-process",
        title: "2. Inspection & Verification Protocol",
        description: "How completed work is reviewed and signed off",
        keywords: ["inspection", "sign off", "engineer", "verification"],
        content: "When work on site is completed, notify the Site Engineer to conduct an inspection and record progress.",
        renderedContent: (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <p className="font-bold">Engineer Verification Requirement</p>
              <p>
                To maintain audit compliance, inspection reports and progress updates are officially verified and signed off by the Site Engineer upon on-site review.
              </p>
            </div>
            <p>
              Once the engineer submits the inspection, your dashboard will immediately reflect the updated completion percentage, status, and attached photo evidence.
            </p>
          </div>
        ),
      },
    ];
  }

  // Owner Role
  return [
    {
      id: "overview",
      title: "1. Owner & Investor Dashboard Overview",
      description: "Transparency into construction progress and financials",
      keywords: ["owner", "investor", "progress", "financials"],
      content: "Owners have comprehensive read-only transparency into project milestones, inspection photos, and financial payment records.",
      renderedContent: (
        <div className="space-y-4 text-xs sm:text-sm">
          <p>
            Welcome to the <strong>Owner &amp; Investor Portal</strong>. This view offers executive transparency into your real estate investments:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-purple-950">Overall Project Completion</p>
              <p className="text-xs text-purple-800">Aggregated real-time progress across all blocks and units.</p>
            </div>
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-purple-950">Financial Health</p>
              <p className="text-xs text-purple-800">Total estimated costs, funds disbursed, and remaining balances.</p>
            </div>
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-purple-950">Photo Evidence Timeline</p>
              <p className="text-xs text-purple-800">Time-stamped inspection photos directly from the job site.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "financial-tracking",
      title: "2. Tracking Financial Disbursements",
      description: "Reviewing payment records and milestone balances",
      keywords: ["finances", "payments", "balance", "cost", "budget"],
      content: "Review all payments disbursed to contractors and vendors with full reference numbers.",
      renderedContent: (
        <div className="space-y-4 text-xs sm:text-sm">
          <p>
            Under the <strong>Financial Summary</strong> card on your dashboard:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li><strong>Total Estimated Budget:</strong> Sum of all unit activity estimates for your project.</li>
            <li><strong>Total Paid:</strong> Cumulative disbursements released to contractors.</li>
            <li><strong>Remaining Balance:</strong> Funds remaining to be disbursed against pending milestones.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "photo-timeline",
      title: "3. Site Photo Timeline & Inspection Logs",
      description: "Visual evidence of on-site milestone completion",
      keywords: ["photos", "gallery", "inspections", "timeline"],
      content: "Inspect high-resolution site photos uploaded by Site Engineers during milestone reviews.",
      renderedContent: (
        <div className="space-y-4 text-xs sm:text-sm">
          <p>
            Every inspection report filed by the Site Engineer includes time-stamped visual verification photos. You can click any photo in the project timeline to view high-resolution inspection details.
          </p>
        </div>
      ),
    },
  ];
}
