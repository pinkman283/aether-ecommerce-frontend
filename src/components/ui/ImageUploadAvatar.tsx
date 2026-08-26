"use client";

import { useState, useRef } from "react";
import { Camera, Trash2, Upload, User as UserIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadAvatarProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUploadAvatar({
  value,
  onChange,
  name = "User",
  size = "lg",
  label,
  disabled = false,
  className = "",
}: ImageUploadAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-24 h-24 text-xl",
    xl: "w-32 h-32 text-2xl",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange(dataUrl);
      toast.info("Profile picture updated in preview. Click Save to apply changes.");
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    toast.info("Picture removed in preview. Click Save to apply changes.");
  };

  // Get initials for fallback
  const getInitials = (str: string) => {
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div className={`flex flex-col items-center sm:items-start gap-2.5 ${className}`}>
      {label && <label className="text-[11px] font-bold text-slate-300 block">{label}</label>}

      <div className="flex items-center gap-4">
        {/* Avatar Circle Container with Upload Overlay */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative rounded-3xl overflow-hidden cursor-pointer border-2 transition-all group shrink-0 ${
            sizeClasses[size]
          } ${
            isHovered
              ? "border-amber-400 shadow-xl shadow-amber-500/10 scale-105"
              : "border-white/10 bg-[#0e121e]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {value ? (
            <img
              src={value}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 text-amber-300 font-black">
              {name ? getInitials(name) : <UserIcon className="w-6 h-6 text-slate-500" />}
            </div>
          )}

          {/* Hover Overlay with Camera Icon */}
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-opacity ${
              isHovered && !disabled ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Camera className="w-5 h-5 text-amber-400 mb-0.5" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-200">
              {value ? "Change" : "Upload"}
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </div>

        {/* Action Buttons & Help Text */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>{value ? "Upload New" : "Upload Picture"}</span>
            </button>

            {value && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemove}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Remove current avatar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <span className="text-[10px] text-slate-500">
            JPG, PNG, WebP up to 5MB. Live preview updates immediately.
          </span>
        </div>
      </div>
    </div>
  );
}
