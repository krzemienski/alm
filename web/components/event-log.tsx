"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Event {
  timestamp: string
  request_id: string
  step: string
  status: string
  detail: Record<string, any>
  elapsed_ms?: number
}

export function EventLogViewer() {
  const [events, setEvents] = useState<Event[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`)

    eventSource.onopen = () => {
      setConnected(true)
    }

    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data)
      setEvents((prev) => [...prev, event])
    }

    eventSource.onerror = () => {
      setConnected(false)
      eventSource.close()

      // Try to reconnect after 5 seconds
      setTimeout(() => {
        eventSource.close()
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Event Logs
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-y-auto space-y-2 bg-muted/20 p-4 rounded-md">
          {events.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              Waiting for events...
            </div>
          ) : (
            events.map((event, i) => (
              <div key={i} className="text-sm border-l-2 pl-2 py-1" style={{
                borderColor: event.status === 'ok' ? 'green' : 'red'
              }}>
                <div className="flex justify-between">
                  <span className="font-medium">{event.step}</span>
                  <span className="text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                {event.detail && Object.keys(event.detail).length > 0 && (
                  <pre className="text-xs mt-1 overflow-x-auto text-muted-foreground">
                    {JSON.stringify(event.detail, null, 2)}
                  </pre>
                )}
                {event.elapsed_ms && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Took {event.elapsed_ms}ms
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
