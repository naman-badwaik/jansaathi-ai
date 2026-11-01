// ====================================================================
// JANSAATHI AI - Guided Citizen Intake Service (Phase 1)
// Multilingual Vague Request Understanding & Single-Question Flow
// Supports Hindi, Marathi, and English with voice and text extraction
// ====================================================================

import type { CitizenIntakeData, SupportedLanguage } from '../types';

export interface IntakeQuestion {
  id: string;
  field: keyof CitizenIntakeData;
  question: Record<SupportedLanguage, string>;
  inputType: 'text' | 'number' | 'select';
  options?: string[];
  placeholder?: Record<SupportedLanguage, string>;
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: 'q-need',
    field: 'needCategory',
    question: {
      English: 'What kind of government service or assistance do you need today?',
      Hindi: 'आज आपको किस प्रकार की सरकारी सहायता या सेवा की आवश्यकता है?',
      Marathi: 'आज आपल्याला कोणत्या प्रकारच्या शासकीय मदतीची किंवा सेवेची आवश्यकता आहे?'
    },
    inputType: 'select',
    options: ['Housing Assistance (घर / आवास)', 'Healthcare & Medical Cover (आरोग्य / इलाज)', 'Farmer & Agriculture Support (शेतकरी / किसान)', 'Senior Citizen & Widow Pension (पेन्शन / सामाजिक सहाय्य)']
  },
  {
    id: 'q-age',
    field: 'citizenAge',
    question: {
      English: 'What is your current age?',
      Hindi: 'आपकी वर्तमान आयु (उम्र) कितनी है?',
      Marathi: 'आपले सध्याचे वय किती आहे?'
    },
    inputType: 'number',
    placeholder: {
      English: 'e.g. 60',
      Hindi: 'जैसे: 60',
      Marathi: 'उदा: ६०'
    }
  },
  {
    id: 'q-state',
    field: 'state',
    question: {
      English: 'In which state do you reside?',
      Hindi: 'आप किस राज्य में रहते हैं?',
      Marathi: 'आपण कोणत्या राज्यात राहता?'
    },
    inputType: 'select',
    options: ['Maharashtra (महाराष्ट्र)', 'Madhya Pradesh (मध्य प्रदेश)', 'Uttar Pradesh (उत्तर प्रदेश)', 'Other State']
  },
  {
    id: 'q-district',
    field: 'district',
    question: {
      English: 'Which district or taluka do you live in?',
      Hindi: 'आप किस जिले या तहसील में रहते हैं?',
      Marathi: 'आपण कोणत्या जिल्ह्यात किंवा तालुक्यात राहता?'
    },
    inputType: 'text',
    placeholder: {
      English: 'e.g. Pune, Haveli',
      Hindi: 'जैसे: पुणे, हवेली',
      Marathi: 'उदा: पुणे, हवेली'
    }
  },
  {
    id: 'q-shelter',
    field: 'housingStatus',
    question: {
      English: 'What is your current living / shelter condition?',
      Hindi: 'आपकी वर्तमान आवास या घर की स्थिति क्या है?',
      Marathi: 'आपली सध्याच्या घराची किंवा निवाऱ्याची परिस्थिती कशी आहे?'
    },
    inputType: 'select',
    options: ['Kutcha House (कच्चा मकान / मातीचे घर)', 'Homeless / No Land (बेघर / निवारा नाही)', 'Pucca House (पक्का मकान / सिमेंटचे घर)']
  },
  {
    id: 'q-income',
    field: 'annualIncome',
    question: {
      English: 'What is your approximate annual family income?',
      Hindi: 'आपकी अनुमानित वार्षिक पारिवारिक आय कितनी है?',
      Marathi: 'आपल्या कुटुंबाचे अंदाजे वार्षिक उत्पन्न किती आहे?'
    },
    inputType: 'select',
    options: ['Below ₹50,000 / BPL (५०,००० पेक्षा कमी)', '₹50,000 to ₹1,20,000', '₹1,20,000 to ₹3,00,000', 'Above ₹3,00,000']
  }
];

/**
 * Intelligent parser that extracts parameters from freeform citizen speech or text in Hindi, Marathi, and English.
 */
export function parseCitizenInitialPrompt(
  prompt: string,
  _lang: SupportedLanguage
): Partial<CitizenIntakeData> {
  const normalized = prompt.toLowerCase();
  const result: Partial<CitizenIntakeData> = {
    rawNeedDescription: prompt,
    state: 'Maharashtra', // Default focus
    casteCategory: 'General',
    areaType: 'Rural'
  };

  // Detect Age: e.g. "60 years", "60 साल", "वय ६०", "६० वर्ष"
  const ageMatch = prompt.match(/(\d{2})\s*(?:years|yr|साल|वर्ष|वय)/i) || prompt.match(/(?:वय|उम्र|age)\s*[:=-]?\s*(\d{2})/i) || prompt.match(/\b(60|62|65|58|55|45)\b/);
  if (ageMatch) {
    result.citizenAge = parseInt(ageMatch[1], 10);
  }

  // Detect Need: Housing vs Health vs Pension
  if (
    normalized.includes('घर') ||
    normalized.includes('आवास') ||
    normalized.includes('house') ||
    normalized.includes('home') ||
    normalized.includes('shelter') ||
    normalized.includes('pmay') ||
    normalized.includes('छत') ||
    normalized.includes('झोपडी')
  ) {
    result.needCategory = 'Housing Assistance (घर / आवास)';
    result.housingStatus = 'Kutcha House';
  } else if (
    normalized.includes('इलाज') ||
    normalized.includes('आरोग्य') ||
    normalized.includes('health') ||
    normalized.includes('hospital') ||
    normalized.includes('ayushman')
  ) {
    result.needCategory = 'Healthcare & Medical Cover (आरोग्य / इलाज)';
  } else if (
    normalized.includes('किसान') ||
    normalized.includes('शेतकरी') ||
    normalized.includes('kisan') ||
    normalized.includes('farmer')
  ) {
    result.needCategory = 'Farmer & Agriculture Support (शेतकरी / किसान)';
  }

  // Detect State
  if (normalized.includes('maharashtra') || normalized.includes('महाराष्ट्र')) {
    result.state = 'Maharashtra';
  } else if (normalized.includes('madhya pradesh') || normalized.includes('मध्य प्रदेश') || normalized.includes('mp')) {
    result.state = 'Madhya Pradesh';
  }

  // Detect District
  if (normalized.includes('pune') || normalized.includes('पुणे')) {
    result.district = 'Pune';
  } else if (normalized.includes('bhopal') || normalized.includes('भोपाल')) {
    result.district = 'Bhopal';
  } else if (normalized.includes('nagpur') || normalized.includes('नागपूर')) {
    result.district = 'Nagpur';
  }

  // Detect Housing Status
  if (normalized.includes('कच्चा') || normalized.includes('kutcha') || normalized.includes('मातीचे') || normalized.includes('झोपडी')) {
    result.housingStatus = 'Kutcha House';
  } else if (normalized.includes('बेघर') || normalized.includes('homeless') || normalized.includes('घर नाही')) {
    result.housingStatus = 'Homeless';
  }

  return result;
}
