// AI Security & SOC Readiness Audit data module
// Spec: GDPR + EU AI Act + SOC-CMM + NIS2 + RAG threat model

export type AiRiskDomain =
  | 'gdpr_data'
  | 'logging_traceability'
  | 'rag_security'
  | 'ai_governance'
  | 'soc_cmm'
  | 'ai_architecture'
  | 'monitoring_nis2';

import type { Question, Section, RedFlag, RiskWeight } from './questionnaireData';

// Re-export types so registry consumers have a single source
export type { Question, Section, RedFlag };

export const aiSections: Section[] = [
  { id: 'ai_gdpr', title: 'Data Handling & GDPR', titleHu: 'Adatkezelés és GDPR kontrollok', description: 'DPA, EU-régió, retention, törlési jog, adatfeldolgozói megfelelés (GDPR Art. 17 / 28)', icon: 'Shield', order: 1 },
  { id: 'ai_logging', title: 'AI Audit Logging & Traceability', titleHu: 'AI Audit Logging és Traceability', description: 'Immutable log, SIEM, prompt chain, EU AI Act Art. 12', icon: 'FileText', order: 2 },
  { id: 'ai_rag', title: 'RAG Security Assessment', titleHu: 'RAG biztonsági értékelés', description: 'Chunk provenance, tenant isolation, prompt injection, embedding leakage, MITRE ATT&CK', icon: 'Database', order: 3 },
  { id: 'ai_governance', title: 'AI Governance & EU AI Act Readiness', titleHu: 'AI Governance és EU AI Act Readiness', description: 'Risk classification, model card, HITL, AI policy (EU AI Act Art. 9 / 12)', icon: 'Scale', order: 4 },
  { id: 'ai_soc_cmm', title: 'SOC-CMM & Security Ops Maturity', titleHu: 'SOC-CMM és biztonsági műveletek érettsége', description: 'Detection engineering, IR, threat hunting, SOAR, AI anomaly detection (L0–L5)', icon: 'Eye', order: 5 },
  { id: 'ai_arch', title: 'AI Security Architecture', titleHu: 'AI biztonsági architektúra review', description: 'API security, secret management, MCP/tool abuse, agent orchestration, supply chain', icon: 'Network', order: 6 },
  { id: 'ai_monitoring', title: 'Monitoring & NIS2 Readiness', titleHu: 'Monitoring és NIS2 Readiness', description: 'AI hívás monitor, anomáliadetekció, NIS2 Art. 21 operational resilience', icon: 'Monitor', order: 7 },
  { id: 'ai_killer', title: 'Killer Questions (AI)', titleHu: 'Kritikus döntéstámogató kérdések (AI)', description: 'Azonnali kockázatot jelző kiemelt AI biztonsági kérdések', icon: 'Zap', order: 8 },
];

const Q = (
  id: string,
  sectionId: string,
  text: string,
  riskWeight: RiskWeight,
  maxPoints: number,
  extra: Partial<Question> = {}
): Question => ({
  id,
  sectionId,
  text,
  purpose: extra.purpose ?? '',
  type: extra.type ?? 'yesno',
  options: extra.options,
  expectedEvidence: extra.expectedEvidence ?? '',
  riskWeight,
  riskDomain: 'vendor_dependency', // placeholder, overridden via aiQuestionDomain map below
  poorAnswer: extra.poorAnswer ?? 'Nincs implementálva',
  strongAnswer: extra.strongAnswer ?? 'Dokumentált, tesztelt, auditált megoldás',
  scoringLogic: extra.scoringLogic ?? '',
  maxPoints,
  redFlagTrigger: extra.redFlagTrigger,
  isKillerQuestion: extra.isKillerQuestion,
});

// Per-question AI risk domain — kept separate so we don't widen the global RiskDomain union
export const aiQuestionDomain: Record<string, AiRiskDomain> = {};

