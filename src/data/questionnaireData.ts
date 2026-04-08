export type QuestionType = 'yesno' | 'multiple' | 'scale' | 'freetext' | 'evidence';
export type RiskWeight = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskDomain = 
  | 'vendor_dependency'
  | 'access_control'
  | 'backup_dr'
  | 'soc_monitoring'
  | 'incident_ownership'
  | 'endpoint_security'
  | 'contractual';

export interface Question {
  id: string;
  sectionId: string;
  text: string;
  purpose: string;
  type: QuestionType;
  options?: string[];
  expectedEvidence: string;
  riskWeight: RiskWeight;
  riskDomain: RiskDomain;
  poorAnswer: string;
  strongAnswer: string;
  redFlagTrigger?: string;
  scoringLogic: string;
  maxPoints: number;
  isKillerQuestion?: boolean;
}

export interface Section {
  id: string;
  title: string;
  titleHu: string;
  description: string;
  icon: string;
  order: number;
}

export interface RedFlag {
  id: string;
  title: string;
  titleHu: string;
  whyCritical: string;
  consequences: string;
  immediateAction: string;
  triggerQuestionId: string;
  triggerCondition: string;
}

export const sections: Section[] = [
  { id: 'general', title: 'General IT Landscape', titleHu: 'Általános IT infrastruktúra és kritikus rendszerek', description: 'Kritikus rendszerek, IT környezet áttekintése', icon: 'Server', order: 1 },
  { id: 'vendor', title: 'Vendor Dependency', titleHu: 'Beszállítói függőség és operatív kontroll', description: 'Info World és egyéb beszállítói függőség feltérképezése', icon: 'Link', order: 2 },
  { id: 'remote_access', title: 'Remote Access / VPN', titleHu: 'Távoli hozzáférés / VPN / harmadik fél hozzáférés', description: 'VPN, távoli hozzáférés és külső fél hozzáférési kockázatok', icon: 'Wifi', order: 3 },
  { id: 'identity', title: 'Identity / AD / PAM', titleHu: 'Identitáskezelés / Active Directory / kiemelt jogosultságok', description: 'AD, GPO, jogosultságkezelés, admin tiering', icon: 'Shield', order: 4 },
  { id: 'endpoint', title: 'Endpoint / Host Security', titleHu: 'Végpont- és hosztbiztonság / tűzfal / EDR', description: 'Végpontvédelem, tűzfal, EDR/XDR megoldások', icon: 'Monitor', order: 5 },
  { id: 'network', title: 'Network Segmentation', titleHu: 'Hálózati szegmentáció és laterális mozgás kontroll', description: 'Hálózati szegmentáció, VLAN-ok, zónák', icon: 'Network', order: 6 },
  { id: 'backup', title: 'Backup / DR', titleHu: 'Mentés / visszaállítás / katasztrófa-elhárítás', description: 'Backup, restore, DR, ransomware recovery', icon: 'Database', order: 7 },
  { id: 'soc', title: 'SOC / Monitoring', titleHu: 'SOC / monitoring / naplókezelés / detektálás', description: 'CYMED SOC, monitoring, naplóforrások, lefedettség', icon: 'Eye', order: 8 },
  { id: 'incident', title: 'Incident Response', titleHu: 'Incidenskezelés / felelősség / RACI / jelentéstétel', description: 'Incidenskezelési felelősség, RACI, DNSC jelentéstétel', icon: 'AlertTriangle', order: 9 },
  { id: 'contractual', title: 'Contracts / SLA', titleHu: 'Szerződések / SLA / beszállítói irányítás / exit terv', description: 'SLA, szerződések, exit stratégia, vendor governance', icon: 'FileText', order: 10 },
  { id: 'compliance', title: 'Compliance / NIS2', titleHu: 'Megfelelőség / NIS2 / DNSC-releváns kérdések', description: 'NIS2, DNSC követelmények, megfelelőségi státusz', icon: 'Scale', order: 11 },
  { id: 'killer', title: 'Killer Questions', titleHu: 'Kritikus döntéstámogató kérdések', description: 'Azonnali kockázatot jelző kiemelt kérdések', icon: 'Zap', order: 12 },
];

