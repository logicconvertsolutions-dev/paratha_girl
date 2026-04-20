import { Navbar }          from '@/components/ui/Navbar'
import { Hero }            from '@/components/menu/Hero'
import { Ticker }          from '@/components/ui/Ticker'
import { MenuSection }     from '@/components/menu/MenuSection'
import { InfoStrip }       from '@/components/ui/InfoStrip'
import { StorySection }    from '@/components/menu/StorySection'
import { ReviewsSection }  from '@/components/menu/ReviewsSection'
import { AdminPreview }    from '@/components/admin/AdminPreview'
import { Footer }          from '@/components/ui/Footer'
import { CartPanel }       from '@/components/cart/CartPanel'
import { PRODUCTS }        from '@/lib/products'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <MenuSection products={PRODUCTS} />
        <InfoStrip />
        <StorySection />
        <ReviewsSection />
        <AdminPreview />
      </main>
      <Footer />
      <CartPanel />
    </>
  )
}