export const aiQuestions: Question[] = [
  // ============== SECTION 1: GDPR ==============
  Q('GDPR-01', 'ai_gdpr', 'Van-e érvényes DPA (Data Processing Agreement) az AI / LLM szolgáltatóval (pl. OpenAI, Anthropic, Azure OpenAI)?', 'Critical', 4, {
    type: 'yesno', purpose: 'GDPR Art. 28 megfelelőség az AI feldolgozói viszonyban',
    expectedEvidence: 'Aláírt DPA, SCC, adatfeldolgozói nyilatkozat',
    poorAnswer: 'Nincs DPA, csak ToS elfogadás', strongAnswer: 'Aláírt DPA SCC-vel, EU-konform',
    scoringLogic: 'Yes = 4pt, No = 0pt és red flag', redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('GDPR-02', 'ai_gdpr', 'EU adatközpontban (EU residency) történik a prompt feldolgozás és embedding generálás?', 'Critical', 4, {
    type: 'multiple', options: ['Igen, garantáltan EU-region', 'Részben EU, részben US', 'Nem, US/global', 'Nem tudjuk'],
    purpose: 'Adatlokáció és Schrems II megfelelőség',
    expectedEvidence: 'Szerződéses záradék, deployment region screenshot',
    redFlagTrigger: 'us_or_unknown', isKillerQuestion: true,
  }),
  Q('GDPR-03', 'ai_gdpr', 'Hol történik a vector storage és a logging? (cloud régió, on-prem)', 'High', 3, {
    type: 'freetext', purpose: 'Data lineage és adatáramlás dokumentálása',
    expectedEvidence: 'Architektúra diagram régió-jelöléssel, adatáramlási modell',
  }),
  Q('GDPR-04', 'ai_gdpr', 'Létezik dokumentált retention policy a promptokra, válaszokra és embeddingekre?', 'High', 3, {
    type: 'yesno', purpose: 'GDPR adatminimalizálás (Art. 5) és tárolási korlátozás',
    expectedEvidence: 'Retention policy dokumentum, retention TTL beállítás bizonyíték',
    redFlagTrigger: 'no',
  }),
  Q('GDPR-05', 'ai_gdpr', 'Megvalósul-e a GDPR Art. 17 (törlési jog / right to erasure) a teljes pipeline-on (prompt log + embedding + vector DB + cache)?', 'Critical', 4, {
    type: 'yesno', purpose: 'Érintetti jogok érvényesíthetősége az AI pipeline-on',
    expectedEvidence: 'Erasure workflow leírás, technikai bizonyíték (vector deletion teszt)',
    redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('GDPR-06', 'ai_gdpr', 'Van-e consent management mechanizmus az AI funkciók használatakor (különösen érzékeny vagy jogi dokumentumoknál)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Consent banner / UI screenshot, consent log',
  }),
  Q('GDPR-07', 'ai_gdpr', 'Készült-e DPIA (Data Protection Impact Assessment) az AI rendszerre?', 'High', 3, {
    type: 'yesno', purpose: 'GDPR Art. 35 — magas kockázatú feldolgozás DPIA kötelezettsége',
    expectedEvidence: 'DPIA dokumentum, kockázatértékelés mátrix',
    redFlagTrigger: 'no',
  }),
  Q('GDPR-08', 'ai_gdpr', 'Hogyan kezelt a beérkező dokumentumok PII / sensitive data szűrése és redaktálása embedding előtt?', 'High', 3, {
    type: 'multiple', options: ['Automatikus PII detektálás + redaction', 'Csak manuális review', 'Nincs szűrés', 'Nem releváns'],
    expectedEvidence: 'PII redaction pipeline dokumentáció, test report',
  }),
  Q('GDPR-09', 'ai_gdpr', 'Adatáramlási modell (data flow diagram) készült és karbantartott?', 'Medium', 2, {
    type: 'yesno', expectedEvidence: 'Aktuális data flow diagram a teljes RAG pipeline-ra',
  }),
  Q('GDPR-10', 'ai_gdpr', 'Privacy risk assessment és GDPR gap analysis dokumentált?', 'Medium', 2, {
    type: 'yesno', expectedEvidence: 'Privacy risk register, GDPR gap analysis dokumentum',
  }),

  // ============== SECTION 2: Logging & Traceability ==============
  Q('LOG-01', 'ai_logging', 'Perzisztens input/output audit log létezik minden AI hívásra?', 'Critical', 4, {
    type: 'yesno', purpose: 'EU AI Act Art. 12 — automatikus naplózás kötelezettsége',
    expectedEvidence: 'Audit log séma, sample log entry, retention beállítás',
    redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('LOG-02', 'ai_logging', 'Visszakereshető-e a teljes dialógus: prompt chain, model response, retrieval context és tool invocation?', 'Critical', 4, {
    type: 'multiple', options: ['Teljes (prompt + retrieval + tool)', 'Csak prompt + response', 'Csak végfelhasználói üzenet', 'Nincs'],
    expectedEvidence: 'Trace dashboard screenshot, session replay példa',
    redFlagTrigger: 'partial_or_none',
  }),
  Q('LOG-03', 'ai_logging', 'Immutable logging (WORM / append-only / objektum lock) biztosított?', 'High', 3, {
    type: 'yesno', purpose: 'Forensic readiness, log tampering védelem',
    expectedEvidence: 'S3 Object Lock / WORM konfiguráció screenshot',
    redFlagTrigger: 'no',
  }),
  Q('LOG-04', 'ai_logging', 'SIEM integráció megvalósult az AI eseményekre?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'SIEM use-case katalógus, AI log source onboarding doc',
    redFlagTrigger: 'no',
  }),
  Q('LOG-05', 'ai_logging', 'Van-e correlation ID / session tracing / actor attribution minden AI hívásban?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Log séma definíció: correlation_id, session_id, user_id mezőkkel',
  }),
  Q('LOG-06', 'ai_logging', 'Mennyi a log retention időtartama?', 'Medium', 2, {
    type: 'multiple', options: ['12+ hónap', '6–12 hónap', '3–6 hónap', '< 3 hónap', 'Nincs definiált'],
  }),
  Q('LOG-07', 'ai_logging', 'Forensic readiness assessment elvégezve (AI-specifikus incidens scenario)?', 'Medium', 2, {
    type: 'yesno', expectedEvidence: 'Forensic readiness report, tabletop exercise jegyzőkönyv',
  }),
  Q('LOG-08', 'ai_logging', 'Naplózott-e a model verzió, embedding model és prompt template változás (versioning)?', 'Medium', 2, {
    type: 'yesno', expectedEvidence: 'Model registry, prompt versioning rendszer',
  }),

  // ============== SECTION 3: RAG Security ==============
  Q('RAG-01', 'ai_rag', 'Chunk provenance rögzítve van (forrásdokumentum + chunk index minden embeddinghez)?', 'Critical', 4, {
    type: 'yesno', expectedEvidence: 'Vector metadata séma: doc_id, chunk_id, source_uri, tenant_id',
    redFlagTrigger: 'no',
  }),
  Q('RAG-02', 'ai_rag', 'Visszakövethető-e a válaszban felhasznált dokumentum eredete (citation / source attribution)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Source citation UI screenshot, retrieval log',
  }),
  Q('RAG-03', 'ai_rag', 'Embedding lifecycle management (re-embed, archive, deletion) implementált?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Embedding lifecycle policy, re-embed pipeline',
  }),
  Q('RAG-04', 'ai_rag', 'Létezik vector deletion mechanizmus (cascade delete: source doc → embedding → cache)?', 'Critical', 4, {
    type: 'yesno', purpose: 'GDPR Art. 17 technikai érvényesíthetősége',
    redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('RAG-05', 'ai_rag', 'Tenant isolation / namespace separation érvényesül a vector DB-ben?', 'Critical', 4, {
    type: 'yesno', expectedEvidence: 'Vector DB namespace konfiguráció, isolation teszt report',
    redFlagTrigger: 'no',
  }),
  Q('RAG-06', 'ai_rag', 'Retrieval authorization (per-user ACL enforcement) működik a retrieval előtt?', 'Critical', 4, {
    type: 'yesno', purpose: 'Megakadályozza, hogy a user olyan dokumentumokat lásson, amikhez nincs joga',
    expectedEvidence: 'Retrieval middleware kód, ACL enforcement teszt',
    redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('RAG-07', 'ai_rag', 'Van-e prompt injection elleni védelem (input sanitization, system prompt hardening, output guardrails)?', 'Critical', 4, {
    type: 'multiple', options: ['Több réteg (input + output guardrails + monitoring)', 'Csak system prompt hardening', 'Csak alapszintű filter', 'Nincs'],
    redFlagTrigger: 'low', isKillerQuestion: true,
  }),
  Q('RAG-08', 'ai_rag', 'Retrieval poisoning elleni védelem (forrás-trust ranking, content signing) implementált?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Trust scoring policy, content provenance dokumentáció',
  }),
  Q('RAG-09', 'ai_rag', 'Embedding leakage / inversion attack threat model elkészült?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Threat model dokumentum, MITRE ATLAS alignment',
  }),
  Q('RAG-10', 'ai_rag', 'Data exfiltration védelem (output filtering, DLP integráció)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'DLP policy, output filter szabálykészlet',
  }),
  Q('RAG-11', 'ai_rag', 'Jailbreak resilience tesztelve (red team / adversarial testing)?', 'High', 3, {
    type: 'multiple', options: ['Folyamatos red team', 'Évente', 'Egyszeri teszt', 'Soha'],
    redFlagTrigger: 'never',
  }),
  Q('RAG-12', 'ai_rag', 'Hallucination impact assessment és mitigáció (HITL érzékeny döntéseknél)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'HITL policy, hallucination mérési metrika',
  }),
  Q('RAG-13', 'ai_rag', 'MITRE ATT&CK / MITRE ATLAS alignment elvégezve az AI rendszerre?', 'Medium', 2, {
    type: 'yesno', expectedEvidence: 'ATT&CK mapping dokumentum',
  }),

  // ============== SECTION 4: AI Governance & EU AI Act ==============
  Q('GOV-01', 'ai_governance', 'Létezik AI risk classification (alacsony / korlátozott / magas / tiltott)?', 'Critical', 4, {
    type: 'yesno', purpose: 'EU AI Act Art. 6–7 kategorizálás',
    expectedEvidence: 'AI risk classification dokumentum, döntési kritériumok',
    redFlagTrigger: 'no',
  }),
  Q('GOV-02', 'ai_governance', 'Model card létezik a használt modell(ek)re?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Model card dokumentum (intended use, limitations, training data)',
  }),
  Q('GOV-03', 'ai_governance', 'AI risk register karbantartott (kockázatok, owner, mitigáció, státusz)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'AI risk register, utolsó update dátum',
  }),
  Q('GOV-04', 'ai_governance', 'AI inventory (minden AI rendszer / modell / use-case katalógusa) létezik?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'AI inventory regiszter',
  }),
  Q('GOV-05', 'ai_governance', 'Human-in-the-loop (HITL) mechanizmus minden magas kockázatú döntésnél?', 'Critical', 4, {
    type: 'yesno', purpose: 'EU AI Act Art. 14 — human oversight',
    redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('GOV-06', 'ai_governance', 'Hivatalos AI policy / AI acceptable use policy elfogadott?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'AI policy dokumentum, jóváhagyási nyomvonal',
  }),
  Q('GOV-07', 'ai_governance', 'AI approval workflow létezik új AI use-case bevezetésére (security + privacy + legal review)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'AI use-case approval template és workflow',
  }),
  Q('GOV-08', 'ai_governance', 'Implementált-e a kódban: consent_required(), ai_risk_classification(), policy enforcement layer?', 'High', 3, {
    type: 'multiple', options: ['Mindhárom kódban', 'Egy-kettő', 'Egy sem', 'Nem tudjuk'],
  }),
  Q('GOV-09', 'ai_governance', 'EU AI Act Article 9 (risk management system) megfelelőség vizsgálva?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Article 9 gap analysis, compliance scorecard',
  }),
  Q('GOV-10', 'ai_governance', 'A rendszer high-risk AI kategóriába tartozik az AI Act szerint?', 'Critical', 3, {
    type: 'multiple', options: ['Igen, és felkészültek vagyunk', 'Igen, de nem vagyunk felkészülve', 'Nem high-risk', 'Nem tudjuk'],
    redFlagTrigger: 'unprepared_or_unknown', isKillerQuestion: true,
  }),

  // ============== SECTION 5: SOC-CMM Maturity ==============
  Q('SOC-01', 'ai_soc_cmm', 'SOC általános érettségi szint (SOC-CMM)', 'Critical', 5, {
    type: 'scale', purpose: 'Önértékelt SOC érettség 0–5 SOC-CMM skálán',
    expectedEvidence: 'SOC-CMM self-assessment riport',
  }),
  Q('SOC-02', 'ai_soc_cmm', 'Detection engineering capability érettsége', 'High', 5, {
    type: 'scale', expectedEvidence: 'Use-case katalógus, detection rule lifecycle',
  }),
  Q('SOC-03', 'ai_soc_cmm', 'Incident response folyamatok érettsége', 'High', 5, {
    type: 'scale', expectedEvidence: 'IR playbook könyvtár, IR metrika',
  }),
  Q('SOC-04', 'ai_soc_cmm', 'Threat hunting capability érettsége', 'High', 5, {
    type: 'scale', expectedEvidence: 'Threat hunt jegyzőkönyvek, hipotézis-alapú hunting program',
  }),
  Q('SOC-05', 'ai_soc_cmm', 'AI monitoring readiness (AI-specifikus detection rule, prompt anomaly)', 'Critical', 5, {
    type: 'scale', expectedEvidence: 'AI-specifikus SIEM use-case-ek',
    redFlagTrigger: 'low_score',
  }),
  Q('SOC-06', 'ai_soc_cmm', 'SOAR integráció érettsége (AI incidens automatizáció)', 'Medium', 5, {
    type: 'scale', expectedEvidence: 'SOAR playbook lista',
  }),
  Q('SOC-07', 'ai_soc_cmm', 'SIEM use-case maturity (lefedettség, kvalitás)', 'High', 5, {
    type: 'scale', expectedEvidence: 'Use-case katalógus, MITRE coverage',
  }),
  Q('SOC-08', 'ai_soc_cmm', 'Telemetry quality (forrás-lefedettség, parsing, normalization)', 'High', 5, {
    type: 'scale', expectedEvidence: 'Log source inventory, parsing coverage report',
  }),
  Q('SOC-09', 'ai_soc_cmm', 'Cloud monitoring capability (cloud-native AI workload)', 'Medium', 5, {
    type: 'scale', expectedEvidence: 'CSPM / CWPP integráció, cloud audit log onboarding',
  }),
  Q('SOC-10', 'ai_soc_cmm', 'AI anomaly detection capability (prompt injection / data exfil pattern)', 'Critical', 5, {
    type: 'scale', expectedEvidence: 'AI-specifikus anomaly detection rule-ok',
    redFlagTrigger: 'low_score', isKillerQuestion: true,
  }),

  // ============== SECTION 6: AI Security Architecture ==============
  Q('ARC-01', 'ai_arch', 'API security (rate limit, auth, input validation) implementált az AI endpointokon?', 'Critical', 4, {
    type: 'yesno', expectedEvidence: 'API security architecture, WAF / API gateway konfiguráció',
    redFlagTrigger: 'no',
  }),
  Q('ARC-02', 'ai_arch', 'Secret management (LLM API kulcsok) — KMS / Vault használatban?', 'Critical', 3, {
    type: 'yesno', expectedEvidence: 'KMS / Vault konfiguráció, secret rotation policy',
    redFlagTrigger: 'no',
  }),
  Q('ARC-03', 'ai_arch', 'MCP / tool abuse threat model elkészült (tool invocation jogosultságkezelés)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Tool registry, per-tool authorization policy',
  }),
  Q('ARC-04', 'ai_arch', 'Authentication flow (MFA, SSO) érvényesül az AI alkalmazáson?', 'High', 3, {
    type: 'yesno',
  }),
  Q('ARC-05', 'ai_arch', 'Authorization enforcement (RBAC / ABAC) az AI funkciókra?', 'High', 3, {
    type: 'yesno',
  }),
  Q('ARC-06', 'ai_arch', 'Service-to-service trust (mTLS / signed tokens)?', 'Medium', 2, {
    type: 'yesno',
  }),
  Q('ARC-07', 'ai_arch', 'Agent orchestration és memory isolation megoldott (cross-session leak védelem)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Memory isolation arch dokumentum, cross-tenant teszt',
  }),
  Q('ARC-08', 'ai_arch', 'Multi-tenant risk assessment elvégezve?', 'High', 3, {
    type: 'yesno',
  }),
  Q('ARC-09', 'ai_arch', 'Supply chain security: dependency risk monitoring (SBOM, CVE scan)?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'SBOM, dependency scan riport',
  }),
  Q('ARC-10', 'ai_arch', 'CI/CD security: AI modell / prompt template változás review és signing?', 'Medium', 2, {
    type: 'yesno',
  }),
  Q('ARC-11', 'ai_arch', 'Model access control: ki tudja módosítani / lecserélni a használt modellt?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Model registry RBAC',
  }),

  // ============== SECTION 7: Monitoring & NIS2 ==============
  Q('MON-01', 'ai_monitoring', 'AI hívások (latency, error rate, token usage, kontextuális anomália) monitorozottak?', 'High', 3, {
    type: 'yesno', expectedEvidence: 'Observability dashboard screenshot',
    redFlagTrigger: 'no',
  }),
  Q('MON-02', 'ai_monitoring', 'Alerting capability AI-specifikus eseményekre (jailbreak, abnormal token usage)?', 'High', 3, {
    type: 'yesno',
  }),
  Q('MON-03', 'ai_monitoring', 'Incident classification AI-specifikus incidenseknél (P1/P2/P3)?', 'High', 3, {
    type: 'yesno',
  }),
  Q('MON-04', 'ai_monitoring', 'Threat intel integráció (AI-targeted threat feed)?', 'Medium', 2, {
    type: 'yesno',
  }),
  Q('MON-05', 'ai_monitoring', 'Centralized logging biztosított az AI rétegre?', 'High', 3, {
    type: 'yesno',
  }),
  Q('MON-06', 'ai_monitoring', 'NIS2 Art. 21 (operational security, incident handling, BCP) megfelelőség értékelve az AI rendszerre?', 'Critical', 4, {
    type: 'yesno', expectedEvidence: 'NIS2 gap analysis, art. 21 mapping',
    redFlagTrigger: 'no', isKillerQuestion: true,
  }),
  Q('MON-07', 'ai_monitoring', 'NIS2 incidens jelentési folyamat (24h early warning, 72h notification) definiált AI incidensekre?', 'Critical', 3, {
    type: 'yesno', expectedEvidence: 'NIS2 reporting playbook',
    redFlagTrigger: 'no',
  }),
];

