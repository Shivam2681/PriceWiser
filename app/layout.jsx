import Navbar from '@/components/Navbar'
import ToastProvider from '@/components/ui/ToastProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Providers from '@/components/Providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import './globals.css'

import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700']
})

export const metadata = {
  title: 'PriceWise - Smart Price Tracking',
  description: 'Track product prices effortlessly and save money on your online shopping. Get instant alerts when prices drop.',
  keywords: ['price tracker', 'price alerts', 'shopping', 'deals', 'discounts'],
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <ToastProvider />
          <main className="">
            <Navbar />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </Providers>
      </body>
    </html>
  );
}