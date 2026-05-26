import { useQuestionnaire } from '@/contexts/QuestionnaireContext';
import { AUDITS, type AuditConfig } from '@/data/auditRegistry';

export function useActiveAudit(): AuditConfig {
  const { auditType } = useQuestionnaire();
  return AUDITS[auditType ?? 'it'];
}