// Apply per-question AI risk domain mapping
const domainMap: Record<string, AiRiskDomain> = {
  GDPR: 'gdpr_data', LOG: 'logging_traceability', RAG: 'rag_security',
  GOV: 'ai_governance', SOC: 'soc_cmm', ARC: 'ai_architecture', MON: 'monitoring_nis2',
};
aiQuestions.forEach(q => {
  const prefix = q.id.split('-')[0];
  const dom = domainMap[prefix];
  if (dom) aiQuestionDomain[q.id] = dom;
  // Tag question's riskDomain field with a stable string (cast through unknown – the scoring engine treats it as opaque key)
  (q as any).riskDomain = dom ?? 'gdpr_data';
});

// Killer questions section auto-populated from isKillerQuestion flag
aiQuestions.filter(q => q.isKillerQuestion).forEach(q => {
  // Add a "shadow" reference so killer section displays them too — done in registry layer
});

export const aiRedFlags: RedFlag[] = [
  { id: 'AI-RF-01', title: 'No DPA with AI provider', titleHu: 'Nincs DPA az AI szolgáltatóval',
    whyCritical: 'GDPR Art. 28 megsértése — adatfeldolgozó nélkül nem lehet jogszerűen személyes adatot küldeni LLM-nek.',
    consequences: 'GDPR bírság (max 4% globális árbevétel), feldolgozás leállítása',
    immediateAction: 'DPA aláírás 30 napon belül vagy AI funkció felfüggesztése',
    triggerQuestionId: 'GDPR-01', triggerCondition: 'no' },
  { id: 'AI-RF-02', title: 'US-only or unknown data residency', titleHu: 'US-only vagy ismeretlen adatlokáció',
    whyCritical: 'Schrems II döntés alapján US-only feldolgozás extra biztosíték nélkül jogellenes lehet EU-s adatokra.',
    consequences: 'Adatvédelmi hatósági szankció, ügyfél bizalomvesztés',
    immediateAction: 'EU regionre váltás vagy SCC + TIA bevezetése',
    triggerQuestionId: 'GDPR-02', triggerCondition: 'us_or_unknown' },
  { id: 'AI-RF-03', title: 'No retention policy for prompts/embeddings', titleHu: 'Nincs retention policy promptokra / embeddingekre',
    whyCritical: 'Adatminimalizálás (GDPR Art. 5) megsértése — végtelen tárolás magas kockázat.',
    consequences: 'Adatszivárgás esetén megnő az érintettek köre, GDPR jogsértés',
    immediateAction: 'Retention policy és TTL bevezetése 60 napon belül',
    triggerQuestionId: 'GDPR-04', triggerCondition: 'no' },
  { id: 'AI-RF-04', title: 'No Art. 17 erasure on AI pipeline', titleHu: 'Nincs törlési jog (GDPR Art. 17) érvényesítve az AI pipeline-on',
    whyCritical: 'Érintetti törlési kérelem nem teljesíthető — közvetlen GDPR jogsértés.',
    consequences: 'Hatósági bírság, érintetti panaszok',
    immediateAction: 'Cascade deletion (source → embedding → cache) implementálása',
    triggerQuestionId: 'GDPR-05', triggerCondition: 'no' },
  { id: 'AI-RF-05', title: 'No persistent AI audit log', titleHu: 'Nincs perzisztens AI audit log',
    whyCritical: 'EU AI Act Art. 12 explicit követelmény. Audit log hiányában nincs forensic képesség.',
    consequences: 'AI Act non-compliance, incidens utáni forensic ellehetetlenül',
    immediateAction: 'Immutable audit log bevezetése minden AI hívásra',
    triggerQuestionId: 'LOG-01', triggerCondition: 'no' },
  { id: 'AI-RF-06', title: 'No vector deletion mechanism', titleHu: 'Nincs vector deletion mechanizmus',
    whyCritical: 'Embeddingek tárolása leszármaztatott személyes adat — törlés nélkül GDPR jogsértés.',
    consequences: 'Adatvédelmi panaszok, hatósági vizsgálat',
    immediateAction: 'Vector deletion API és cascade workflow implementálása',
    triggerQuestionId: 'RAG-04', triggerCondition: 'no' },
  { id: 'AI-RF-07', title: 'No tenant isolation in vector DB', titleHu: 'Nincs tenant isolation a vector DB-ben',
    whyCritical: 'Cross-tenant data leakage kritikus kockázat — egy user másik tenant dokumentumait olvashatja.',
    consequences: 'Tömeges adatszivárgás, szerződésszegés, GDPR breach',
    immediateAction: 'Namespace / per-tenant index bevezetése azonnal',
    triggerQuestionId: 'RAG-05', triggerCondition: 'no' },
  { id: 'AI-RF-08', title: 'No retrieval ACL enforcement', titleHu: 'Nincs retrieval-szintű jogosultságellenőrzés',
    whyCritical: 'A user olyan dokumentumokra kaphat választ, amikhez egyébként nincs joga.',
    consequences: 'Bizalmas adatok kiszivárgása, audit failure',
    immediateAction: 'ACL filter beépítése a retrieval middleware-be',
    triggerQuestionId: 'RAG-06', triggerCondition: 'no' },
  { id: 'AI-RF-09', title: 'No prompt injection defense', titleHu: 'Nincs prompt injection védelem',
    whyCritical: 'Prompt injection a #1 OWASP LLM kockázat — adat exfiltration és jogosulatlan tool használat fő vektora.',
    consequences: 'Adatszivárgás, jogosulatlan akciók, reputációs kár',
    immediateAction: 'Input sanitization + output guardrails + monitoring bevezetése',
    triggerQuestionId: 'RAG-07', triggerCondition: 'low' },
  { id: 'AI-RF-10', title: 'No human-in-the-loop for high-risk decisions', titleHu: 'Nincs HITL magas kockázatú döntéseknél',
    whyCritical: 'EU AI Act Art. 14 explicit emberi felügyeleti követelmény.',
    consequences: 'AI Act non-compliance, hibás automata döntések kontroll nélkül',
    immediateAction: 'HITL approval step kötelezővé tétele high-risk use-case-eknél',
    triggerQuestionId: 'GOV-05', triggerCondition: 'no' },
  { id: 'AI-RF-11', title: 'Low AI anomaly detection capability', titleHu: 'Alacsony AI anomaly detection képesség',
    whyCritical: 'AI-specifikus támadások (prompt injection, data exfil) detektálás nélkül láthatatlanok.',
    consequences: 'Hosszú dwell time, súlyos breach',
    immediateAction: 'AI-specifikus SIEM use-case-ek építése, anomaly baseline',
    triggerQuestionId: 'SOC-10', triggerCondition: 'low_score' },
  { id: 'AI-RF-12', title: 'No NIS2 Art. 21 compliance for AI', titleHu: 'Nincs NIS2 Art. 21 megfelelőség az AI rendszerre',
    whyCritical: 'NIS2 hatály alá tartozó szervezetnél jogszabályi kötelezettség.',
    consequences: 'NIS2 bírság, vezetői személyes felelősség',
    immediateAction: 'NIS2 gap analysis és Art. 21 mapping 60 napon belül',
    triggerQuestionId: 'MON-06', triggerCondition: 'no' },
];

