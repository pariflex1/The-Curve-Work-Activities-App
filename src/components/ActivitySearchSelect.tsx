"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Plus, Sparkles, X, Layers, Tag } from "lucide-react";

export interface ActivityOption {
  id?: string;
  name: string;
  category?: string | null;
  code?: string | null;
  default_unit?: string | null;
}

export const PRESET_CONSTRUCTION_ACTIVITIES: ActivityOption[] = [
  { name: "Excavation & Earthwork", category: "Civil / Structure", code: "EXC", default_unit: "cu.m" },
  { name: "PCC (Plain Cement Concrete)", category: "Civil / Structure", code: "PCC", default_unit: "cu.m" },
  { name: "RCC Footing & Foundation", category: "Civil / Structure", code: "FTG", default_unit: "cu.m" },
  { name: "Column Casting & Reinforcement", category: "Civil / Structure", code: "COL", default_unit: "cu.m" },
  { name: "Beam & Slab Casting", category: "Civil / Structure", code: "SLB", default_unit: "sq.ft" },
  { name: "Brick & AAC Block Masonry", category: "Masonry", code: "MSN", default_unit: "sq.ft" },
  { name: "Internal & External Plastering", category: "Plastering", code: "PLS", default_unit: "sq.ft" },
  { name: "Waterproofing & Membrane Coating", category: "Waterproofing", code: "WPF", default_unit: "sq.ft" },
  { name: "Electrical Concealed Conduit & Piping", category: "Electrical / MEP", code: "ELC", default_unit: "r.ft" },
  { name: "Electrical Wiring, DB & Switch Installation", category: "Electrical / MEP", code: "ELW", default_unit: "points" },
  { name: "Plumbing Concealed Piping & Drainage", category: "Plumbing / MEP", code: "PLM", default_unit: "r.ft" },
  { name: "Sanitary Fixtures & CP Brass Fittings", category: "Plumbing / MEP", code: "SNT", default_unit: "nos" },
  { name: "Vitrified Tile / Marble Flooring", category: "Finishing", code: "FLR", default_unit: "sq.ft" },
  { name: "Bathroom Wall Dado Tiling", category: "Finishing", code: "WTL", default_unit: "sq.ft" },
  { name: "False Ceiling & Gypsum POP Board", category: "Interior", code: "FCL", default_unit: "sq.ft" },
  { name: "Door Frames, Flush Shutters & Locks", category: "Carpentry", code: "DRF", default_unit: "nos" },
  { name: "UPVC / Aluminium Windows & Glazing", category: "Fabrication", code: "WND", default_unit: "sq.ft" },
  { name: "Internal Putty, Primer & Emulsion Paint", category: "Painting", code: "PNT-I", default_unit: "sq.ft" },
  { name: "External Texture & Weatherproof Paint", category: "Painting", code: "PNT-E", default_unit: "sq.ft" },
  { name: "Modular Kitchen Granite & Cabinets", category: "Interior", code: "KIT", default_unit: "r.ft" },
  { name: "Custom Woodwork & Wardrobes", category: "Carpentry", code: "WDW", default_unit: "sq.ft" },
  { name: "Fire Fighting Sprinklers & Alarms", category: "Safety / MEP", code: "FIR", default_unit: "points" },
  { name: "HVAC Copper Piping & Ducting", category: "HVAC", code: "HVC", default_unit: "nos" },
  { name: "Deep Cleaning & Final Handover", category: "Finishing", code: "CLN", default_unit: "sq.ft" },
];

interface ActivitySearchSelectProps {
  options?: ActivityOption[];
  value: string;
  onChange: (val: {
    name: string;
    isCustom: boolean;
    activityId?: string;
    category?: string;
    code?: string;
    default_unit?: string;
  }) => void;
  placeholder?: string;
  required?: boolean;
}

export default function ActivitySearchSelect({
  options = [],
  value,
  onChange,
  placeholder = "Search or select an activity...",
  required = true,
}: ActivitySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState(value || "");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Combine provided options with standard presets (avoiding exact duplicates by name)
  const combinedOptions: ActivityOption[] = [...options];
  PRESET_CONSTRUCTION_ACTIVITIES.forEach((preset) => {
    if (!combinedOptions.some((o) => o.name.toLowerCase() === preset.name.toLowerCase())) {
      combinedOptions.push(preset);
    }
  });

  // Filter options based on search query
  const filteredOptions = combinedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesName = opt.name.toLowerCase().includes(q);
    const matchesCategory = opt.category?.toLowerCase().includes(q) || false;
    const matchesCode = opt.code?.toLowerCase().includes(q) || false;
    return matchesName || matchesCategory || matchesCode;
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When dropdown opens, focus the search input
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  function handleSelectOption(opt: ActivityOption) {
    setIsCustomMode(false);
    setCustomName(opt.name);
    setSearchQuery("");
    setIsOpen(false);
    onChange({
      name: opt.name,
      isCustom: false,
      activityId: opt.id,
      category: opt.category || undefined,
      code: opt.code || undefined,
      default_unit: opt.default_unit || undefined,
    });
  }

  function handleSelectOther() {
    setIsCustomMode(true);
    const initialCustom = searchQuery.trim() || customName || "";
    setCustomName(initialCustom);
    setIsOpen(false);
    onChange({
      name: initialCustom,
      isCustom: true,
    });
  }

  function handleCustomNameChange(newName: string) {
    setCustomName(newName);
    onChange({
      name: newName,
      isCustom: true,
    });
  }

  function handleSwitchBackToDropdown() {
    setIsCustomMode(false);
    setSearchQuery("");
    setIsOpen(true);
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {isCustomMode ? (
        // Custom Mode Input Field
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Sparkles className="w-3 h-3" />
              <span>Custom Activity Mode</span>
            </span>
            <button
              type="button"
              onClick={handleSwitchBackToDropdown}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-1"
            >
              <span>Choose from list</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              name="name"
              required={required}
              value={customName}
              onChange={(e) => handleCustomNameChange(e.target.value)}
              placeholder="Type your custom activity name (e.g. Italian Marble Polishing)..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold shadow-sm"
              autoFocus
            />
            {customName && (
              <button
                type="button"
                onClick={() => handleCustomNameChange("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            This activity will be added specifically and automatically registered into the Master Catalog.
          </p>
        </div>
      ) : (
        // Dropdown Trigger Field
        <div>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-blue-400 ${
              isOpen ? "ring-2 ring-blue-500 bg-white border-blue-500" : ""
            }`}
          >
            <span className={value ? "text-slate-900 font-semibold text-sm" : "text-slate-400 text-sm"}>
              {value || placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                isOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </div>

          {/* Hidden input for standard form submission fallback */}
          <input type="hidden" name="name" value={value} />

          {/* Floating Dropdown Popover */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 max-h-80 flex flex-col">
              {/* Search Bar inside popover */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities or type custom name..."
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none py-1"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="overflow-y-auto p-1.5 space-y-1 flex-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = value.toLowerCase() === opt.name.toLowerCase();
                    return (
                      <div
                        key={opt.id || `${opt.name}-${idx}`}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Tag className="w-3 h-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold truncate text-slate-900">
                              {opt.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {opt.category || "General"} {opt.code ? `• ${opt.code}` : ""}
                            </p>
                          </div>
                        </div>

                        {opt.default_unit && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {opt.default_unit}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs">
                    No matching activity found for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Other (Custom Activity) Action Button at bottom */}
              <div className="p-2 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={handleSelectOther}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-left">
                      {searchQuery.trim()
                        ? `Add "${searchQuery}" as Custom Activity`
                        : "Other / Add Custom Activity..."}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                    Custom
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
