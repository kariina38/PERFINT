import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import { Card } from "../../components/ui/card";

export function TermsPrivacy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  const termsContent = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using the Personal Finance Tracker application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily use the Personal Finance Tracker for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose; attempt to decompile or reverse engineer any software contained in the application.",
    },
    {
      title: "3. Account Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.",
    },
    {
      title: "4. Financial Data",
      content: "You acknowledge that you are responsible for the accuracy of the financial data you input into the application. We do not verify the accuracy of your financial information and are not responsible for any errors or omissions in the data you provide.",
    },
    {
      title: "5. Service Modifications",
      content: "We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. You agree that we shall not be liable to you or to any third party for any modification, suspension or discontinuance of the service.",
    },
    {
      title: "6. Limitation of Liability",
      content: "In no event shall Personal Finance Tracker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our application.",
    },
  ];

  const privacyContent = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, add financial transactions, or contact our support team. This includes your name, email address, phone number, and financial transaction data you choose to input.",
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you technical notices and support messages, to communicate with you about products, services, and events, and to monitor and analyze trends, usage, and activities.",
    },
    {
      title: "3. Data Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration, and destruction. We use industry-standard encryption to protect your data both in transit and at rest. However, no security system is impenetrable and we cannot guarantee the security of our systems 100%.",
    },
    {
      title: "4. Data Sharing",
      content: "We do not share your personal financial data with third parties for marketing purposes. We may share your information with service providers who perform services on our behalf, such as cloud hosting and analytics, but only to the extent necessary to provide our services.",
    },
    {
      title: "5. Your Rights",
      content: "You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting our support team. You also have the right to opt out of receiving promotional communications from us.",
    },
    {
      title: "6. Data Retention",
      content: "We retain your personal information for as long as your account is active or as needed to provide you services. If you wish to delete your account, you may do so in the app settings, and we will delete your data within 30 days, except where we are required to retain it for legal purposes.",
    },
    {
      title: "7. Children's Privacy",
      content: "Our service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information.",
    },
    {
      title: "8. Changes to Privacy Policy",
      content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the 'Last Updated' date. You are advised to review this privacy policy periodically for any changes.",
    },
  ];

  const content = activeTab === "terms" ? termsContent : privacyContent;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Terms & Privacy</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === "terms"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Last Updated */}
        <Card className="p-4 rounded-2xl bg-blue-50 border-blue-100">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Last Updated:</span> February 28, 2026
          </p>
        </Card>

        {/* Content Sections */}
        <div className="space-y-4">
          {content.map((section, index) => (
            <Card key={index} className="p-4 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-3">{section.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="p-4 rounded-2xl bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Questions or Concerns?</h4>
          <p className="text-sm text-gray-600 mb-3">
            If you have any questions about our {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"}, 
            please contact us at:
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">legal@financetracker.com</p>
            <p className="text-gray-600">Personal Finance Tracker Inc.</p>
            <p className="text-gray-600">123 Finance Street, New York, NY 10001</p>
          </div>
        </Card>

        {/* Acknowledgment */}
        <Card className="p-4 rounded-2xl border-blue-200 bg-blue-50">
          <p className="text-sm text-gray-700 leading-relaxed">
            By continuing to use this application, you acknowledge that you have read, 
            understood, and agree to be bound by these {activeTab === "terms" ? "Terms of Service" : "Privacy Policy terms"}.
          </p>
        </Card>
      </div>
    </div>
  );
}
