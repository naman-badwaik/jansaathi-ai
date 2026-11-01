// ====================================================================
// JANSAATHI AI - Official Central & Maharashtra Scheme Knowledge Base
// Edge Function Grounded Knowledge & Deterministic Eligibility Engine
// Reused in Supabase Edge Functions for Server-Side AI Tools
// ====================================================================

export type EligibilityGrade = 
  | 'Eligible' 
  | 'Likely Eligible' 
  | 'More Information Needed' 
  | 'Not Eligible';

export interface VerifiedScheme {
  id: string;
  title: string;
  state: 'Central' | 'Maharashtra' | string;
  department: string;
  category: string;
  benefit: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialSourceUrl: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  defaultGrade?: EligibilityGrade;
  defaultReasoning?: string;
}

export interface CitizenApplicantData {
  name?: string;
  citizenAge?: number;
  state?: string;
  district?: string;
  casteCategory?: string;
  occupation?: string;
  annualIncome?: number;
  annualIncomeBracket?: string;
  housingStatus?: string;
  landHoldingAcres?: number;
  hasKutchaHouse?: boolean;
  isSeniorCitizen?: boolean;
}

export const VERIFIED_SCHEMES_DB: VerifiedScheme[] = [
  {
    id: 'mh-housing-01',
    title: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G) Maharashtra',
    state: 'Maharashtra',
    department: 'Rural Development Department, Govt of Maharashtra & MoRD Central',
    category: 'Housing',
    benefit: '₹1.20 Lakh in plains, ₹1.30 Lakh in hilly/difficult areas + ₹18,000 MGNREGA wages + ₹12,000 for toilet construction.',
    eligibilityCriteria: [
      'Households without shelter or living in zero/one/two room kutcha wall/roof houses.',
      'Must be listed in SECC 2011 / Awaas+ verified survey list.',
      'No family member should own a pucca house anywhere in India.',
      'Annual family income generally below ₹1.20 Lakh or rural BPL category.'
    ],
    requiredDocuments: [
      'Aadhaar Card of all adult family members',
      'Bank Account Passbook seeded with Aadhaar (NPCI DBT active)',
      'Job Card (MGNREGA number)',
      'Land ownership proof or Gram Panchayat certificate of site',
      'Affidavit / Self-declaration of not owning any pucca house'
    ],
    applicationProcess: [
      'Identification through Gram Sabha verified Awaas+ list.',
      'Geo-tagging of existing kutcha site by Gram Sevak.',
      'Direct DBT credit in 3 installments tied to construction stages (plinth, lintel, completion).'
    ],
    officialSourceUrl: 'https://pmayg.nic.in / https://rdd.maharashtra.gov.in',
    lastVerifiedDate: '15 October 2026',
    isVerified: true
  },
  {
    id: 'mh-housing-02',
    title: 'Ramai Awas Gharkul Yojana (रमाई आवास घरकुल योजना)',
    state: 'Maharashtra',
    department: 'Social Justice and Special Assistance Department, Govt of Maharashtra',
    category: 'Housing',
    benefit: 'Financial subsidy of ₹1.30 Lakh to ₹2.60 Lakh for constructing pucca house in rural and urban Maharashtra.',
    eligibilityCriteria: [
      'Permanent resident of Maharashtra for at least 15 years.',
      'Must belong to Scheduled Caste (SC) or Neo-Buddhist community.',
      'Annual family income must not exceed ₹1.00 Lakh (rural) or ₹3.00 Lakh (urban).',
      'Must own land or have Gram Panchayat sanctioned plot but no pucca house.'
    ],
    requiredDocuments: [
      'Maharashtra Domicile Certificate (15-year residency)',
      'Caste Certificate (SC / Neo-Buddhist)',
      'Income Certificate issued by Tehsildar',
      'Aadhaar Card & Ration Card',
      '7/12 land extract or Gram Panchayat 8-A property card'
    ],
    applicationProcess: [
      'Online application on MahaAwas / Social Justice portal (sjsa.maharashtra.gov.in).',
      'Scrutiny by Block Development Officer (BDO) and Social Welfare Officer.',
      'Fund transfer directly to beneficiary bank account in installments.'
    ],
    officialSourceUrl: 'https://sjsa.maharashtra.gov.in',
    lastVerifiedDate: '20 October 2026',
    isVerified: true
  },
  {
    id: 'mh-health-01',
    title: 'Ayushman Bharat - Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
    state: 'Maharashtra',
    department: 'Public Health Department, Government of Maharashtra & NHA Central',
    category: 'Healthcare',
    benefit: 'Cashless medical treatment cover up to ₹5,00,000 per family per year across 1,356 empanelled public and private hospitals.',
    eligibilityCriteria: [
      'Citizen resident of Maharashtra holding Yellow, Orange (up to ₹1 Lakh income), or Antyodaya/Annapurna Ration Card.',
      'Universal health guarantee coverage for all valid Maharashtra ration cardholders as per updated state resolution.'
    ],
    requiredDocuments: [
      'Ration Card (Yellow/Orange/AAY) or Suvarna/Ayushman Card',
      'Aadhaar Card or recognized photo ID proof',
      'Referral slip from network hospital or Primary Health Centre (PHC)'
    ],
    applicationProcess: [
      'Instant verification at Arogyamitra desk in any empanelled hospital.',
      'Biometric / Aadhaar e-KYC authentication on National Health Portal.',
      'Immediate cashless pre-authorization and treatment.'
    ],
    officialSourceUrl: 'https://www.jeevandayee.gov.in',
    lastVerifiedDate: '24 October 2026',
    isVerified: true
  },
  {
    id: 'mh-social-01',
    title: 'Sanjay Gandhi Niradhar Anudan Yojana (SGNAY)',
    state: 'Maharashtra',
    department: 'Revenue and Forest Department, Government of Maharashtra',
    category: 'Social Welfare',
    benefit: 'Monthly pension of ₹1,000 per month (₹1,200 for households with more than one beneficiary) directly into bank account.',
    eligibilityCriteria: [
      'Destitute persons, senior citizens aged 65 years and above with no supporting family.',
      'Annual family income must be below ₹21,000 per annum.',
      'Permanent resident of Maharashtra for at least 15 years.'
    ],
    requiredDocuments: [
      'Age Proof (Aadhaar Card, Birth Certificate, or School Leaving)',
      'Domicile Certificate of Maharashtra (15 years)',
      'Tehsildar-certified Income Certificate (below ₹21,000/yr)',
      'Affidavit of no earning adult family member'
    ],
    applicationProcess: [
      'Submit form to local Talathi or Tehsil Office (Aaple Sarkar portal).',
      'Inquiry report submitted by Talathi to Sanjay Gandhi Yojana Committee.',
      'Approval sanctioned by Naib Tehsildar.'
    ],
    officialSourceUrl: 'https://aaplesarkar.mahaonline.gov.in',
    lastVerifiedDate: '10 October 2026',
    isVerified: true
  },
  {
    id: 'central-agri-01',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    state: 'Central',
    department: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    category: 'Agriculture',
    benefit: '₹6,000 per year transferred in three equal 4-monthly installments of ₹2,000 directly via DBT.',
    eligibilityCriteria: [
      'Small and marginal farmer families with cultivable landholding in their name.',
      'Excludes institutional landholders, income tax payers, government employees (Class I-III), and constitutional post holders.'
    ],
    requiredDocuments: [
      'Aadhaar Card with e-KYC completed',
      'Land Record (7/12 extract / Khatauni / Land Possession Certificate)',
      'Active Bank Passbook seeded with Aadhaar on NPCI mapping'
    ],
    applicationProcess: [
      'Self-registration via pmkisan.gov.in or CSC Center.',
      'State Nodal Officer and District verification.',
      'Direct DBT credit by PFMS.'
    ],
    officialSourceUrl: 'https://pmkisan.gov.in',
    lastVerifiedDate: '26 October 2026',
    isVerified: true
  }
];