export const aiScoringWeights = {
  gdpr_data: { label: 'GDPR / Data Handling', labelHu: 'GDPR és adatkezelés', maxPoints: 20 },
  logging_traceability: { label: 'Logging & Traceability', labelHu: 'Naplózás és nyomonkövethetőség', maxPoints: 15 },
  rag_security: { label: 'RAG Security', labelHu: 'RAG biztonság', maxPoints: 20 },
  ai_governance: { label: 'AI Governance & AI Act', labelHu: 'AI Governance és AI Act', maxPoints: 15 },
  soc_cmm: { label: 'SOC-CMM Maturity', labelHu: 'SOC-CMM érettség', maxPoints: 15 },
  ai_architecture: { label: 'AI Security Architecture', labelHu: 'AI biztonsági architektúra', maxPoints: 10 },
  monitoring_nis2: { label: 'Monitoring & NIS2', labelHu: 'Monitoring és NIS2', maxPoints: 5 },
} as const;

export const aiMaturityLevels = [
  { min: 0, max: 25, label: 'L0–L1 — Nonexistent / Initial', labelEn: 'Nonexistent / Initial', color: 'critical', description: 'Kritikus hiányosságok — AI rendszer jelenlegi állapotában nem megfelelő enterprise használatra' },
  { min: 26, max: 50, label: 'L2 — Repeatable', labelEn: 'Repeatable', color: 'significant', description: 'Alapvető kontrollok léteznek, de inkonzisztensek — jelentős gap van a compliance-ig' },
  { min: 51, max: 70, label: 'L3 — Defined', labelEn: 'Defined', color: 'moderate', description: 'Definiált folyamatok, mérsékelt kockázat — célzott fejlesztések szükségesek' },
  { min: 71, max: 85, label: 'L4 — Managed', labelEn: 'Managed', color: 'acceptable', description: 'Mért és menedzselt kontrollok — enterprise-ready, finomhangolás szükséges' },
  { min: 86, max: 100, label: 'L5 — Optimized', labelEn: 'Optimized', color: 'good', description: 'Optimalizált AI security posture — folyamatos fejlesztés és threat-driven detection' },
];

