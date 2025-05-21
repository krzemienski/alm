"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EventLogViewer } from '@/components/event-log'

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleImport = async () => {
    if (!repoUrl) return

    try {
      setImporting(true)
      setError('')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to import awesome list')
      }

      const data = await response.json()
      router.push(`/lists/${data.list_id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background">
      <div className="w-full max-w-3xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Awesome List Manager</CardTitle>
            <CardDescription>
              Import, edit, and manage awesome lists from GitHub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter GitHub repo URL (e.g., https://github.com/krzemienski/awesome-video)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleImport} disabled={importing || !repoUrl}>
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Import public awesome lists via URL—no token required.
            </p>
          </CardFooter>
        </Card>

        <EventLogViewer />
      </div>
    </main>
  )
}
