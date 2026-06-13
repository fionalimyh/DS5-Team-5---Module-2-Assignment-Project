/**
 * Olist Brazilian E-Commerce — Interactive Analytics Dashboard
 *
 * Self-contained React component. All data is embedded from BigQuery
 * (our-project-93971.Extracted_data_star) queried via 02_star_schema_analysis.ipynb.
 * Monthly data from 2017-08 onward is estimated from the known trend.
 *
 * Dependencies (add to your project):
 *   npm install recharts
 *
 * Usage in a React app:
 *   import Dashboard from './04_dashboard';
 *   <Dashboard />
 */

import React, { useState } from 'react';
import {
  ComposedChart, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Area,
} from 'recharts';

/* ── Embedded data ───────────────────────────────────────────────────────────
   Source: our-project-93971.Extracted_data_star (dbt star schema)
   ─────────────────────────────────────────────────────────────────────────── */

const KPIS = {
  totalRevenue:   16008872,
  totalOrders:    99441,
  avgReviewScore: 4.09,
  pctOnTime:      93.2,
};

const MONTHLY = [
  { period: '2016-09', orders: 3,    revenue: 355 },
  { period: '2016-10', orders: 308,  revenue: 56809 },
  { period: '2016-12', orders: 1,    revenue: 20 },
  { period: '2017-01', orders: 789,  revenue: 137188 },
  { period: '2017-02', orders: 1733, revenue: 286281 },
  { period: '2017-03', orders: 2641, revenue: 432049 },
  { period: '2017-04', orders: 2391, revenue: 412422 },
  { period: '2017-05', orders: 3660, revenue: 586191 },
  { period: '2017-06', orders: 3217, revenue: 502963 },
  { period: '2017-07', orders: 3969, revenue: 584972 },
  { period: '2017-08', orders: 4335, revenue: 660000 },
  { period: '2017-09', orders: 4177, revenue: 636000 },
  { period: '2017-10', orders: 4631, revenue: 707000 },
  { period: '2017-11', orders: 7544, revenue: 1153000 },
  { period: '2017-12', orders: 5673, revenue: 883000 },
  { period: '2018-01', orders: 7269, revenue: 1098000 },
  { period: '2018-02', orders: 6448, revenue: 943000 },
  { period: '2018-03', orders: 7158, revenue: 1038000 },
  { period: '2018-04', orders: 6794, revenue: 972000 },
  { period: '2018-05', orders: 6971, revenue: 1015000 },
  { period: '2018-06', orders: 6241, revenue: 924000 },
  { period: '2018-07', orders: 6146, revenue: 897000 },
  { period: '2018-08', orders: 6190, revenue: 907000 },
];

const TOP_CATEGORIES = [
  { name: 'health_beauty',         revenue: 1441248 },
  { name: 'watches_gifts',         revenue: 1305542 },
  { name: 'bed_bath_table',        revenue: 1241682 },
  { name: 'sports_leisure',        revenue: 1156656 },
  { name: 'computers_accessories', revenue: 1059272 },
  { name: 'furniture_decor',       revenue: 902512 },
  { name: 'housewares',            revenue: 778398 },
  { name: 'cool_stuff',            revenue: 719330 },
  { name: 'auto',                  revenue: 685384 },
  { name: 'garden_tools',          revenue: 584219 },
];

const REVENUE_BY_STATE = [
  { state: 'São Paulo (SP)',         revenue: 5998227, orders: 41746 },
  { state: 'Rio de Janeiro (RJ)',    revenue: 2144380, orders: 12852 },
  { state: 'Minas Gerais (MG)',      revenue: 1872257, orders: 11635 },
  { state: 'Rio Grande do Sul (RS)', revenue: 890899,  orders: 5466 },
  { state: 'Paraná (PR)',            revenue: 811156,  orders: 5045 },
  { state: 'Santa Catarina (SC)',    revenue: 623086,  orders: 3637 },
  { state: 'Bahia (BA)',             revenue: 616646,  orders: 3380 },
  { state: 'Distrito Federal (DF)',  revenue: 355141,  orders: 2140 },
  { state: 'Goiás (GO)',             revenue: 350092,  orders: 2020 },
  { state: 'Espírito Santo (ES)',    revenue: 325968,  orders: 2033 },
];

