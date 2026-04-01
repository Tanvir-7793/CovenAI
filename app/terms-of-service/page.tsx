import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - CovenAI',
  description: 'Terms and conditions for using CovenAI services.'
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: December 6, 2023</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using the CovenAI service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Service Description</h2>
          <p className="text-gray-700 mb-4">
            CovenAI provides AI-powered legal document generation services. While we strive for accuracy, we do not provide legal advice and our service does not create an attorney-client relationship.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. User Responsibilities</h2>
          <p className="text-gray-700 mb-4">
            You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Use the Service for lawful purposes only</li>
            <li>Not engage in any activity that interferes with the Service</li>
            <li>Not attempt to reverse engineer or access the Service using unauthorized means</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            All content and materials available on the Service, including but not limited to text, graphics, logos, and software, are the property of CovenAI or its licensors and are protected by intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by law, CovenAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Terms at any time. We will provide notice of any changes by updating the "Last updated" date at the top of this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700 mt-2">
            Email: legal@covenai.com<br />
            Address: DIET Satara A/P- Sonwadi-Gajawadi, Sajjangad Road, Satara-415013.
          </p>
        </section>
      </div>
    </div>
  );
}
