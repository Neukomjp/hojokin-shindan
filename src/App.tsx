import { useState, useEffect } from 'react';
import Questionnaire from './components/Questionnaire';
import LeadForm from './components/LeadForm';
import ResultPage from './components/ResultPage';
import AdminPage from './components/AdminPage';
import UrlScanner from './components/UrlScanner';
import { supabase } from './lib/supabase';
import { ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { calculateDiagnosis } from './data/questions';

type Step = 'intro' | 'questionnaire' | 'url_scan' | 'lead_form' | 'result';

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

  const handleStart = () => {
    setScanUrl(''); // Clear the URL state if they start a manual diagnosis
    setAiProposalText(null); // Clear previous AI text
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = (collectedAnswers: Record<string, string[]>) => {
    setAnswers(collectedAnswers);
    setStep('lead_form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) return;
    setStep('url_scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUrlScanComplete = (autoAnswers: Record<string, string[]>, aiProposal?: string) => {
    setAnswers(autoAnswers);
    if (aiProposal) setAiProposalText(aiProposal);
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
      <header style={{ backgroundColor: 'var(--color-primary)', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>公的支援制度・活用診断</h1>
      </header>

      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        {step === 'intro' && (
          <div className="container text-center animate-fade-in" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-primary)', lineHeight: 1.4 }}>
              1分でわかる！<br/>補助金・助成金 無料診断
            </h2>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', color: 'var(--color-text-body)' }}>
              簡単な6つの質問に答えるだけで、あなたの会社が受給できる可能性のある補助金・助成金の金額と種類がわかります。
            </p>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <CheckCircle2 /> 手動で診断を開始する
              </h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
                会社の状況について6つの質問に回答し、受給見込み金額を確認します。
              </p>
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleStart} className="btn btn-primary btn-lg" style={{ fontSize: '1.1rem', padding: '1rem 2rem', width: '100%' }}>
                  無料診断をスタートする <ArrowRight style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <Globe /> 自社のURLから自動診断する
              </h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
                貴社のWebサイトのURLを入力すると、AIがサイト情報を分析して自動で補助金診断を行います。
              </p>
              <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="url" 
                  value={scanUrl}
                  onChange={(e) => setScanUrl(e.target.value)}
                  placeholder="https://example.com" 
                  className="form-input" 
                  style={{ flex: 1, padding: '0.8rem' }}
                  required 
                />
                <button type="submit" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                  自動診断
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'questionnaire' && (
          <Questionnaire 
            onComplete={handleQuestionnaireComplete} 
            onBack={() => setStep('intro')}
          />
        )}

        {step === 'url_scan' && (
          <UrlScanner 
            url={scanUrl}
            onComplete={handleUrlScanComplete}
          />
        )}

        {step === 'lead_form' && (
          <LeadForm 
            onSubmit={handleLeadSubmit} 
          />
        )}

        {step === 'result' && (
          <ResultPage answers={answers} aiProposal={aiProposalText} isUrlScan={!!scanUrl} />
        )}
      </main>

      {/* 共通フッター */}
      <footer style={{ backgroundColor: 'var(--color-bg-alt)', padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)', marginTop: 'auto' }}>
        <p style={{ fontSize: '0.85rem' }}>&copy; 2026 補助金診断システム. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