export const aiEvidenceChecklist = [
  'DPA (Data Processing Agreement) az AI szolgáltatóval',
  'Standard Contractual Clauses (SCC) + TIA (Transfer Impact Assessment)',
  'Adatáramlási diagram (prompt → embedding → vector → logging)',
  'Retention policy dokumentum (prompt / embedding / log)',
  'GDPR Art. 17 erasure workflow leírás',
  'DPIA (Data Protection Impact Assessment) az AI rendszerre',
  'PII detection / redaction pipeline dokumentáció',
  'Privacy risk register',
  'GDPR gap analysis',
  'AI audit log séma + retention konfiguráció',
  'Immutable logging (WORM / Object Lock) bizonyíték',
  'SIEM AI log source onboarding dokumentum',
  'Trace / session replay dashboard screenshot',
  'Model registry + prompt versioning rendszer',
  'Vector DB metadata séma (doc_id, chunk_id, tenant_id, ACL)',
  'Embedding lifecycle policy',
  'Vector deletion / cascade workflow teszt',
  'Tenant isolation teszt jegyzőkönyv',
  'Retrieval ACL middleware kód + teszt',
  'Prompt injection threat model és teszt riport',
  'Red team / adversarial testing jegyzőkönyv',
  'MITRE ATT&CK / MITRE ATLAS alignment',
  'AI risk classification dokumentum',
  'Model card',
  'AI risk register',
  'AI inventory',
  'HITL (human-in-the-loop) policy',
  'AI acceptable use policy',
  'AI use-case approval workflow',
  'EU AI Act Art. 9 / Art. 12 compliance gap analysis',
  'SOC-CMM self-assessment riport',
  'AI-specifikus SIEM use-case katalógus',
  'SOAR playbook AI incidensekre',
  'API security konfiguráció (gateway, WAF, rate limit)',
  'Secret / KMS / Vault konfiguráció',
  'Tool registry + per-tool authorization policy',
  'SBOM + dependency CVE scan riport',
  'NIS2 Art. 21 gap analysis',
  'NIS2 incidens jelentési playbook (24h / 72h)',
];

