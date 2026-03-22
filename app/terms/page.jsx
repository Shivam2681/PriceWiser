export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-blue-100">
            Please read these terms carefully before using PriceWiser
          </p>
        </div>

        <div className="p-8">

          {/* Agreement */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Agreement to Terms
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <p className="text-gray-900 leading-relaxed">
                By accessing or using PriceWiser, you agree to be bound by these Terms of Service and our Privacy Policy. 
                If you do not agree to these Terms, please do not use our services.
              </p>
            </div>
          </section>

          {/* Description */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Description of Service
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              PriceWiser provides price tracking and monitoring services for 
              e-commerce products from supported online retailers such as 
              Amazon and other e-commerce platforms.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Real-time product price tracking</li>
              <li>Email price drop alerts</li>
              <li>Historical price charts</li>
              <li>AI-powered price predictions</li>
              <li>Product comparison insights</li>
              <li>Favorites and product watchlists</li>
            </ul>

            <p className="text-gray-600 leading-relaxed mt-4">
              We may update, modify, or discontinue features at any time 
              without prior notice.
            </p>
          </section>

          {/* Price Accuracy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Price Accuracy Disclaimer
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-gray-900 leading-relaxed">
                PriceWiser displays product price information collected from 
                third-party websites. While we strive to provide accurate and 
                timely information, prices may change at any time and we cannot 
                guarantee the accuracy or availability of any price displayed. 
                Users should always verify the final price directly on the 
                retailer’s website before making a purchase.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              User Accounts
            </h2>

            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree not to use another user's account without permission.</li>
              <li>You may not use automated systems to abuse the service.</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceptable Use
            </h2>

            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Violating any laws or regulations</li>
              <li>Attempting to hack or disrupt the platform</li>
              <li>Uploading malicious software or harmful code</li>
              <li>Using the service for spam or fraudulent activity</li>
            </ul>
          </section>

          {/* Amazon Affiliate */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Affiliate Disclosure
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 leading-relaxed">
                PriceWiser participates in the Amazon Associates Program, 
                an affiliate advertising program designed to provide a means 
                for websites to earn advertising fees by advertising and 
                linking to Amazon.in.
              </p>

              <p className="text-yellow-800 leading-relaxed mt-4">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>

              <p className="text-yellow-800 leading-relaxed mt-4">
                Amazon® is a trademark of Amazon.com, Inc. or its affiliates.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Disclaimer of Warranties
            </h2>

            <p className="text-gray-600 leading-relaxed">
              The service is provided "as is" and "as available" without 
              warranties of any kind. We do not guarantee uninterrupted or 
              error-free service.
            </p>
          </section>

          {/* Limitation */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Limitation of Liability
            </h2>

            <p className="text-gray-600 leading-relaxed">
              PriceWiser shall not be liable for any indirect, incidental, 
              or consequential damages arising from your use of the service.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Governing Law
            </h2>

            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and interpreted in accordance 
              with the laws of India. Any disputes arising out of the use of 
              our services shall be subject to the jurisdiction of the courts 
              located in India.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>

            <p className="text-gray-600 mb-4">
              For any questions about these Terms of Service, please contact us:
            </p>

            <a
              href="mailto:pricewiser.help@gmail.com"
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              pricewiser.help@gmail.com
            </a>
          </section>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}