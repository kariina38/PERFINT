import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export function HelpCenter() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "To create an account, tap the 'Register' button on the login screen, enter your email, phone number, and create a password. You'll receive an OTP for verification.",
        },
        {
          question: "How do I add my first wallet?",
          answer: "After logging in, go to the Wallets tab and tap the '+' button. Enter your wallet name, select the type (Cash, Bank, Card), and set the initial balance.",
        },
      ],
    },
    {
      category: "Transactions",
      questions: [
        {
          question: "How do I record a transaction?",
          answer: "Tap the '+' button on the home screen, select Income or Expense, choose the category, enter the amount, and select the wallet. You can also add a note and date.",
        },
        {
          question: "Can I edit or delete a transaction?",
          answer: "Yes, go to your transaction history, tap on the transaction you want to modify, and select 'Edit' or 'Delete' from the options menu.",
        },
        {
          question: "How do I categorize my expenses?",
          answer: "When adding a transaction, you can select from predefined categories like Food, Transport, Shopping, etc. You can also create custom categories in Settings.",
        },
      ],
    },
    {
      category: "Budgets & Goals",
      questions: [
        {
          question: "How do I set a budget?",
          answer: "Go to the Budgets tab, tap 'Create Budget', select a category, set the amount limit and time period (monthly, weekly), and save. You'll receive alerts when approaching the limit.",
        },
        {
          question: "What happens when I exceed my budget?",
          answer: "You'll receive a notification alert when you reach 80% and 100% of your budget limit. The budget progress bar will turn red to indicate you've exceeded the limit.",
        },
      ],
    },
    {
      category: "Security",
      questions: [
        {
          question: "Is my financial data secure?",
          answer: "Yes, we use bank-level encryption to protect your data. All sensitive information is encrypted both in transit and at rest. We never share your data with third parties.",
        },
        {
          question: "How do I enable biometric authentication?",
          answer: "Go to Settings > Security > Biometric Authentication and toggle it on. You'll be able to use your fingerprint or face ID to quickly access the app.",
        },
      ],
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "Mon-Fri, 9AM-6PM EST",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@financetracker.com",
      availability: "Response within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "+1 (800) 123-4567",
      availability: "Mon-Fri, 9AM-6PM EST",
    },
  ];

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
            <h1 className="text-lg font-bold text-gray-900">Help Center</h1>
          </div>

          {/* Search Bar */}
          <Card className="p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                className="flex-1 outline-none bg-transparent text-sm"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Contact Support</h3>
          <div className="grid gap-3">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="p-4 rounded-2xl hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{method.title}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{method.availability}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Frequently Asked Questions</h3>
          
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-2">
              <h4 className="text-sm font-medium text-blue-600 px-2">{category.category}</h4>
              {category.questions.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex;
                const isExpanded = expandedFaq === globalIndex;
                
                return (
                  <Card key={faqIndex} className="rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : globalIndex)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900 text-left">{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="p-4 rounded-2xl bg-blue-50 border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2">Need More Help?</h4>
          <p className="text-sm text-gray-600 mb-4">
            Visit our comprehensive documentation and video tutorials for detailed guides.
          </p>
          <Button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
            View Documentation
          </Button>
        </Card>
      </div>
    </div>
  );
}
