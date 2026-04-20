'use client'

import { useEffect, useState } from 'react'
import type { Review } from '@/types'

export function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 5,
    body: '',
    is_published: true,
  })

  // Fetch reviews
  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    try {
      const res = await fetch('/api/admin/reviews')
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      alert('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      })
      if (!res.ok) throw new Error('Failed to update review')
      await fetchReviews()
    } catch (error) {
      console.error('Error updating review:', error)
      alert('Failed to update review')
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete review')
      await fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.body) {
      alert('Name and review text are required')
      return
    }

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to create review')
      setFormData({ name: '', location: '', rating: 5, body: '', is_published: true })
      setIsAddingReview(false)
      await fetchReviews()
    } catch (error) {
      console.error('Error creating review:', error)
      alert('Failed to create review')
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Manage Reviews</h3>
        <button
          onClick={() => setIsAddingReview(!isAddingReview)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          {isAddingReview ? 'Cancel' : '+ Add Review'}
        </button>
      </div>

      {/* Add Review Form */}
      {isAddingReview && (
        <form onSubmit={handleAddReview} className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John S."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., North York"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {'⭐'.repeat(r)} {r} Star{r !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Text *</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="What did they love about the parathas?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save Review
            </button>
            <button
              type="button"
              onClick={() => setIsAddingReview(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`p-6 rounded-lg border-2 ${
                review.is_published ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <span className="text-amber-500">{'⭐'.repeat(review.rating)}</span>
                    {!review.is_published && (
                      <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  {review.location && (
                    <p className="text-sm text-gray-600">{review.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePublish(review.id, review.is_published)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      review.is_published
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {review.is_published ? '✓ Published' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <blockquote className="text-gray-700 italic">"{review.body}"</blockquote>
              <p className="text-xs text-gray-500 mt-3">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
