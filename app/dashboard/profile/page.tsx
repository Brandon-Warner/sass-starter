import React from "react"

import { AppRouterPageRoute } from "@auth0/nextjs-auth0/server"
import { appClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default appClient.withPageAuthRequired(
  async function ProfileTokens() {
    const session = await appClient.getSession()
    const accessTokenResponse = await appClient.getAccessToken()

    let decodedToken = null
    if (accessTokenResponse?.token) {
      try {
        const parts = accessTokenResponse.token.split(".")
        if (parts.length === 3) {
          decodedToken = JSON.parse(
            Buffer.from(parts[1], "base64").toString()
          )
        }
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }

    return (
      <div className="space-y-6">
        <PageHeader
          title="Profile Tokens"
          description="View your decrypted ID and Access tokens from Auth0."
        />

        <Card>
          <CardHeader>
            <CardTitle>ID Token</CardTitle>
            <CardDescription>
              Decoded user information from your ID token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
              <code>{JSON.stringify(session?.user, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Token</CardTitle>
            <CardDescription>
              Raw access token used for API authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Token:</p>
                <pre className="max-w-2xl overflow-auto rounded-md bg-muted p-4 text-xs">
                  <code>{accessTokenResponse?.token}</code>
                </pre>
              </div>
              {accessTokenResponse?.token && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Decoded Payload:</p>
                    <a
                      href={`https://jwt.io/#debugger-io?token=${accessTokenResponse.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Decode on jwt.io →
                    </a>
                  </div>
                  <pre className="max-w-2xl overflow-auto rounded-md bg-muted p-4 text-xs">
                    <code>
                      {(() => {
                        try {
                          return JSON.stringify(
                            JSON.parse(
                              Buffer.from(
                                accessTokenResponse.token.split(".")[1],
                                "base64"
                              ).toString()
                            ),
                            null,
                            2
                          )
                        } catch (error) {
                          return "Error decoding token payload"
                        }
                      })()}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } as AppRouterPageRoute,
  { returnTo: "/dashboard/profile" }
) as React.FC