export const questions: Question[] = [
  // === SECTION 1: General IT Landscape ===
  {
    id: 'GEN-01', sectionId: 'general',
    text: 'Melyek az intézmény betegellátás szempontjából kritikus IT rendszerei? (HIS, PACS, LIS, RIS, gyógyszertári rendszer, stb.)',
    purpose: 'Kritikus rendszerek azonosítása és a betegellátásra gyakorolt hatás felmérése',
    type: 'freetext', expectedEvidence: 'Kritikus rendszerek leltára, üzleti hatáselemzés (BIA)',
    riskWeight: 'High', riskDomain: 'vendor_dependency',
    poorAnswer: 'Nincs dokumentált kritikus rendszerlista', strongAnswer: 'Teljes, priorizált kritikus rendszerleltár BIA-val',
    scoringLogic: 'Dokumentált lista = 2pt, BIA is van = 3pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'GEN-02', sectionId: 'general',
    text: 'Mi történik, ha az Info World 24-48 órán keresztül nem elérhető? Mely rendszerek működnek tovább és melyek állnak le?',
    purpose: 'Beszállítói függőség mértékének feltárása a betegellátás folytonosságára vonatkozóan',
    type: 'freetext', expectedEvidence: 'Üzletmenet-folytonossági terv (BCP), függőségi mátrix',
    riskWeight: 'Critical', riskDomain: 'vendor_dependency',
    poorAnswer: 'Nem tudjuk, minden leállna', strongAnswer: 'Dokumentált BCP, amely részletezi a folytonossági képességeket',
    scoringLogic: 'BCP létezik és tesztelt = 4pt, létezik de nem tesztelt = 2pt, nincs = 0pt', maxPoints: 4,
    redFlagTrigger: 'Ha a válasz szerint minden leáll', isKillerQuestion: true,
  },
  {
    id: 'GEN-03', sectionId: 'general',
    text: 'Hány szerver és végpont van az intézmény hálózatán?',
    purpose: 'IT környezet méretének és komplexitásának felmérése',
    type: 'freetext', expectedEvidence: 'Eszközleltár, CMDB kivonat',
    riskWeight: 'Medium', riskDomain: 'endpoint_security',
    poorAnswer: 'Nincs pontos eszközleltár', strongAnswer: 'Naprakész CMDB minden eszközzel',
    scoringLogic: 'Naprakész leltár = 2pt, részleges = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'GEN-04', sectionId: 'general',
    text: 'Milyen operációs rendszerek futnak a szervereken és végpontokon? Vannak-e end-of-life (EOL) rendszerek?',
    purpose: 'Elavult, nem támogatott rendszerek azonosítása',
    type: 'freetext', expectedEvidence: 'OS verziólista, patch status riport',
    riskWeight: 'High', riskDomain: 'endpoint_security',
    poorAnswer: 'Vannak EOL rendszerek, nincs migrációs terv', strongAnswer: 'Nincs EOL rendszer, vagy van dokumentált migrációs terv',
    scoringLogic: 'Nincs EOL = 2pt, van EOL de van terv = 1pt, van EOL terv nélkül = 0pt', maxPoints: 2,
  },

  // === SECTION 2: Vendor Dependency ===
  {
    id: 'VEN-01', sectionId: 'vendor',
    text: 'Az Info World mely tevékenységeket végzi? (szerver üzemeltetés, backup, restore, SQL adminisztráció, OS frissítés, domain admin, monitoring)',
    purpose: 'Beszállítói tevékenységek teljes körű feltérképezése és a függőség mértékének megállapítása',
    type: 'multiple', options: ['Szerver üzemeltetés', 'Backup kezelés', 'Restore végrehajtás', 'SQL adminisztráció', 'OS patch/frissítés', 'Domain adminisztráció', 'Monitoring', 'Felhasználókezelés'],
    expectedEvidence: 'Szolgáltatási szerződés, RACI mátrix, feladatleírás',
    riskWeight: 'Critical', riskDomain: 'vendor_dependency',
    poorAnswer: 'Az Info World végzi az összes felsorolt tevékenységet kizárólagosan', strongAnswer: 'Feladatok dokumentáltan megosztottak, belső kompetencia is van',
    scoringLogic: '7-8 jelölve = 0pt (teljes függőség), 4-6 = 2pt, 1-3 = 4pt', maxPoints: 4,
    redFlagTrigger: 'Ha minden tevékenységet az Info World végez', isKillerQuestion: true,
  },
  {
    id: 'VEN-02', sectionId: 'vendor',
    text: 'Van-e belső IT személyzet, aki képes lenne a kritikus rendszerek alapszintű üzemeltetésére az Info World nélkül?',
    purpose: 'Belső kompetencia és redundancia felmérése',
    type: 'yesno', expectedEvidence: 'Szervezeti ábra, kompetencia mátrix, képzési terv',
    riskWeight: 'High', riskDomain: 'vendor_dependency',
    poorAnswer: 'Nincs belső IT kompetencia', strongAnswer: 'Van képzett belső csapat dokumentált kompetenciákkal',
    scoringLogic: 'Igen, dokumentált = 3pt, igen de nem dokumentált = 1pt, nem = 0pt', maxPoints: 3,
  },
  {
    id: 'VEN-03', sectionId: 'vendor',
    text: 'Az Info World single point of failure (egyetlen kritikus pont) a szervezet IT működésében?',
    purpose: 'Kritikus függőségi pont azonosítása',
    type: 'yesno', expectedEvidence: 'Függőségi elemzés, kockázatértékelés',
    riskWeight: 'Critical', riskDomain: 'vendor_dependency',
    poorAnswer: 'Igen, az Info World egyetlen kritikus pont', strongAnswer: 'Nem, van redundancia és alternatív képesség',
    scoringLogic: 'Nem SPOF = 3pt, részben = 1pt, igen SPOF = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha igen', isKillerQuestion: true,
  },
  {
    id: 'VEN-04', sectionId: 'vendor',
    text: 'Van-e dokumentált vendor lock-in kockázatértékelés?',
    purpose: 'Vendor lock-in tudatosság és kezelés felmérése',
    type: 'yesno', expectedEvidence: 'Kockázatértékelési dokumentum',
    riskWeight: 'High', riskDomain: 'vendor_dependency',
    poorAnswer: 'Nincs ilyen elemzés', strongAnswer: 'Dokumentált elemzés mitigációs intézkedésekkel',
    scoringLogic: 'Dokumentált + mitigáció = 3pt, dokumentált = 2pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'VEN-05', sectionId: 'vendor',
    text: 'Milyen rendszerességgel történik az Info World tevékenységének felülvizsgálata / auditja?',
    purpose: 'Beszállítói felügyelet hatékonyságának felmérése',
    type: 'multiple', options: ['Soha', 'Évente', 'Félévente', 'Negyedévente', 'Folyamatos monitoring'],
    expectedEvidence: 'Audit jelentések, felülvizsgálati jegyzőkönyvek',
    riskWeight: 'Medium', riskDomain: 'contractual',
    poorAnswer: 'Soha nem volt felülvizsgálat', strongAnswer: 'Rendszeres, dokumentált felülvizsgálat',
    scoringLogic: 'Negyedévente+ = 2pt, évente = 1pt, soha = 0pt', maxPoints: 2,
  },

  // === SECTION 3: Remote Access / VPN ===
  {
    id: 'VPN-01', sectionId: 'remote_access',
    text: 'Mely beszállítók rendelkeznek VPN hozzáféréssel az intézmény hálózatához? (Info World, CYMED, egyéb)',
    purpose: 'Külső hozzáférések teljes feltérképezése',
    type: 'freetext', expectedEvidence: 'VPN konfiguráció, hozzáférési lista, VPN napló',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'Nincs naprakész nyilvántartás a VPN hozzáférésekről', strongAnswer: 'Teljes, dokumentált VPN hozzáférési leltár',
    scoringLogic: 'Dokumentált lista = 2pt, részleges = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'VPN-02', sectionId: 'remote_access',
    text: 'A beszállítói VPN hozzáféréseknél alkalmaznak-e többfaktoros hitelesítést (MFA)?',
    purpose: 'MFA hiányának azonosítása a külső hozzáféréseknél',
    type: 'yesno', expectedEvidence: 'VPN konfiguráció, MFA policy',
    riskWeight: 'Critical', riskDomain: 'access_control',
    poorAnswer: 'Nincs MFA a beszállítói hozzáférésen', strongAnswer: 'MFA kötelező minden külső hozzáférésnél',
    scoringLogic: 'MFA minden hozzáférésnél = 4pt, részleges = 2pt, nincs = 0pt', maxPoints: 4,
    redFlagTrigger: 'Ha nincs MFA', isKillerQuestion: true,
  },
  {
    id: 'VPN-03', sectionId: 'remote_access',
    text: 'A beszállítói hozzáférési fiókok személyre szólóak (named account), vagy megosztott fiókokat használnak?',
    purpose: 'Megosztott fiókok és az egyéni felelősség hiányának feltárása',
    type: 'multiple', options: ['Minden fiók személyre szóló', 'Vegyes (van megosztott is)', 'Többnyire megosztott fiókok'],
    expectedEvidence: 'Felhasználói fiók lista, hozzáférési policy',
    riskWeight: 'Critical', riskDomain: 'access_control',
    poorAnswer: 'Megosztott fiókokat használnak', strongAnswer: 'Kizárólag személyre szóló fiókok',
    scoringLogic: 'Minden személyre szóló = 3pt, vegyes = 1pt, megosztott = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha megosztott fiókokat használnak',
  },
  {
    id: 'VPN-04', sectionId: 'remote_access',
    text: 'A VPN hozzáférés PSK (Pre-Shared Key) vagy XAUTH alapú?',
    purpose: 'Gyenge hitelesítési módszerek azonosítása',
    type: 'multiple', options: ['PSK alapú', 'XAUTH alapú', 'Tanúsítvány alapú', 'Nem tudjuk'],
    expectedEvidence: 'VPN konfiguráció',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'PSK alapú, gyenge hitelesítés', strongAnswer: 'Tanúsítvány alapú, erős hitelesítés',
    scoringLogic: 'Tanúsítvány = 3pt, XAUTH+MFA = 2pt, PSK/XAUTH = 0pt', maxPoints: 3,
  },
  {
    id: 'VPN-05', sectionId: 'remote_access',
    text: 'Van-e session logging / session recording a beszállítói hozzáféréseknél?',
    purpose: 'Beszállítói tevékenység nyomon követhetőségének felmérése',
    type: 'yesno', expectedEvidence: 'Session log példa, PAM konfiguráció',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'Nincs session naplózás', strongAnswer: 'Teljes session recording és naplózás van',
    scoringLogic: 'Session recording = 3pt, session log = 2pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'VPN-06', sectionId: 'remote_access',
    text: 'A beszállítói hozzáférés időben korlátozott (time-bound)?',
    purpose: 'Folyamatos, ellenőrizetlen hozzáférés kockázatának felmérése',
    type: 'yesno', expectedEvidence: 'Hozzáférési policy, VPN konfiguráció',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'Állandó hozzáférés, nincs időkorlát', strongAnswer: 'Időkorlátos, igény alapú hozzáférés',
    scoringLogic: 'Időkorlátos = 2pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'VPN-07', sectionId: 'remote_access',
    text: 'Használnak-e jump host / bastion host rendszert a beszállítói hozzáféréshez?',
    purpose: 'Hozzáférési kontroll réteg meglétének felmérése',
    type: 'yesno', expectedEvidence: 'Hálózati rajz, bastion host konfiguráció',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'Nincs bastion host, közvetlen hozzáférés a belső hálózathoz', strongAnswer: 'Bastion host-on keresztül történik minden beszállítói hozzáférés',
    scoringLogic: 'Bastion host van = 3pt, nincs = 0pt', maxPoints: 3,
  },

  // === SECTION 4: Identity / AD / PAM ===
  {
    id: 'IAM-01', sectionId: 'identity',
    text: 'Mely beszállítók rendelkeznek Domain Admin vagy azzal egyenértékű jogosultsággal?',
    purpose: 'Túlzott jogosultságok és kiemelt hozzáférések azonosítása',
    type: 'freetext', expectedEvidence: 'AD csoport tagság lista, privilegizált fiókok leltára',
    riskWeight: 'Critical', riskDomain: 'access_control',
    poorAnswer: 'Több beszállító is Domain Admin joggal rendelkezik', strongAnswer: 'Minimális, dokumentált kiemelt jogosultság, least privilege elv',
    scoringLogic: 'Dokumentált, minimális = 3pt, túl sok DA = 0pt', maxPoints: 3,
    isKillerQuestion: true,
  },
  {
    id: 'IAM-02', sectionId: 'identity',
    text: 'Implementálva van-e AD admin tiering (Tier 0 / Tier 1 / Tier 2 szeparáció)?',
    purpose: 'Adminisztratív szintű jogosultság-szeparáció felmérése',
    type: 'yesno', expectedEvidence: 'AD tiering dokumentáció, OU struktúra',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'Nincs admin tiering', strongAnswer: 'Dokumentált tiering modell implementálva',
    scoringLogic: 'Implementált = 3pt, tervezés alatt = 1pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'IAM-03', sectionId: 'identity',
    text: 'Van-e Privileged Access Management (PAM) megoldás implementálva?',
    purpose: 'Kiemelt hozzáférések kezelési érettségének felmérése',
    type: 'yesno', expectedEvidence: 'PAM eszköz konfiguráció, jelszókezelési policy',
    riskWeight: 'High', riskDomain: 'access_control',
    poorAnswer: 'Nincs PAM megoldás', strongAnswer: 'PAM eszköz van, automatizált jelszórotáció',
    scoringLogic: 'PAM + rotáció = 3pt, részleges = 1pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'IAM-04', sectionId: 'identity',
    text: 'Az Active Directory megerősítése (hardening) dokumentáltan végrehajtásra került?',
    purpose: 'AD biztonsági konfiguráció állapotának felmérése',
    type: 'evidence', expectedEvidence: 'AD hardening checklist, GPO lista, biztonsági audit eredmény',
    riskWeight: 'High', riskDomain: 'endpoint_security',
    poorAnswer: 'Nincs AD hardening, vagy nincs bizonyíték rá', strongAnswer: 'Dokumentált hardening, rendszeres felülvizsgálat',
    scoringLogic: 'Dokumentált + felülvizsgált = 3pt, részleges = 1pt, nincs = 0pt', maxPoints: 3,
  },

  // === SECTION 5: Endpoint / Host Security ===
  {
    id: 'EPT-01', sectionId: 'endpoint',
    text: 'Mi a "Disable Firewall" GPO célja, és mely rendszerekre van alkalmazva?',
    purpose: 'A tűzfal kikapcsoló GPO kockázatának felmérése',
    type: 'freetext', expectedEvidence: 'GPO konfiguráció, alkalmazási hatókör dokumentáció',
    riskWeight: 'Critical', riskDomain: 'endpoint_security',
    poorAnswer: 'Nincs dokumentált indoklás, szerverekre is alkalmazott', strongAnswer: 'Nem létezik ilyen GPO, vagy kizárólag indokolt esetben, szűk hatókörrel',
    scoringLogic: 'Nincs ilyen GPO = 3pt, van de dokumentált = 1pt, szervereken is aktív = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha aktív a szervereken', isKillerQuestion: true,
  },
  {
    id: 'EPT-02', sectionId: 'endpoint',
    text: 'Telepítve van-e EDR / XDR megoldás a végpontokon és szervereken?',
    purpose: 'Végpontvédelmi megoldás meglétének és lefedettségének felmérése',
    type: 'multiple', options: ['Igen, minden végponton és szerveren', 'Csak végpontokon', 'Csak szervereken', 'Nincs EDR/XDR'],
    expectedEvidence: 'EDR dashboard screenshot, telepítési lefedettség riport',
    riskWeight: 'High', riskDomain: 'endpoint_security',
    poorAnswer: 'Nincs EDR/XDR', strongAnswer: 'Teljes lefedettség EDR/XDR-rel',
    scoringLogic: 'Teljes lefedettség = 3pt, részleges = 1pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'EPT-03', sectionId: 'endpoint',
    text: 'Mikor történt utoljára a GPO-k biztonsági felülvizsgálata?',
    purpose: 'GPO karbantartás és felülvizsgálat rendszerességének felmérése',
    type: 'multiple', options: ['3 hónapon belül', '6 hónapon belül', '12 hónapon belül', 'Több mint 1 éve', 'Soha'],
    expectedEvidence: 'GPO felülvizsgálati jegyzőkönyv',
    riskWeight: 'Medium', riskDomain: 'endpoint_security',
    poorAnswer: 'Soha nem volt felülvizsgálat', strongAnswer: 'Rendszeres, dokumentált felülvizsgálat',
    scoringLogic: '3 hónapon belül = 2pt, 12 hónapon belül = 1pt, soha = 0pt', maxPoints: 2,
  },

  // === SECTION 6: Network Segmentation ===
  {
    id: 'NET-01', sectionId: 'network',
    text: 'A hálózat szegmentált-e a klinikai / adminisztratív / beszállítói / infrastruktúra zónák között?',
    purpose: 'Hálózati szegmentáció és laterális mozgás elleni védelem felmérése',
    type: 'multiple', options: ['Igen, teljes szegmentáció', 'Részleges szegmentáció', 'Nincs szegmentáció', 'Nem tudjuk'],
    expectedEvidence: 'Hálózati rajz, VLAN konfiguráció, tűzfalszabályok',
    riskWeight: 'Critical', riskDomain: 'endpoint_security',
    poorAnswer: 'Flat network, nincs szegmentáció', strongAnswer: 'Teljes szegmentáció dokumentált tűzfalszabályokkal',
    scoringLogic: 'Teljes = 3pt, részleges = 1pt, nincs = 0pt', maxPoints: 3,
    isKillerQuestion: true,
  },
  {
    id: 'NET-02', sectionId: 'network',
    text: 'A orvostechnikai eszközök (medical devices) külön hálózati szegmensben vannak?',
    purpose: 'Orvostechnikai eszközök hálózati izolációjának felmérése',
    type: 'yesno', expectedEvidence: 'Hálózati rajz, VLAN konfiguráció',
    riskWeight: 'High', riskDomain: 'endpoint_security',
    poorAnswer: 'Nem, közös hálózaton vannak', strongAnswer: 'Igen, dedikált szegmensben vannak',
    scoringLogic: 'Külön szegmens = 2pt, nincs = 0pt', maxPoints: 2,
  },

  // === SECTION 7: Backup / DR ===
  {
    id: 'BCK-01', sectionId: 'backup',
    text: 'Hol tárolják a mentéseket? (helyi, távoli, felhő, offline)',
    purpose: 'Backup tárolási diverzitás és biztonság felmérése',
    type: 'multiple', options: ['Csak helyi (on-site)', 'Helyi + távoli', 'Helyi + távoli + offline', 'Helyi + felhő', 'Nem tudjuk'],
    expectedEvidence: 'Backup konfiguráció, tárolási architektúra dokumentáció',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Csak helyi mentés, nincs off-site', strongAnswer: 'Helyi + távoli + offline mentés',
    scoringLogic: 'Helyi+távoli+offline = 4pt, helyi+távoli = 2pt, csak helyi = 0pt', maxPoints: 4,
  },
  {
    id: 'BCK-02', sectionId: 'backup',
    text: 'Van-e immutable (megváltoztathatatlan) backup megoldás?',
    purpose: 'Ransomware elleni backup védelem felmérése',
    type: 'yesno', expectedEvidence: 'Backup konfiguráció, immutability beállítás',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Nincs immutable backup', strongAnswer: 'Immutable backup implementálva és tesztelve',
    scoringLogic: 'Van és tesztelt = 4pt, van = 2pt, nincs = 0pt', maxPoints: 4,
    redFlagTrigger: 'Ha nincs immutable backup', isKillerQuestion: true,
  },
  {
    id: 'BCK-03', sectionId: 'backup',
    text: 'Van-e offline (air-gapped) backup másolat?',
    purpose: 'Hálózattól izolált backup másolat meglétének felmérése',
    type: 'yesno', expectedEvidence: 'Offline backup eljárás, tárolási dokumentáció',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Nincs offline backup', strongAnswer: 'Rendszeres offline backup másolat készül',
    scoringLogic: 'Van rendszeres = 3pt, alkalmi = 1pt, nincs = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nincs offline backup',
  },
  {
    id: 'BCK-04', sectionId: 'backup',
    text: 'Mikor történt utoljára teljes visszaállítási teszt (full restore test)?',
    purpose: 'Visszaállítási képesség valós tesztelésének felmérése',
    type: 'multiple', options: ['3 hónapon belül', '6 hónapon belül', '12 hónapon belül', 'Több mint 1 éve', 'Soha'],
    expectedEvidence: 'Visszaállítási teszt jegyzőkönyv, eredmény dokumentáció',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Soha nem volt restore teszt', strongAnswer: '3 hónapon belüli sikeres restore teszt',
    scoringLogic: '3 hónapon belül = 4pt, 12 hónapon belül = 2pt, soha = 0pt', maxPoints: 4,
    redFlagTrigger: 'Ha soha nem volt vagy több mint 12 hónap', isKillerQuestion: true,
  },
  {
    id: 'BCK-05', sectionId: 'backup',
    text: 'Mikor történt utoljára PACS rendszer visszaállítási teszt?',
    purpose: 'Képalkotó diagnosztikai rendszer visszaállítási képesség felmérése',
    type: 'multiple', options: ['6 hónapon belül', '12 hónapon belül', 'Több mint 1 éve', 'Soha'],
    expectedEvidence: 'PACS restore teszt jegyzőkönyv',
    riskWeight: 'High', riskDomain: 'backup_dr',
    poorAnswer: 'Soha nem volt PACS restore teszt', strongAnswer: '6 hónapon belüli sikeres teszt',
    scoringLogic: '6 hónapon belül = 3pt, 12 hónapon belül = 2pt, soha = 0pt', maxPoints: 3,
  },
  {
    id: 'BCK-06', sectionId: 'backup',
    text: 'Mikor történt utoljára SQL adatbázis visszaállítási teszt?',
    purpose: 'Adatbázis visszaállítási képesség valós tesztelése',
    type: 'multiple', options: ['6 hónapon belül', '12 hónapon belül', 'Több mint 1 éve', 'Soha'],
    expectedEvidence: 'SQL restore teszt jegyzőkönyv',
    riskWeight: 'High', riskDomain: 'backup_dr',
    poorAnswer: 'Soha nem volt SQL restore teszt', strongAnswer: '6 hónapon belüli sikeres teszt',
    scoringLogic: '6 hónapon belül = 3pt, 12 hónapon belül = 2pt, soha = 0pt', maxPoints: 3,
  },
  {
    id: 'BCK-07', sectionId: 'backup',
    text: 'Definiáltak-e RTO (Recovery Time Objective) és RPO (Recovery Point Objective) célértékeket?',
    purpose: 'Helyreállítási célértékek meglétének és dokumentáltságának felmérése',
    type: 'yesno', expectedEvidence: 'RTO/RPO dokumentáció, BIA',
    riskWeight: 'High', riskDomain: 'backup_dr',
    poorAnswer: 'Nincsenek definiált RTO/RPO célértékek', strongAnswer: 'Dokumentált RTO/RPO rendszerenként',
    scoringLogic: 'Dokumentált rendszerenként = 3pt, általános = 1pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'BCK-08', sectionId: 'backup',
    text: 'Van-e ransomware recovery runbook (helyreállítási forgatókönyv)?',
    purpose: 'Ransomware incidens utáni helyreállítási felkészültség felmérése',
    type: 'yesno', expectedEvidence: 'Ransomware recovery runbook dokumentáció',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Nincs ransomware recovery runbook', strongAnswer: 'Dokumentált, tesztelt runbook van',
    scoringLogic: 'Van és tesztelt = 4pt, van = 2pt, nincs = 0pt', maxPoints: 4,
    redFlagTrigger: 'Ha nincs ransomware recovery runbook', isKillerQuestion: true,
  },

  // === SECTION 8: SOC / Monitoring ===
  {
    id: 'SOC-01', sectionId: 'soc',
    text: 'Pontosan mely naplóforrásokat (log source) gyűjti a CYMED?',
    purpose: 'Monitoring lefedettség és vakfoltok azonosítása',
    type: 'freetext', expectedEvidence: 'Naplóforrás leltár, SIEM konfiguráció',
    riskWeight: 'Critical', riskDomain: 'soc_monitoring',
    poorAnswer: 'Nincs dokumentált naplóforrás leltár', strongAnswer: 'Teljes naplóforrás leltár SIEM integrációval',
    scoringLogic: 'Teljes leltár = 3pt, részleges = 1pt, nincs = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nincs naplóforrás leltár',
  },
  {
    id: 'SOC-02', sectionId: 'soc',
    text: 'Mely rendszerek / hálózati szegmensek NEM integráltak a monitoringba?',
    purpose: 'Monitoring vakfoltok azonosítása',
    type: 'freetext', expectedEvidence: 'Lefedettségi mátrix, gap elemzés',
    riskWeight: 'High', riskDomain: 'soc_monitoring',
    poorAnswer: 'Nem tudjuk, nincs gap elemzés', strongAnswer: 'Dokumentált lefedettségi mátrix, ismert vakfoltokkal',
    scoringLogic: 'Gap elemzés van = 2pt, részleges = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'SOC-03', sectionId: 'soc',
    text: 'A SOC monitoring valóban 24/7-es?',
    purpose: 'Folyamatos monitoring lefedettség valós állapotának felmérése',
    type: 'multiple', options: ['Igen, 24/7 valós idejű', 'Munkaidőben élő, éjjel on-call', 'Csak munkaidőben', 'Nem tudjuk'],
    expectedEvidence: 'SOC működési leírás, SLA dokumentáció',
    riskWeight: 'High', riskDomain: 'soc_monitoring',
    poorAnswer: 'Csak munkaidőben, vagy nem tudjuk', strongAnswer: '24/7 valós idejű monitoring dokumentált SLA-val',
    scoringLogic: '24/7 valós = 3pt, on-call = 1pt, csak munkaidő = 0pt', maxPoints: 3,
  },
  {
    id: 'SOC-04', sectionId: 'soc',
    text: 'Mi a P1 (kritikus) incidens első értesítési SLA-ja?',
    purpose: 'Kritikus incidens értesítési idő felmérése',
    type: 'multiple', options: ['15 percen belül', '30 percen belül', '1 órán belül', '4 órán belül', 'Nincs definiált SLA'],
    expectedEvidence: 'SLA dokumentáció, SOC szerződés',
    riskWeight: 'Critical', riskDomain: 'soc_monitoring',
    poorAnswer: 'Nincs definiált P1 SLA', strongAnswer: '15 percen belüli P1 értesítés',
    scoringLogic: '15 perc = 3pt, 30 perc = 2pt, 1 óra = 1pt, nincs = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nincs definiált P1 SLA',
  },
  {
    id: 'SOC-05', sectionId: 'soc',
    text: 'Hány óra karbantartási vakfolt (maintenance blind spot) van hetente?',
    purpose: 'Monitoring kiesések azonosítása',
    type: 'freetext', expectedEvidence: 'Karbantartási ablak dokumentáció',
    riskWeight: 'Medium', riskDomain: 'soc_monitoring',
    poorAnswer: 'Nem ismert, vagy >8 óra/hét', strongAnswer: '<2 óra/hét, dokumentált',
    scoringLogic: '<2 óra = 2pt, 2-8 óra = 1pt, >8 óra = 0pt', maxPoints: 2,
  },
  {
    id: 'SOC-06', sectionId: 'soc',
    text: 'Van-e use-case lefedettség ransomware / brute force / laterális mozgás / adat-exfiltráció detektálásra?',
    purpose: 'Detektálási képesség és use-case lefedettség felmérése',
    type: 'multiple', options: ['Igen, mind a 4 lefedett', 'Részleges (1-3)', 'Nincs specifikus use-case', 'Nem tudjuk'],
    expectedEvidence: 'Use-case katalógus, SIEM szabályok',
    riskWeight: 'High', riskDomain: 'soc_monitoring',
    poorAnswer: 'Nincs specifikus use-case', strongAnswer: 'Teljes use-case lefedettség dokumentáltan',
    scoringLogic: 'Mind lefedett = 3pt, részleges = 1pt, nincs = 0pt', maxPoints: 3,
  },
  {
    id: 'SOC-07', sectionId: 'soc',
    text: 'Mi a naplók megőrzési ideje (retention period)?',
    purpose: 'Napló megőrzési idő megfelelőségének felmérése',
    type: 'multiple', options: ['30 nap', '90 nap', '180 nap', '365 nap', '365+ nap', 'Nem tudjuk'],
    expectedEvidence: 'Retention policy, SIEM konfiguráció',
    riskWeight: 'Medium', riskDomain: 'soc_monitoring',
    poorAnswer: '30 nap vagy kevesebb', strongAnswer: '365+ nap',
    scoringLogic: '365+ = 2pt, 180 = 1pt, <180 = 0pt', maxPoints: 2,
  },

  // === SECTION 9: Incident Response ===
  {
    id: 'INC-01', sectionId: 'incident',
    text: 'Ki az incidens parancsnok (incident commander) az első 15 percben egy P1 incidensnél?',
    purpose: 'Incidenskezelési felelősség tisztázottságának felmérése',
    type: 'freetext', expectedEvidence: 'Incidenskezelési terv, RACI mátrix',
    riskWeight: 'Critical', riskDomain: 'incident_ownership',
    poorAnswer: 'Nincs kijelölt személy / nem egyértelmű', strongAnswer: 'Dokumentáltan kijelölt, elérhető személy',
    scoringLogic: 'Dokumentált + elérhető = 3pt, van de nem dokumentált = 1pt, nincs = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nincs kijelölt incidens parancsnok', isKillerQuestion: true,
  },
  {
    id: 'INC-02', sectionId: 'incident',
    text: 'Ki dönt a visszaállításról (restore) egy incidens során?',
    purpose: 'Visszaállítási döntéshozatal tisztázottságának felmérése',
    type: 'freetext', expectedEvidence: 'Incidenskezelési terv, döntéshozatali mátrix',
    riskWeight: 'High', riskDomain: 'incident_ownership',
    poorAnswer: 'Nem egyértelmű', strongAnswer: 'Dokumentált döntéshozatali lánc',
    scoringLogic: 'Dokumentált = 2pt, szóbeli = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'INC-03', sectionId: 'incident',
    text: 'Ki gyűjti össze a naplókat (log) egy incidens során?',
    purpose: 'Naplógyűjtési felelősség tisztázása',
    type: 'freetext', expectedEvidence: 'Incidenskezelési eljárás',
    riskWeight: 'Medium', riskDomain: 'incident_ownership',
    poorAnswer: 'Nem egyértelmű', strongAnswer: 'Dokumentált felelősség és eljárás',
    scoringLogic: 'Dokumentált = 2pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'INC-04', sectionId: 'incident',
    text: 'Ki jelent a DNSC / NIS hatóságok felé incidens esetén?',
    purpose: 'Hatósági jelentéstételi felelősség tisztázása',
    type: 'freetext', expectedEvidence: 'NIS2 jelentéstételi eljárás',
    riskWeight: 'High', riskDomain: 'incident_ownership',
    poorAnswer: 'Nem tudjuk / nincs kijelölt személy', strongAnswer: 'Dokumentált felelős és eljárás',
    scoringLogic: 'Dokumentált = 2pt, szóbeli = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'INC-05', sectionId: 'incident',
    text: 'Van-e írásban rögzített RACI mátrix az Info World és a CYMED között?',
    purpose: 'Beszállítók közötti felelősségmegosztás tisztázottságának felmérése',
    type: 'yesno', expectedEvidence: 'RACI mátrix dokumentum',
    riskWeight: 'Critical', riskDomain: 'incident_ownership',
    poorAnswer: 'Nincs írott RACI', strongAnswer: 'Dokumentált, elfogadott RACI mátrix',
    scoringLogic: 'Dokumentált = 3pt, szóbeli = 1pt, nincs = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nincs írott RACI', isKillerQuestion: true,
  },
  {
    id: 'INC-06', sectionId: 'incident',
    text: 'Van-e P1 / P2 / P3 súlyossági besorolási modell?',
    purpose: 'Incidens priorizálási keretrendszer meglétének felmérése',
    type: 'yesno', expectedEvidence: 'Incidens osztályozási dokumentáció',
    riskWeight: 'High', riskDomain: 'incident_ownership',
    poorAnswer: 'Nincs súlyossági besorolás', strongAnswer: 'Dokumentált, elfogadott besorolási modell',
    scoringLogic: 'Dokumentált = 2pt, nincs = 0pt', maxPoints: 2,
  },

  // === SECTION 10: Contracts / SLA ===
  {
    id: 'CON-01', sectionId: 'contractual',
    text: 'Van-e egyértelműen definiált restore SLA a beszállítói szerződésben?',
    purpose: 'Visszaállítási SLA meglétének és egyértelműségének felmérése',
    type: 'yesno', expectedEvidence: 'Szerződéses SLA dokumentáció',
    riskWeight: 'High', riskDomain: 'contractual',
    poorAnswer: 'Nincs restore SLA', strongAnswer: 'Egyértelmű restore SLA kötbérrel',
    scoringLogic: 'SLA + kötbér = 2pt, SLA = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'CON-02', sectionId: 'contractual',
    text: 'Van-e dokumentált eszkalációs útvonal a beszállítók felé?',
    purpose: 'Eszkalációs folyamat tisztázottságának felmérése',
    type: 'yesno', expectedEvidence: 'Eszkalációs mátrix',
    riskWeight: 'Medium', riskDomain: 'contractual',
    poorAnswer: 'Nincs dokumentált eszkalációs útvonal', strongAnswer: 'Dokumentált, többszintű eszkalációs mátrix',
    scoringLogic: 'Dokumentált = 2pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'CON-03', sectionId: 'contractual',
    text: 'Van-e exit terv (exit plan) a kritikus beszállító leváltása esetére?',
    purpose: 'Beszállítói exit stratégia meglétének felmérése',
    type: 'yesno', expectedEvidence: 'Exit plan dokumentáció',
    riskWeight: 'Critical', riskDomain: 'contractual',
    poorAnswer: 'Nincs exit terv', strongAnswer: 'Dokumentált exit terv ütemtervvel',
    scoringLogic: 'Dokumentált = 3pt, tervezés alatt = 1pt, nincs = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nincs exit terv', isKillerQuestion: true,
  },
  {
    id: 'CON-04', sectionId: 'contractual',
    text: 'Van-e vendor governance keretrendszer?',
    purpose: 'Beszállítói irányítási keretrendszer meglétének felmérése',
    type: 'yesno', expectedEvidence: 'Vendor governance policy',
    riskWeight: 'Medium', riskDomain: 'contractual',
    poorAnswer: 'Nincs keretrendszer', strongAnswer: 'Dokumentált vendor governance folyamat',
    scoringLogic: 'Van = 2pt, nincs = 0pt', maxPoints: 2,
  },

  // === SECTION 11: Compliance / NIS2 ===
  {
    id: 'NIS-01', sectionId: 'compliance',
    text: 'Az intézmény azonosította-e magát NIS2 hatálya alá tartozó szervezetként?',
    purpose: 'NIS2 tudatosság és azonosítás felmérése',
    type: 'yesno', expectedEvidence: 'NIS2 besorolási dokumentáció',
    riskWeight: 'High', riskDomain: 'incident_ownership',
    poorAnswer: 'Nem történt NIS2 besorolás', strongAnswer: 'Dokumentált NIS2 besorolás és gap elemzés',
    scoringLogic: 'Besorolás + gap = 2pt, besorolás = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'NIS-02', sectionId: 'compliance',
    text: 'Van-e NIS2 megfelelőségi gap elemzés és cselekvési terv?',
    purpose: 'NIS2 felkészülési állapot felmérése',
    type: 'yesno', expectedEvidence: 'Gap elemzés, cselekvési terv',
    riskWeight: 'High', riskDomain: 'incident_ownership',
    poorAnswer: 'Nincs gap elemzés', strongAnswer: 'Dokumentált gap elemzés cselekvési tervvel',
    scoringLogic: 'Van mindkettő = 2pt, van gap = 1pt, nincs = 0pt', maxPoints: 2,
  },
  {
    id: 'NIS-03', sectionId: 'compliance',
    text: 'A DNSC felé történő incidensjelentési kötelezettség és eljárás ismert és dokumentált?',
    purpose: 'DNSC jelentéstételi felkészültség felmérése',
    type: 'yesno', expectedEvidence: 'DNSC jelentéstételi eljárás',
    riskWeight: 'High', riskDomain: 'incident_ownership',
    poorAnswer: 'Nem ismert az eljárás', strongAnswer: 'Dokumentált és gyakorolt eljárás',
    scoringLogic: 'Dokumentált + gyakorolt = 2pt, dokumentált = 1pt, nincs = 0pt', maxPoints: 2,
  },

  // === SECTION 12: Killer Questions ===
  {
    id: 'KIL-01', sectionId: 'killer',
    text: 'Ha holnap egy ransomware támadás titkosítaná az összes szerveren lévő adatot, mennyi idő alatt tudná az intézmény visszaállítani a betegellátás folytonosságát?',
    purpose: 'Valós ransomware felkészültség és helyreállítási képesség felmérése',
    type: 'multiple', options: ['4 órán belül', '24 órán belül', '48 órán belül', '1 héten belül', 'Nem tudjuk'],
    expectedEvidence: 'Ransomware recovery runbook, restore teszt eredmények, RTO dokumentáció',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Nem tudjuk / 1 héten belül', strongAnswer: '4-24 órán belül, dokumentált és tesztelt',
    scoringLogic: '4h = 4pt, 24h = 3pt, 48h = 1pt, 1 hét+ = 0pt', maxPoints: 4,
    isKillerQuestion: true,
  },
  {
    id: 'KIL-02', sectionId: 'killer',
    text: 'A szervezet képes-e önállóan (az Info World nélkül) visszaállítani a HIS rendszert egy backup-ból?',
    purpose: 'Teljes beszállítói függőség a helyreállítás terén',
    type: 'yesno', expectedEvidence: 'Restore eljárás, belső kompetencia dokumentáció',
    riskWeight: 'Critical', riskDomain: 'vendor_dependency',
    poorAnswer: 'Nem, kizárólag az Info World képes rá', strongAnswer: 'Igen, dokumentált eljárás és képzett személyzet',
    scoringLogic: 'Igen = 3pt, részben = 1pt, nem = 0pt', maxPoints: 3,
    isKillerQuestion: true,
  },
  {
    id: 'KIL-03', sectionId: 'killer',
    text: 'Az elmúlt 12 hónapban volt-e sikeres, dokumentált teljes rendszer-visszaállítási teszt?',
    purpose: 'Restore képesség valós tesztelésének felmérése',
    type: 'yesno', expectedEvidence: 'Restore teszt jegyzőkönyv',
    riskWeight: 'Critical', riskDomain: 'backup_dr',
    poorAnswer: 'Nem volt restore teszt', strongAnswer: 'Igen, dokumentált és sikeres teszt',
    scoringLogic: 'Igen = 3pt, nem = 0pt', maxPoints: 3,
    redFlagTrigger: 'Ha nem volt', isKillerQuestion: true,
  },
  {
    id: 'KIL-04', sectionId: 'killer',
    text: 'Ha az Info World felmondaná a szerződést 30 napos határidővel, az intézmény képes lenne-e folytatni az IT működést?',
    purpose: 'Vendor lock-in és exit readiness valós felmérése',
    type: 'multiple', options: ['Igen, van exit terv', 'Részben, de kritikus kockázattal', 'Nem, teljes leállás lenne', 'Nem tudjuk'],
    expectedEvidence: 'Exit plan, átmeneti terv, alternatív beszállítói lista',
    riskWeight: 'Critical', riskDomain: 'vendor_dependency',
    poorAnswer: 'Nem / teljes leállás', strongAnswer: 'Van exit terv és alternatív képesség',
    scoringLogic: 'Van exit terv = 3pt, részben = 1pt, nem = 0pt', maxPoints: 3,
    isKillerQuestion: true,
  },
  {
    id: 'KIL-05', sectionId: 'killer',
    text: 'A szervezet tudja-e pontosan, hogy a CYMED SOC mit monitoroz és mit NEM?',
    purpose: 'SOC lefedettség tudatosságának felmérése',
    type: 'yesno', expectedEvidence: 'SOC scope dokumentáció, lefedettségi mátrix',
    riskWeight: 'High', riskDomain: 'soc_monitoring',
    poorAnswer: 'Nem tudjuk pontosan', strongAnswer: 'Dokumentált lefedettségi mátrix van',
    scoringLogic: 'Dokumentált = 2pt, nem = 0pt', maxPoints: 2,
    isKillerQuestion: true,
  },
];

