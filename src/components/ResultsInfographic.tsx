import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { AssessmentResult } from '@/lib/scoringEngine';
import { cn } from '@/lib/utils';

interface Props {
  results: AssessmentResult;
}

const DOMAIN_SHORT: Record<string, string> = {
  vendor_dependency: 'Beszállító',
  access_control: 'Hozzáférés',
  backup_dr: 'Backup/DR',
  soc_monitoring: 'SOC/Mon.',
  incident_ownership: 'Incidens',
  endpoint_security: 'Endpoint',
  contractual: 'Szerződés',
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
  'hsl(210, 80%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(280, 60%, 55%)',
  'hsl(30, 80%, 55%)',
  'hsl(340, 70%, 50%)',
];

function getScoreColor(pct: number): string {
  if (pct <= 25) return '#ef4444';
  if (pct <= 50) return '#f97316';
  if (pct <= 70) return '#eab308';
  if (pct <= 85) return '#22c55e';
  return '#16a34a';
}

export function ResultsInfographic({ results }: Props) {
  const radarData = useMemo(() =>
    results.domainScores.map(ds => ({
      domain: DOMAIN_SHORT[ds.domain] || ds.domain,
      score: ds.percentage,
      fullMark: 100,
    })), [results.domainScores]);

  const barData = useMemo(() =>
    results.domainScores.map(ds => ({
      name: DOMAIN_SHORT[ds.domain] || ds.domain,
      pont: ds.normalizedScore,
      max: ds.maxPoints,
      pct: ds.percentage,
    })), [results.domainScores]);

  const pieData = useMemo(() => {
    const answered = results.answeredCount;
    const unanswered = results.totalQuestions - answered;
    return [
      { name: 'Megválaszolt', value: answered },
      { name: 'Nem válaszolt', value: unanswered },
    ];
  }, [results]);

  const maturityGauge = useMemo(() => {
    const segments = [
      { name: 'Kritikus', range: 25, color: '#ef4444' },
      { name: 'Jelentős', range: 25, color: '#f97316' },
      { name: 'Mérsékelt', range: 20, color: '#eab308' },
      { name: 'Elfogadható', range: 15, color: '#22c55e' },
      { name: 'Jó', range: 15, color: '#16a34a' },
    ];
    return segments.map(s => ({ ...s, value: s.range }));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Vizuális Infografika
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Row 1: Radar + Score Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div>
            <h3 className="text-sm font-medium text-center mb-2">Területi Lefedettség</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Pontszám %" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Maturity Pie + Completion */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-medium text-center">Kitöltöttség</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <div className={cn('text-3xl font-heading font-bold')} style={{ color: getScoreColor(results.percentage) }}>
                {results.totalScore} / {results.maxScore}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Összesített pontszám</div>
            </div>
          </div>
        </div>

        {/* Row 2: Bar chart */}
        <div>
          <h3 className="text-sm font-medium text-center mb-2">Területi Pontszámok</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'pont') return [`${value} pt`, 'Pontszám'];
                  return [`${value} pt`, 'Maximum'];
                }}
              />
              <Bar dataKey="max" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="max" />
              <Bar dataKey="pont" radius={[4, 4, 0, 0]} name="pont">
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={getScoreColor(entry.pct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 3: Risk Heat Strips */}
        <div>
          <h3 className="text-sm font-medium mb-3">Kockázati Hőtérkép</h3>
          <div className="space-y-2">
            {results.domainScores.map(ds => (
              <div key={ds.domain} className="flex items-center gap-3">
                <span className="text-xs w-20 text-right text-muted-foreground truncate">{DOMAIN_SHORT[ds.domain]}</span>
                <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${ds.percentage}%`,
                      backgroundColor: getScoreColor(ds.percentage),
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                    {ds.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-heading font-bold" style={{ color: getScoreColor(results.percentage) }}>
              {results.maturityLevel.label}
            </div>
            <div className="text-[10px] text-muted-foreground">Érettségi szint</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-destructive">{results.triggeredRedFlags.length}</div>
            <div className="text-[10px] text-muted-foreground">Red Flag</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold">{results.quickWins.length}</div>
            <div className="text-[10px] text-muted-foreground">Gyors lépés</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
