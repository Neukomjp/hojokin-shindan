import { useState, useEffect } from 'react';
import LeadForm from './components/LeadForm';
import ResultPage from './components/ResultPage';
import AdminPage from './components/AdminPage';
import UrlScanner from './components/UrlScanner';
import UrlConfirm from './components/UrlConfirm';
import { supabase } from './lib/supabase';
import { Globe } from 'lucide-react';
import { calculateDiagnosis } from './data/questions';

type Step = 'intro' | 'url_scan' | 'url_confirm' | 'lead_form' | 'result';

function App() {
  const [step, setStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [, setLeadData] = useState<{ companyName: string; phone: string; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scanUrl, setScanUrl] = useState('');
  const [aiProposalText, setAiProposalText] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === '#admin');
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);


  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) return;
    setStep('url_scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUrlScanComplete = (autoAnswers: Record<string, string[]>, aiProposal?: string) => {
    setAnswers(autoAnswers);
    if (aiProposal) setAiProposalText(aiProposal);
    setStep('url_confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUrlConfirmComplete = (confirmedAnswers: Record<string, string[]>) => {
    setAnswers(confirmedAnswers);
    setStep('lead_form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeadSubmit = async (data: { companyName: string; phone: string; email: string }) => {
    const result = calculateDiagnosis(answers);
    const newLead = {
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      max_amount: result.maxAmount,
      answers: answers,
      scan_url: scanUrl || null
    };

    try {
      const { error } = await supabase.from('leads').insert([newLead]);
      if (error) {
        console.error('Error saving to Supabase:', error);
      } else {
        // Send email notification to admin (fire-and-forget)
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: data.companyName,
            phone: data.phone,
            email: data.email,
            maxAmount: result.maxAmount,
            scanUrl: scanUrl || null,
          }),
        }).catch(err => console.error('Notification failed:', err));
      }
    } catch (e) {
      console.error('Failed to save to Supabase:', e);
    }

    setLeadData(data);
    setStep('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdmin) {
    return (
      <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
        <AdminPage />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 共通ヘッダー */}
      <header className="app-header" style={{ backgroundColor: 'var(--color-primary)', padding: '0.75rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <img src="/logo.png" alt="補助くる" style={{ height: '44px', objectFit: 'contain' }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>公的支援制度・活用診断</h1>
      </header>

      <main className="app-main" style={{ flex: 1, padding: '2rem 1rem' }}>
        {step === 'intro' && (
          <div className="container text-center animate-fade-in" style={{ marginTop: '1.5rem' }}>
            {/* ヒーローセクション */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 className="intro-title" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--color-primary)' }}>最大数千万円</span>の<br/>補助金・助成金を逃していませんか？
              </h2>
              <p className="intro-desc" style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--color-text-body)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                WebサイトのURLを入力するだけで、AIがあなたの事業を分析。<br/>受給可能な補助金・助成金を<strong>無料</strong>で診断します。
              </p>
            </div>

            {/* 信頼性指標 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[
                { num: '1,200+', label: '診断実績' },
                { num: '97%', label: '満足度' },
                { num: '60秒', label: '診断時間' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0 }}>{item.num}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* URL入力フォーム */}
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '520px', margin: '0 auto 2rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <Globe /> URLを入力して無料診断
              </h3>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                貴社のWebサイトをAIが解析し、受給可能な補助金・助成金を特定します。
              </p>
              <form onSubmit={handleUrlSubmit} className="url-form" style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="url" 
                  value={scanUrl}
                  onChange={(e) => setScanUrl(e.target.value)}
                  placeholder="https://example.com" 
                  className="form-input" 
                  style={{ flex: 1, padding: '0.85rem' }}
                  required 
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.85rem 1.5rem' }}>
                  無料診断
                </button>
              </form>
            </div>
          </div>
        )}



        {step === 'url_scan' && (
          <UrlScanner 
            url={scanUrl}
            onComplete={handleUrlScanComplete}
          />
        )}

        {step === 'url_confirm' && (
          <UrlConfirm 
            initialAnswers={answers}
            onComplete={handleUrlConfirmComplete}
          />
        )}

        {step === 'lead_form' && (
          <LeadForm 
            onSubmit={handleLeadSubmit}
            maxAmount={calculateDiagnosis(answers).maxAmount}
            answers={answers}
          />
        )}

        {step === 'result' && (
          <ResultPage answers={answers} aiProposal={aiProposalText} isUrlScan={!!scanUrl} />
        )}
      </main>

      {/* 共通フッター */}
      <footer className="app-footer" style={{ backgroundColor: 'var(--color-bg-alt)', padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)', marginTop: 'auto' }}>
        <p style={{ fontSize: '0.85rem' }}>&copy; 2026 補助くる All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
