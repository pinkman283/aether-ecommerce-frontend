"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2, CheckCircle2, ChevronLeft, User, Phone, X, Check, ChevronDown, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Address } from "@/types";
import { toast } from "sonner";

export const BANGLADESH_CITIES = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
  "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali",
  "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
  "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
  "Tangail", "Thakurgaon"
];

export default function AddressesPage() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [addressName, setAddressName] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [type, setType] = useState<"shipping" | "billing">("shipping");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);

  // Address Name uniqueness check
  const trimmedAddressName = addressName.trim();
  const isAddressNameDuplicate =
    trimmedAddressName.length > 0 &&
    addresses.some(
      (a) => (a.address_name || "").trim().toLowerCase() === trimmedAddressName.toLowerCase()
    );

  // Phone validation helpers
  const cleanPhone = phone.replace(/\D/g, "");
  const isPhoneValid = cleanPhone.length === 11 && cleanPhone.startsWith("01");
  const showPhoneError = phone.length > 0 && !isPhoneValid;

  // Custom City Dropdown state & positioning
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const cityTriggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);

  const filteredCities = BANGLADESH_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const updateDropdownCoords = () => {
    if (!cityTriggerRef.current) return;
    const rect = cityTriggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.max(rect.width, 260);

    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - dropdownWidth - 16);
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 260 && spaceAbove > spaceBelow) {
      setDropdownCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width: dropdownWidth,
      });
    } else {
      setDropdownCoords({
        top: rect.bottom + 6,
        left,
        width: dropdownWidth,
      });
    }
  };

  useEffect(() => {
    if (!isCityDropdownOpen) return;
    updateDropdownCoords();

    const handleScrollOrResize = () => {
      updateDropdownCoords();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isCityDropdownOpen]);

  const handleOpenModal = () => {
    setAddressName("");
    setFullName(user?.name || "");
    const cleanUserPhone = (user?.phone || "").replace(/\D/g, "");
    if (cleanUserPhone.startsWith("01") && cleanUserPhone.length === 11) {
      setPhone(cleanUserPhone);
    } else {
      setPhone("");
    }
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setIsCityDropdownOpen(false);
    setCitySearch("");
    setDropdownCoords(null);
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  // Keyboard accessibility: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCityDropdownOpen) {
          setIsCityDropdownOpen(false);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCityDropdownOpen, isModalOpen]);

  const fetchAddresses = async () => {
    try {
      const res = await api.client.get("/addresses");
      setAddresses(res.data || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
        toast.error("Your session has expired. Please sign in again.");
        openAuthModal("login");
      } else {
        console.warn("Failed to fetch addresses:", err?.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressName.trim()) {
      toast.error("Please enter a name for the address (e.g. Home, Office).");
      return;
    }

    if (isAddressNameDuplicate) {
      toast.error(`An address named "${trimmedAddressName}" already exists. Please choose a unique name.`);
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      toast.error("Mobile number must start with 01 and be exactly 11 digits.");
      return;
    }

    if (!addressLine1.trim()) {
      toast.error("Please enter your street address.");
      return;
    }

    if (!city) {
      toast.error("Please select a city / district.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.client.post("/addresses", {
        type,
        address_name: addressName.trim(),
        full_name: fullName.trim(),
        phone: cleanPhone,
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || null,
        city,
        state: state.trim() || null,
        postal_code: postalCode.trim() || null,
        country,
        is_default: isDefault,
      });

      setAddresses([res.data, ...addresses]);
      setIsModalOpen(false);
      toast.success("Address added successfully!");
      setAddressName("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setPostalCode("");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
        toast.error("Your session has expired. Please sign in again.");
        openAuthModal("login");
      } else {
        toast.error(err?.response?.data?.message || "Failed to save address.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.client.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success("Address removed.");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
        toast.error("Your session has expired. Please sign in again.");
        openAuthModal("login");
      } else {
        toast.error("Failed to delete address.");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Please sign in to manage your saved shipping and billing addresses.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/5">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 mb-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Saved Addresses</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your delivery and billing locations</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-2 p-10 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No saved addresses</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Save an address to breeze through checkout on future purchases.
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Add First Address
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200/80 dark:border-white/10 shadow-sm relative flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    {addr.type}
                  </span>
                  {addr.is_default && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {addr.address_name || addr.full_name}
                </h3>
                {addr.address_name && (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    {addr.full_name}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{addr.address_line1}</p>
                {addr.address_line2 && <p className="text-xs text-slate-600 dark:text-slate-300">{addr.address_line2}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{addr.country}</p>
                {addr.phone && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {addr.phone}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#0f131f] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Delivery Address</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter your Bangladesh delivery details</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAddress} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain text-xs">
                {/* Address Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Address Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">e.g. Home, Office, Studio</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    placeholder="e.g. Home, Office, Warehouse..."
                    className={`w-full bg-white dark:bg-white/5 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                      isAddressNameDuplicate
                        ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20"
                        : "border-gray-200 dark:border-white/10 focus:border-indigo-500"
                    }`}
                  />
                  {isAddressNameDuplicate && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      An address named &quot;{trimmedAddressName}&quot; already exists. Please choose a unique name.
                    </p>
                  )}
                </div>

                {/* Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">11 digits (01...)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={phone}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.startsWith("+8801")) val = val.slice(3);
                          else if (val.startsWith("8801")) val = val.slice(2);
                          setPhone(val.replace(/\D/g, "").slice(0, 11));
                        }}
                        placeholder="01XXXXXXXXX"
                        className={`w-full bg-white dark:bg-white/5 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                          showPhoneError
                            ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20"
                            : isPhoneValid
                            ? "border-emerald-400 focus:border-emerald-500 ring-1 ring-emerald-400/20"
                            : "border-gray-200 dark:border-white/10 focus:border-indigo-500"
                        }`}
                      />
                      {isPhoneValid && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-emerald-500">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    {showPhoneError ? (
                      <p className="text-[11px] text-rose-500 mt-1">
                        Must start with 01 and be exactly 11 digits.
                      </p>
                    ) : isPhoneValid ? (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Valid mobile number
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        e.g. 01712345678
                      </p>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House no, road no, area, landmark..."
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <button
                      ref={cityTriggerRef}
                      type="button"
                      onClick={() => {
                        if (!isCityDropdownOpen) {
                          updateDropdownCoords();
                          setCitySearch("");
                        }
                        setIsCityDropdownOpen(!isCityDropdownOpen);
                      }}
                      className={`w-full flex items-center justify-between bg-white dark:bg-[#0f131f] border rounded-xl px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                        !city
                          ? "text-slate-400 border-gray-200 dark:border-white/10 hover:border-gray-300"
                          : "text-slate-900 dark:text-white border-gray-200 dark:border-white/10 font-medium"
                      } ${isCityDropdownOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""}`}
                    >
                      <span className="truncate">{city || "Select City / District"}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${isCityDropdownOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      State / Zone <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Postal Code <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="e.g. 1205"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Default Delivery Address Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="defaultAddress"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <label htmlFor="defaultAddress" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    Set as default delivery address
                  </label>
                </div>
              </div>

              {/* Action Buttons (Fixed at bottom) */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !isPhoneValid || !city || !addressName.trim() || isAddressNameDuplicate}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 ${
                    saving || !isPhoneValid || !city || !addressName.trim() || isAddressNameDuplicate
                      ? "bg-gray-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Address"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* City / District Dropdown Menu (Floats on upper layer over the parent card & footer) */}
      {isCityDropdownOpen && dropdownCoords && (
        <>
          {/* Transparent backdrop to catch clicks outside and close */}
          <div
            onClick={() => setIsCityDropdownOpen(false)}
            className="fixed inset-0 z-[65]"
            aria-hidden="true"
          />

          {/* Floating Dropdown Menu attached to City / District button */}
          <div
            style={{
              position: "fixed",
              top: dropdownCoords.top !== undefined ? `${dropdownCoords.top}px` : undefined,
              bottom: dropdownCoords.bottom !== undefined ? `${dropdownCoords.bottom}px` : undefined,
              left: `${dropdownCoords.left}px`,
              width: `${dropdownCoords.width}px`,
            }}
            className="z-[70] bg-white dark:bg-[#131726] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search Input */}
            <div className="p-2.5 border-b border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search 64 districts..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 64 Districts List */}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
              {filteredCities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No district found matching "{citySearch}"
                </div>
              ) : (
                filteredCities.map((c) => {
                  const isSelected = city === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCity(c);
                        setIsCityDropdownOpen(false);
                        setCitySearch("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white font-semibold shadow-xs"
                          : "text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                      }`}
                    >
                      <span className="truncate">{c}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
