"use client"

import { toast } from "sonner"

import { SubmitButton } from "@/components/submit-button"

import { resendVerificationEmail } from "./actions"

export function ResendVerificationForm() {
  return (
    <form
      action={async () => {
        const { error } = await resendVerificationEmail()

        if (error) {
          toast.error(error)
          return
        }

        toast.success(
          "The verification e-mail has successfully been sent. Please check your inbox."
        )
      }}
    >
      <SubmitButton>Resend Verification</SubmitButton>
    </form>
  )
}