/**
 * Filter verified schemes by category, state, and search keyword.
 */
export function queryVerifiedSchemes(filters: {
  category?: string;
  state?: string;
  keyword?: string;
}): VerifiedScheme[] {
  let results = [...VERIFIED_SCHEMES_DB];

  if (filters.category && filters.category.toLowerCase() !== 'all') {
    const cat = filters.category.toLowerCase();
    results = results.filter((s) => s.category.toLowerCase().includes(cat) || cat.includes(s.category.toLowerCase()));
  }

  if (filters.state && filters.state.toLowerCase() !== 'all') {
    const st = filters.state.toLowerCase();
    results = results.filter((s) => s.state.toLowerCase() === 'central' || s.state.toLowerCase().includes(st) || st.includes(s.state.toLowerCase()));
  }

  if (filters.keyword && filters.keyword.trim()) {
    const rawKw = filters.keyword.toLowerCase().trim();
    const tokens = rawKw.split(/\s+/).filter((t) => t.length > 2);
    results = results.filter((s) => {
      const text = `${s.id} ${s.title} ${s.category} ${s.benefit} ${s.department}`.toLowerCase();
      return text.includes(rawKw) || (tokens.length > 0 && tokens.some((t) => text.includes(t)));
    });
  }

  return results;
}

/**
 * Deterministic scheme eligibility matching engine.
 * Distinguishes: 'Eligible' | 'Likely Eligible' | 'More Information Needed' | 'Not Eligible'
 * Mirroring the existing frontend rule engine exactly.
 */
