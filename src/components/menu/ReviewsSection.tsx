'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Review } from '@/types'

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        setReviews(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-amber-50">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          Loading reviews...
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -60,
      rotateY: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 15,
        duration: 0.6,
      },
    },
  }

  return (
    <section className="py-20 bg-amber-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Love
          </h2>
          <p className="text-lg text-gray-600">
            Real stories from real people who've tasted our parathas
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <AnimatePresence mode="wait">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-shadow"
                style={{
                  perspective: '1000px',
                }}
              >
                {/* Stars */}
                <motion.div
                  className="flex gap-1 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < review.rating ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </motion.div>

                {/* Quote */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                  "{review.body}"
                </blockquote>

                {/* Author */}
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  {review.location && (
                    <p className="text-sm text-gray-600">{review.location}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
