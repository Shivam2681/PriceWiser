export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-blue-100">
            Your privacy is important to us. Here's how we protect your data.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to PriceWiser ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our price tracking services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By using PriceWiser, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. Personal Information You Provide
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li><strong>Email address:</strong> When you create an account or subscribe to price alerts</li>
                  <li><strong>Name:</strong> If you choose to provide it during account creation</li>
                  <li><strong>Password:</strong> Encrypted and securely stored for account access</li>
                  <li><strong>Product URLs:</strong> Amazon product links you track</li>
                  <li><strong>Communication preferences:</strong> Email notification settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2. Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li><strong>Usage data:</strong> Pages visited, features used, time spent</li>
                  <li><strong>Device information:</strong> Browser type, operating system, IP address</li>
                  <li><strong>Log data:</strong> Server logs, access times, referring websites</li>
                  <li><strong>Cookies:</strong> We use cookies to enhance user experience (see Cookie Policy below)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <p className="text-gray-900 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-900 ml-4">
                <li>Provide, maintain, and improve our price tracking services</li>
                <li>Send you price drop alerts and notifications about tracked products</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Develop new features and services</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Protect the security and integrity of our service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Sharing of Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sharing of Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do NOT sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Service Providers:</strong> With trusted third-party vendors who perform services on our behalf (e.g., email delivery, hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (you will be notified via email)</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>
          </section>

          {/* Amazon Affiliate Disclosure */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Amazon Affiliate Relationship
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-gray-900 leading-relaxed">
                PriceWiser participates in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in. As an Amazon Associate
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using HTTPS/SSL</li>
              <li><strong>Password Security:</strong> Passwords are hashed and salted using industry-standard algorithms</li>
              <li><strong>Database Security:</strong> Secure MongoDB databases with access controls</li>
              <li><strong>Regular Audits:</strong> Periodic security reviews and updates</li>
              <li><strong>Limited Access:</strong> Only authorized personnel have access to user data</li>
            </ul>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Rights and Choices
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access Your Data
                </h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  Request a copy of the personal information we hold about you.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Correct Inaccuracies
                </h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  Update or correct your personal information through your account settings.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Delete Your Data
                </h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  Request deletion of your account and associated personal information.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Opt-Out of Communications
                </h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  Unsubscribe from promotional emails and adjust notification preferences.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Essential Cookies:</strong> Required for basic site functionality and security</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our service (Google Analytics)</li>
              <li><strong>Session Cookies:</strong> Maintain your login session</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You can control cookie settings through your browser. However, disabling cookies may limit your ability to use certain features of our service.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our service may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900 text-sm leading-relaxed">
                <strong>Examples:</strong> Amazon.com, email service providers (Resend), authentication services (NextAuth), hosting providers (Vercel).
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you become aware that a child under 13 has provided us with personal information, please contact us and we will take steps to delete such information.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date at the bottom of this page</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Contact Us */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <a 
              href="mailto:privacy@pricewiser.com" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              pricewiser.help@gmail.com
            </a>
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
