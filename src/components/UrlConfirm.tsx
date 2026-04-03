import { useState } from 'react';
import { questions } from '../data/questions';
import { Check, ArrowRight } from 'lucide-react';

type Props = {
  initialAnswers: Record<string, string[]>;
  onComplete: (answers: Record<string, string[]>) => void;
};

export default function UrlConfirm({ initialAnswers, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>(initialAnswers);

  const handleOptionToggle = (questionId: string, optionId: string, type: 'radio' | 'checkbox') => {
    const currentAnswers = answers[questionId] || [];

    if (type === 'radio') {
      setAnswers(prev => ({ ...prev, [questionId]: [optionId] }));
    } else {
      if (currentAnswers.includes(optionId)) {
        setAnswers(prev => ({
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId)
        }));
      } else {
        setAnswers(prev => ({
          ...prev,
          [questionId]: [...currentAnswers, optionId]
        }));
      }
    }
  };

  const handleNext = () => {
    onComplete(answers);
  };

  return (
    <div className="container mt-8 animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-primary)' }}>
        AIによる推測結果の確認
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--color-text-light)' }}>
        Webサイトの情報から自動推測した現状をチェックしました。<br/>事実と異なる場合は正しい項目を選び直してから、「次へ進む」をクリックしてください。
      </p>

      {questions.map((q) => {
        const currentAnswers = answers[q.id] || [];
        return (
          <div key={q.id} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              {q.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map(option => {
                const isSelected = currentAnswers.includes(option.id);
                return (
                  <div 
                    key={option.id}
                    className={`option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionToggle(q.id, option.id, q.type)}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      minWidth: '24px',
                      minHeight: '24px',
                      flexShrink: 0,
                      borderRadius: q.type === 'radio' ? '50%' : '2px',
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      marginRight: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      transition: 'all 0.2s'
                    }}>
                      {isSelected && <Check size={16} color="white" />}
                    </div>
                    <div className="option-title">{option.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleNext}
          style={{ minWidth: '300px', fontSize: '1.2rem', padding: '1rem' }}
        >
          この内容で診断する <ArrowRight size={24} style={{ marginLeft: '10px' }} />
        </button>
      </div>
    </div>
  );
}
