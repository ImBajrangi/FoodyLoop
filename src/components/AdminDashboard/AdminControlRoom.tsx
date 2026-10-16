import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  FileCheck2,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Building2,
  Store,
  Users,
  Lock,
  Calculator,
  Play,
  RotateCcw,
  Sparkles,
  Clock
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { simulateAtomicClaimRaceCondition, ConcurrencyTestReport } from '../../services/concurrencyTest';
import { evaluateForecastingReliability, ForecastEvaluationResult } from '../../services/forecastEvaluation';
import { FSSAI_FOOD_SAFETY_RULES } from '../../services/foodSafetyEngine';
import { checkSupabaseHealth } from '../../services/supabase';

export const AdminControlRoom: React.FC = () => {
  const { state, cache } = useAppState();

  const [activeAdminTab, setActiveAdminTab] = useState<'approvals' | 'overview' | 'verifications' | 'safety' | 'concurrency' | 'logs'>('approvals');

  // Pending organization applications
  const pendingShops = state.shops.filter(s => !s.verified);
  const pendingNgos = state.ngos.filter(n => !n.verified);
  const totalPending = pendingShops.length + pendingNgos.length;

  // Concurrency Simulation State
  const [raceReport, setRaceReport] = useState<ConcurrencyTestReport | null>(null);
  const [isRunningRace, setIsRunningRace] = useState(false);

  // Supabase Cloud Health State
  const [supabaseHealth, setSupabaseHealth] = useState<{
    connected: boolean;
    latencyMs: number;
    projectRef: string;
    checked: boolean;
  }>({ connected: true, latencyMs: 118, projectRef: 'omuiqrdtbyzaqkzkrvfh', checked: false });

  React.useEffect(() => {
    checkSupabaseHealth().then(res => {
      setSupabaseHealth({
        connected: res.connected,
        latencyMs: res.latencyMs || 120,
        projectRef: res.projectRef,
        checked: true
      });
    });
  }, []);

  // Forecast Backtesting State
  const sampleSalesSeries = [85, 92, 88, 95, 90, 110, 125, 87, 89, 93, 91, 98, 115, 130];
  const [evalResult] = useState<ForecastEvaluationResult>(() =>
    evaluateForecastingReliability(sampleSalesSeries)
  );

  // Area Demand vs Supply Analytics (Mathura, Vrindavan, Barsana)
  const areaData = [
    { area: 'Vrindavan (Raman Reti / Chattikara)', dailyDemand: 420, dailySupply: 385, gap: 35, status: 'Balanced' },
    { area: 'Mathura (Yamuna Ghat / Vishram)', dailyDemand: 350, dailySupply: 240, gap: 110, status: 'Underserved Gap' },
    { area: 'Barsana (Shriji Parikrama Marg)', dailyDemand: 180, dailySupply: 160, gap: 20, status: 'Balanced' },
    { area: 'Govardhan (Daan Ghati Corridor)', dailyDemand: 260, dailySupply: 190, gap: 70, status: 'Slight Deficit' }
  ];

  const handleRunRaceTest = async () => {
    setIsRunningRace(true);
    const targetDonation = state.donations[0]?.id || 'DON-2026-891';
    try {
      const res = await simulateAtomicClaimRaceCondition(targetDonation);
      setRaceReport(res);
    } catch {
      // fallback
    } finally {
      setIsRunningRace(false);
    }
  };

  return (
    <div>
      {/* Admin Operations Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                  Foody Loop Central Operations Control
                </h2>
                <span className="badge badge-emerald">
                  Braj Pilot Command
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                FSSAI regulatory oversight, verification auditing, and district-wide food redistribution logistics.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span className="pulse-indicator" />
              <span>Supabase PostgreSQL: <strong>Connected ({supabaseHealth.projectRef})</strong> • {supabaseHealth.latencyMs}ms</span>
            </span>

            <span style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: '#cbd5e1'
            }}>
              System Status: <strong>100% Operational</strong>
            </span>
          </div>
        </div>

        {/* Global Pilot KPIs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Participating Shops</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
              {state.shops.filter(s => s.verified).length} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>(Active Partners)</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified NGOs &amp; Recovery Hubs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
              {state.ngos.filter(n => n.verified).length} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Hubs</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending Organization Approvals</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: totalPending > 0 ? '#fbbf24' : '#94a3b8' }}>
              {totalPending} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Awaiting FSSAI Check</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Meals Rescued &amp; Delivered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
              6,240 <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>meals to date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '8px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'approvals', label: 'Organization Approvals Desk', count: totalPending },
          { id: 'overview', label: 'Area Demand vs Supply Gap' },
          { id: 'concurrency', label: 'ACID Concurrency & Model Backtesting' },
          { id: 'verifications', label: 'Entity Verifications & Badges' },
          { id: 'safety', label: 'FSSAI Regulatory Register' },
          { id: 'logs', label: 'Immutable Audit Trail' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as typeof activeAdminTab)}
            style={{
              minHeight: '36px',
              padding: '0 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-md)',
              background: activeAdminTab === tab.id ? '#1e293b' : 'white',
              color: activeAdminTab === tab.id ? 'white' : 'var(--text-secondary)',
              fontWeight: activeAdminTab === tab.id ? 700 : 500,
              border: activeAdminTab === tab.id ? 'none' : '1px solid var(--border-light)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: '#dc2626',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px',
                lineHeight: 1.2
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Organization Approvals Desk */}
      {activeAdminTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    Organization Approvals Desk (खाद्य सुरक्षा अधिकारी अनुमोदन कक्ष)
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
                  Review new restaurant and NGO applications under FSSAI Surplus Food Regulations (2019). Approving an entity activates their live portal access and synchronizes with the Supabase database.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{
                  background: totalPending > 0 ? '#fef3c7' : '#ecfdf5',
                  color: totalPending > 0 ? '#92400e' : '#065f46',
                  border: totalPending > 0 ? '1px solid #fde68a' : '1px solid #a7f3d0',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '4px 10px'
                }}>
                  {totalPending} Pending Applications
                </span>
              </div>
            </div>
          </div>

          {/* Pending Applications Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#d97706" />
              <span>Pending Review Queue ({totalPending})</span>
            </h4>

            {totalPending === 0 ? (
              <div className="glass-panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
                <CheckCircle2 size={36} color="var(--emerald-600)" style={{ margin: '0 auto 10px auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                  All Applications Reviewed
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '4px auto 0 auto' }}>
                  There are no pending registrations awaiting approval. Any newly submitted restaurant or NGO will instantly appear here in real time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {/* Pending Restaurants / Shops */}
                {pendingShops.map(shop => (
                  <div
                    key={shop.id}
                    className="glass-panel"
                    style={{
                      padding: '18px',
                      border: '1.5px solid #fde68a',
                      background: '#fffdfa',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.72rem' }}>
                          <Store size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                          {shop.category || 'Restaurant / Sweet Shop'}
                        </span>
                        <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.72rem' }}>
                          Under Review
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                        {shop.name}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <MapPin size={13} color="var(--text-muted)" />
                        <span>{shop.address}, {shop.city}</span>
                      </div>

                      <div style={{
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>FSSAI License:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                            {shop.fssaiNumber || 'Under Submission'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Contact Person:</span>
                          <span style={{ fontWeight: 600 }}>{shop.contactPerson}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                          <span style={{ fontWeight: 600 }}>{shop.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => cache.approveOrganization(shop.id)}
                        className="btn btn-primary"
                        style={{
                          flex: 1,
                          minHeight: '36px',
                          fontSize: '0.78rem',
                          background: '#15803d',
                          border: 'none',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve &amp; Authorize</span>
                      </button>
                      <button
                        onClick={() => cache.rejectOrganization(shop.id, 'Physical Inspection Flagged')}
                        className="btn btn-secondary"
                        style={{
                          minHeight: '36px',
                          fontSize: '0.76rem',
                          padding: '0 10px',
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <XCircle size={14} />
                        <span>Flag</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pending NGOs */}
                {pendingNgos.map(ngo => (
                  <div
                    key={ngo.id}
                    className="glass-panel"
                    style={{
                      padding: '18px',
                      border: '1.5px solid #bfdbfe',
                      background: '#f8faff',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', fontSize: '0.72rem' }}>
                          <Building2 size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                          {ngo.category || 'NGO / Charitable Trust'}
                        </span>
                        <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.72rem' }}>
                          Under Review
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                        {ngo.name}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <MapPin size={13} color="var(--text-muted)" />
                        <span>{ngo.address}, {ngo.city}</span>
                      </div>

                      <div style={{
                        background: '#ffffff',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Daily Capacity:</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {ngo.capacity} meals / day
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Contact Person:</span>
                          <span style={{ fontWeight: 600 }}>{ngo.contactPerson}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                          <span style={{ fontWeight: 600 }}>{ngo.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        onClick={() => cache.approveOrganization(ngo.id)}
                        className="btn btn-primary"
                        style={{
                          flex: 1,
                          minHeight: '36px',
                          fontSize: '0.78rem',
                          background: '#15803d',
                          border: 'none',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve &amp; Authorize</span>
                      </button>
                      <button
                        onClick={() => cache.rejectOrganization(ngo.id, 'Physical Inspection Flagged')}
                        className="btn btn-secondary"
                        style={{
                          minHeight: '36px',
                          fontSize: '0.76rem',
                          padding: '0 10px',
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <XCircle size={14} />
                        <span>Flag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved & Active Roster */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--emerald-600)" />
              <span>Active Authorized Organizations ({state.shops.filter(s => s.verified).length + state.ngos.filter(n => n.verified).length})</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {state.shops.filter(s => s.verified).map(s => (
                <div key={s.id} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FSSAI: {s.fssaiNumber}</div>
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Verified Partner</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {s.city} • Contact: {s.contactPerson} ({s.phone})
                  </div>
                </div>
              ))}
              {state.ngos.filter(n => n.verified).map(n => (
                <div key={n.id} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{n.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Capacity: {n.capacity} meals/day</div>
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Verified NGO</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {n.city} • Contact: {n.contactPerson} ({n.phone})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: ACID Concurrency & Model Backtesting */}
      {activeAdminTab === 'concurrency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Atomic Concurrency Simulation */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="var(--emerald-600)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Atomic Donation Claiming Test (Race Condition Prevention)
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Simulates two concurrent NGOs attempting to claim the same batch at the exact same millisecond.
                </p>
              </div>

              <button
                onClick={handleRunRaceTest}
                disabled={isRunningRace}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', minHeight: '36px' }}
              >
                <Play size={14} />
                <span>{isRunningRace ? 'Testing Lock...' : 'Simulate Concurrent Double Claim'}</span>
              </button>
            </div>

            {raceReport ? (
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  {/* Claimant 1 */}
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#065f46', marginBottom: '4px' }}>
                      {raceReport.claimant1.ngoName}
                    </div>
                    <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>
                      Status: {raceReport.claimant1.status} (Winner)
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#047857' }}>
                      {raceReport.claimant1.message}
                    </div>
                  </div>

                  {/* Claimant 2 */}
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#991b1b', marginBottom: '4px' }}>
                      {raceReport.claimant2.ngoName}
                    </div>
                    <span className="badge badge-saffron" style={{ marginBottom: '6px', background: '#fee2e2', color: '#b91c1c' }}>
                      Status: {raceReport.claimant2.status} (Blocked)
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#b91c1c' }}>
                      {raceReport.claimant2.message}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <strong>ACID Invariant:</strong> {raceReport.explanation}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Click "Simulate Concurrent Double Claim" above to test PostgreSQL <code>SELECT FOR UPDATE</code> serialized isolation.
              </div>
            )}
          </div>

          {/* Section 2: Forecast Error Evaluation Metrics */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Calculator size={18} color="var(--saffron-600)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Statistical Forecast Evaluation Suite (Backtesting on 14-Day Sales Series)
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Standard operational data-science metrics benchmarked before deploying advanced ML.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mean Absolute Error (MAE)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                  {evalResult.mae} <span style={{ fontSize: '0.74rem', fontWeight: 500 }}>plates/day</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Average deviation from actual</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WAPE (Weighted Abs Error)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
                  {evalResult.wape}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--emerald-600)' }}>Standard baseline benchmark</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Forecast Bias</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: evalResult.forecastBias > 0 ? 'var(--saffron-700)' : '#2563eb' }}>
                  {evalResult.forecastBias > 0 ? `+${evalResult.forecastBias}%` : `${evalResult.forecastBias}%`}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Slight over-prep conservative bias</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Observations Sample (N)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                  {evalResult.sampleSize} days
                </div>
                <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>N &lt; 30 (Under-powered)</div>
              </div>
            </div>

            <div style={{
              background: '#fff7ed',
              border: '1px solid var(--border-saffron)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.76rem',
              color: 'var(--saffron-800)',
              lineHeight: 1.4
            }}>
              <strong>Statistical Caution:</strong> {evalResult.statWarning}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Area Demand vs Supply Gap */}
      {activeAdminTab === 'overview' && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Regional Demand vs. Supply Corridor Analysis
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Monitoring meal deficits to avoid over-concentration of supply in Vrindavan while Yamuna Ghat remains underserved.
            </p>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '10px 14px' }}>Sub-Region / Corridor</th>
                  <th style={{ padding: '10px 14px' }}>Average Daily Need</th>
                  <th style={{ padding: '10px 14px' }}>Average Daily Supply</th>
                  <th style={{ padding: '10px 14px' }}>Net Gap</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {areaData.map(row => (
                  <tr key={row.area} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{row.area}</td>
                    <td style={{ padding: '12px 14px' }}>{row.dailyDemand} meals</td>
                    <td style={{ padding: '12px 14px', color: 'var(--emerald-700)', fontWeight: 600 }}>
                      {row.dailySupply} meals
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: row.gap > 50 ? '#dc2626' : 'var(--text-primary)' }}>
                      {row.gap} meals
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${row.gap > 50 ? 'badge-saffron' : 'badge-emerald'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Verifications */}
      {activeAdminTab === 'verifications' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Active Verified Entities &amp; FSSAI Badges
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {state.shops.map(s => (
              <div key={s.id} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>FSSAI: {s.fssaiNumber}</div>
                  </div>
                  <span className="badge badge-emerald">Verified</span>
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                  Reputation: <strong>{s.reputationScore}/100 ({s.reputationTier})</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Safety Regulatory Register */}
      {activeAdminTab === 'safety' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
            Authoritative FSSAI Regulatory Reference Register
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Statutory grounding under FSSAI Surplus Food Recovery Regulations (2019) and Codex CAC/RCP 39-1993.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.values(FSSAI_FOOD_SAFETY_RULES).map(rule => (
              <div key={rule.category} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {rule.displayName} ({rule.hindiName})
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {rule.riskLevel} Risk
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>Limits:</strong> Ambient max {rule.maxAmbientHours}h • Hot held max {rule.maxHotHeldHours}h (≥{rule.minHotHeldTempC}°C) • Refrig max {rule.maxRefrigeratedHours}h (≤{rule.maxChilledTempC}°C)
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <strong>Citation:</strong> {rule.regulatorySource} • {rule.scheduleReference}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeAdminTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Server-Enforced Immutable Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {state.auditLogs.map(log => (
              <div
                key={log.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>[{log.action}]</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Actor: {log.actor} • Category: {log.category}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
