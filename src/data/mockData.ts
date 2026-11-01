import type { 
  SchemeItem, 
  ApplicationItem, 
  ActivityItem, 
  AssistanceCentre, 
  CitizenProfile 
} from '../types';

export const INITIAL_CITIZEN_PROFILE: CitizenProfile = {
  name: 'Citizen',
  state: 'National Portal',
  district: 'All Districts',
  category: 'General',
  occupation: 'Citizen',
  annualIncomeBracket: 'Not Specified',
  digilockerLinked: false,
  aadhaarVerified: false,
  phone: 'Not Linked'
};

export const SAMPLE_SCHEMES: SchemeItem[] = [
  {
    id: 'sch-01',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    benefit: '₹6,000 per year in 3 direct bank transfers',
    targetGroup: 'Small and marginal landholder farmer families',
    tags: ['Direct Benefit Transfer', 'Aadhaar Seeded', 'Central Sector'],
    status: 'Always Active'
  },
  {
    id: 'sch-02',
    title: 'Ayushman Bharat - PM Jan Arogya Yojana (AB-PMJAY)',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'Healthcare',
    benefit: 'Health cover up to ₹5,00,000 per family/year',
    targetGroup: 'Bottom 40% vulnerable citizen households',
    tags: ['Cashless Hospitalization', 'Secondary & Tertiary Care', 'E-Card'],
    status: 'Always Active'
  },
  {
    id: 'sch-03',
    title: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    ministry: 'Ministry of Rural Development',
    category: 'Housing',
    benefit: 'Financial assistance of ₹1.20 Lakh to ₹1.30 Lakh for house construction',
    targetGroup: 'Rural homeless & households living in kutcha houses',
    tags: ['Housing Subsidy', 'Direct Bank Transfer', 'Sanitation Support'],
    status: 'Open'
  },
  {
    id: 'sch-04',
    title: 'PM Mudra Yojana (PMMY) - Shishu & Kishore',
    ministry: 'Ministry of Finance',
    category: 'Skill & Employment',
    benefit: 'Collateral-free micro loans up to ₹10 Lakh for enterprises',
    targetGroup: 'Non-corporate, non-farm micro and small businesses',
    tags: ['Micro Finance', 'Low Interest', 'Zero Collateral'],
    status: 'Always Active'
  },
  {
    id: 'sch-05',
    title: 'National Social Assistance Programme (NSAP)',
    ministry: 'Ministry of Rural Development',
    category: 'Social Welfare',
    benefit: 'Monthly pension for senior citizens, widows, and persons with disabilities',
    targetGroup: 'BPL citizens aged 60+ and eligible individuals',
    tags: ['Social Security', 'Monthly Pension', 'Direct Credit'],
    status: 'Open'
  },
  {
    id: 'sch-06',
    title: 'Sukanya Samriddhi Yojana (SSY)',
    ministry: 'Ministry of Women and Child Development',
    category: 'Women & Child',
    benefit: 'High-interest tax-exempt savings scheme for girl child education & future',
    targetGroup: 'Parents or legal guardians of girl child below 10 years',
    tags: ['Section 80C Tax Benefit', 'High Sovereign Interest', 'Long-term'],
    status: 'Always Active'
  }
];

