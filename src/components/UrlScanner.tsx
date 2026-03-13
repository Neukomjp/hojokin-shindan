import { useState, useEffect, useRef } from 'react';
import { Search, Globe, Cpu, CheckCircle } from 'lucide-react';

type Props = {
  url: string;
  onComplete: (answers: Record<string, string[]>) => void;
};

export default function UrlScanner({ url, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('対象サイトへアクセス中...');
  const [icon, setIcon] = useState(<Globe size={48} color="var(--color-primary)" />);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    let isSubscribed = true;
    let progressInterval: number;

    const startAnalysis = async () => {
      try {
        // Start fake progress while waiting for the API
        setProgress(5);
        let currentProgress = 5;
        progressInterval = window.setInterval(() => {
          if (currentProgress < 90) {
            currentProgress += Math.floor(Math.random() * 5) + 1;
            if (isSubscribed) setProgress(currentProgress);
            
            // Update status text based on progress
            if (currentProgress > 70 && isSubscribed) {
               setStatus('AIが従業員規模・課題を特定・分析中...');
               setIcon(<Cpu size={48} color="var(--color-primary)" />);
            } else if (currentProgress > 30 && isSubscribed) {
               setStatus('事業内容・サービス情報を抽出中...');
               setIcon(<Search size={48} color="var(--color-primary)" />);
            }
          }
        }, 800);

        // Call the real API
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();

        // Finish progress
        clearInterval(progressInterval);
        
        if (isSubscribed) {
          setProgress(100);
          setStatus('解析完了！');
          setIcon(<CheckCircle size={48} color="var(--color-success, #009342)" />);
          
          setTimeout(() => {
            if (isSubscribed) onComplete(data);
          }, 800);
        }

      } catch (error) {
        console.error('Analysis error:', error);
        clearInterval(progressInterval);
        if (isSubscribed) {
          setStatus('解析に失敗しました。サイトを読み取れませんでした。');
          setIcon(<Globe size={48} color="var(--color-alert, #e53e3e)" />);
          
          // Provide default safe answers if scraping fails
          const fallbackAnswers: Record<string, string[]> = {
            'q1': ['3'],
            'q2': ['8'],
            'q3': ['1', '2'],
            'q4': ['3'],
            'q5': ['3'],
            'q6': ['3']
          };
          setTimeout(() => {
            if (isSubscribed) onComplete(fallbackAnswers);
          }, 2000);
        }
      }
    };

    startAnalysis();

    return () => {
      isSubscribed = false;
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [url, onComplete]);

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
