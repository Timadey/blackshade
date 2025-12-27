import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    canonical,
    ogType = 'website',
    ogImage = 'https://blackshade.site/favicon.svg',
    keywords
}) => {
    const siteName = 'Blackshade';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Speak freely and stay anonymous. Blackshade is a safe haven for your thoughts where you can connect without revealing your identity.';

    return (
        <Helmet>
            {/* Base Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
};

export default SEO;