export const aiDomainShort: Record<AiRiskDomain, string> = {
  gdpr_data: 'GDPR',
  logging_traceability: 'Logging',
  rag_security: 'RAG',
  ai_governance: 'Governance',
  soc_cmm: 'SOC-CMM',
  ai_architecture: 'Architektúra',
  monitoring_nis2: 'NIS2',
};

export const aiQuickWinsRules = (answers: Record<string, any>): string[] => {
  const wins: string[] = [];
  const isNo = (id: string) => !answers[id] || answers[id] === 'no';
  if (isNo('GDPR-01')) wins.push('DPA aláírása az AI szolgáltatóval 30 napon belül');
  if (isNo('GDPR-04')) wins.push('Retention policy és TTL bevezetése a prompt/embedding tárolásra');
  if (isNo('LOG-01')) wins.push('Perzisztens AI audit log bevezetése (input + output)');
  if (isNo('RAG-04')) wins.push('Vector cascade deletion API megépítése (GDPR Art. 17)');
  if (isNo('RAG-06')) wins.push('Retrieval-szintű ACL middleware bevezetése');
  if (isNo('RAG-07') || answers['RAG-07'] === 'Nincs') wins.push('Prompt injection input filter + output guardrails bevezetése');
  if (isNo('GOV-05')) wins.push('Human-in-the-loop approval step bevezetése high-risk döntéseknél');
  if (isNo('MON-06')) wins.push('NIS2 Art. 21 gap analysis indítása az AI rendszerre');
  return wins;
};
