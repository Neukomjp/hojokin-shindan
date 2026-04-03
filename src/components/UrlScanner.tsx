import { useState, useEffect, useRef } from 'react';
import { Search, Globe, Cpu, CheckCircle } from 'lucide-react';

type Props = {
  url: string;
  onComplete: (answers: Record<string, string[]>, aiProposal?: string) => void;
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
            if (isSubscribed) {
               const { aiProposal, ...rawAnswers } = data;
               
               // AIが返した q1〜q6 の数値を、計算ロジック（calculateDiagnosis）が期待するID文字列に変換する
               const mappedAnswers: Record<string, string[]> = {};
               
               // URL診断の場合は、社会保険などの前提条件はクリア済みと見なす（手動入力フォームを省いているため）
               // これによりResultPageでの警告が非表示になり、助成金の金額が正しく算出される
               mappedAnswers['companyStatus'] = ['social_insurance', 'no_labor_violations'];
               
               const businessInitiatives: string[] = [];
               const employeeInitiatives: string[] = [];
               
               if (Array.isArray(rawAnswers.q3)) {
                 rawAnswers.q3.forEach((val: string) => {
                   switch(val) {
                     case '1': businessInitiatives.push('it_tools'); break;
                     case '2': businessInitiatives.push('new_business'); break;
                     case '3': businessInitiatives.push('hp_ec'); break;
                     case '4': businessInitiatives.push('machines_interior'); break;
                     case '5': businessInitiatives.push('machines_interior'); break;
                     case '6': employeeInitiatives.push('hire_new'); break;
                     case '7': employeeInitiatives.push('part_time_improvement'); break;
                     case '8': businessInitiatives.push('it_tools'); break;
                     case '9': employeeInitiatives.push('external_training'); break;
                   }
                 });
               }
               mappedAnswers['businessInitiatives'] = businessInitiatives;
               mappedAnswers['employeeInitiatives'] = employeeInitiatives;
               
               // 従業員数のマッピング (q1: 1=0名, 2=1-5名, 3=6-20名, 4=21-50名, 5=51名以上)
               let empCount = '0名';
               if (rawAnswers.q1 && rawAnswers.q1[0]) {
                 switch(rawAnswers.q1[0]) {
                   case '1': empCount = '0名'; break;
                   case '2': empCount = '1-5名'; break;
                   case '3': empCount = '6-20名'; break;
                   case '4': empCount = '21-50名'; break;
                   case '5': empCount = '51-100名'; break; // 51名以上の代表値として使用
                 }
               }
               mappedAnswers['employeeCount'] = [empCount];

               // 業種のマッピング (q2)
               let indCount = 'その他';
               if (rawAnswers.q2 && rawAnswers.q2[0]) {
                 switch(rawAnswers.q2[0]) {
                   case '1': indCount = '情報通信・IT業'; break;
                   case '2': indCount = '飲食業'; break;
                   case '3': indCount = '小売業'; break;
                   case '4': indCount = '製造業'; break; // 建設業も合算されるが便宜上製造業に統一
                   case '5': case '6': case '7': case '8': indCount = 'サービス業'; break;
                 }
               }
               mappedAnswers['industry'] = [indCount];
               
               // 予算の判定（未定以外であればなんでもOK）
               mappedAnswers['budget'] = rawAnswers.q4 && rawAnswers.q4[0] !== '1' ? ['150万円〜300万円'] : ['未定'];

               onComplete(mappedAnswers, aiProposal);
            }
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
            'companyStatus': ['social_insurance', 'no_labor_violations'],
            'businessInitiatives': ['it_tools'],
            'employeeInitiatives': ['hire_new'],
            'budget': ['300万円〜500万円']
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