export const redFlags: RedFlag[] = [
  {
    id: 'RF-01', title: 'No MFA on vendor access', titleHu: 'Nincs MFA a beszállítói hozzáférésen',
    whyCritical: 'A többfaktoros hitelesítés hiánya lehetővé teszi az ellopott hitelesítő adatokkal való jogosulatlan hozzáférést.',
    consequences: 'Teljes hálózati kompromittáció, ransomware, adatszivárgás',
    immediateAction: 'MFA bevezetése minden külső hozzáférésre 30 napon belül',
    triggerQuestionId: 'VPN-02', triggerCondition: 'no',
  },
  {
    id: 'RF-02', title: 'Shared vendor admin accounts', titleHu: 'Megosztott beszállítói admin fiókok',
    whyCritical: 'Megosztott fiókok esetén nem állapítható meg az egyéni felelősség, és a hozzáférés nem vonható vissza szelektíven.',
    consequences: 'Audit trail hiánya, jogosulatlan tevékenység, felelősségre vonhatatlanság',
    immediateAction: 'Személyre szóló fiókok létrehozása, megosztott fiókok megszüntetése',
    triggerQuestionId: 'VPN-03', triggerCondition: 'shared',
  },
  {
    id: 'RF-03', title: 'No documented restore test in 12 months', titleHu: 'Nincs dokumentált restore teszt 12 hónapon belül',
    whyCritical: 'A backup létezése önmagában nem garantálja a sikeres visszaállítást. Tesztelés nélkül a backup megbízhatatlan.',
    consequences: 'Incidens esetén a visszaállítás sikertelen lehet, teljes adatvesztés',
    immediateAction: 'Azonnali restore teszt végrehajtása és dokumentálása',
    triggerQuestionId: 'BCK-04', triggerCondition: 'never_or_12months',
  },
  {
    id: 'RF-04', title: 'No immutable or offline backup', titleHu: 'Nincs immutable vagy offline backup',
    whyCritical: 'Ransomware a hálózaton elérhető backupokat is titkosíthatja.',
    consequences: 'Teljes adatvesztés ransomware támadás esetén',
    immediateAction: 'Immutable és/vagy offline backup megoldás implementálása',
    triggerQuestionId: 'BCK-02', triggerCondition: 'no',
  },
  {
    id: 'RF-05', title: 'No designated incident commander', titleHu: 'Nincs kijelölt incidens parancsnok',
    whyCritical: 'Kijelölt felelős nélkül az incidenskezelés kaotikussá válik, és a reakcióidő kritikusan megnő.',
    consequences: 'Lassú, koordinálatlan incidenskezelés, növekvő kár',
    immediateAction: 'Incidens parancsnok kijelölése és dokumentálása',
    triggerQuestionId: 'INC-01', triggerCondition: 'empty_or_unclear',
  },
  {
    id: 'RF-06', title: 'No written RACI between Info World and CYMED', titleHu: 'Nincs írott RACI az Info World és CYMED között',
    whyCritical: 'Felelősségi körök tisztázatlansága kritikus helyzetben döntésképtelenséghez vezet.',
    consequences: 'Felelősségi vákuum incidens esetén, egymásra mutogatás',
    immediateAction: 'RACI mátrix létrehozása és jóváhagyása mindkét féllel',
    triggerQuestionId: 'INC-05', triggerCondition: 'no',
  },
  {
    id: 'RF-07', title: 'Disable Firewall GPO active on servers', titleHu: 'Disable Firewall GPO aktív a szervereken',
    whyCritical: 'A tűzfal kikapcsolása lehetővé teszi a laterális mozgást és a ransomware terjedését.',
    consequences: 'Ransomware gyors terjedése, teljes hálózati kompromittáció',
    immediateAction: 'GPO azonnali felülvizsgálata és korrekciója',
    triggerQuestionId: 'EPT-01', triggerCondition: 'active_on_servers',
  },
  {
    id: 'RF-08', title: 'No 24/7 P1 incident notification SLA', titleHu: 'Nincs 24/7 P1 incidens értesítési SLA',
    whyCritical: 'P1 SLA nélkül a kritikus incidensek észlelése és kezelése órákat késhet.',
    consequences: 'Késleltetett incidenskezelés, megnövelt kár, adatvesztés',
    immediateAction: 'P1 SLA definiálása és szerződéses rögzítése',
    triggerQuestionId: 'SOC-04', triggerCondition: 'no_sla',
  },
  {
    id: 'RF-09', title: 'No log source inventory', titleHu: 'Nincs naplóforrás leltár',
    whyCritical: 'Ha nem tudjuk, mit monitorozunk, nem tudjuk, mit nem. A vakfoltok rejtett kockázatot jelentenek.',
    consequences: 'Nem detektált behatolás, forensic nehézségek',
    immediateAction: 'Teljes naplóforrás leltár készítése',
    triggerQuestionId: 'SOC-01', triggerCondition: 'no_inventory',
  },
  {
    id: 'RF-10', title: 'No ransomware recovery runbook', titleHu: 'Nincs ransomware recovery runbook',
    whyCritical: 'Forgatókönyv nélkül az incidens ad-hoc kezelése kaotikus és lassú lesz.',
    consequences: 'Elhúzódó leállás, növekvő anyagi és reputációs kár',
    immediateAction: 'Ransomware recovery runbook készítése és tesztelése',
    triggerQuestionId: 'BCK-08', triggerCondition: 'no',
  },
  {
    id: 'RF-11', title: 'No exit plan for critical vendor', titleHu: 'Nincs exit terv a kritikus beszállító leváltására',
    whyCritical: 'Exit terv nélkül a szervezet kiszolgáltatottá válik a beszállítónak.',
    consequences: 'Kiszolgáltatottság, zsarolhatóság, működési kockázat',
    immediateAction: 'Exit terv készítése 90 napon belül',
    triggerQuestionId: 'CON-03', triggerCondition: 'no',
  },
];

