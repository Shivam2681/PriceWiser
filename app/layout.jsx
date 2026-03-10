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
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          #initial-loader {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            width: 100dvw;
            height: 100dvh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease, visibility 0.5s ease;
            overflow: hidden;
          }
          #initial-loader.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
          #initial-loader .loader-container {
            position: relative;
            width: 120px;
            height: 120px;
            margin-bottom: 32px;
          }
          #initial-loader .loader-orbit {
            position: absolute;
            inset: 0;
            border: 2px solid rgba(228, 48, 48, 0.2);
            border-radius: 50%;
            animation: orbit 3s linear infinite;
          }
          #initial-loader .loader-orbit::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 12px;
            background: #E43030;
            border-radius: 50%;
            box-shadow: 0 0 20px #E43030, 0 0 40px #E43030;
          }
          #initial-loader .loader-logo {
            position: absolute;
            inset: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: logoSpin 2s ease-in-out infinite;
          }
          #initial-loader .loader-logo svg {
            width: 60px;
            height: 60px;
            filter: drop-shadow(0 0 20px rgba(228, 48, 48, 0.5));
          }
          #initial-loader .loader-text {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #fff 0%, #E43030 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
            letter-spacing: 2px;
          }
          #initial-loader .loader-subtext {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 500;
          }
          #initial-loader .loader-dots {
            display: flex;
            gap: 8px;
            margin-top: 24px;
          }
          #initial-loader .loader-dot {
            width: 8px;
            height: 8px;
            background: #E43030;
            border-radius: 50%;
            animation: dotPulse 1.4s ease-in-out infinite;
          }
          #initial-loader .loader-dot:nth-child(2) { animation-delay: 0.2s; }
          #initial-loader .loader-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes orbit {
            to { transform: rotate(360deg); }
          }
          @keyframes logoSpin {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(-5deg); }
            50% { transform: scale(1) rotate(0deg); }
            75% { transform: scale(1.1) rotate(5deg); }
          }
          @keyframes dotPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.5); opacity: 0.5; }
          }
        `}} />
      </head>
      <body className={inter.className}>
        {/* Initial Loader - Shows until React mounts */}
        <div id="initial-loader">
          <div className="loader-container">
            <div className="loader-orbit"></div>
            <div className="loader-logo">
              <svg width="60" height="60" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.4" d="M20.212 7.37784L18.1533 5.31909C16.4152 3.58097 15.5467 2.71134 14.4183 2.38847C13.2899 2.06447 12.0918 2.34122 9.69665 2.89472L8.31515 3.21309C6.29915 3.67772 5.29115 3.91059 4.6004 4.60022C3.91078 5.29097 3.6779 6.29897 3.21328 8.31497L2.89378 9.69647C2.3414 12.0927 2.06465 13.2897 2.38753 14.4181C2.71153 15.5465 3.58115 16.415 5.31928 18.1531L7.37803 20.2118C10.4043 23.2392 11.9163 24.7501 13.795 24.7501C15.6749 24.7501 17.1869 23.237 20.212 20.2118C23.2394 17.1867 24.7503 15.6747 24.7503 13.7948C24.7503 11.9161 23.2372 10.403 20.212 7.37784Z" fill="#E43030"/>
                <path d="M12.5405 16.1191C11.7834 15.3631 11.7902 14.2763 12.2424 13.4157C12.1302 13.2536 12.0783 13.0573 12.0957 12.8609C12.1131 12.6645 12.1988 12.4803 12.3378 12.3405C12.4768 12.2007 12.6604 12.114 12.8567 12.0954C13.0531 12.0769 13.2497 12.1276 13.4124 12.239C13.7949 12.0365 14.2145 11.9285 14.633 11.933C14.8568 11.935 15.0706 12.0259 15.2274 12.1856C15.3841 12.3454 15.471 12.5608 15.4689 12.7846C15.4668 13.0084 15.3759 13.2221 15.2162 13.3789C15.0565 13.5356 14.8411 13.6225 14.6173 13.6205C14.3568 13.6301 14.1106 13.7421 13.9322 13.9321C13.4968 14.3675 13.6115 14.804 13.733 14.9266C13.8568 15.0492 14.2922 15.1628 14.7275 14.7275C15.6095 13.8455 17.1328 13.553 18.1093 14.5283C18.8664 15.2855 18.8597 16.3722 18.4063 17.2328C18.5178 17.395 18.5692 17.591 18.5514 17.787C18.5337 17.983 18.448 18.1667 18.3092 18.3062C18.1703 18.4457 17.9871 18.5322 17.7912 18.5509C17.5953 18.5696 17.399 18.5192 17.2363 18.4085C16.7314 18.6854 16.1459 18.7776 15.5803 18.6695C15.4717 18.6471 15.3686 18.6037 15.2768 18.5415C15.185 18.4793 15.1064 18.3997 15.0454 18.3071C14.9844 18.2146 14.9422 18.1109 14.9212 18.0021C14.9003 17.8932 14.901 17.7813 14.9233 17.6727C14.9456 17.5641 14.9891 17.461 15.0512 17.3692C15.1134 17.2774 15.193 17.1988 15.2856 17.1378C15.3782 17.0768 15.4818 17.0346 15.5907 17.0136C15.6995 16.9927 15.8115 16.9934 15.92 17.0157C16.1192 17.0573 16.4409 16.9921 16.7165 16.7165C17.153 16.28 17.0383 15.8446 16.9157 15.722C16.793 15.5993 16.3577 15.4857 15.9212 15.9211C15.0392 16.8031 13.5159 17.0956 12.5405 16.1191ZM11.2738 11.5797C11.4887 11.3721 11.6601 11.1239 11.778 10.8494C11.8959 10.5749 11.958 10.2796 11.9606 9.98086C11.9632 9.6821 11.9063 9.38582 11.7931 9.10931C11.68 8.83279 11.5129 8.58157 11.3017 8.37031C11.0904 8.15905 10.8392 7.99199 10.5627 7.87885C10.2862 7.76572 9.9899 7.70879 9.69114 7.71139C9.39239 7.71398 9.09714 7.77605 8.82264 7.89397C8.54813 8.01189 8.29985 8.1833 8.09229 8.3982C7.68244 8.82256 7.45565 9.39091 7.46078 9.98086C7.4659 10.5708 7.70254 11.1351 8.1197 11.5523C8.53687 11.9695 9.1012 12.2061 9.69114 12.2112C10.2811 12.2163 10.8494 11.9896 11.2738 11.5797Z" fill="#E43030"/>
              </svg>
            </div>
          </div>
          <div className="loader-text">PRICEWISER</div>
          <div className="loader-subtext">Smart Price Tracking</div>
          <div className="loader-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        </div>
        
        <script dangerouslySetInnerHTML={{__html: `
          // Hide loader when React is ready
          window.addEventListener('load', function() {
            setTimeout(function() {
              var loader = document.getElementById('initial-loader');
              if (loader) {
                loader.classList.add('hidden');
                setTimeout(function() {
                  loader.remove();
                }, 300);
              }
            }, 500);
          });
        `}} />
        
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