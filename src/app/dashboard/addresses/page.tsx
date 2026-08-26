"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, CheckCircle2, ChevronLeft, Building, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Address } from "@/types";
import { toast } from "sonner";

export default function AddressesPage() {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [type, setType] = useState<"shipping" | "billing">("shipping");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.client.get("/addresses");
      setAddresses(res.data || []);
    } catch (err) {
      console.error(err);
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
    setSaving(true);
    try {
      const res = await api.client.post("/addresses", {
        type,
        full_name: fullName,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        is_default: isDefault,
      });

      setAddresses([res.data, ...addresses]);
      setIsModalOpen(false);
      toast.success("Address added successfully!");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setPostalCode("");
    } catch (err) {
      toast.error("Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.client.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success("Address removed.");
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Saved Addresses</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-[#0e121e] border border-white/10 text-center space-y-3">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No saved addresses</h3>
            <p className="text-xs text-slate-400">Add an address for lightning-fast 1-click checkouts.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-6 rounded-3xl bg-[#0e121e] border border-white/10 shadow-xl relative flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {addr.type}
                  </span>
                  {addr.is_default && (
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{addr.full_name}</h3>
                <p className="text-xs text-slate-300 mt-1">{addr.address_line1}</p>
                {addr.address_line2 && <p className="text-xs text-slate-300">{addr.address_line2}</p>}
                <p className="text-xs text-slate-400 mt-0.5">
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
                <p className="text-xs text-slate-400">{addr.country}</p>
                {addr.phone && <p className="text-xs text-slate-400 mt-2">Phone: {addr.phone}</p>}
              </div>

              <div className="flex justify-end pt-3 border-t border-white/5">
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs font-bold text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e121e] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 space-y-5">
            <h3 className="text-lg font-black text-white">Add Shipping Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. 100 Innovation Way"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