export const scoringWeights: Record<RiskDomain, { label: string; labelHu: string; maxPoints: number }> = {
  vendor_dependency: { label: 'Vendor Dependency / Lock-in', labelHu: 'Beszállítói függőség / lock-in', maxPoints: 20 },
  access_control: { label: 'Access Control / VPN / PAM', labelHu: 'Hozzáférés-szabályozás / VPN / PAM', maxPoints: 20 },
  backup_dr: { label: 'Backup / Restore / DR', labelHu: 'Mentés / visszaállítás / katasztrófa-elhárítás', maxPoints: 20 },
  soc_monitoring: { label: 'SOC / Monitoring / Detection', labelHu: 'SOC / monitoring / detektálás', maxPoints: 15 },
  incident_ownership: { label: 'Incident Ownership / RACI', labelHu: 'Incidenskezelési felelősség / RACI', maxPoints: 10 },
  endpoint_security: { label: 'Endpoint / AD / GPO / Host', labelHu: 'Végpont / AD / GPO / hoszt', maxPoints: 10 },
  contractual: { label: 'Contractual / SLA / Exit', labelHu: 'Szerződések / SLA / exit', maxPoints: 5 },
};

export const maturityLevels = [
  { min: 0, max: 25, label: 'Kritikus sebezhetőség', labelEn: 'Critical Vulnerability', color: 'critical', description: 'Magas működési kockázat – azonnali beavatkozás szükséges' },
  { min: 26, max: 50, label: 'Jelentős sebezhetőség', labelEn: 'Significant Vulnerability', color: 'significant', description: 'Súlyos kontrollhiányok – mielőbbi intézkedés szükséges' },
  { min: 51, max: 70, label: 'Mérsékelt sebezhetőség', labelEn: 'Moderate Vulnerability', color: 'moderate', description: 'Részben kontrollált, de kockázatos – fejlesztés szükséges' },
  { min: 71, max: 85, label: 'Elfogadható, javítandó', labelEn: 'Acceptable, Needs Improvement', color: 'acceptable', description: 'Elfogadható szint, de további fejlesztések szükségesek' },
  { min: 86, max: 100, label: 'Jó kontroll szint', labelEn: 'Good Control Level', color: 'good', description: 'Relatíve érett környezet – folyamatos fenntartás és fejlesztés' },
];

