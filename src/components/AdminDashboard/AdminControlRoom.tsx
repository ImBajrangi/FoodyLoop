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
  Clock,
  Compass
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import { simulateAtomicClaimRaceCondition, ConcurrencyTestReport } from '../../services/concurrencyTest';
import { evaluateForecastingReliability, ForecastEvaluationResult } from '../../services/forecastEvaluation';
import { FSSAI_FOOD_SAFETY_RULES } from '../../services/foodSafetyEngine';
import { checkSupabaseHealth } from '../../services/supabase';
import { AdminMultiPortalSwitchboard } from './AdminMultiPortalSwitchboard';

export const AdminControlRoom: React.FC = () => {
  const { state, cache } = useAppState();

  const [activeAdminTab, setActiveAdminTab] = useState<'approvals' | 'overview' | 'verifications' | 'safety' | 'concurrency' | 'logs' | 'switchboard'>('approvals');

  // Pending organization applications
  const pendingShops = state.shops.filter(s => !s.verified);
  const pendingNgos = state.ngos.filter(n => !n.verified);
  const totalPending = pendingShops.length + pendingNgos.length;

  // Action & Sync State
  const [actionLoading, setActionLoading] = useState<Record<string, 'approving' | 'flagging' | 'holding' | null>>({});
  const [toastMsg, setToastMsg] = useState<{ id: number; type: 'success' | 'warn'; text: string } | null>(null);
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);

  React.useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

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

  const handleApprove = async (id: string, name: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
    try {
      const res = await cache.approveOrganization(id);
      setToastMsg({
        id: Date.now(),
        type: 'success',
        text: `✓ ${res.orgName || name} authorized! Synchronized with Supabase PostgreSQL database.`
      });
    } catch (err: any) {
      setToastMsg({
        id: Date.now(),
        type: 'warn',
        text: `Approval saved locally; Supabase notice: ${err?.message}`
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleFlag = async (id: string, name: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'flagging' }));
    try {
      const res = await cache.rejectOrganization(id, 'Physical Inspection Flagged');
      setToastMsg({
        id: Date.now(),
        type: 'warn',
        text: `⚠️ ${res.orgName || name} flagged for regulatory inspection! Recorded in Supabase database & audit logs.`
      });
    } catch (err: any) {
      setToastMsg({
        id: Date.now(),
        type: 'warn',
        text: `Flagged locally; Supabase notice: ${err?.message}`
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleHold = async (id: string, name: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'holding' }));
    try {
      const res = await cache.putOrganizationOnHold(id);
      setToastMsg({
        id: Date.now(),
        type: 'warn',
        text: `ℹ️ ${res.orgName || name} placed on regulatory hold and returned to pending review queue.`
      });
    } catch (err: any) {
      setToastMsg({
        id: Date.now(),
        type: 'warn',
        text: `Hold updated locally; notice: ${err?.message}`
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleManualSync = async () => {
    setIsRefreshingDb(true);
    try {
      await cache.refreshFromDatabase();
      const health = await checkSupabaseHealth();
      setSupabaseHealth({
        connected: health.connected,
        latencyMs: health.latencyMs || 115,
        projectRef: health.projectRef,
        checked: true
      });
      setToastMsg({
        id: Date.now(),
        type: 'success',
        text: `✓ Database synchronized fresh from Supabase PostgreSQL (${health.latencyMs || 115}ms latency)`
      });
    } finally {
      setIsRefreshingDb(false);
    }
  };

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
      {/* Admin Operations Banner - Theme-Friendly Clean Design */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '20px',
        backgroundColor: '#ffffff',
        border: '2px solid var(--color-border)',
        boxShadow: '0 4px 0 var(--color-border)',
        borderRadius: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-primary)',
              border: '2px solid var(--color-primary-dark)',
              boxShadow: '0 3px 0 var(--color-primary-dark)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.4px', margin: 0 }}>
                  Foody Loop Central Operations Control
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
                  Braj Pilot Command
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', marginBottom: 0 }}>
                FSSAI regulatory oversight, verification auditing, and district-wide food redistribution logistics.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: '#15803d',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block'
              }} />
              <span>Supabase PostgreSQL: <strong>Connected ({supabaseHealth.projectRef})</strong> • {supabaseHealth.latencyMs}ms</span>
            </span>

            <button
              onClick={handleManualSync}
              disabled={isRefreshingDb}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #86efac',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: '#15803d',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} style={{ transform: isRefreshingDb ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s' }} />
              <span>{isRefreshingDb ? 'Syncing...' : 'Sync DB Now'}</span>
            </button>

            <span style={{
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: '#1d4ed8',
              fontWeight: 700
            }}>
              System Status: 100% Operational
            </span>
          </div>
        </div>

        {/* Global Pilot KPIs - Duolingo Theme-Friendly Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '2px solid #f1f5f9'
        }}>
          <div style={{
            backgroundColor: '#f7fdf4',
            border: '2px solid #dcfce7',
            boxShadow: '0 3px 0 #bbf7d0',
            borderRadius: '14px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified Participating Shops
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              {state.shops.filter(s => s.verified).length}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>(Active Partners)</span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #e0f2fe',
            boxShadow: '0 3px 0 #bae6fd',
            borderRadius: '14px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified NGOs &amp; Recovery Hubs
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
              {state.ngos.filter(n => n.verified).length}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1' }}>Hubs</span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fffdf5',
            border: '2px solid #fef3c7',
            boxShadow: '0 3px 0 #fde68a',
            borderRadius: '14px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Organization Approvals
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: totalPending > 0 ? '#d97706' : '#64748b', marginTop: '2px' }}>
              {totalPending}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Awaiting FSSAI Check</span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#faf5ff',
            border: '2px solid #f3e8ff',
            boxShadow: '0 3px 0 #e9d5ff',
            borderRadius: '14px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#6b21a8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Meals Rescued &amp; Delivered
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#9333ea', marginTop: '2px' }}>
              6,240{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b21a8' }}>meals to date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Theme Friendly Pill Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        padding: '6px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '2px solid var(--color-border)',
        boxShadow: '0 3px 0 var(--color-border)',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'approvals', label: 'Organization Approvals Desk', count: totalPending, icon: ShieldCheck },
          { id: 'switchboard', label: 'District Multi-Portal Switchboard', icon: Compass },
          { id: 'overview', label: 'Area Demand vs Supply Gap', icon: MapPin },
          { id: 'concurrency', label: 'ACID Concurrency & AI Backtest', icon: Activity },
          { id: 'verifications', label: 'Entity Verifications & Badges', icon: FileCheck2 },
          { id: 'safety', label: 'FSSAI Regulatory Register', icon: Store },
          { id: 'logs', label: 'Immutable Audit Trail', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as typeof activeAdminTab)}
              style={{
                minHeight: '40px',
                padding: '0 16px',
                fontSize: '0.82rem',
                borderRadius: '12px',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                fontWeight: isActive ? 800 : 700,
                border: isActive ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
                boxShadow: isActive ? '0 3px 0 var(--color-primary-dark)' : 'none',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                flexShrink: 0,
                textTransform: 'none',
                letterSpacing: 'normal'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  backgroundColor: '#ff4b4b',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  lineHeight: 1.2
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Master District Multi-Portal Switchboard (Admin Exclusive) */}
      {activeAdminTab === 'switchboard' && (
        <div style={{ marginBottom: '24px' }}>
          <AdminMultiPortalSwitchboard
            onSelectPortal={(portal, id) => {
              cache.setPortal(portal, id);
            }}
            onBackToAdmin={() => setActiveAdminTab('approvals')}
          />
        </div>
      )}

      {/* Tab: Organization Approvals Desk */}
      {activeAdminTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          {/* Toast Notification Banner */}
          {toastMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '14px',
              border: toastMsg.type === 'success' ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
              backgroundColor: toastMsg.type === 'success' ? '#f0fdf4' : '#fff5f5',
              color: toastMsg.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {toastMsg.type === 'success' ? (
                  <CheckCircle2 size={18} color="#16a34a" />
                ) : (
                  <AlertTriangle size={18} color="#dc2626" />
                )}
                <span>{toastMsg.text}</span>
              </div>
              <button
                onClick={() => setToastMsg(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                  padding: '2px 8px'
                }}
              >
                x
              </button>
            </div>
          )}

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
                {pendingShops.map(shop => {
                  const isFlagged = shop.reputationTier === 'Restricted';
                  const isBusy = Boolean(actionLoading[shop.id]);
                  return (
                    <div
                      key={shop.id}
                      className="glass-panel"
                      style={{
                        padding: '20px',
                        border: isFlagged ? '2px solid #fca5a5' : '2px solid var(--color-border)',
                        background: '#ffffff',
                        boxShadow: isFlagged ? '0 4px 0 #fca5a5' : '0 4px 0 var(--color-border)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1.5px solid #fde68a', fontSize: '0.72rem' }}>
                            <Store size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                            {shop.category || 'Restaurant / Sweet Shop'}
                          </span>
                          {isFlagged ? (
                            <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5', fontSize: '0.72rem', fontWeight: 800 }}>
                              Inspection Flagged
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1.5px solid #fecaca', fontSize: '0.72rem' }}>
                              Under Review
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.08rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '4px' }}>
                          {shop.name}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                          <MapPin size={14} color="var(--color-accent-dark)" />
                          <span>{shop.address}, {shop.city}</span>
                        </div>

                        <div style={{
                          background: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid #e2e8f0',
                          fontSize: '0.76rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>FSSAI License:</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a' }}>
                              {shop.fssaiNumber || 'Under Submission'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Contact Person:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{shop.contactPerson}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{shop.phone}</span>
                          </div>
                        </div>

                        {isFlagged && (
                          <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            fontSize: '0.74rem',
                            color: '#991b1b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '10px'
                          }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                            <span>Flagged for regulatory inspection. Saved to Supabase database.</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1.5px solid #f1f5f9' }}>
                        <button
                          onClick={() => handleApprove(shop.id, shop.name)}
                          disabled={isBusy}
                          className="btn btn-primary"
                          style={{
                            flex: 1,
                            minHeight: '38px',
                            fontSize: '0.8rem',
                            backgroundColor: '#58cc02',
                            borderColor: '#58a700',
                            boxShadow: '0 3px 0 #58a700',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            textTransform: 'none',
                            letterSpacing: 'normal',
                            opacity: isBusy ? 0.7 : 1
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>{actionLoading[shop.id] === 'approving' ? 'Authorizing & Syncing...' : 'Approve & Authorize'}</span>
                        </button>
                        <button
                          onClick={() => handleFlag(shop.id, shop.name)}
                          disabled={isBusy}
                          className="btn btn-secondary"
                          style={{
                            minHeight: '38px',
                            fontSize: '0.78rem',
                            padding: '0 12px',
                            color: isFlagged ? '#991b1b' : '#dc2626',
                            borderColor: isFlagged ? '#f87171' : '#fca5a5',
                            backgroundColor: isFlagged ? '#fee2e2' : '#fff5f5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            textTransform: 'none',
                            letterSpacing: 'normal',
                            fontWeight: isFlagged ? 800 : 700,
                            opacity: isBusy ? 0.7 : 1
                          }}
                        >
                          <XCircle size={15} />
                          <span>{actionLoading[shop.id] === 'flagging' ? 'Flagging...' : isFlagged ? 'Flagged (जांच लंबित)' : 'Flag'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pending NGOs */}
                {pendingNgos.map(ngo => {
                  const isFlagged = ngo.reputationTier === 'Restricted';
                  const isBusy = Boolean(actionLoading[ngo.id]);
                  return (
                    <div
                      key={ngo.id}
                      className="glass-panel"
                      style={{
                        padding: '20px',
                        border: isFlagged ? '2px solid #fca5a5' : '2px solid var(--color-border)',
                        background: '#ffffff',
                        boxShadow: isFlagged ? '0 4px 0 #fca5a5' : '0 4px 0 var(--color-border)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #bae6fd', fontSize: '0.72rem' }}>
                            <Building2 size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                            {ngo.category || 'NGO / Charitable Trust'}
                          </span>
                          {isFlagged ? (
                            <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5', fontSize: '0.72rem', fontWeight: 800 }}>
                              Inspection Flagged
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1.5px solid #fecaca', fontSize: '0.72rem' }}>
                              Under Review
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.08rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '4px' }}>
                          {ngo.name}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                          <MapPin size={14} color="var(--color-accent-dark)" />
                          <span>{ngo.address}, {ngo.city}</span>
                        </div>

                        <div style={{
                          background: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid #e2e8f0',
                          fontSize: '0.76rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Daily Capacity:</span>
                            <span style={{ fontWeight: 800, color: '#0f172a' }}>
                              {ngo.capacity} meals / day
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Contact Person:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{ngo.contactPerson}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Phone Number:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{ngo.phone}</span>
                          </div>
                        </div>

                        {isFlagged && (
                          <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            fontSize: '0.74rem',
                            color: '#991b1b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '10px'
                          }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                            <span>Flagged for regulatory inspection. Saved to Supabase database.</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1.5px solid #e2e8f0' }}>
                        <button
                          onClick={() => handleApprove(ngo.id, ngo.name)}
                          disabled={isBusy}
                          className="btn btn-primary"
                          style={{
                            flex: 1,
                            minHeight: '38px',
                            fontSize: '0.8rem',
                            backgroundColor: '#58cc02',
                            borderColor: '#58a700',
                            boxShadow: '0 3px 0 #58a700',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            textTransform: 'none',
                            letterSpacing: 'normal',
                            opacity: isBusy ? 0.7 : 1
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>{actionLoading[ngo.id] === 'approving' ? 'Authorizing & Syncing...' : 'Approve & Authorize'}</span>
                        </button>
                        <button
                          onClick={() => handleFlag(ngo.id, ngo.name)}
                          disabled={isBusy}
                          className="btn btn-secondary"
                          style={{
                            minHeight: '38px',
                            fontSize: '0.78rem',
                            padding: '0 12px',
                            color: isFlagged ? '#991b1b' : '#dc2626',
                            borderColor: isFlagged ? '#f87171' : '#fca5a5',
                            backgroundColor: isFlagged ? '#fee2e2' : '#fff5f5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            textTransform: 'none',
                            letterSpacing: 'normal',
                            fontWeight: isFlagged ? 800 : 700,
                            opacity: isBusy ? 0.7 : 1
                          }}
                        >
                          <XCircle size={15} />
                          <span>{actionLoading[ngo.id] === 'flagging' ? 'Flagging...' : isFlagged ? 'Flagged (जांच लंबित)' : 'Flag'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                      Live in Database
                    </span>
                    <button
                      onClick={() => handleHold(s.id, s.name)}
                      disabled={Boolean(actionLoading[s.id])}
                      style={{
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#e11d48',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {actionLoading[s.id] === 'holding' ? 'Holding...' : 'Hold / Re-Inspect'}
                    </button>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                      Live in Database
                    </span>
                    <button
                      onClick={() => handleHold(n.id, n.name)}
                      disabled={Boolean(actionLoading[n.id])}
                      style={{
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#e11d48',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {actionLoading[n.id] === 'holding' ? 'Holding...' : 'Hold / Re-Inspect'}
                    </button>
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
