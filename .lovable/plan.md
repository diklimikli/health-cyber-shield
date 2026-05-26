## Cél

Új audit típus hozzáadása: **AI Security & SOC Readiness Audit**, a meglévő IT biztonsági audit mellé. A felhasználó indításkor választhat a két audit közül.

## Architektúra

Bevezetek egy audit-regisztert, így a meglévő komponensek (`QuestionCard`, `SectionNav`, `ResultsDashboard`, `pdfExport`) változatlanul, paraméterezetten működnek két (későbbi: több) audit-szettel.

```
src/data/
  questionnaireData.ts       (meglévő, IT audit – marad)
  aiAuditData.ts             (ÚJ – AI/RAG/SOC audit teljes adatmodellje)
  auditRegistry.ts           (ÚJ – id → {sections, questions, redFlags, scoringWeights, maturityLevels, evidenceChecklist, meta})
```

A `QuestionnaireContext` kap egy `auditType: 'it' | 'ai'` mezőt + `setAuditType`. Az `Index.tsx`-be új **AuditPicker** kerül: ha még nincs választott audit → válaszó képernyő ("IT Security Audit" / "AI System Audit" kártyák), különben a kérdőív.

A komponensek a `useActiveAudit()` hookon keresztül kérik le az aktív audit moduljait, így a `sections`/`questions`/`redFlags`/stb. statikus importok helyett dinamikusan jönnek.

## AI Audit tartalom (7 szekció, ~55 kérdés)

A felhasználói specifikációt 1:1 lefedi, scoring-súlyokkal:

| # | Szekció | Súly |
|---|---|---|
| 1 | Adatkezelés és GDPR kontrollok (DPA, EU-régió, retention, Art.17/28) | 20 |
| 2 | AI Audit Logging és Traceability (immutable log, SIEM, EU AI Act Art.12) | 15 |
| 3 | RAG Security (chunk provenance, tenant isolation, prompt injection, embedding leakage) | 20 |
| 4 | AI Governance és AI Act Readiness (risk classification, model card, HITL, Art.9) | 15 |
| 5 | SOC-CMM és Security Operations Maturity (L0–L5 detection/IR/hunting/SOAR) | 15 |
| 6 | AI Security Architecture Review (API/secret/MCP/agent/memory/supply-chain) | 10 |
| 7 | Monitoring és NIS2 Readiness (NIS2 Art.21, anomaly detection, telemetry) | 5 |

Plusz "Killer Questions" szekció a kritikus döntéstámogató kérdésekkel (DPA, EU adatközpont, immutable log, prompt injection védelem, HITL, NIS2 incidens jelentés).

Minden kérdés tartalmazza: `purpose`, `expectedEvidence`, `riskWeight`, `poorAnswer`, `strongAnswer`, `scoringLogic`, `maxPoints`, opcionális `redFlagTrigger` és `isKillerQuestion`.

Hozzáadom:
- ~12 RAG/AI-specifikus **Red Flag** (pl. nincs DPA, US-only adatfeldolgozás, nincs prompt injection védelem, nincs vector deletion, nincs immutable log, nincs HITL high-risk-nél, nincs NIS2 jelentési folyamat).
- AI-specifikus **maturity szintek** (Level 0–5 SOC-CMM stílusban) ÉS a meglévő 0–100 skála.
- AI-specifikus **evidence checklist** (~30 elem: DPA, adatáramlási diagram, model card, AI inventory, risk register, retrieval ACL policy, SIEM use-case katalógus AI eseményekre, prompt injection test report, AI policy stb.).
- **Quick wins** generálása AI-specifikus szabályokkal (pl. ha nincs DPA → DPA aláírás 30 napon belül).

## Scoring és kockázati domének (AI)

```ts
type AiRiskDomain =
  | 'gdpr_data'
  | 'logging_traceability'
  | 'rag_security'
  | 'ai_governance'
  | 'soc_cmm'
  | 'ai_architecture'
  | 'monitoring_nis2';
```

Ugyanaz a `calculateResults` motor működik – a `scoringEngine`-be `auditConfig` paramétert injektálok (sections/questions/weights/redFlags/maturity/quickWins-szabályok jönnek paraméterként), így az IT és AI audit ugyanazt a logikát használja.

## PDF export

A `pdfExport.ts` megkapja az aktív audit metaadatait (cím, fájlnév, evidence checklist forrása) – a vizuális template változatlan, csak a tartalom jön az aktuális auditból. AI audit PDF fájlnév: `ai_security_audit_report.pdf` / `audit_securitate_ai.pdf` / `ai_biztonsagi_audit.pdf`.

## Lokalizáció

- HU: teljes (a spec eredeti nyelve).
- EN/RO: csak a szekció-/UI-szintű címkék fordítása + audit picker címek. Az 55 új AI kérdés szövege HU-ban marad a többnyelvű kapcsoló mellett – jelölés a UI-on, hogy az AI audit kérdéscsomag HU specifikus (későbbi iterációban bővíthető). Ezt a kompromisszumot a méret indokolja; ha kéred, külön körben elkészítem a teljes EN/RO fordítást is.

## UI változások

- `Index.tsx`: ha `auditType === null` → AuditPicker render (két kártya, AI ikon vs Shield, leírás, "Indítás" gomb). Ha választott → eddigi flow.
- Új gomb a header-ben: "Audit típus váltása" (visszadob a választóhoz, megerősítéssel ha vannak válaszok).
- A maturity-doboz a Results-ban AI auditnál egy extra "SOC-CMM Maturity Matrix" táblát is mutat L0–L5 szintekkel.

## Érintett fájlok

Új:
- `src/data/aiAuditData.ts`
- `src/data/auditRegistry.ts`
- `src/components/AuditPicker.tsx`
- `src/hooks/useActiveAudit.ts`

Módosítás:
- `src/contexts/QuestionnaireContext.tsx` (auditType state)
- `src/pages/Index.tsx` (picker integráció)
- `src/lib/scoringEngine.ts` (audit-config paraméter)
- `src/components/SectionNav.tsx`, `QuestionCard.tsx`, `ResultsDashboard.tsx` (aktív audit hookból olvas)
- `src/lib/pdfExport.ts` (audit metaadat paraméter)
- `src/i18n/translations.ts` (új UI kulcsok: audit picker, AI audit címek)

## Limitációk / döntések

- Az AI audit kérdéseinek teljes EN/RO fordítása ebből kimarad (mennyiség miatt) – ha kell, jelezd és külön körben hozzáadom.
- A meglévő IT audit scoring és red flag logikája változatlan; csak refaktorálom konfigurációvá, viselkedés-ekvivalens.