export const SAMPLE_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-01',
    applicationNumber: 'PMKIS-2026-MP-98421',
    schemeTitle: 'PM-KISAN Samman Nidhi',
    category: 'Agriculture',
    appliedDate: '14 Oct 2026',
    lastUpdated: '28 Oct 2026',
    currentStage: 'Land Record Verification with Tehsil Portal',
    overallProgress: 75,
    status: 'Under Review',
    statusColor: 'blue',
    nextAction: 'No action required right now. Tehsil officer verification is ongoing.'
  },
  {
    id: 'app-02',
    applicationNumber: 'ABJAY-2026-HQ-51004',
    schemeTitle: 'Ayushman Bharat Golden Card Generation',
    category: 'Healthcare',
    appliedDate: '02 Sep 2026',
    lastUpdated: '18 Sep 2026',
    currentStage: 'Card Issued & Linked with DigiLocker',
    overallProgress: 100,
    status: 'Approved',
    statusColor: 'emerald',
    nextAction: 'Download e-Card from DigiLocker or view in JANSAATHI documents vault.'
  },
  {
    id: 'app-03',
    applicationNumber: 'PMAY-2026-CZ-19402',
    schemeTitle: 'Pradhan Mantri Awas Yojana - Gramin',
    category: 'Housing',
    appliedDate: '26 Oct 2026',
    lastUpdated: '30 Oct 2026',
    currentStage: 'Document Verification - Income Certificate Needs Refresh',
    overallProgress: 35,
    status: 'Action Required',
    statusColor: 'amber',
    nextAction: 'Upload updated Tehsildar-signed Income Certificate for FY 2026-27.'
  }
];

export const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-01',
    title: 'Land Record Verification Passed',
    description: 'Tehsil revenue department verified your Khasra/Khatauni record for PM-KISAN.',
    timestamp: 'Yesterday at 04:30 PM',
    type: 'application',
    statusTag: 'Verified'
  },
  {
    id: 'act-02',
    title: 'Aadhaar Document Analyzed',
    description: 'Document Assistant checked UIDAI format integrity and DigiLocker seal. All good.',
    timestamp: '28 Oct 2026',
    type: 'document',
    statusTag: 'Valid'
  },
  {
    id: 'act-03',
    title: 'Discovered 2 New Schemes',
    description: 'Based on your rural agriculture profile, JANSAATHI AI flagged PMAY-G and Soil Health Card.',
    timestamp: '25 Oct 2026',
    type: 'scheme',
    statusTag: 'Recommended'
  },
  {
    id: 'act-04',
    title: 'Ayushman Bharat Card Generated',
    description: 'Beneficiary card ABJAY-2026-HQ-51004 successfully approved by National Health Authority.',
    timestamp: '18 Sep 2026',
    type: 'application',
    statusTag: 'Completed'
  }
];

export const SAMPLE_CENTRES: AssistanceCentre[] = [
  {
    id: 'cen-01',
    name: 'CSC Digital Seva Kendra - MP Nagar Zone 2',
    type: 'Common Service Centre (CSC)',
    address: 'Plot 44, Near Dainik Bhaskar Complex, MP Nagar Zone 2, Bhopal, MP 462011',
    distanceKm: 1.2,
    contactNumber: '+91 755 242 8190',
    workingHours: 'Mon - Sat: 09:30 AM to 06:30 PM',
    servicesAvailable: ['Aadhaar Updation', 'Scheme Enrolment', 'Biometric Auth', 'Document Scanning', 'Direct Cash Out'],
    isVerified: true
  },
  {
    id: 'cen-02',
    name: 'Citizen Suvidha Kendra - Arera Colony',
    type: 'Citizen Seva Kendra',
    address: 'E-4, Commercial Complex, Near 10 No. Market, Arera Colony, Bhopal, MP 462016',
    distanceKm: 2.8,
    contactNumber: '+91 755 255 1201',
    workingHours: 'Mon - Fri: 10:00 AM to 05:30 PM',
    servicesAvailable: ['Govt Certificate Issuance', 'Ration Card Services', 'Pension Submissions', 'Grievance Redressal'],
    isVerified: true
  },
  {
    id: 'cen-03',
    name: 'Panchayat Citizen Support Helpdesk',
    type: 'Panchayat Suvidha Kendra',
    address: 'Gram Panchayat Bhawan, Kolar Road Sub-Division, Bhopal Outer, MP 462042',
    distanceKm: 5.4,
    contactNumber: '+91 755 289 4402',
    workingHours: 'Mon - Sat: 10:00 AM to 04:00 PM',
    servicesAvailable: ['PM-KISAN Physical KYC', 'PMAY-G Site Verification', 'Job Card Issuance', 'Free Voice Form Filling'],
    isVerified: true
  }
];