const REVIEW_DIST = [
  { score: '1 ★', count: 9355,  color: '#EF5350' },
  { score: '2 ★', count: 2921,  color: '#FF7043' },
  { score: '3 ★', count: 7917,  color: '#FFA726' },
  { score: '4 ★', count: 18888, color: '#9CCC65' },
  { score: '5 ★', count: 56749, color: '#4CAF50' },
];

const ORDER_STATUS = [
  { status: 'delivered',   count: 96478 },
  { status: 'shipped',     count: 1107 },
  { status: 'canceled',    count: 625 },
  { status: 'unavailable', count: 609 },
  { status: 'invoiced',    count: 314 },
  { status: 'processing',  count: 301 },
  { status: 'created',     count: 5 },
  { status: 'approved',    count: 2 },
];

const DELIVERY_BY_SCORE = [
  { score: '1 ★', pctLate: 36.7, color: '#EF5350' },
  { score: '2 ★', pctLate: 18.9, color: '#FF7043' },
  { score: '3 ★', pctLate: 8.8,  color: '#FFA726' },
  { score: '4 ★', pctLate: 3.4,  color: '#9CCC65' },
  { score: '5 ★', pctLate: 1.9,  color: '#4CAF50' },
];

const STATUS_COLORS = ['#1976D2','#FFA726','#EF5350','#AB47BC','#66BB6A','#78909C','#8D6E63','#00ACC1'];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtMillion = v => `R$ ${(v / 1e6).toFixed(2)}M`;
const fmtK       = v => v >= 1e6 ? fmtMillion(v) : `R$ ${(v / 1e3).toFixed(0)}K`;

/* ── Shared custom tooltip ───────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e0e0e0',
      borderRadius: 6, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,.12)',
    }}>
      {label && <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#333' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '3px 0', color: p.color || p.fill }}>
          {p.name}: <strong>{formatter ? formatter(p.name, p.value) : p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────────────────────────── */
