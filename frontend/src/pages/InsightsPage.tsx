import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { api, ForecastData, BudgetRecommendation } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';

export const InsightsPage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [horizon, setHorizon] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<string[]>([]);

  const { formatCurrency } = useTheme();
  const { success, error: toastError } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [fData, rData] = await Promise.all([
        api.getMonthlyExpenseForecast(horizon),
        api.getBudgetRecommendations()
      ]);
      setForecast(fData);
      setRecommendations(rData);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Unable to compute ML financial forecasts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [horizon]);

  const handleApplyRecommendation = async (rec: BudgetRecommendation) => {
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const periodStart = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const periodEnd = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      await api.createBudget({
        category_id: rec.category_id,
        limit_amount: Number(rec.recommended_budget_max),
        alert_threshold_pct: 80,
        period_start: periodStart,
        period_end: periodEnd,
      });

      setAppliedCategoryIds(prev => [...prev, rec.category_id]);
      success(
        `Applied recommended budget of ${formatCurrency(rec.recommended_budget_max)} to ${rec.category_name}.`,
        'Budget Optimization'
      );
    } catch (e: any) {
      toastError(e.message || 'Failed to apply recommendation', 'Action Failed');
    }
  };

  // Prepare chart series combining historical points and predicted point
  const chartData = forecast?.historical_points ? [...forecast.historical_points] : [];
  if (forecast && Number(forecast.predicted_expense) > 0) {
    chartData.push({
      month: `${forecast.target_period} (Forecast)`,
      amount: Number(forecast.predicted_expense)
    });
  }

  const confidenceColor = 
    forecast?.confidence_label === 'high' ? 'var(--green-600)' :
    forecast?.confidence_label === 'medium' ? 'var(--warning)' : 'var(--muted)';

  const chartTooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text)',
    fontSize: '12.5px'
  };

  return (
    <div className="page-container">
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
              ML Forecasting & Financial Intelligence
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
              color: 'white',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.4px'
            }}>
              scikit-learn
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Transparent expense forecasting, time-series projections, and explainable budget optimization
          </p>
        </div>

        {/* Horizon selector */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'var(--surface-subtle)', 
          padding: '6px 14px', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--border)' 
        }}>
          <Clock size={16} color="var(--green-600)" />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Forecast Horizon:</span>
          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            aria-label="Select forecast horizon"
            style={{
              background: 'transparent',
              border: 'none',
              fontWeight: 700,
              color: 'var(--text)',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={1} style={{ background: 'var(--surface)', color: 'var(--text)' }}>Next Month (1 Mo)</option>
            <option value={2} style={{ background: 'var(--surface)', color: 'var(--text)' }}>2 Months Ahead</option>
            <option value={3} style={{ background: 'var(--surface)', color: 'var(--text)' }}>3 Months Ahead</option>
          </select>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {errorMsg && (
        <div className="error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchInsights} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 1. Primary AI Expense Forecast Banner Card */}
      {isLoading ? (
        <div className="skeleton-shimmer skeleton-chart" style={{ height: '320px' }} />
      ) : (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-income">
                  <Sparkles size={13} />
                  ML Projections
                </span>
                <span 
                  className="badge" 
                  style={{ 
                    background: forecast?.confidence_label === 'high' ? 'var(--green-100)' : 'var(--warning-light)',
                    color: confidenceColor
                  }}
                >
                  Confidence: {forecast?.confidence_label ? forecast.confidence_label.toUpperCase() : 'MEDIUM'}
                </span>
              </div>

              <div style={{ fontSize: '13.5px', color: 'var(--muted)', fontWeight: 500 }}>
                Estimated Outflows for {forecast?.target_period || 'Next Period'}
              </div>

              <div className="font-tabular" style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-1px', margin: '4px 0 10px' }}>
                {formatCurrency(forecast?.predicted_expense || 0)}
              </div>

              {forecast?.lower_bound && forecast?.upper_bound && (
                <div style={{
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: 'var(--text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'var(--muted)' }}>Prediction Interval:</span>
                  <span className="font-tabular" style={{ fontWeight: 700 }}>
                    {formatCurrency(forecast.lower_bound)} — {formatCurrency(forecast.upper_bound)}
                  </span>
                </div>
              )}

              <div style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.6, marginTop: '8px' }}>
                <strong style={{ color: 'var(--green-600)' }}>Methodology:</strong> {forecast?.explanation}
              </div>
            </div>

            {/* Historical Trend + Prediction Point Chart */}
            <div style={{ 
              height: '240px', 
              width: '100%', 
              background: 'var(--surface-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '14px', 
              border: '1px solid var(--border)' 
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Historical Spending & Regression Projections
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green-600)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--green-600)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10.5, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 10.5, fill: 'var(--muted)' }} tickFormatter={(v) => `${Math.round(v/1000)}k`} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(val), 'Volume']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--green-600)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Limitations Banner */}
          <div style={{
            marginTop: '22px',
            padding: '14px 18px',
            background: 'var(--warning-light)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: '#92400E'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Model Transparency & Assumptions:</strong> {forecast?.limitations || 'Projections apply linear regression across available history. Real expenditure will fluctuate with life events and unexpected emergencies.'}
            </div>
          </div>
        </div>
      )}

      {/* 2. Actionable AI Budget Recommendations */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Explainable Budget Recommendations</h2>
            <p className="card-subtitle">
              Calculated by benchmarking recent 3-month spending velocity against your active category caps
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`rec-skel-${i}`} className="skeleton-shimmer skeleton-card" />
            ))
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)', fontSize: '13px' }}>
              <ShieldCheck size={36} color="var(--green-600)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>No budget adjustments required</div>
              <div style={{ marginTop: '4px' }}>Your current spending velocity is balanced within defined category parameters.</div>
            </div>
          ) : (
            recommendations.map((rec) => {
              const isApplied = appliedCategoryIds.includes(rec.category_id);
              const urgencyBadge = 
                rec.urgency === 'adjust_up' ? { text: 'Needs Increase', bg: 'var(--warning-light)', color: '#B45309' } :
                rec.urgency === 'adjust_down' ? { text: 'Reallocate to Savings', bg: 'var(--savings-light)', color: 'var(--savings)' } :
                { text: 'Stable Velocity', bg: 'var(--green-100)', color: 'var(--green-900)' };

              return (
                <div 
                  key={rec.category_id}
                  style={{
                    padding: '18px 22px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  <div style={{ flex: '1 1 360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
                        {rec.category_name}
                      </span>
                      <span 
                        className="badge"
                        style={{ backgroundColor: urgencyBadge.bg, color: urgencyBadge.color }}
                      >
                        {urgencyBadge.text}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {rec.explanation}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
                      <span>Current Cap: <strong>{rec.current_budget ? formatCurrency(rec.current_budget) : 'None'}</strong></span>
                      <span>3-Mo Average: <strong>{formatCurrency(rec.recent_avg_spend)}</strong></span>
                      <span style={{ color: 'var(--green-600)' }}>
                        Suggested Limit: <strong>{formatCurrency(rec.recommended_budget_min)} – {formatCurrency(rec.recommended_budget_max)}</strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    {isApplied ? (
                      <span className="badge badge-income" style={{ padding: '8px 14px', fontSize: '12.5px' }}>
                        <Check size={14} />
                        Budget Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyRecommendation(rec)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12.5px' }}
                      >
                        <span>Apply {formatCurrency(rec.recommended_budget_max)}</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
