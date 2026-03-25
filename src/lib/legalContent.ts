// Legal content structured from source DOCX documents
// Source: /Business Documents/Legal_Contact/
// All content is verbatim from the approved legal documents.

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'subsection'; heading: string; blocks: ContentBlock[] };

export type LegalSection = {
  number: string;
  heading: string;
  blocks: ContentBlock[];
};

export type LegalDocument = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  callout: { label: string; body: string };
  sections: LegalSection[];
  contact: { label: string; value: string }[];
};

function p(text: string): ContentBlock {
  return { type: 'paragraph', text };
}
function list(items: string[]): ContentBlock {
  return { type: 'list', items };
}
function table(headers: string[], rows: string[][]): ContentBlock {
  return { type: 'table', headers, rows };
}
function sub(heading: string, blocks: ContentBlock[]): ContentBlock {
  return { type: 'subsection', heading, blocks };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TERMS & CONDITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const termsAndConditions: LegalDocument = {
  title: 'Terms & Conditions',
  effectiveDate: 'March 2026',
  lastUpdated: 'March 21, 2026',
  callout: {
    label: 'PLEASE READ CAREFULLY',
    body: 'By accessing or using any Jurassic English™ materials, platforms, programmes, or services operated by World Wise Learning, you agree to be bound by these Terms & Conditions. If you do not agree, you must discontinue use immediately.',
  },
  sections: [
    {
      number: '1',
      heading: 'Introduction and Acceptance',
      blocks: [
        p('These Terms and Conditions ("Terms") govern your access to and use of all products, services, digital platforms, printed curriculum materials, licensing arrangements, and professional programmes offered by World Wise Learning ("We," "Us," or "Our") under the Jurassic English™ brand.'),
        p('By accessing Our Services—whether as an individual educator, institutional client, parent, student, or partner organisation—you confirm that you have read, understood, and agree to be bound by these Terms and any additional policies referenced herein, including Our Privacy Policy, Cookie Policy, and Disclaimer.'),
        p('These Terms constitute a legally binding agreement between you and World Wise Learning. We reserve the right to update these Terms at any time. Continued use of Our Services following notification of changes constitutes your acceptance of the revised Terms.'),
      ],
    },
    {
      number: '2',
      heading: 'Definitions',
      blocks: [
        p('For the purposes of these Terms, the following definitions apply:'),
        list([
          '"Services" means all Jurassic English™ curriculum materials, digital platforms, teacher training programmes, licensing agreements, academic consulting, and institutional partnership arrangements provided by World Wise Learning.',
          '"User" means any individual or entity accessing Our Services, including educators, school administrators, students, parents, institutional clients, and licensees.',
          '"Content" means all text, images, audio, video, assessments, curriculum frameworks, lesson plans, rubrics, and other materials made available through Our Services.',
          '"Institutional Client" means any school, academy, organisation, or educational body that enters into a formal licensing or partnership agreement with World Wise Learning.',
          '"Platform" means any digital interface, portal, learning management system, or online tool provided by World Wise Learning in connection with the Services.',
          '"Intellectual Property" means all patents, trade marks (including Jurassic English™ and Jurassic Thinking Cycle™), registered designs, copyrights, database rights, trade secrets, and other proprietary rights owned or licensed by World Wise Learning.',
        ]),
      ],
    },
    {
      number: '3',
      heading: 'Eligibility and Account Registration',
      blocks: [
        sub('3.1 Eligibility', [
          p('Our Services are intended for professional educators, educational institutions, and individuals aged 18 or over. Use of Our Services by or on behalf of minors (persons under 18) must be supervised by a qualified adult educator or parent/guardian. Institutional Clients are responsible for ensuring appropriate supervision of minor users within their premises.'),
        ]),
        sub('3.2 Account Registration', [
          p('Certain Services may require account registration. You agree to provide accurate, current, and complete information during registration and to keep that information up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity conducted under your account.'),
          p('You must notify Us immediately at legal@worldwiselearning.com if you suspect any unauthorised use of your account. We reserve the right to suspend or terminate accounts that contain false information or that violate these Terms.'),
        ]),
        sub('3.3 Institutional Account Administration', [
          p('Institutional Clients may designate one or more administrators responsible for managing user access within their organisation. Institutional Clients are fully responsible for all activity conducted under their institutional account, including the conduct of individual users to whom they grant access.'),
        ]),
      ],
    },
    {
      number: '4',
      heading: 'Permitted Use and Licence',
      blocks: [
        sub('4.1 Licence Grant', [
          p('Subject to your compliance with these Terms and payment of any applicable fees, World Wise Learning grants you a limited, non-exclusive, non-transferable, revocable licence to access and use Our Services solely for your internal educational purposes.'),
        ]),
        sub('4.2 Permitted Uses', [
          p('Under this licence you may:'),
          list([
            'Deliver Jurassic English™ curriculum to enrolled students within your licensed institution;',
            'Participate in teacher training and professional development programmes;',
            'Access, print, and distribute curriculum materials to enrolled students for classroom use within your licensed scope;',
            'Engage with digital platforms for instructional planning and assessment purposes.',
          ]),
        ]),
        sub('4.3 Prohibited Uses', [
          p('You must not, without Our prior written consent:'),
          list([
            'Reproduce, distribute, sell, sublicense, translate, or otherwise commercialise any portion of Our Content or Services;',
            'Modify, adapt, or create derivative works based on Our Content without express written permission;',
            'Remove, alter, or obscure any copyright notices, trade marks, or proprietary labels from Our materials;',
            'Share account credentials, access codes, or digital licences with individuals or institutions outside your licensed user base;',
            'Use Our Services for any unlawful purpose or in violation of applicable law or regulation;',
            'Use automated systems, bots, scrapers, or similar tools to access, extract, or index Our Content;',
            'Transmit malicious code, viruses, or disruptive software through Our platforms;',
            'Represent Our materials as your own original work or misrepresent your relationship with World Wise Learning.',
          ]),
          p('Violation of these prohibitions may result in immediate termination of your licence and legal action.'),
        ]),
      ],
    },
    {
      number: '5',
      heading: 'Intellectual Property Rights',
      blocks: [
        p('All Content, frameworks, trade marks, logos, and methodologies—including the Jurassic Thinking Cycle™, CEIW Structure, Four-Level Reasoning Rubric, and all associated pedagogical tools—are the exclusive intellectual property of World Wise Learning and are protected by applicable copyright, trade mark, and other intellectual property laws.'),
        p('Nothing in these Terms transfers any intellectual property rights to you. Your licence to use Our Services does not constitute assignment or waiver of any intellectual property right. All goodwill generated through use of Our trade marks accrues solely to World Wise Learning.'),
        p('If you believe any Content on Our platform infringes your intellectual property rights, please contact Us at legal@worldwiselearning.com with full particulars of the alleged infringement.'),
      ],
    },
    {
      number: '6',
      heading: 'Fees and Payment',
      blocks: [
        sub('6.1 Pricing', [
          p('Access to certain Services is subject to fees as set out in your individual agreement, licensing contract, or as displayed on Our website at www.jurassicenglish.com. Fees are quoted exclusive of applicable taxes unless otherwise stated.'),
        ]),
        sub('6.2 Payment Terms', [
          p('Payment terms are specified in individual service agreements. Institutional Clients are subject to the payment schedule agreed at the time of contracting. Failure to make timely payment may result in suspension of access to licensed Services without prejudice to any outstanding obligations.'),
        ]),
        sub('6.3 Refund Policy', [
          p('Refunds are assessed on a case-by-case basis in accordance with the terms of your individual service agreement. Digital curriculum materials and downloaded resources are non-refundable once accessed.'),
        ]),
      ],
    },
    {
      number: '7',
      heading: 'Confidentiality',
      blocks: [
        p('Each party agrees to keep confidential all non-public, proprietary, or commercially sensitive information disclosed by the other party in connection with these Terms ("Confidential Information"). Confidential Information shall not be disclosed to third parties without prior written consent, except as required by law or regulation.'),
        p('The obligations of this clause survive termination of these Terms for a period of three (3) years.'),
      ],
    },
    {
      number: '8',
      heading: 'Warranties and Representations',
      blocks: [
        p('World Wise Learning represents that it holds all necessary rights to provide the Services and Content as described herein. To the fullest extent permitted by law, Our Services and Content are provided "AS IS" and "AS AVAILABLE." We do not warrant that Our Services will be uninterrupted, error-free, or free from harmful components.'),
        p('You represent that: (a) you have the authority to enter into these Terms; (b) your use of Our Services complies with all applicable laws and regulations; and (c) the information you provide to Us is accurate and complete.'),
      ],
    },
    {
      number: '9',
      heading: 'Limitation of Liability',
      blocks: [
        p('To the maximum extent permitted by applicable law, World Wise Learning shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from or in connection with your use of or inability to use Our Services.'),
        p('Our total aggregate liability to you for any direct damages shall not exceed the total fees paid by you to Us in the twelve (12) months preceding the claim.'),
        p('Nothing in these Terms limits Our liability for: (a) death or personal injury caused by Our negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability that cannot be excluded by law.'),
      ],
    },
    {
      number: '10',
      heading: 'Indemnification',
      blocks: [
        p('You agree to indemnify, defend, and hold harmless World Wise Learning and its officers, directors, employees, agents, and licensors from and against all claims, damages, losses, costs, and expenses (including reasonable legal fees) arising from: (a) your use of Our Services; (b) your breach of these Terms; (c) your violation of any third-party rights; or (d) any content you submit through Our platforms.'),
      ],
    },
    {
      number: '11',
      heading: 'Term and Termination',
      blocks: [
        p('These Terms remain in effect for the duration of your use of Our Services. Either party may terminate this agreement on written notice if the other party materially breaches these Terms and fails to remedy the breach within thirty (30) days of notification.'),
        p('World Wise Learning may immediately suspend or terminate your access if you violate the prohibited uses in Section 4.3, engage in fraudulent activity, or if required to do so by law.'),
        p('Upon termination, all licences granted under these Terms cease immediately. Sections 5 (Intellectual Property), 7 (Confidentiality), 9 (Limitation of Liability), 10 (Indemnification), and 13 (Governing Law) survive termination.'),
      ],
    },
    {
      number: '12',
      heading: 'Third-Party Services and Links',
      blocks: [
        p('Our Services may integrate with or contain links to third-party platforms, services, or websites. These are provided for convenience only. World Wise Learning does not endorse, control, or accept responsibility for the content, privacy practices, or terms of any third-party service. You access third-party services at your own risk.'),
      ],
    },
    {
      number: '13',
      heading: 'Governing Law and Dispute Resolution',
      blocks: [
        p('These Terms are governed by and construed in accordance with the laws of the jurisdiction in which World Wise Learning is registered. Any disputes arising out of or in connection with these Terms shall first be subject to good-faith negotiation between the parties.'),
        p('If negotiation fails to resolve a dispute within sixty (60) days, the parties agree to submit to non-binding mediation before initiating any legal proceedings.'),
      ],
    },
    {
      number: '14',
      heading: 'Force Majeure',
      blocks: [
        p('World Wise Learning shall not be liable for any failure or delay in performance of its obligations under these Terms resulting from causes beyond its reasonable control, including acts of God, natural disasters, pandemic, government action, war, civil unrest, infrastructure failure, or third-party service outages.'),
      ],
    },
    {
      number: '15',
      heading: 'Modifications to Terms',
      blocks: [
        p('We reserve the right to modify these Terms at any time. We will provide notice of material changes via email (to the address associated with your account) or by prominent notice on Our website. Continued use of Our Services following such notice constitutes acceptance of the updated Terms.'),
      ],
    },
    {
      number: '16',
      heading: 'Entire Agreement',
      blocks: [
        p('These Terms, together with Our Privacy Policy, Cookie Policy, Disclaimer, and any applicable service-specific agreements, constitute the entire agreement between you and World Wise Learning with respect to the subject matter herein, and supersede all prior agreements and understandings.'),
      ],
    },
    {
      number: '17',
      heading: 'Contact Information',
      blocks: [
        p('For questions regarding these Terms and Conditions, please contact:'),
      ],
    },
  ],
  contact: [
    { label: 'Organisation', value: 'World Wise Learning' },
    { label: 'Brand', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Legal Enquiries', value: 'legal@worldwiselearning.com' },
    { label: 'Effective Date', value: 'March 2026' },
    { label: 'Last Updated', value: 'March 21, 2026' },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRIVACY POLICY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  effectiveDate: 'March 2026',
  lastUpdated: 'March 21, 2026',
  callout: {
    label: 'YOUR PRIVACY MATTERS',
    body: 'World Wise Learning is committed to protecting your personal data. This Privacy Policy explains what data we collect, how we use it, and your rights under applicable data protection law including the UK GDPR, EU GDPR, and equivalent international legislation.',
  },
  sections: [
    {
      number: '1',
      heading: 'Who We Are',
      blocks: [
        p('World Wise Learning ("We," "Us," "Our") is the data controller responsible for your personal data. We develop and deliver the Jurassic English™ curriculum, professional development programmes, and supporting educational services to schools and educators internationally.'),
        table(
          ['Detail', 'Information'],
          [
            ['Data Controller', 'World Wise Learning'],
            ['Brand', 'Jurassic English™'],
            ['Website', 'www.jurassicenglish.com'],
            ['Contact', 'legal@worldwiselearning.com'],
          ],
        ),
      ],
    },
    {
      number: '2',
      heading: 'Data We Collect',
      blocks: [
        sub('2.1 Information You Provide to Us', [
          p('We collect personal data that you provide directly, including:'),
          list([
            'Full name and professional title;',
            'Institutional email address and contact details;',
            'School or organisation name and address;',
            'Role and level of seniority (for teacher training and licensing purposes);',
            'Payment and billing information (processed securely via third-party payment processors);',
            'Communication records, including emails, enquiry forms, and support correspondence;',
            'Account credentials (username and encrypted password) for platform users.',
          ]),
        ]),
        sub('2.2 Information Collected Automatically', [
          p('When you use Our digital platforms, We may collect:'),
          list([
            'IP address and browser type;',
            'Device type and operating system;',
            'Pages visited, session duration, and click behaviour;',
            'Referral source (how you arrived at Our site);',
            'Cookies and similar tracking technologies (see Our Cookie Policy for full details).',
          ]),
        ]),
        sub('2.3 Information About Students', [
          p('Where Our Services are delivered to minors through an institutional arrangement, We process student data only on behalf of and under instruction from the Institutional Client (the school or organisation). Institutional Clients act as the data controller in respect of student data; We act as data processor. Student data is used solely for curriculum delivery and is never used for commercial purposes.'),
        ]),
        sub('2.4 Special Category Data', [
          p('We do not knowingly collect special category data (such as health data, ethnicity, or biometric data) unless explicitly required under a specific institutional agreement, with appropriate legal basis and safeguards in place.'),
        ]),
      ],
    },
    {
      number: '3',
      heading: 'How We Use Your Data',
      blocks: [
        p('We use your personal data for the following purposes:'),
        list([
          'To provide, maintain, and improve Our Services;',
          'To process account registrations and manage user access;',
          'To process payments and manage contractual arrangements;',
          'To communicate with you regarding service updates, training, and account information;',
          'To deliver teacher training and professional development programmes;',
          'To provide technical support and respond to enquiries;',
          'To comply with legal and regulatory obligations;',
          'To conduct educational research and improve Our pedagogical frameworks (using only anonymised or aggregated data);',
          'To send marketing communications, where you have provided explicit consent (you may withdraw consent at any time without affecting the lawfulness of prior processing).',
        ]),
      ],
    },
    {
      number: '4',
      heading: 'Legal Basis for Processing',
      blocks: [
        p('We process your personal data on the following legal bases:'),
        table(
          ['Legal Basis', 'When It Applies'],
          [
            ['Contractual Necessity', 'Processing required to perform a contract with you or your institution.'],
            ['Legitimate Interests', 'Processing for fraud prevention, security, and improving Our Services.'],
            ['Consent', 'Processing based on your freely given, informed, and specific consent (e.g., marketing emails).'],
            ['Legal Obligation', 'Processing required by applicable law or regulatory authority.'],
          ],
        ),
      ],
    },
    {
      number: '5',
      heading: 'Data Sharing and Disclosure',
      blocks: [
        p('We do not sell your personal data. We may share your data with:'),
        list([
          'Service providers: Third-party platforms (e.g., cloud hosting, payment processors, email delivery services) engaged to operate Our Services under data processing agreements;',
          'Institutional Clients: Where you are a student or user registered under an institutional account, relevant data may be shared with your institution\'s designated administrator;',
          'Professional advisors: Legal, accounting, and compliance professionals bound by professional confidentiality;',
          'Regulatory authorities: Where required by law, court order, or government directive.',
        ]),
        p('All third-party data processors are contractually obligated to process data only as instructed by Us and in compliance with applicable data protection law.'),
      ],
    },
    {
      number: '6',
      heading: 'International Data Transfers',
      blocks: [
        p('As an internationally operating organisation, your data may be transferred to and processed in countries outside your country of residence. Where data is transferred outside the UK/EU/EEA, We implement appropriate safeguards—including Standard Contractual Clauses approved by relevant data protection authorities—to ensure equivalent protection.'),
      ],
    },
    {
      number: '7',
      heading: 'Data Retention',
      blocks: [
        p('We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce Our agreements. Standard retention periods are:'),
        table(
          ['Data Category', 'Retention Period'],
          [
            ['Active account data', 'Duration of account plus 24 months after closure'],
            ['Contractual records', '7 years from contract end (legal/audit purposes)'],
            ['Communication logs', '3 years from last interaction'],
            ['Marketing data', 'Until consent is withdrawn'],
            ['Anonymised analytics', 'Indefinitely (no longer constitutes personal data)'],
          ],
        ),
      ],
    },
    {
      number: '8',
      heading: 'Your Data Protection Rights',
      blocks: [
        p('Subject to applicable data protection law, you have the following rights in respect of your personal data:'),
        list([
          'Right of access: To request a copy of the personal data We hold about you;',
          'Right to rectification: To request correction of inaccurate or incomplete data;',
          'Right to erasure: To request deletion of your data in certain circumstances;',
          'Right to restriction: To request that We restrict processing of your data;',
          'Right to data portability: To receive your data in a structured, machine-readable format;',
          'Right to object: To object to processing based on legitimate interests or for direct marketing;',
          'Right to withdraw consent: Where processing is based on consent, to withdraw that consent at any time.',
        ]),
        p('To exercise any of these rights, contact Us at legal@worldwiselearning.com. We will respond within the timeframe required by applicable law (typically 30 days). We may request proof of identity before processing your request.'),
      ],
    },
    {
      number: '9',
      heading: 'Children\'s Privacy',
      blocks: [
        p('Our Services are directed at educational institutions and professional educators. Where Our curriculum is delivered to students under 18, this occurs through the institutional relationship, and the Institutional Client is responsible for obtaining all necessary consents from parents or guardians.'),
        p('We do not knowingly collect personal data directly from children under 13 without verifiable parental consent. If you believe We have inadvertently collected such data, contact Us immediately at legal@worldwiselearning.com.'),
      ],
    },
    {
      number: '10',
      heading: 'Security',
      blocks: [
        p('We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, accidental loss, destruction, or damage. Measures include: encryption of data in transit (TLS/SSL), access controls, regular security assessments, and staff training on data protection obligations.'),
        p('No method of transmission over the internet or electronic storage is completely secure. While We strive to protect your data, We cannot guarantee absolute security.'),
      ],
    },
    {
      number: '11',
      heading: 'Cookies',
      blocks: [
        p('We use cookies and similar tracking technologies on Our platforms. For detailed information on the types of cookies We use and how to manage your preferences, please refer to Our Cookie Policy available at www.jurassicenglish.com.'),
      ],
    },
    {
      number: '12',
      heading: 'Third-Party Links',
      blocks: [
        p('Our platforms may contain links to third-party websites. This Privacy Policy applies only to Our Services. We encourage you to review the privacy policies of any third-party sites you visit.'),
      ],
    },
    {
      number: '13',
      heading: 'Changes to This Policy',
      blocks: [
        p('We may update this Privacy Policy periodically. We will notify you of material changes via email or by a prominent notice on Our platform. The "Last Updated" date at the top of this policy reflects the most recent revision.'),
      ],
    },
    {
      number: '14',
      heading: 'Complaints',
      blocks: [
        p('If you have concerns about how We handle your personal data, please contact Us at legal@worldwiselearning.com. You also have the right to lodge a complaint with your relevant supervisory authority (e.g., the UK Information Commissioner\'s Office, or the applicable national data protection authority in your jurisdiction).'),
      ],
    },
    {
      number: '15',
      heading: 'Contact Us',
      blocks: [],
    },
  ],
  contact: [
    { label: 'Data Controller', value: 'World Wise Learning' },
    { label: 'Brand', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Privacy Enquiries', value: 'legal@worldwiselearning.com' },
    { label: 'Effective Date', value: 'March 2026' },
    { label: 'Last Updated', value: 'March 21, 2026' },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COOKIE POLICY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const cookiePolicy: LegalDocument = {
  title: 'Cookie Policy',
  effectiveDate: 'March 2026',
  lastUpdated: 'March 21, 2026',
  callout: {
    label: 'ABOUT THIS POLICY',
    body: 'This Cookie Policy explains what cookies are, how World Wise Learning uses them across Jurassic English™ platforms, and how you can manage your cookie preferences.',
  },
  sections: [
    {
      number: '1',
      heading: 'What Are Cookies?',
      blocks: [
        p('Cookies are small text files placed on your device (computer, tablet, or smartphone) when you visit a website or use a digital platform. They are widely used to make platforms work efficiently, improve user experience, and provide operational information to site operators.'),
        p('Similar technologies—including web beacons, pixel tags, local storage, and session storage—function similarly to cookies and are referred to collectively as "cookies" throughout this policy.'),
      ],
    },
    {
      number: '2',
      heading: 'How We Use Cookies',
      blocks: [
        p('World Wise Learning uses cookies on Our platforms to:'),
        list([
          'Enable core platform functionality (e.g., secure login sessions and CSRF protection);',
          'Remember your preferences and settings across visits;',
          'Analyse how users interact with Our platform to improve usability and content relevance;',
          'Support the delivery of relevant educational content and training pathways;',
          'Measure the effectiveness of professional development programmes and communications.',
        ]),
      ],
    },
    {
      number: '3',
      heading: 'Types of Cookies We Use',
      blocks: [
        table(
          ['Cookie Type', 'Duration', 'Purpose'],
          [
            ['Strictly Necessary', 'Session', 'Essential for the platform to function. Cannot be disabled. Includes authentication tokens, session management, and security (CSRF) protection.'],
            ['Functional', 'Persistent (up to 12 months)', 'Remember your preferences such as language, region, and display settings to personalise your experience across visits.'],
            ['Performance / Analytics', 'Persistent (up to 24 months)', 'Collect anonymised data on page visits, navigation, and time on page to help Us improve platform usability and learning content.'],
            ['Training & Assessment', 'Session / Persistent', 'Track completion of training modules, assessment progress, and certification records associated with teacher development programmes.'],
            ['Communication', 'Persistent (up to 12 months)', 'Record acknowledgement of important notices and subscription or opt-out status for communications.'],
          ],
        ),
      ],
    },
    {
      number: '4',
      heading: 'Third-Party Cookies',
      blocks: [
        p('Some cookies on Our platforms are set by trusted third-party service providers. These may include:'),
        list([
          'Analytics providers — to help Us understand platform usage patterns using anonymised data;',
          'Video and multimedia delivery services — to stream training and instructional content;',
          'Communication and survey tools — to deliver newsletters and collect feedback;',
          'Payment processors — for secure transaction processing.',
        ]),
        p('These third parties operate under their own cookie and privacy policies, which We recommend you review. World Wise Learning does not control third-party cookies and is not responsible for the data practices of third-party providers.'),
      ],
    },
    {
      number: '5',
      heading: 'Your Cookie Choices',
      blocks: [
        sub('5.1 Cookie Consent Banner', [
          p('On your first visit to Our platforms, you will be presented with a cookie consent banner. You may accept all cookies, accept only strictly necessary cookies, or manage your preferences in detail. Strictly necessary cookies cannot be disabled as they are essential to platform functionality.'),
        ]),
        sub('5.2 Browser Settings', [
          p('You can manage and delete cookies through your browser settings. Most modern browsers allow you to:'),
          list([
            'View all cookies currently stored on your device;',
            'Block cookies from specific or all websites;',
            'Delete all cookies at the end of each browsing session.',
          ]),
          p('Please note that blocking or deleting cookies may impair the functionality of Our platforms. Features including login persistence and personalised settings may not function correctly without cookies.'),
        ]),
        sub('5.3 Opt-Out Tools', [
          p('For analytics cookies, you may use browser plug-ins or opt-out mechanisms provided by individual analytics service providers. Links to these opt-out tools are available in the full cookie declaration published on Our website at www.jurassicenglish.com.'),
        ]),
      ],
    },
    {
      number: '6',
      heading: 'Cookies and Children',
      blocks: [
        p('Where Our curriculum platforms are accessed by students under 18 through an institutional arrangement, cookie use is limited to strictly necessary and performance categories only. Institutional Clients are responsible for ensuring that appropriate parental consents are in place as required by applicable law in their jurisdiction.'),
      ],
    },
    {
      number: '7',
      heading: 'Do Not Track',
      blocks: [
        p('Some browsers support a "Do Not Track" (DNT) signal. Our platforms currently do not respond to DNT signals, as there is no globally accepted standard governing how platforms should interpret them. We will review this position as industry standards develop.'),
      ],
    },
    {
      number: '8',
      heading: 'Updates to This Policy',
      blocks: [
        p('We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or Our operational practices. Material changes will be communicated via Our website or by email. The "Last Updated" date at the top of this policy reflects the most recent revision.'),
      ],
    },
    {
      number: '9',
      heading: 'Contact Us',
      blocks: [
        p('For questions about Our use of cookies or to exercise your preferences, please contact:'),
      ],
    },
  ],
  contact: [
    { label: 'Organisation', value: 'World Wise Learning' },
    { label: 'Brand', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Cookie Enquiries', value: 'legal@worldwiselearning.com' },
    { label: 'Last Updated', value: 'March 21, 2026' },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCESSIBILITY STATEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const accessibilityStatement: LegalDocument = {
  title: 'Accessibility Statement',
  effectiveDate: 'March 2026',
  lastUpdated: 'March 21, 2026',
  callout: {
    label: 'OUR COMMITMENT',
    body: 'World Wise Learning is committed to ensuring that all Jurassic English™ digital platforms and curriculum materials are accessible to every user, including individuals with disabilities. We actively work to meet internationally recognised accessibility standards.',
  },
  sections: [
    {
      number: '1',
      heading: 'Our Commitment to Accessibility',
      blocks: [
        p('World Wise Learning believes that access to high-quality education should be equitable and inclusive. We are committed to designing and maintaining digital platforms and curriculum materials that are accessible to the widest possible audience, regardless of ability, disability, or the assistive technologies they use.'),
        p('Our accessibility commitment is aligned with the following frameworks:'),
        list([
          'Web Content Accessibility Guidelines (WCAG) 2.1 Level AA — the international standard for digital accessibility;',
          'Universal Design for Learning (UDL) — embedded in Our curriculum design to provide multiple means of engagement, representation, and expression;',
          'UNESCO Education for All and Education for Sustainable Development (ESD) principles;',
          'Applicable national and regional legislation, including the UK Equality Act 2010 and equivalent international provisions.',
        ]),
      ],
    },
    {
      number: '2',
      heading: 'Conformance Status',
      blocks: [
        p('Our digital platforms are partially conformant with WCAG 2.1 Level AA. "Partially conformant" means that some parts of the content do not yet fully conform to the standard. We are actively working to address known gaps and improve conformance across all platforms and materials.'),
        table(
          ['Criterion', 'Detail'],
          [
            ['Target Standard', 'WCAG 2.1 Level AA'],
            ['Conformance Level', 'Partially Conformant'],
            ['Assessment Method', 'Internal review by World Wise Learning accessibility team'],
            ['Assessment Date', 'March 21, 2026'],
            ['Next Scheduled Review', 'March 2027'],
          ],
        ),
      ],
    },
    {
      number: '3',
      heading: 'Accessible Features Currently Implemented',
      blocks: [
        p('The following accessibility features are in place across Our platforms:'),
        list([
          'Keyboard navigability: Core platform functions can be accessed without a mouse;',
          'Screen reader compatibility: Semantic HTML and ARIA labels support assistive technology;',
          'Text alternatives: Images include descriptive alt text attributes;',
          'Colour contrast: Text and UI elements are designed to meet minimum contrast ratios (4.5:1 for normal text);',
          'Resizable text: Content reflows appropriately when text is scaled up to 200% without horizontal scrolling;',
          'Captions: Video content includes closed captions where available;',
          'Consistent navigation: Navigation menus and page structures are consistent throughout;',
          'Error identification: Form errors are clearly identified and described in text;',
          'Language identification: All pages include a defined language attribute in the page header.',
        ]),
      ],
    },
    {
      number: '4',
      heading: 'Known Limitations',
      blocks: [
        p('We acknowledge the following known limitations and are actively working to address them:'),
        list([
          'Some older PDF curriculum documents may not be fully compatible with screen reader technology. These are being progressively updated.',
          'Certain third-party embedded tools (e.g., video players and interactive assessments) may not fully conform to WCAG 2.1 AA. We are working with third-party providers to improve conformance.',
          'Complex data tables in some assessment materials may require additional navigation support for screen reader users.',
          'Audio descriptions for all video content are not yet universally available. This is being addressed in Our content production pipeline.',
        ]),
        p('If you encounter an accessibility barrier not listed above, please contact Us as described in Section 7.'),
      ],
    },
    {
      number: '5',
      heading: 'Curriculum Accessibility',
      blocks: [
        p('Jurassic English™ curriculum materials are designed using Universal Design for Learning (UDL) principles. The following accommodations are built into the pedagogical framework of the Jurassic English™ programme:'),
        sub('5.1 Special Educational Needs (SEN) Accommodations', [
          p('The curriculum includes documented accommodations for the following learner profiles:'),
          list([
            'Dyslexia: Extended time provisions, font flexibility (dyslexia-friendly fonts recommended), and reduced visual clutter on worksheets;',
            'ADHD: Chunked task sequences, regulation-before-reasoning protocols, and built-in movement breaks within lesson structures;',
            'Autism Spectrum: Clear, predictable lesson structures, visual schedules, and explicit metacognitive prompts;',
            'High Anxiety: Low-stakes initial engagement, gradual exposure to oral tasks, and private written response options;',
            'EAL/ESL Learners: Bilingual glossary support, sentence stem scaffolds, and adapted CEFR benchmarks.',
          ]),
        ]),
        sub('5.2 Accessible Physical Materials', [
          p('Printed curriculum materials are available in the following accessible formats upon written request:'),
          list([
            'Large print (minimum 16pt font);',
            'High-contrast printing formats;',
            'Digital editable versions compatible with assistive technology.',
          ]),
          p('To request materials in an accessible format, contact Us at legal@worldwiselearning.com.'),
        ]),
      ],
    },
    {
      number: '6',
      heading: 'Technical Specifications',
      blocks: [
        p('Our platforms rely on the following technologies to support accessibility:'),
        list([
          'HTML5 and ARIA (Accessible Rich Internet Applications) for semantic structure;',
          'CSS3 for responsive and adaptable layout;',
          'JavaScript for interactive features, with fallback functionality for users with JavaScript disabled where feasible.',
        ]),
        p('Our platforms are designed to be compatible with the following assistive technologies:'),
        list([
          'Screen readers: NVDA (Windows), JAWS (Windows), VoiceOver (macOS and iOS), TalkBack (Android);',
          'Speech recognition: Dragon NaturallySpeaking;',
          'Screen magnification: ZoomText and browser-native zoom functionality.',
        ]),
      ],
    },
    {
      number: '7',
      heading: 'Feedback and Contact',
      blocks: [
        p('We welcome feedback on the accessibility of Our platforms and materials. If you experience any accessibility barriers, require content in an accessible format, or wish to report an issue, please contact Us:'),
        table(
          ['Contact Detail', 'Information'],
          [
            ['Accessibility Enquiries', 'legal@worldwiselearning.com'],
            ['Organisation', 'World Wise Learning'],
            ['Website', 'www.jurassicenglish.com'],
            ['Response Time', 'We aim to respond within 5 business days of receipt.'],
          ],
        ),
        p('We take accessibility feedback seriously and will work to provide a timely resolution or accessible workaround for any reported issue.'),
      ],
    },
    {
      number: '8',
      heading: 'Formal Complaints',
      blocks: [
        p('If you are not satisfied with Our response to your accessibility feedback, you have the right to escalate your complaint to the relevant national enforcement body or equality authority in your jurisdiction.'),
        p('For users in the United Kingdom: The Equality and Human Rights Commission (EHRC) is responsible for enforcing equality legislation. For matters relating to public sector bodies and accessibility regulations, you may also contact the relevant monitoring body. For private sector services, you may seek independent legal advice.'),
        p('For users in other jurisdictions: Please refer to your applicable national disability rights or equality authority for information on your rights and available remedies.'),
      ],
    },
    {
      number: '9',
      heading: 'Review Schedule',
      blocks: [
        p('This Accessibility Statement is reviewed annually and updated to reflect ongoing improvements to Our platforms and curriculum materials. We are committed to continuous improvement of accessibility across all Our products and services.'),
        table(
          ['Detail', 'Date'],
          [
            ['Statement Issued', 'March 2026'],
            ['Last Reviewed', 'March 21, 2026'],
            ['Next Scheduled Review', 'March 2027'],
          ],
        ),
      ],
    },
  ],
  contact: [
    { label: 'Accessibility Enquiries', value: 'legal@worldwiselearning.com' },
    { label: 'Organisation', value: 'World Wise Learning' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISCLAIMER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const disclaimer: LegalDocument = {
  title: 'Disclaimer',
  effectiveDate: 'March 2026',
  lastUpdated: 'March 21, 2026',
  callout: {
    label: 'IMPORTANT NOTICE',
    body: 'Please read this Disclaimer carefully before using any Jurassic English™ materials, services, or platforms provided by World Wise Learning. This Disclaimer forms part of Our Terms & Conditions and applies to all users.',
  },
  sections: [
    {
      number: '1',
      heading: 'General Disclaimer',
      blocks: [
        p('The information, curriculum materials, services, and content ("Content") provided by World Wise Learning under the Jurassic English™ brand are offered in good faith for educational purposes. While we endeavour to ensure that all Content is accurate, current, and of the highest educational quality, World Wise Learning makes no representations or warranties of any kind, express or implied, as to the completeness, accuracy, reliability, suitability, or availability of the Content for any particular purpose.'),
        p('Any reliance you place on Our Content is strictly at your own risk. World Wise Learning shall not be held liable for any loss, damage, or adverse outcome arising directly or indirectly from your use of, or reliance on, any Content provided through Our Services.'),
      ],
    },
    {
      number: '2',
      heading: 'Educational Content Disclaimer',
      blocks: [
        p('Jurassic English™ curriculum materials are designed to support structured, teacher-facilitated learning aligned with internationally recognised academic frameworks including CEFR, CCSS, and iPGCE/PGCE standards. They are not intended to serve as a standalone or replacement educational programme without appropriate professional oversight by qualified educators.'),
        p('Learning outcomes described in Our curriculum materials represent targets and expectations within a structured instructional context. Individual student outcomes will vary based on factors including instructional delivery quality, student prior knowledge, learning environment, and wider educational context. World Wise Learning does not guarantee specific academic outcomes for individual learners.'),
        p('Our curriculum frameworks—including the Jurassic Thinking Cycle™, CEIW Structure, and associated pedagogical tools—are proprietary instructional models grounded in established educational research. They should be implemented by qualified educators who exercise professional judgment in adapting materials to their specific student populations and institutional contexts.'),
      ],
    },
    {
      number: '3',
      heading: 'Professional Advice Disclaimer',
      blocks: [
        p('Nothing contained within Our Services, websites, publications, training materials, or communications constitutes legal, financial, medical, psychological, or other professional advice. Content is provided for general educational and informational purposes only.'),
        p('For any legal, financial, safeguarding, or other professional matters arising in connection with your institution\'s use of Our Services, you should seek advice from appropriately qualified professionals. World Wise Learning expressly disclaims any liability arising from reliance on Our Content as a substitute for professional advice.'),
      ],
    },
    {
      number: '4',
      heading: 'No Warranties',
      blocks: [
        p('To the fullest extent permitted by applicable law, World Wise Learning disclaims all warranties, express or implied, including but not limited to:'),
        list([
          'Warranties of merchantability or fitness for a particular purpose;',
          'Warranties that Our digital platforms will be uninterrupted, error-free, secure, or free from viruses or other harmful components;',
          'Warranties as to the accuracy, completeness, or timeliness of any Content;',
          'Warranties that defects will be corrected within a specified timeframe.',
        ]),
        p('Some jurisdictions do not permit the exclusion of implied warranties. In such jurisdictions, Our liability is limited to the minimum extent permitted by applicable law.'),
      ],
    },
    {
      number: '5',
      heading: 'Limitation of Liability',
      blocks: [
        p('To the maximum extent permitted by law, World Wise Learning, its directors, employees, affiliates, agents, licensors, and service providers shall not be liable for any:'),
        list([
          'Indirect, incidental, special, consequential, or punitive damages;',
          'Loss of profit, revenue, data, goodwill, or business opportunity;',
          'Damages arising from reliance on Our Content or Services for institutional or individual decision-making;',
          'Damages resulting from unauthorised access to or alteration of your data on Our platforms.',
        ]),
        p('In all cases, Our total aggregate liability shall not exceed the total fees paid by you or your institution to World Wise Learning in the twelve (12) months preceding the event giving rise to the claim.'),
        p('Nothing in this Disclaimer excludes or limits Our liability for: (a) death or personal injury caused by Our negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability that cannot be excluded by law.'),
      ],
    },
    {
      number: '6',
      heading: 'Third-Party Content and External Links',
      blocks: [
        p('Our platforms and materials may reference, link to, or incorporate third-party resources, publications, research, or websites. Such references are provided for informational purposes only. World Wise Learning does not endorse, control, or accept responsibility for the content, accuracy, privacy practices, or accessibility of any third-party resources.'),
        p('Inclusion of a third-party link or reference does not imply endorsement by World Wise Learning. You access third-party resources at your own discretion and risk.'),
        p('Where Our curriculum materials reference specific literary texts for instructional purposes, those texts remain subject to their respective copyright holders\' terms. Educators are responsible for ensuring that any reproduction of third-party texts complies with applicable copyright law, fair dealing provisions, and relevant licensing arrangements in their jurisdiction.'),
      ],
    },
    {
      number: '7',
      heading: 'Errors and Omissions',
      blocks: [
        p('While We exercise diligence in producing and reviewing Our Content, curriculum materials may occasionally contain typographical errors, inaccuracies, or omissions. World Wise Learning reserves the right to correct any errors at any time without prior notice.'),
        p('We do not accept liability for any errors or omissions in Our Content. If you identify an error in any of Our materials, please contact Us at legal@worldwiselearning.com so that We may address it promptly.'),
      ],
    },
    {
      number: '8',
      heading: 'Regulatory and Jurisdictional Disclaimer',
      blocks: [
        p('Jurassic English™ curriculum frameworks are developed with reference to international educational standards including CEFR, CCSS, and iPGCE/PGCE. However, compliance with specific national curriculum requirements, regulatory standards, or institutional policies in your jurisdiction is the responsibility of the Institutional Client and the qualified educators delivering the curriculum.'),
        p('World Wise Learning does not warrant that Our curriculum or Services comply with the specific regulatory requirements of any particular national or regional education authority. Institutional Clients should conduct their own due diligence to ensure suitability within their regulatory and cultural context.'),
      ],
    },
    {
      number: '9',
      heading: 'Intellectual Property Notice',
      blocks: [
        p('All proprietary frameworks, methodologies, trade marks, and branded content included in Our materials are the intellectual property of World Wise Learning. This Disclaimer does not transfer any intellectual property rights to users. Unauthorised reproduction, distribution, or commercial exploitation of Our Content is strictly prohibited and may result in civil and/or criminal legal action.'),
        p('Jurassic English™, Jurassic Thinking Cycle™, and all associated marks are registered or unregistered trade marks of World Wise Learning. All rights reserved worldwide.'),
      ],
    },
    {
      number: '10',
      heading: 'Changes to This Disclaimer',
      blocks: [
        p('World Wise Learning reserves the right to amend this Disclaimer at any time. Material changes will be communicated via Our website or by email to registered users. Your continued use of Our Services following such notification constitutes your acceptance of the updated Disclaimer.'),
      ],
    },
    {
      number: '11',
      heading: 'Contact Information',
      blocks: [
        p('If you have questions regarding this Disclaimer or wish to report an issue with any of Our Content, please contact:'),
      ],
    },
  ],
  contact: [
    { label: 'Organisation', value: 'World Wise Learning' },
    { label: 'Brand', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Legal Enquiries', value: 'legal@worldwiselearning.com' },
    { label: 'Effective Date', value: 'March 2026' },
    { label: 'Last Updated', value: 'March 21, 2026' },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const legalDocuments: Record<string, LegalDocument> = {
  '/legal/terms': termsAndConditions,
  '/legal/privacy': privacyPolicy,
  '/legal/cookies': cookiePolicy,
  '/legal/accessibility': accessibilityStatement,
  '/legal/disclaimer': disclaimer,
};

export const isLegalPath = (pathname: string): boolean => {
  return pathname in legalDocuments;
};
