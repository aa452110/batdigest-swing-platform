import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Background for Nav */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-800 to-teal-600">
        {/* Navigation */}
        <nav className="relative z-50 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link to="/" className="flex items-center gap-3">
                <img 
                  src="/swing-shop-icon.png" 
                  alt="Swing Shop" 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                <span className="text-xl md:text-2xl font-bold text-white">Swing Shop</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4 md:space-x-6">
                <a href="https://batdigest.com" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  BatDigest
                </a>
                <Link to="/login" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  Player Login
                </Link>
                <Link to="/coach/login" className="text-white hover:text-cyan-300 text-sm md:text-base">
                  Coach Login
                </Link>
                <a href="/#pricing" className="bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-cyan-600 text-sm md:text-base">
                  Sign Up
                </a>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Slide-out */}
        <div className={`fixed top-0 right-0 h-full w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}>
          <div className="p-6">
            <button
              className="absolute top-6 right-6 text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mt-16 flex flex-col space-y-6">
              <a 
                href="https://batdigest.com" 
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                BatDigest
              </a>
              <Link 
                to="/login" 
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Player Login
              </Link>
              <Link 
                to="/coach/login" 
                className="text-white text-lg hover:text-cyan-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Coach Login
              </Link>
              <a 
                href="/#pricing" 
                className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 text-center font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              SWING SHOP TERMS OF SERVICE & PRIVACY POLICY
            </h1>
            <p className="text-sm text-gray-600">Last Updated: August 29, 2025</p>
            <p className="text-xs text-gray-500 mt-1">A BatDigest.com Initiative</p>
          </div>

          {/* Terms of Service */}
          <div className="space-y-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b-2 border-gray-200">
              Terms of Service
            </h2>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. SERVICE DESCRIPTION</h3>
              <p className="text-gray-700 leading-relaxed">
                Swing Shop provides professional video analysis services for baseball and softball players. 
                Our team of experienced coaches analyzes your swing videos and provides personalized feedback 
                to help improve your performance.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. USER ACCOUNTS & CONSENT</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>You must create an account through swing.batdigest.com</li>
                <li>You are responsible for maintaining account security</li>
                <li>Users under 18 require parental consent</li>
                <li>By uploading videos of minors, you confirm you are the parent/guardian</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3. SUBSCRIPTION PLANS</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>Starter Plan: Monthly subscription</li>
                <li>Performance Plan: Monthly subscription with premium features</li>
                <li>6-Month Performance: 6-month commitment with discount</li>
                <li>All subscription management through swing.batdigest.com/login</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">4. CANCELLATION POLICY</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>You may cancel anytime at swing.batdigest.com/login</li>
                  <li>Cancellations take effect at the end of your current billing period</li>
                  <li>No refunds for partial months or unused analyses</li>
                  <li>Visit swing.batdigest.com/login to understand your options</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">5. DISCLAIMER OF WARRANTIES</h3>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold uppercase">
                  THE SWING SHOP SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES 
                  OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES 
                  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>We make no warranty that the service will be uninterrupted or error-free</li>
                  <li>We do not warrant the accuracy or completeness of any analysis</li>
                  <li>We expressly disclaim all warranties not stated in these terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">6. LIMITATION OF LIABILITY</h3>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>IN NO EVENT SHALL SWING SHOP, BATDIGEST, OR ITS AFFILIATES BE LIABLE FOR ANY 
                      INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                  <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE PAST TWELVE (12) MONTHS</li>
                  <li>WE SHALL NOT BE LIABLE FOR ANY LOSS OF DATA, LOSS OF PROFITS, OR INTERRUPTION OF BUSINESS</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7. BINDING ARBITRATION & CLASS ACTION WAIVER</h3>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                <p className="font-semibold text-gray-800 mb-3">
                  PLEASE READ CAREFULLY – THIS AFFECTS YOUR LEGAL RIGHTS:
                </p>
                <ul className="text-gray-700 space-y-2 list-disc list-inside">
                  <li>Any dispute shall be resolved through binding arbitration, not in court</li>
                  <li>Arbitration shall be conducted by JAMS in Delaware</li>
                  <li>You waive any right to bring or participate in a class action lawsuit</li>
                  <li>You agree to resolve disputes only on an individual basis</li>
                  <li>This waiver applies to the maximum extent permitted by law</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">8. INDEMNIFICATION</h3>
              <div className="text-gray-700 space-y-3">
                <p>
                  You agree to indemnify, defend, and hold harmless Swing Shop, BatDigest, and their officers, 
                  directors, employees, and agents from any claims, damages, losses, liabilities, and expenses 
                  (including attorney's fees) arising from:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Your use or misuse of the service</li>
                  <li>Your violation of these Terms</li>
                  <li>Any content you submit through the service</li>
                  <li>Any false representations regarding guardian consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">9. GOVERNING LAW</h3>
              <p className="text-gray-700">
                These Terms shall be governed by the laws of the State of Delaware, without regard to conflict 
                of law provisions. Any legal proceedings shall be brought exclusively in Delaware courts.
              </p>
            </section>
          </div>

          {/* Privacy Policy */}
          <div className="space-y-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b-2 border-gray-200">
              Privacy Policy
            </h2>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">INFORMATION WE COLLECT</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>Account information (name, email)</li>
                <li>Videos you upload for analysis</li>
                <li>Coach codes and preferences</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">HOW WE USE YOUR INFORMATION</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>To provide video analysis services</li>
                <li>To match you with appropriate coaches</li>
                <li>To improve our coaching methods</li>
                <li>To communicate about your analyses</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">DATA STORAGE & RETENTION</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>Videos stored securely on Cloudflare R2</li>
                <li>Analyses retained for 30 days</li>
                <li>Account data retained while active</li>
                <li>You can request deletion at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">YOUR RIGHTS</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>Access your data at any time</li>
                <li>Request deletion of your account</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability upon request</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">CHILDREN'S PRIVACY</h3>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>Users under 18 require parental consent</li>
                <li>We comply with COPPA requirements</li>
                <li>Parents may review and delete their child's information</li>
              </ul>
            </section>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="text-gray-700 space-y-3">
              <div>
                <p className="font-semibold">For questions or concerns:</p>
                <p>Email: <a href="mailto:support@batdigest.com" className="text-cyan-600 hover:text-cyan-700">support@batdigest.com</a></p>
                <p>Website: <a href="https://swing.batdigest.com" className="text-cyan-600 hover:text-cyan-700">swing.batdigest.com</a></p>
              </div>
              <div>
                <p className="font-semibold">For privacy concerns:</p>
                <p>Email: <a href="mailto:privacy@batdigest.com" className="text-cyan-600 hover:text-cyan-700">privacy@batdigest.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img 
                src="/swing-shop-icon.png" 
                alt="Swing Shop" 
                className="w-12 h-12 opacity-50"
              />
              <div className="text-center md:text-left">
                <p className="text-gray-400">© 2024 Swing Shop. All rights reserved.</p>
                <p className="text-gray-400 text-sm mt-2">The Mechanic, Not the Metal.</p>
                <p className="text-gray-400 text-sm mt-1">A BatDigest.com Initiative</p>
              </div>
            </div>
            <div className="flex gap-6 flex-wrap">
              <a href="https://batdigest.com" className="text-gray-400 hover:text-white">BatDigest.com</a>
              <Link to="/login" className="text-gray-400 hover:text-white">Player Login</Link>
              <Link to="/coach/login" className="text-gray-400 hover:text-white">Coach Login</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
              <Link to="/support" className="text-gray-400 hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