export function evaluateSchemeEligibility(
  scheme: VerifiedScheme,
  data: CitizenApplicantData
): { grade: EligibilityGrade; reasoning: string; missingFields: string[] } {
  const missingFields: string[] = [];

  // Parse numeric income from bracket if annualIncome is not explicitly provided
  let effectiveIncome = data.annualIncome;
  if (effectiveIncome === undefined && data.annualIncomeBracket) {
    const bracket = data.annualIncomeBracket.toLowerCase();
    if (bracket.includes('below') || bracket.includes('50,000') || bracket.includes('bpl')) {
      effectiveIncome = 45000;
    } else if (bracket.includes('1,50,000') || bracket.includes('2,50,000')) {
      effectiveIncome = 200000;
    }
  }

  // Parse age from senior flag if citizenAge is not provided
  let effectiveAge = data.citizenAge;
  if (effectiveAge === undefined && data.isSeniorCitizen) {
    effectiveAge = 65;
  }

  // Housing Schemes
  if (scheme.category === 'Housing') {
    if (data.housingStatus === 'Pucca House') {
      return {
        grade: 'Not Eligible',
        reasoning: 'Ineligible because applicant or immediate family already owns a permanent pucca house.',
        missingFields
      };
    }

    if (scheme.id === 'mh-housing-02') {
      // Ramai Awas requires SC / Neo-Buddhist
      if (data.casteCategory && data.casteCategory !== 'SC') {
        return {
          grade: 'Not Eligible',
          reasoning: 'Ramai Awas Gharkul Yojana is specifically designated for Scheduled Caste (SC) & Neo-Buddhist citizens.',
          missingFields
        };
      }
      if (!data.casteCategory) {
        missingFields.push('Caste Category (SC / Neo-Buddhist proof)');
        return {
          grade: 'More Information Needed',
          reasoning: 'Caste category documentation required to verify Ramai Awas reservation eligibility.',
          missingFields
        };
      }
    }

    if (data.housingStatus === 'Kutcha House' || data.housingStatus === 'Homeless' || data.hasKutchaHouse) {
      const isMhOrCentral = !data.state || data.state.toLowerCase().includes('maharashtra') || scheme.state === 'Central';
      if (isMhOrCentral) {
        // PMAY-G requires checking age (18+) and income (< 1.2L / BPL)
        const isAgeKnown = effectiveAge !== undefined;
        const isIncomeKnown = effectiveIncome !== undefined;

        if (isAgeKnown && effectiveAge < 18) {
          return {
            grade: 'Not Eligible',
            reasoning: 'Applicant is below the minimum adult age of 18 years required for head of household under PMAY-G.',
            missingFields
          };
        }

        if (isIncomeKnown && effectiveIncome > 120000) {
          return {
            grade: 'Not Eligible',
            reasoning: `Annual household income of ₹${effectiveIncome.toLocaleString('en-IN')} exceeds the rural PMAY-G assistance threshold of ₹1,20,000 per annum.`,
            missingFields
          };
        }

        if (!isAgeKnown) {
          missingFields.push('Applicant Age (must be 18+ years)');
        }
        if (!isIncomeKnown) {
          missingFields.push('Annual Family Income / BPL Status (< ₹1.20 Lakh/year)');
        }

        if (missingFields.length > 0) {
          return {
            grade: 'More Information Needed',
            reasoning: 'Applicant resides in Maharashtra and has a kutcha house, satisfying the shelter condition. However, age and annual household income must be confirmed to determine PMAY-G eligibility.',
            missingFields
          };
        }

        return {
          grade: 'Likely Eligible',
          reasoning: 'Applicant resides in Maharashtra/Central jurisdiction, lives in a kutcha house, satisfies age and income limits, qualifying for rural housing assistance.',
          missingFields
        };
      }
    }

    missingFields.push('Current Housing Status (Kutcha / Pucca / Homeless)');
    return {
      grade: 'More Information Needed',
      reasoning: 'Need to verify current dwelling condition (kutcha shelter vs pucca house) and Gram Panchayat housing survey listing.',
      missingFields
    };
  }

  // Healthcare Schemes
  if (scheme.category === 'Healthcare') {
    const isMh = !data.state || data.state.toLowerCase().includes('maharashtra');
    if (isMh || (effectiveIncome !== undefined && effectiveIncome <= 500000)) {
      return {
        grade: 'Eligible',
        reasoning: 'MJPJAY provides universal cashless health insurance cover up to ₹5 Lakh across empanelled hospitals for resident families in Maharashtra.',
        missingFields
      };
    }
  }

  // Social Welfare / Destitute Senior Citizen Pension
  if (scheme.category === 'Social Welfare') {
    if (effectiveAge !== undefined && effectiveAge >= 65) {
      if (effectiveIncome !== undefined && effectiveIncome <= 21000) {
        return {
          grade: 'Eligible',
          reasoning: 'Applicant meets age criteria (65+ years) and family income threshold (below ₹21,000/yr) for Sanjay Gandhi Niradhar Anudan Yojana.',
          missingFields
        };
      }
      missingFields.push('Official Income Certificate (< ₹21,000/year ceiling)');
      return {
        grade: 'Likely Eligible',
        reasoning: 'Applicant is a senior citizen (65+ years); formal Tehsildar income certificate required to confirm the < ₹21,000/year destitute pension ceiling.',
        missingFields
      };
    } else if (effectiveAge !== undefined && effectiveAge < 65) {
      return {
        grade: 'Not Eligible',
        reasoning: `Applicant is ${effectiveAge} years old, which is below the minimum age of 65 years required for destitute senior pension (SGNAY).`,
        missingFields
      };
    } else {
      missingFields.push('Citizen Age Proof');
      missingFields.push('Income Certificate');
      return {
        grade: 'More Information Needed',
        reasoning: 'Need to verify applicant age (65+ years) and annual household income ceiling (< ₹21,000/year).',
        missingFields
      };
    }
  }

  // Agriculture Schemes
  if (scheme.category === 'Agriculture') {
    if (data.landHoldingAcres !== undefined && data.landHoldingAcres > 0) {
      return {
        grade: 'Likely Eligible',
        reasoning: 'Applicant holds cultivable agricultural land and is a farming family, qualifying for PM-KISAN ₹6,000 annual DBT direct benefit.',
        missingFields
      };
    }
    missingFields.push('Land Record (7/12 extract / Khatauni in applicant name)');
    return {
      grade: 'More Information Needed',
      reasoning: 'Requires confirmation of legal cultivable agricultural land title in applicant name (7/12 extract or Khatauni).',
      missingFields
    };
  }

  return {
    grade: 'More Information Needed',
    reasoning: 'Additional documentation and local revenue authority verification needed.',
    missingFields
  };
}
