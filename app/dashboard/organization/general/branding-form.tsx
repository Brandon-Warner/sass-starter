"use client"

import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/submit-button"

import { updateBranding } from "./actions"

interface Props {
  organization: {
    id: string
    branding?: {
      logo_url?: string
      colors?: {
        primary?: string
        page_background?: string
      }
    }
  }
}

export function BrandingForm({ organization }: Props) {
  return (
    <Card>
      <form
        action={async (formData: FormData) => {
          const { error } = await updateBranding(formData)

          if (error) {
            toast.error(error)
          } else {
            toast.success("The organization's branding has been updated.")
          }
        }}
      >
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Update the organization&apos;s branding and visual identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              type="url"
              placeholder="https://example.com/logo.png"
              defaultValue={organization.branding?.logo_url || ""}
            />
            <p className="text-sm text-muted-foreground">
              Publicly accessible URL to your organization&apos;s logo image.
            </p>
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                name="primary_color"
                type="color"
                defaultValue={organization.branding?.colors?.primary || "#000000"}
                className="h-10 w-20"
              />
              <Input
                type="text"
                placeholder="#000000"
                defaultValue={organization.branding?.colors?.primary || ""}
                className="flex-1"
                onChange={(e) => {
                  const colorInput = document.getElementById("primary_color") as HTMLInputElement
                  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    colorInput.value = e.target.value
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Primary brand color (hex format).
            </p>
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="page_background_color">Page Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="page_background_color"
                name="page_background_color"
                type="color"
                defaultValue={organization.branding?.colors?.page_background || "#ffffff"}
                className="h-10 w-20"
              />
              <Input
                type="text"
                placeholder="#ffffff"
                defaultValue={organization.branding?.colors?.page_background || ""}
                className="flex-1"
                onChange={(e) => {
                  const colorInput = document.getElementById("page_background_color") as HTMLInputElement
                  if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    colorInput.value = e.target.value
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Background color for authentication pages (hex format).
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}
