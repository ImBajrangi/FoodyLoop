import React from 'react';
import { X, Award, CheckCircle2, Download, Share2, Sparkles } from 'lucide-react';
import { Sponsorship } from '../../types';

interface ImpactCertificateModalProps {
  sponsorship: Sponsorship | null;
  onClose: () => void;
}

export const ImpactCertificateModal: React.FC<ImpactCertificateModalProps> = ({ sponsorship, onClose }) => {
  if (!sponsorship) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}>
        {/* Certificate Card Container */}
        <div style={{
          background: '#fdfbf7',
          border: '8px double #d97706',
          padding: '36px 30px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: 'inset 0 0 20px rgba(217, 119, 6, 0.08)'
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>

          {/* Top Emblem */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 14px rgba(180, 83, 9, 0.3)'
          }}>
            <Award size={36} />
          </div>

          <div style={{
            fontSize: '0.8rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#b45309',
            fontWeight: 800,
            marginBottom: '4px'
          }}>
            Foody Loop • Braj Seva Initiative
          </div>

          <h2 className="font-serif" style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Certificate of Annadana &amp; Compassion
          </h2>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Pilot Corridor: India • FSSAI Partner Verified
          </p>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #d97706, transparent)',
            margin: '0 auto 20px',
            maxWidth: '400px'
          }} />

          {/* Certificate Body */}
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            This certificate gratefully acknowledges the pious food sponsorship of
          </p>

          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: 'var(--saffron-700)',
            marginBottom: '4px'
          }}>
            {sponsorship.sponsorName}
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            in honor of <strong>{sponsorship.honoreeName}</strong> ({sponsorship.occasion})
          </p>

          {/* Dedication Quote */}
          <div style={{
            background: 'rgba(254, 243, 199, 0.4)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            fontStyle: 'italic',
            fontSize: '0.84rem',
            color: '#78350f',
            marginBottom: '20px',
            lineHeight: 1.5
          }}>
            "{sponsorship.dedicationMessage}"
          </div>

          {/* Impact Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '24px',
            fontSize: '0.82rem'
          }}>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                {sponsorship.mealsSponsored}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Nutritious Meals Served</div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
                {sponsorship.beneficiaryLocationName.split('&')[0]}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Beneficiary Location</div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Dr. Ananya Pandey</div>
              <div>Braj Seva Food Recovery</div>
            </div>

            <div>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                <CheckCircle2 size={12} />
                FSSAI IFSA Seal
              </span>
              <div style={{ fontSize: '0.68rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {sponsorship.certificateId}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Foody Loop Operations</div>
              <div>Mathura District Hub</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          background: 'white',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ fontSize: '0.84rem' }}
          >
            <Download size={14} />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