export const evidenceChecklist = [
  'Kritikus rendszerek leltára (asset inventory)',
  'Üzleti hatáselemzés (BIA)',
  'Üzletmenet-folytonossági terv (BCP)',
  'Beszállítói szerződések és SLA-k',
  'RACI mátrix (Info World / CYMED / belső IT)',
  'VPN konfiguráció és hozzáférési listák',
  'MFA konfiguráció bizonyíték',
  'Active Directory csoport tagság export (Domain Admins, Enterprise Admins)',
  'GPO lista és konfiguráció (különösen Disable Firewall)',
  'AD tiering dokumentáció',
  'PAM eszköz konfiguráció',
  'EDR/XDR telepítési lefedettség riport',
  'Hálózati topológia rajz VLAN-okkal',
  'Tűzfalszabályok',
  'Backup konfiguráció és ütemezés',
  'Immutable backup beállítás bizonyítéka',
  'Offline backup eljárás',
  'Restore teszt jegyzőkönyvek (rendszer, PACS, SQL)',
  'RTO/RPO dokumentáció',
  'Ransomware recovery runbook',
  'SOC naplóforrás leltár',
  'SIEM use-case katalógus',
  'SOC SLA dokumentáció',
  'Napló megőrzési policy',
  'Incidenskezelési terv',
  'Incidens osztályozási modell (P1/P2/P3)',
  'Eszkalációs mátrix',
  'NIS2 besorolás és gap elemzés',
  'DNSC jelentéstételi eljárás',
  'Vendor governance policy',
  'Exit terv dokumentáció',
  'Kockázatértékelési dokumentum',
  'Session logging / recording konfiguráció',
  'Patch management eljárás és állapot',
  'OS verzió leltár (EOL azonosítással)',
];
