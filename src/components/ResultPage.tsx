import { useEffect, useState } from 'react';
import { calculateDiagnosis } from '../data/questions';
import { PiggyBank, ExternalLink, MessageCircle } from 'lucide-react';

type Props = {
  answers: Record<string, string[]>;
  aiProposal?: string | null;
  isUrlScan?: boolean;
};

export default function ResultPage({ answers, aiProposal, isUrlScan }: Props) {
  const result = calculateDiagnosis(answers);
  const [animatedAmount, setAnimatedAmount] = useState(0);

  const companyStatus = answers['companyStatus'] || [];
  const hasSocialInsurance = companyStatus.includes('social_insurance');
  const hasNoLaborViolations = companyStatus.includes('no_labor_violations');

  useEffect(() => {
    // Simple animated counter for maxAmount
    let start = 0;
    const end = result.maxAmount;
    if (start === end) return;

    const duration = 1500;
    const incrementTime = 30;
    const steps = duration / incrementTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setAnimatedAmount(end);
      } else {
        setAnimatedAmount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [result.maxAmount]);

  return (
    <div className="container mt-8 animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* 診断結果ヘッダー */}
      <h1 className="text-center" style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '2rem' }}>
        診断結果
      </h1>
      
      {/* AIからの提案パネル (URL自動診断時のみ表示) */}
      {aiProposal && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)', backgroundColor: 'var(--color-bg-alt)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            ✨ AIからの個別提案
          </h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
            {aiProposal}
          </p>
        </div>
      )}
      
      {/* 最大受給金額カード */}
      <div className="glass-panel text-center" style={{ padding: '3rem 2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, white 100%)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
          最大受給金額は・・・
        </p>
        <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
            {animatedAmount}
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            万円
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          ※独自の算定基準に基づき試算した期待金額を表示しています
        </p>
        
        {result.employeeSubsidies.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'left', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank size={18} color="var(--color-primary)" />
              該当する雇用・研修系助成金（合算済）
            </h3>
            <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
              {result.employeeSubsidies.map((sub, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{sub}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 条件アラート */}
      {!isUrlScan && (!hasSocialInsurance || !hasNoLaborViolations) && (
        <div style={{ border: '2px solid var(--color-alert)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem', backgroundColor: '#fef2f2' }}>
          <h4 style={{ color: 'var(--color-alert)', fontWeight: 700, marginBottom: '0.5rem' }}>※ご注意事項※</h4>
          <p style={{ fontSize: '0.9rem' }}>厚労省の助成金に関しては以下の項目を整備されることが必須となります。</p>
          {!hasSocialInsurance && (
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-alert)', marginTop: '0.5rem' }}>・「社会保険への加入」が必要です。</p>
          )}
          {!hasNoLaborViolations && (
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-alert)', marginTop: '0.5rem' }}>・「労働違反の是正」が必要です。</p>
          )}
        </div>
      )}

      {/* 事業系補助金リスト */}
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--color-text-main)', fontWeight: 700 }}>
        {result.maxAmount === 0 ? '条件次第で獲得できる補助金' : '主要な該当する補助金'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {result.subsidyCards.map((card) => (
          <div key={card.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>{card.title}</h3>
              <div style={{ background: 'var(--color-primary-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>最大</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginLeft: '0.5rem' }}>{card.maxAmount.toLocaleString()}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginLeft: '0.15rem' }}>万円</span>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{card.description}</p>
            <div style={{ marginTop: '0.5rem' }}>
              <a href={card.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                <ExternalLink size={14} /> 詳細ページはこちら
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center" style={{ marginTop: '3rem' }}>
        <p style={{ marginBottom: '1rem', fontWeight: 600 }}>まずは無料で、お気軽に</p>
        <a href="tel:0523878688" className="btn btn-primary btn-lg" style={{ width: '100%', maxWidth: '400px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <MessageCircle size={20} /> 申請の相談をする
        </a>
      </div>
    </div>
  );
}
