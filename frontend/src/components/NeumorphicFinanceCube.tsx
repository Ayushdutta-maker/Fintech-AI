import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  PieChart, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

export const NeumorphicFinanceCube: React.FC = () => {
  const { theme, currencySymbol } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const cubeSize = 130;
  const halfSize = cubeSize / 2;

  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${cubeSize}px`,
    height: `${cubeSize}px`,
    borderRadius: '18px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: theme === 'dark' 
      ? 'rgba(16, 23, 38, 0.88)' 
      : 'rgba(255, 255, 255, 0.92)',
    border: theme === 'dark'
      ? '1px solid rgba(16, 185, 129, 0.35)'
      : '1px solid rgba(5, 150, 105, 0.25)',
    boxShadow: theme === 'dark'
      ? '0 10px 25px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
      : '0 10px 25px rgba(0, 77, 52, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    backfaceVisibility: 'visible',
    userSelect: 'none',
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '320px',
        height: '320px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Perspective Container */}
      <div style={{ perspective: 900 }}>
        <div 
          className="finance-3d-cube"
          style={{
            position: 'relative',
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s ease',
          }}
        >
          {/* Front Face: Brand & AI Core */}
          <div style={{ ...faceStyle, transform: `translateZ(${halfSize}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <TrendingUp size={15} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--green-600)' }}>CORE</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Liquidity</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
                {currencySymbol}84,500
              </div>
            </div>
          </div>

          {/* Back Face: ML Projections */}
          <div style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${halfSize}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Sparkles size={16} color="var(--green-600)" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--warning)' }}>ML</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Confidence</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--green-600)' }}>
                98.7% Acc
              </div>
            </div>
          </div>

          {/* Right Face: Net Margin */}
          <div style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${halfSize}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ArrowUpRight size={16} color="var(--green-600)" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--green-600)' }}>SURPLUS</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Net Margin</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
                +32.4%
              </div>
            </div>
          </div>

          {/* Left Face: Smart Budgets */}
          <div style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PieChart size={16} color="var(--savings)" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--savings)' }}>BUDGETS</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Ceiling</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
                Disciplined
              </div>
            </div>
          </div>

          {/* Top Face: AES-256 Vault */}
          <div style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${halfSize}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ShieldCheck size={16} color="var(--green-600)" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--green-600)' }}>VAULT</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Encryption</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
                AES-256
              </div>
            </div>
          </div>

          {/* Bottom Face: Intelligence Node */}
          <div style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Cpu size={16} color="var(--bill)" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--bill)' }}>NODE</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Status</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
                Synced
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orbiting Neumorphic Badge 1 */}
      <div 
        className="floating-3d-badge badge-1"
        style={{
          position: 'absolute',
          top: '20px',
          right: '-10px',
          background: 'var(--surface)',
          padding: '8px 14px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          fontWeight: 700,
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow-3d)',
          color: 'var(--text)',
          pointerEvents: 'none'
        }}
      >
        <Sparkles size={14} color="var(--green-600)" />
        <span>ML Predictive Engine</span>
      </div>

      {/* Orbiting Neumorphic Badge 2 */}
      <div 
        className="floating-3d-badge badge-2"
        style={{
          position: 'absolute',
          bottom: '25px',
          left: '-15px',
          background: 'var(--surface)',
          padding: '8px 14px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          fontWeight: 700,
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow-3d)',
          color: 'var(--text)',
          pointerEvents: 'none'
        }}
      >
        <ShieldCheck size={14} color="var(--green-600)" />
        <span>Google OAuth 2.0</span>
      </div>
    </div>
  );
};
