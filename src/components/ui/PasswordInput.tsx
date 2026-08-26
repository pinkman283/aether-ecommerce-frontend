"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  iconLeft?: boolean;
  autoComplete?: string;
  id?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  iconLeft = false,
  autoComplete = "current-password",
  id,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative flex items-center ${className}`}>
      {iconLeft && (
        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
      )}

      <input
        id={id}
        type={showPassword ? "text" : "password"}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full pr-10 ${iconLeft ? "pl-10" : "px-3.5"} ${inputClassName}`}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer z-10 focus:outline-none"
        title={showPassword ? "Hide password" : "Show password"}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4 text-amber-400" />
        ) : (
          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
        )}
      </button>
    </div>
  );
}
