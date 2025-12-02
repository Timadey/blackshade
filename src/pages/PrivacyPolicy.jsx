import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const PrivacyPolicy = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-secondary">
                <div className="mb-8">
                    <Link to="/" className="text-primary hover:underline">&larr; Back to Home</Link>
                </div>

                <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

                <div className="space-y-6 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Blackshade. We are committed to protecting your privacy and ensuring your anonymity.
                            This Privacy Policy explains how we handle information when you use our anonymous social network.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Information We Do Not Collect</h2>
                        <p>
                            We built Blackshade with privacy as a core principle. We do <strong className="text-white">not</strong> collect:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Real names or email addresses (unless you explicitly provide them for support).</li>
                            <li>Phone numbers.</li>
                            <li>GPS location history (we only use your current location for local feeds if allowed, and do not store a history).</li>
                            <li>Device identifiers linked to your real identity.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Information We Do Collect</h2>
                        <p>
                            To make the service work, we process:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Generated Pseudonyms:</strong> Randomly assigned identifiers for your session.</li>
                            <li><strong>Content:</strong> The messages, boards, and replies you post.</li>
                            <li><strong>Usage Data:</strong> Minimal logs required for security and abuse prevention (e.g., rate limiting).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Cookies and Local Storage</h2>
                        <p>
                            We use local storage on your device to maintain your session and preferences (like your current pseudonym).
                            We do not use third-party tracking cookies for advertising.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect the limited data we hold. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Changes to This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us through the platform.
                        </p>
                    </section>

                    <div className="pt-8 text-sm text-secondary/60">
                        Last updated: December 2025
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;
