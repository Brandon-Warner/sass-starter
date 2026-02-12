import { redirect } from "next/navigation"
import { EnvelopeClosedIcon } from "@radix-ui/react-icons"

import { onboardingClient } from "@/lib/auth0"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ResendVerificationForm } from "./resend-verification-form"

export default async function Verify() {
  const session = await onboardingClient.getSession()

  // If user is already verified, redirect to organization creation
  if (session?.user?.email_verified) {
    redirect("/onboarding/create")
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="grid gap-2">
          <EnvelopeClosedIcon className="size-5" />
          <span>Verify your e-mail</span>
        </CardTitle>
        <CardDescription>
          Please check your inbox for a verification link to continue creating
          your account.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <ResendVerificationForm />
      </CardFooter>
    </Card>
  )
}
