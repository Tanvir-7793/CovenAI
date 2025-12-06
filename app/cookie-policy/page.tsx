import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - CovenAI',
  description: 'Learn how CovenAI uses cookies and similar technologies.'
};

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: December 6, 2023</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. What Are Cookies</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Essential Cookies:</strong> Necessary for the website to function properly</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong>Functionality Cookies:</strong> Enable enhanced functionality and personalization</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how our service is used</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We may use third-party services that place cookies on your device. These third parties may collect information about your online activities over time and across different websites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Your Cookie Choices</h2>
          <p className="text-gray-700 mb-4">
            You can control and manage cookies in various ways. Most web browsers allow you to control cookies through their settings. However, if you disable cookies, some features of our Service may not function properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Cookie Policy, please contact us at:
          </p>
          <p className="text-gray-700 mt-2">
            Email: privacy@covenai.com<br />
            Address: DIET Satara A/P- Sonwadi-Gajawadi, Sajjangad Road, Satara-415013.
          </p>
        </section>
      </div>
    </div>
  );
}
