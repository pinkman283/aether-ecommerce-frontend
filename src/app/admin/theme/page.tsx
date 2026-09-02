"use client";

import AdminAppearancePage from "@/app/admin/settings/appearance/page";

/**
 * Direct route alias for /admin/theme
 * Seamlessly renders the modular AdminAppearancePage under the Settings architecture.
 * Preserves 100% backward compatibility for direct links, bookmarks, and APIs.
 */
export default function AdminThemePageAlias() {
  return <AdminAppearancePage />;
}
