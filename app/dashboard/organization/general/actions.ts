"use server"

import { revalidatePath } from "next/cache"
import { SessionData } from "@auth0/nextjs-auth0/types"

import { managementClient } from "@/lib/auth0"
import { withServerActionAuth } from "@/lib/with-server-action-auth"

export const updateDisplayName = withServerActionAuth(
  async function updateDisplayName(formData: FormData, session: SessionData) {
    const displayName = formData.get("display_name")

    if (!displayName || typeof displayName !== "string") {
      return {
        error: "Display name is required.",
      }
    }

    try {
      await managementClient.organizations.update(
        {
          id: session.user.org_id!,
        },
        {
          display_name: displayName,
        }
      )

      revalidatePath("/", "layout")
    } catch (error) {
      console.error("failed to update organization display name", error)
      return {
        error: "Failed to update the organization's display name.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)

export const updateBranding = withServerActionAuth(
  async function updateBranding(formData: FormData, session: SessionData) {
    const logoUrl = formData.get("logo_url") as string
    const primaryColor = formData.get("primary_color") as string
    const pageBackgroundColor = formData.get("page_background_color") as string

    // Validate hex color format if provided
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return {
        error: "Primary color must be in hex format (e.g., #000000).",
      }
    }
    if (pageBackgroundColor && !hexColorRegex.test(pageBackgroundColor)) {
      return {
        error: "Page background color must be in hex format (e.g., #ffffff).",
      }
    }

    try {
      const branding: {
        logo_url?: string
        colors?: {
          primary?: string
          page_background?: string
        }
      } = {}

      // Only include logo_url if provided
      if (logoUrl) {
        branding.logo_url = logoUrl
      }

      // Only include colors if at least one is provided
      if (primaryColor || pageBackgroundColor) {
        branding.colors = {}
        if (primaryColor) {
          branding.colors.primary = primaryColor
        }
        if (pageBackgroundColor) {
          branding.colors.page_background = pageBackgroundColor
        }
      }

      await managementClient.organizations.update(
        {
          id: session.user.org_id!,
        },
        {
          branding,
        }
      )

      revalidatePath("/dashboard/organization/general")
    } catch (error) {
      console.error("failed to update organization branding", error)
      return {
        error: "Failed to update the organization's branding.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)
