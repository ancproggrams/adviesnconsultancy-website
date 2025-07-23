


export interface QuickScanQuestion {
  id: number
  text: string
  type: 'multiple-choice' | 'boolean' | 'number'
  category: string
  controlArea: string
  isRequired?: boolean
  options?: {
    text: string
    value: string
    score: number
  }[]
  scoring?: {
    threshold: number
    score: number
  }[]
}

// ISO 22301 BCM Quick Scan - Exactly 20 questions across 7 control areas
export const quickScanQuestions: QuickScanQuestion[] = [
  // 1. Context of the Organization (3 questions)
  {
    id: 1,
    text: 'Heeft uw organisatie de interne en externe context geïdentificeerd die relevant is voor business continuity?',
    type: 'multiple-choice',
    category: 'Context van de Organisatie',
    controlArea: 'context',
    options: [
      { text: 'Volledig geïdentificeerd en gedocumenteerd', value: 'fully_identified', score: 5 },
      { text: 'Grotendeels geïdentificeerd', value: 'mostly_identified', score: 4 },
      { text: 'Gedeeltelijk geïdentificeerd', value: 'partially_identified', score: 3 },
      { text: 'Beperkt geïdentificeerd', value: 'limited_identified', score: 2 },
      { text: 'Niet geïdentificeerd', value: 'not_identified', score: 1 }
    ]
  },
  {
    id: 2,
    text: 'Zijn de belanghebbenden en hun belangen geïdentificeerd en geanalyseerd?',
    type: 'multiple-choice',
    category: 'Context van de Organisatie',
    controlArea: 'context',
    options: [
      { text: 'Volledig geïdentificeerd en regelmatig geëvalueerd', value: 'fully_evaluated', score: 5 },
      { text: 'Volledig geïdentificeerd', value: 'fully_identified', score: 4 },
      { text: 'Grotendeels geïdentificeerd', value: 'mostly_identified', score: 3 },
      { text: 'Beperkt geïdentificeerd', value: 'limited_identified', score: 2 },
      { text: 'Niet geïdentificeerd', value: 'not_identified', score: 1 }
    ]
  },
  {
    id: 3,
    text: 'Is de scope van het BCMS duidelijk gedefinieerd?',
    type: 'multiple-choice',
    category: 'Context van de Organisatie',
    controlArea: 'context',
    options: [
      { text: 'Volledig gedefinieerd en goedgekeurd', value: 'fully_defined', score: 5 },
      { text: 'Gedefinieerd maar nog niet goedgekeurd', value: 'defined_not_approved', score: 4 },
      { text: 'Gedeeltelijk gedefinieerd', value: 'partially_defined', score: 3 },
      { text: 'In ontwikkeling', value: 'in_development', score: 2 },
      { text: 'Niet gedefinieerd', value: 'not_defined', score: 1 }
    ]
  },

  // 2. Leadership (3 questions - including required BCM officer question)
  {
    id: 4,
    text: 'Heeft uw organisatie een aangestelde BCM-functionaris of -manager?',
    type: 'boolean',
    category: 'Leiderschap',
    controlArea: 'leadership',
    isRequired: true
  },
  {
    id: 5,
    text: 'Toont het management leiderschap en betrokkenheid bij business continuity?',
    type: 'multiple-choice',
    category: 'Leiderschap',
    controlArea: 'leadership',
    options: [
      { text: 'Volledig betrokken en actief ondersteunend', value: 'fully_engaged', score: 5 },
      { text: 'Grotendeels betrokken', value: 'mostly_engaged', score: 4 },
      { text: 'Redelijk betrokken', value: 'moderately_engaged', score: 3 },
      { text: 'Beperkt betrokken', value: 'limited_engaged', score: 2 },
      { text: 'Niet betrokken', value: 'not_engaged', score: 1 }
    ]
  },
  {
    id: 6,
    text: 'Zijn rollen en verantwoordelijkheden voor BCMS duidelijk gedefinieerd?',
    type: 'multiple-choice',
    category: 'Leiderschap',
    controlArea: 'leadership',
    options: [
      { text: 'Volledig gedefinieerd en gecommuniceerd', value: 'fully_defined', score: 5 },
      { text: 'Gedefinieerd maar beperkt gecommuniceerd', value: 'defined_limited_comm', score: 4 },
      { text: 'Gedeeltelijk gedefinieerd', value: 'partially_defined', score: 3 },
      { text: 'Informeel gedefinieerd', value: 'informally_defined', score: 2 },
      { text: 'Niet gedefinieerd', value: 'not_defined', score: 1 }
    ]
  },

  // 3. Planning (3 questions)
  {
    id: 7,
    text: 'Heeft uw organisatie een Business Impact Analysis (BIA) uitgevoerd?',
    type: 'multiple-choice',
    category: 'Planning',
    controlArea: 'planning',
    options: [
      { text: 'Recent uitgevoerd en regelmatig geüpdatet', value: 'recent_updated', score: 5 },
      { text: 'Recent uitgevoerd', value: 'recent', score: 4 },
      { text: 'Uitgevoerd maar verouderd', value: 'outdated', score: 3 },
      { text: 'Informele analyse uitgevoerd', value: 'informal', score: 2 },
      { text: 'Niet uitgevoerd', value: 'not_performed', score: 1 }
    ]
  },
  {
    id: 8,
    text: 'Zijn risico\'s geïdentificeerd en beoordeeld?',
    type: 'multiple-choice',
    category: 'Planning',
    controlArea: 'planning',
    options: [
      { text: 'Volledig geïdentificeerd en regelmatig geëvalueerd', value: 'fully_evaluated', score: 5 },
      { text: 'Volledig geïdentificeerd', value: 'fully_identified', score: 4 },
      { text: 'Grotendeels geïdentificeerd', value: 'mostly_identified', score: 3 },
      { text: 'Beperkt geïdentificeerd', value: 'limited_identified', score: 2 },
      { text: 'Niet geïdentificeerd', value: 'not_identified', score: 1 }
    ]
  },
  {
    id: 9,
    text: 'Zijn BCMS-doelstellingen vastgesteld en gemeten?',
    type: 'multiple-choice',
    category: 'Planning',
    controlArea: 'planning',
    options: [
      { text: 'Vastgesteld en regelmatig gemeten', value: 'established_measured', score: 5 },
      { text: 'Vastgesteld maar beperkt gemeten', value: 'established_limited', score: 4 },
      { text: 'Vastgesteld maar niet gemeten', value: 'established_not_measured', score: 3 },
      { text: 'Informeel vastgesteld', value: 'informally_established', score: 2 },
      { text: 'Niet vastgesteld', value: 'not_established', score: 1 }
    ]
  },

  // 4. Support (3 questions)
  {
    id: 10,
    text: 'Zijn voldoende resources toegewezen aan het BCMS?',
    type: 'multiple-choice',
    category: 'Ondersteuning',
    controlArea: 'support',
    options: [
      { text: 'Volledig adequaat en toegewezen', value: 'fully_adequate', score: 5 },
      { text: 'Grotendeels adequaat', value: 'mostly_adequate', score: 4 },
      { text: 'Redelijk adequaat', value: 'moderately_adequate', score: 3 },
      { text: 'Beperkt adequaat', value: 'limited_adequate', score: 2 },
      { text: 'Niet adequaat', value: 'not_adequate', score: 1 }
    ]
  },
  {
    id: 11,
    text: 'Hebben medewerkers de juiste competenties voor hun BCMS-rollen?',
    type: 'multiple-choice',
    category: 'Ondersteuning',
    controlArea: 'support',
    options: [
      { text: 'Volledig competent en getraind', value: 'fully_competent', score: 5 },
      { text: 'Grotendeels competent', value: 'mostly_competent', score: 4 },
      { text: 'Redelijk competent', value: 'moderately_competent', score: 3 },
      { text: 'Beperkt competent', value: 'limited_competent', score: 2 },
      { text: 'Niet competent', value: 'not_competent', score: 1 }
    ]
  },
  {
    id: 12,
    text: 'Is er een communicatieplan voor business continuity?',
    type: 'multiple-choice',
    category: 'Ondersteuning',
    controlArea: 'support',
    options: [
      { text: 'Volledig uitgewerkt en getest', value: 'fully_tested', score: 5 },
      { text: 'Volledig uitgewerkt maar niet getest', value: 'not_tested', score: 4 },
      { text: 'Gedeeltelijk uitgewerkt', value: 'partially_developed', score: 3 },
      { text: 'Basis communicatieplan', value: 'basic_plan', score: 2 },
      { text: 'Geen communicatieplan', value: 'no_plan', score: 1 }
    ]
  },

  // 5. Operation (4 questions - including required crisis team question)
  {
    id: 13,
    text: 'Heeft uw organisatie een operationeel crisisteam?',
    type: 'boolean',
    category: 'Operatie',
    controlArea: 'operation',
    isRequired: true
  },
  {
    id: 14,
    text: 'Zijn business continuity procedures geïmplementeerd?',
    type: 'multiple-choice',
    category: 'Operatie',
    controlArea: 'operation',
    options: [
      { text: 'Volledig geïmplementeerd en getest', value: 'fully_tested', score: 5 },
      { text: 'Volledig geïmplementeerd maar niet getest', value: 'not_tested', score: 4 },
      { text: 'Gedeeltelijk geïmplementeerd', value: 'partially_implemented', score: 3 },
      { text: 'In ontwikkeling', value: 'in_development', score: 2 },
      { text: 'Niet geïmplementeerd', value: 'not_implemented', score: 1 }
    ]
  },
  {
    id: 15,
    text: 'Worden incidenten gedocumenteerd en gemanaged?',
    type: 'multiple-choice',
    category: 'Operatie',
    controlArea: 'operation',
    options: [
      { text: 'Volledig gedocumenteerd met formeel proces', value: 'fully_documented', score: 5 },
      { text: 'Grotendeels gedocumenteerd', value: 'mostly_documented', score: 4 },
      { text: 'Gedeeltelijk gedocumenteerd', value: 'partially_documented', score: 3 },
      { text: 'Informeel gedocumenteerd', value: 'informally_documented', score: 2 },
      { text: 'Niet gedocumenteerd', value: 'not_documented', score: 1 }
    ]
  },
  {
    id: 16,
    text: 'Zijn alternatieve werklocaties beschikbaar?',
    type: 'multiple-choice',
    category: 'Operatie',
    controlArea: 'operation',
    options: [
      { text: 'Volledig ingericht en operationeel', value: 'fully_operational', score: 5 },
      { text: 'Ingericht maar niet getest', value: 'not_tested', score: 4 },
      { text: 'Gedeeltelijk ingericht', value: 'partially_equipped', score: 3 },
      { text: 'Geïdentificeerd maar niet ingericht', value: 'identified_only', score: 2 },
      { text: 'Niet beschikbaar', value: 'not_available', score: 1 }
    ]
  },

  // 6. Performance Evaluation (3 questions)
  {
    id: 17,
    text: 'Wordt de prestatie van het BCMS gemeten en geëvalueerd?',
    type: 'multiple-choice',
    category: 'Prestatie-evaluatie',
    controlArea: 'performance',
    options: [
      { text: 'Regelmatig gemeten met KPIs', value: 'regular_kpis', score: 5 },
      { text: 'Periodiek gemeten', value: 'periodic_measurement', score: 4 },
      { text: 'Incidenteel gemeten', value: 'occasional_measurement', score: 3 },
      { text: 'Informeel geëvalueerd', value: 'informal_evaluation', score: 2 },
      { text: 'Niet gemeten', value: 'not_measured', score: 1 }
    ]
  },
  {
    id: 18,
    text: 'Worden er regelmatig BCMS-audits uitgevoerd?',
    type: 'multiple-choice',
    category: 'Prestatie-evaluatie',
    controlArea: 'performance',
    options: [
      { text: 'Regelmatige interne en externe audits', value: 'regular_both', score: 5 },
      { text: 'Regelmatige interne audits', value: 'regular_internal', score: 4 },
      { text: 'Incidentele audits', value: 'occasional_audits', score: 3 },
      { text: 'Informele evaluaties', value: 'informal_reviews', score: 2 },
      { text: 'Geen audits', value: 'no_audits', score: 1 }
    ]
  },
  {
    id: 19,
    text: 'Worden business continuity oefeningen uitgevoerd?',
    type: 'multiple-choice',
    category: 'Prestatie-evaluatie',
    controlArea: 'performance',
    options: [
      { text: 'Regelmatige oefeningen (elke 6 maanden)', value: 'regular_exercises', score: 5 },
      { text: 'Jaarlijkse oefeningen', value: 'annual_exercises', score: 4 },
      { text: 'Incidentele oefeningen', value: 'occasional_exercises', score: 3 },
      { text: 'Desktop oefeningen alleen', value: 'desktop_only', score: 2 },
      { text: 'Geen oefeningen', value: 'no_exercises', score: 1 }
    ]
  },

  // 7. Improvement (2 questions)
  {
    id: 20,
    text: 'Worden verbeteracties geïdentificeerd en geïmplementeerd?',
    type: 'multiple-choice',
    category: 'Verbetering',
    controlArea: 'improvement',
    options: [
      { text: 'Systematisch geïdentificeerd en geïmplementeerd', value: 'systematic_implementation', score: 5 },
      { text: 'Regelmatig geïdentificeerd en grotendeels geïmplementeerd', value: 'regular_mostly_implemented', score: 4 },
      { text: 'Incidenteel geïdentificeerd en gedeeltelijk geïmplementeerd', value: 'occasional_partial', score: 3 },
      { text: 'Informeel geïdentificeerd', value: 'informal_identification', score: 2 },
      { text: 'Niet geïdentificeerd', value: 'not_identified', score: 1 }
    ]
  }
]

// Control area mapping for scoring
export const controlAreas = {
  context: 'Context van de Organisatie',
  leadership: 'Leiderschap', 
  planning: 'Planning',
  support: 'Ondersteuning',
  operation: 'Operatie',
  performance: 'Prestatie-evaluatie',
  improvement: 'Verbetering'
}

// Maturity level definitions
export const maturityLevels = {
  1: { level: 'Beginner', description: 'Weinig tot geen BCMS activiteiten' },
  2: { level: 'Ontwikkelend', description: 'Basis BCMS activiteiten gestart' },
  3: { level: 'Gedefinieerd', description: 'BCMS grotendeels geïmplementeerd' },
  4: { level: 'Beheerd', description: 'BCMS volledig operationeel' },
  5: { level: 'Geoptimaliseerd', description: 'BCMS continu verbeterd en geoptimaliseerd' }
}
