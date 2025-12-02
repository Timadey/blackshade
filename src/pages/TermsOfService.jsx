import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const TermsOfService = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-secondary">
                <div className="mb-8">
                    <Link to="/" className="text-primary hover:underline">&larr; Back to Home</Link>
                </div>

                <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

                <div className="space-y-6 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Blackshade, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Anonymity and Responsibility</h2>
                        <p>
                            Blackshade is designed for anonymous communication. However, anonymity does not shield you from the consequences of your actions.
                            You are solely responsible for the content you post.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Acceptable Use</h2>
                        <p>
                            You agree not to use Blackshade to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Post illegal, threatening, or harassing content.</li>
                            <li>Dox or reveal the private information of others without consent.</li>
                            <li>Spam or flood the service with repetitive content.</li>
                            <li>Distribute malware or attempt to compromise the security of the platform.</li>
                        </ul>
                        <p className="mt-2">
                            We reserve the right to remove content and ban users who violate these guidelines.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Content Ownership</h2>
                        <p>
                            You retain the rights to the content you create. By posting on Blackshade, you grant us a non-exclusive license to display, distribute, and copy your content within the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Disclaimer of Warranties</h2>
                        <p>
                            The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, Blackshade shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
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

export default TermsOfService;
