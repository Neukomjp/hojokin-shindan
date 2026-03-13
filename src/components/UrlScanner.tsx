import { useState, useEffect } from 'react';
import { Search, Globe, Cpu, CheckCircle } from 'lucide-react';

type Props = {
  url: string;
  onComplete: (answers: Record<string, string[]>) => void;
};

export default function UrlScanner({ url, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('対象サイトへアクセス中...');
  const [icon, setIcon] = useState(<Globe size={48} color="var(--color-primary)" />);

  useEffect(() => {
    // Simulated scanning sequence
    const sequence = [
      { time: 500,  progress: 15, text: '企業サイトの構造を解析中...', icon: <Search size={48} color="var(--color-primary)" /> },
      { time: 1500, progress: 40, text: '事業内容・サービス情報を抽出中...', icon: <Cpu size={48} color="var(--color-primary)" /> },
      { time: 3000, progress: 75, text: 'AIが従業員規模・課題を特定・分析中...', icon: <Cpu size={48} color="var(--color-primary)" /> },
      { time: 4500, progress: 95, text: '最適な補助金・助成金データベースと照合中...', icon: <Search size={48} color="var(--color-primary)" /> },
      { time: 5500, progress: 100, text: '解析完了！', icon: <CheckCircle size={48} color="var(--color-success, #009342)" /> }
    ];

    let timeouts: number[] = [];

    // Initial state
    setProgress(5);

    sequence.forEach((step) => {
      const t = setTimeout(() => {
        setProgress(step.progress);
        setStatus(step.text);
        setIcon(step.icon);
        
        if (step.progress === 100) {
          // Prepare maximum payout mock answers after animation
          const mockAnswers: Record<string, string[]> = {
            'employeeCount': ['21-50名'],
            'industry': ['情報通信・IT業'],
            'companyStatus': ['social_insurance', 'no_labor_violations'],
            'businessInitiatives': ['hp_ec', 'it_tools', 'ai_dev', 'machines_interior'],
            'budget': ['1,000万円〜'],
            'employeeInitiatives': ['ai_training', 'hire_new', 'part_time_improvement']
          };
          
          setTimeout(() => {
            onComplete(mockAnswers);
          }, 800);
        }
      }, step.time);
      timeouts.push(t as unknown as number);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="container mt-8 animate-fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
        AI自動診断を実行中
      </h2>
      <p style={{ color: 'var(--color-text-light)', marginBottom: '3rem', wordBreak: 'break-all' }}>
        対象URL: {url}
      </p>

      <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ marginBottom: '2rem', animation: progress < 100 ? 'pulse 1.5s infinite' : 'none' }}>
          {icon}
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'var(--color-primary)', minHeight: '1.5em' }}>
          {status}
        </h3>

        <div className="progress-container" style={{ width: '100%', maxWidth: '400px', height: '12px', marginBottom: '1rem' }}>
          <div 
            className="progress-bar" 
            style={{ 
              width: `${progress}%`, 
              transition: 'width 0.5s ease-out',
              backgroundColor: progress === 100 ? 'var(--color-success, #009342)' : 'var(--color-primary)' 
            }}
          />
        </div>
        
        <p style={{ fontWeight: 'bold', color: 'var(--color-text-light)' }}>
          {progress}%
        </p>

      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
