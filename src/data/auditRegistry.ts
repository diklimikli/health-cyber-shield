import {
  sections as itSections,
  questions as itQuestions,
  redFlags as itRedFlags,
  scoringWeights as itScoringWeights,
  maturityLevels as itMaturityLevels,
  evidenceChecklist as itEvidenceChecklist,
  type Section, type Question, type RedFlag,
} from './questionnaireData';
import {
  aiSections, aiQuestions, aiRedFlags, aiScoringWeights, aiMaturityLevels,
  aiEvidenceChecklist, aiDomainShort, aiQuickWinsRules,
} from './aiAuditData';

export type AuditId = 'it' | 'ai';

const IT_DOMAIN_SHORT: Record<string, string> = {
  vendor_dependency: 'Beszállító',
  access_control: 'Hozzáférés',
  backup_dr: 'Backup/DR',
  soc_monitoring: 'SOC/Mon.',
  incident_ownership: 'Incidens',
  endpoint_security: 'Endpoint',
  contractual: 'Szerződés',
};

export interface AuditConfig {
  id: AuditId;
  titleKey: string;          // translation key for header title
  subtitleKey: string;
  pdfFilenames: Record<'hu' | 'ro' | 'en', string>;
  pdfReportTitle: Record<'hu' | 'ro' | 'en', string>;
  sections: Section[];
  questions: Question[];
  redFlags: RedFlag[];
  scoringWeights: Record<string, { label: string; labelHu: string; maxPoints: number }>;
  maturityLevels: typeof itMaturityLevels;
  evidenceChecklist: string[];
  domainShort: Record<string, string>;
  quickWinsBuilder?: (answers: Record<string, any>) => string[];
}

export const AUDITS: Record<AuditId, AuditConfig> = {
  it: {
    id: 'it',
    titleKey: 'app.title',
    subtitleKey: 'app.subtitle',
    pdfFilenames: { hu: 'it_biztonsagi_ertekeles.pdf', ro: 'evaluare_securitate_it.pdf', en: 'it_security_assessment.pdf' },
    pdfReportTitle: { hu: 'IT BIZTONSÁGI AUDIT JELENTÉS', ro: 'RAPORT AUDIT SECURITATE IT', en: 'IT SECURITY AUDIT REPORT' },
    sections: itSections,
    questions: itQuestions,
    redFlags: itRedFlags,
    scoringWeights: itScoringWeights as any,
    maturityLevels: itMaturityLevels,
    evidenceChecklist: itEvidenceChecklist,
    domainShort: IT_DOMAIN_SHORT,
  },
  ai: {
    id: 'ai',
    titleKey: 'ai.app.title',
    subtitleKey: 'ai.app.subtitle',
    pdfFilenames: { hu: 'ai_biztonsagi_audit.pdf', ro: 'audit_securitate_ai.pdf', en: 'ai_security_audit_report.pdf' },
    pdfReportTitle: { hu: 'AI / RAG / SOC READINESS AUDIT JELENTÉS', ro: 'RAPORT AUDIT AI / RAG / SOC READINESS', en: 'AI / RAG / SOC READINESS AUDIT REPORT' },
    sections: aiSections,
    questions: aiQuestions,
    redFlags: aiRedFlags,
    scoringWeights: aiScoringWeights as any,
    maturityLevels: aiMaturityLevels,
    evidenceChecklist: aiEvidenceChecklist,
    domainShort: aiDomainShort as any,
    quickWinsBuilder: aiQuickWinsRules,
  },
};
