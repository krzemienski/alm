"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Edit, Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Item {
  id: string
  name: string
  url: string
  description: string | null
  category_id: string
  list_id: string
}

interface SubCategory {
  id: string
  name: string
  description: string | null
  items: Item[]
  parent_id: string
  list_id: string
}

interface Category {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  list_id: string
  items: Item[]
  subcategories: SubCategory[]
}

interface AwesomeList {
  id: string
  title: string
  description: string | null
  repo_url: string
  owner: string
  repo: string
  categories: Category[]
}

export default function ListDetail() {
  const params = useParams()
  const router = useRouter()
  const [list, setList] = useState<AwesomeList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/lists/${params.id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch awesome list')
        }

        const data = await response.json()
        setList(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchList()
  }, [params.id])

  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/export/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to export awesome list')
      }

      const markdown = await response.text()

      // Create a blob and download it
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${list?.title.toLowerCase().replace(/\s+/g, '-')}.md` || 'awesome-list.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          list_id: params.id,
          name: newCategoryName,
          description: newCategoryDescription || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      // Refresh the list data
      const updatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/lists/${params.id}`)
      const updatedData = await updatedResponse.json()
      setList(updatedData)

      // Reset form
      setNewCategoryName('')
      setNewCategoryDescription('')
      setShowAddCategory(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button asChild>
          <Link href="/">Go back</Link>
        </Button>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Awesome list not found</p>
        <Button asChild>
          <Link href="/">Go back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-bold">{list.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddCategory(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button onClick={handleExport}>Export README</Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-6">
        {list.description && (
          <p className="mb-6 text-muted-foreground">{list.description}</p>
        )}

        {/* Add Category Dialog */}
        {showAddCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md bg-background p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Add Category</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <Input
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {list.categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{category.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Category items */}
                  {category.items.length > 0 && (
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item.id} className="flex flex-col gap-1">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            {item.name}
                          </a>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Subcategories */}
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="mt-4">
                      <h3 className="mb-2 text-lg font-medium">{subcategory.name}</h3>
                      {subcategory.description && (
                        <p className="mb-2 text-sm text-muted-foreground">{subcategory.description}</p>
                      )}
                      <ul className="space-y-2">
                        {subcategory.items.map((item) => (
                          <li key={item.id} className="flex flex-col gap-1">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline"
                            >
                              {item.name}
                            </a>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
