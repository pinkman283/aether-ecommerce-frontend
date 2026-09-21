import React from "react";
import { Globe } from "lucide-react";

interface SocialPlatformIconProps {
  platform: string;
  icon?: string | null;
  className?: string;
}

export function SocialPlatformIcon({
  platform,
  icon,
  className = "w-4 h-4",
}: SocialPlatformIconProps) {
  const p = (platform || "").toLowerCase();
  const i = (icon || "").toLowerCase();

  // 1. WhatsApp (Official filled silhouette)
  if (p.includes("whatsapp") || i.includes("whatsapp")) {
    return (
      <svg
        className={`${className} fill-current`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.3-.776.979-.952 1.18-.175.2-.35.225-.651.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.083-.175-.3-.019-.462.132-.612.136-.135.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.63-.926-2.234-.244-.588-.492-.508-.676-.518-.175-.01-.375-.01-.576-.01-.2 0-.526.075-.802.375-.276.3-1.052 1.028-1.052 2.508 0 1.48 1.078 2.91 1.228 3.11.15.2 2.122 3.24 5.14 4.542.718.31 1.278.495 1.714.633.72.23 1.376.197 1.895.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.125-.275-.2-.576-.35zM12.04 2c-5.52 0-10 4.48-10 10 0 1.765.46 3.424 1.26 4.872L2 22l5.3-1.39C8.71 21.41 10.33 22 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.2c-1.53 0-2.98-.41-4.24-1.13l-.3-.18-3.15.83.84-3.07-.2-.32C4.24 15.01 3.8 13.54 3.8 12c0-4.54 3.69-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.2-8.23 8.2z" />
      </svg>
    );
  }

  // 2. Instagram
  if (p.includes("instagram") || i.includes("instagram")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  // 3. Facebook
  if (p.includes("facebook") || i.includes("facebook")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }

  // 4. X / Twitter
  if (p.includes("twitter") || p.includes("x (") || p === "x" || i.includes("twitter")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    );
  }

  // 5. YouTube
  if (p.includes("youtube") || i.includes("youtube")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
      </svg>
    );
  }

  // 6. Discord
  if (p.includes("discord") || i.includes("discord")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 6a15 15 0 0 0-4-1.5c-.2.4-.4.8-.5 1.2-1.5-.2-3-.2-4.5 0-.2-.4-.4-.8-.5-1.2A15 15 0 0 0 4 6c-2.5 4-3.2 8-2.9 12a15.8 15.8 0 0 0 5 2.5c.4-.6.8-1.2 1.1-1.8-1-.4-1.9-.9-2.7-1.5.2.1.4.3.7.4 3.7 1.7 7.7 1.7 11.4 0 .3-.2.5-.3.7-.4-.8.6-1.7 1.1-2.7 1.5.3.6.7 1.2 1.1 1.8 3.5-.5 5-2.5 5-2.5.4-4.5-.4-8.5-2.9-12z" />
        <circle cx="8.5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // 7. GitHub
  if (p.includes("github") || i.includes("github")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }

  // 8. TikTok
  if (p.includes("tiktok") || i.includes("tiktok")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    );
  }

  // 9. LinkedIn
  if (p.includes("linkedin") || i.includes("linkedin")) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  // Fallback
  return <Globe className={className} aria-hidden="true" />;
}