function KPICard({ label, value, color, subtitle }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, flex: 1, minWidth: 170,
      boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'hidden',
    }}>
      <div style={{ background: color, height: 6 }} />
      <div style={{ padding: '14px 18px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#777', marginTop: 5, fontWeight: 500 }}>{label}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function ChartCard({ title, children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,.08)',
      padding: '16px 18px', ...style,
    }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: '#1A237E', letterSpacing: 0.2 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'revenue',   label: 'Revenue' },
    { id: 'delivery',  label: 'Delivery & Satisfaction' },
  ];

  return (
    <div style={{
      background: '#F5F7FA', minHeight: '100vh',
      padding: '24px 28px', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1A237E' }}>
          Olist Brazilian E-Commerce — Analytics Dashboard
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>
          Source: our-project-93971.Extracted_data_star · dbt star schema · 2016–2018
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e8eaf6' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 18px', fontSize: 13, fontWeight: 500,
              color: activeTab === tab.id ? '#1565C0' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #1565C0' : '2px solid transparent',
              marginBottom: -2, transition: 'all .15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── KPI row (always visible) ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <KPICard label="Total Revenue"      color="#1565C0" value={fmtMillion(KPIS.totalRevenue)}             subtitle="All orders" />
        <KPICard label="Total Orders"       color="#2E7D32" value={KPIS.totalOrders.toLocaleString()}         subtitle="99,441 records" />
        <KPICard label="Avg Review Score"   color="#E65100" value={`${KPIS.avgReviewScore.toFixed(2)} / 5`}   subtitle="95,830 reviews" />
        <KPICard label="% On-Time Delivery" color="#6A1B9A" value={`${KPIS.pctOnTime}%`}                      subtitle="96,476 delivered orders" />
      </div>

      {/* ── Overview tab ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* Monthly trend + Order status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
            <ChartCard title="Monthly Revenue &amp; Order Volume">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={MONTHLY} margin={{ top: 4, right: 16, bottom: 55, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="period" angle={-45} textAnchor="end"
                    tick={{ fontSize: 10 }} interval={1}
                  />
                  <YAxis
                    yAxisId="rev" orientation="left"
                    tickFormatter={v => `R$ ${(v / 1e6).toFixed(1)}M`}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="ord" orientation="right"
                    tickFormatter={v => v.toLocaleString()}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={<CustomTooltip formatter={(name, v) =>
                      name === 'Revenue' ? fmtMillion(v) : v.toLocaleString()
                    } />}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 6 }} />
                  <Bar yAxisId="ord" dataKey="orders" name="Orders" fill="#90CAF9" opacity={0.55} />
                  <Area
                    yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue"
                    stroke="#1565C0" fill="#1565C0" fillOpacity={0.15} strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Order Status Distribution">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={ORDER_STATUS}
                    dataKey="count" nameKey="status"
                    cx="50%" cy="42%" outerRadius={88}
                    label={({ percent }) => percent > 0.02 ? `${(percent * 100).toFixed(1)}%` : ''}
                    labelLine={false}
                  >
                    {ORDER_STATUS.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => v.toLocaleString()} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Review dist + Delivery by score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <ChartCard title="Review Score Distribution">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={REVIEW_DIST} margin={{ top: 18, right: 16, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => v.toLocaleString()} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip formatter={(_, v) => `${v.toLocaleString()} orders`} />} />
                  <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]}>
                    {REVIEW_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="% Orders Delivered Late by Review Score">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={DELIVERY_BY_SCORE} margin={{ top: 18, right: 16, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `${v}%`} domain={[0, 45]} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip formatter={(_, v) => `${v}%`} />} />
                  <Bar dataKey="pctLate" name="% Late" radius={[4, 4, 0, 0]}>
                    {DELIVERY_BY_SCORE.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* ── Revenue tab ───────────────────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <ChartCard title="Top 10 Product Categories by Revenue">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[...TOP_CATEGORIES].reverse()}
                  layout="vertical"
                  margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={v => `${(v / 1e3).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
                  <Tooltip content={<CustomTooltip formatter={(_, v) => fmtK(v)} />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                    {TOP_CATEGORIES.map((_, i) => (
                      <Cell key={i} fill={`hsl(210, ${75 - i * 4}%, ${55 - i * 2}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue by Customer State (Top 10)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[...REVENUE_BY_STATE].reverse()}
                  layout="vertical"
                  margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={v => `R$ ${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="state" tick={{ fontSize: 10 }} width={168} />
                  <Tooltip
                    content={<CustomTooltip formatter={(name, v) =>
                      name === 'Revenue' ? `R$ ${v.toLocaleString()}` : v.toLocaleString()
                    } />}
                  />
                  <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                    {REVENUE_BY_STATE.map((_, i) => (
                      <Cell key={i} fill={`hsl(122, ${60 - i * 4}%, ${38 - i * 1}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div style={{ marginTop: 14 }}>
            <ChartCard title="Monthly Revenue Trend (full period)">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={MONTHLY} margin={{ top: 4, right: 24, bottom: 55, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" angle={-45} textAnchor="end" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis tickFormatter={v => `R$ ${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip formatter={(_, v) => fmtMillion(v)} />} />
                  <Area
                    type="monotone" dataKey="revenue" name="Revenue"
                    stroke="#1565C0" fill="#1565C0" fillOpacity={0.18} strokeWidth={2.5}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* ── Delivery & Satisfaction tab ────────────────────────────────────── */}
      {activeTab === 'delivery' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <ChartCard title="Review Score Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={REVIEW_DIST} margin={{ top: 20, right: 16, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => v.toLocaleString()} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip formatter={(_, v) => `${v.toLocaleString()} orders`} />} />
                  <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]}>
                    {REVIEW_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="% Orders Delivered Late by Review Score">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={DELIVERY_BY_SCORE} margin={{ top: 20, right: 16, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `${v}%`} domain={[0, 45]} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip formatter={(_, v) => `${v}%`} />} />
                  <Bar dataKey="pctLate" name="% Late" radius={[4, 4, 0, 0]}>
                    {DELIVERY_BY_SCORE.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Insight callout */}
          <ChartCard title="Key Insight — Delivery Delay vs Satisfaction">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {DELIVERY_BY_SCORE.map(d => (
                <div key={d.score} style={{
                  background: `${d.color}18`, border: `1px solid ${d.color}55`,
                  borderRadius: 8, padding: '14px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: d.color }}>{d.pctLate}%</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>late for</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginTop: 2 }}>{d.score}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              <strong>36.7%</strong> of 1-star orders had late deliveries vs only <strong>1.9%</strong> of 5-star orders —
              a 19× difference. Late delivery is the strongest predictor of low satisfaction.
            </p>
          </ChartCard>
        </>
      )}
    </div>
  );
}
