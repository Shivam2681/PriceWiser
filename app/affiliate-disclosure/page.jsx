export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Affiliate Disclosure
          </h1>
          <p className="text-blue-100">
            Transparency about our affiliate relationships
          </p>
        </div>

        {/* Content */}
        <div className="p-8">

          {/* Amazon Associates Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Amazon Associates Program
            </h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="text-gray-900 leading-relaxed mb-4">
                PriceWiser participates in the Amazon Associates Program, an affiliate advertising program designed to provide a means for websites to earn advertising fees by advertising and linking to Amazon.in.
              </p>

              <p className="text-gray-900 leading-relaxed mb-4">
                As an Amazon Associate, PriceWiser earns from qualifying purchases.
              </p>

              <p className="text-gray-900 leading-relaxed">
                When you click on links to Amazon products on our website and make a purchase, we may receive a small commission at no additional cost to you. These commissions help support our platform and allow us to continue providing free price tracking services.
              </p>
            </div>
          </section>


          {/* How It Works */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>

            <div className="space-y-6">

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    You Track Products
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    Use PriceWiser to track price changes for Amazon products you're interested in purchasing.
                  </p>
                </div>
              </div>


              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    We Notify You of Price Changes
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    Our system monitors prices and alerts you when they drop or meet your criteria.
                  </p>
                </div>
              </div>


              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    You Purchase Through Our Links
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    When you're ready to buy, click through our tracked links to Amazon. If you make a purchase, we earn a small commission.
                  </p>
                </div>
              </div>

            </div>
          </section>


          {/* What This Means For You */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What This Means For You
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  ✓ No Additional Cost
                </h3>

                <p className="text-green-800 leading-relaxed">
                  You pay the same price whether you use our links or not. The commission comes from Amazon’s marketing budget, not from your pocket.
                </p>
              </div>


              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  ✓ Same Amazon Experience
                </h3>

                <p className="text-green-800 leading-relaxed">
                  You still purchase directly from Amazon with all their buyer protections, return policies, and customer service.
                </p>
              </div>


              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  ✓ Supports Our Service
                </h3>

                <p className="text-green-800 leading-relaxed">
                  Your purchases through our links help keep PriceWiser running and allow us to add new features.
                </p>
              </div>


              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  ✓ Transparent Relationship
                </h3>

                <p className="text-green-800 leading-relaxed">
                  We believe in full transparency about how we earn revenue and maintain our service.
                </p>
              </div>

            </div>
          </section>


          {/* Important Notes */}
          <section className="mb-10">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Important Notes
            </h2>

            <ul className="space-y-4">

              <li className="text-gray-900">
                <strong>Price Accuracy:</strong> While we strive to display accurate prices, Amazon prices can change frequently. Always verify the final price on Amazon before purchasing.
              </li>

              <li className="text-gray-900">
                <strong>Product Availability:</strong> Product availability and promotional offers are subject to Amazon's terms and may change without notice.
              </li>

              <li className="text-gray-900">
                <strong>Commission Rates:</strong> Commission rates vary by product category and are determined by Amazon.
              </li>

              <li className="text-gray-900">
                <strong>No Influence on Recommendations:</strong> Our AI insights and price predictions are not influenced by affiliate commissions. We provide unbiased analysis regardless of commission rates.
              </li>

            </ul>

          </section>


          {/* Last Updated */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}