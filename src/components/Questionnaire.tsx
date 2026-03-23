import { useState, useEffect } from 'react';
import { questions, type Question } from '../data/questions';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';

type Props = {
  onComplete: (answers: Record<string, string[]>) => void;
  onBack: () => void;
};

export default function Questionnaire({ onComplete, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [animate, setAnimate] = useState(true);

  const question: Question = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    setAnimate(true);
  }, [currentIndex]);

  const handleOptionToggle = (optionId: string) => {
    const currentAnswers = answers[question.id] || [];

    if (question.type === 'radio') {
      // Auto-advance for radio
      setAnswers(prev => ({ ...prev, [question.id]: [optionId] }));
      setTimeout(() => handleNext(), 300);
    } else {
      // Toggle for checkbox
      if (currentAnswers.includes(optionId)) {
        setAnswers(prev => ({
          ...prev,
          [question.id]: currentAnswers.filter(id => id !== optionId)
        }));
      } else {
        setAnswers(prev => ({
          ...prev,
          [question.id]: [...currentAnswers, optionId]
        }));
      }
    }
  };

  const currentAnswers = answers[question.id] || [];

  const handleNext = () => {
    setAnimate(false);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete(answers);
      }
    }, 150);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setAnimate(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
      }, 150);
    } else {
      onBack();
    }
  };

  // For checkbox questions, allow next if not empty, or even if empty if we want to allow skipping
  // The original system allowed skipping checkboxes if they don't apply. We'll allow next always for checkboxes.

  return (
    <div className="container mt-8">
      <div className="glass-panel" style={{ padding: '2rem', transition: 'all 0.3s' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
          STEP {currentIndex + 1} / {questions.length}
        </div>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <div className={animate ? 'animate-fade-in' : ''} style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.15s' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            {question.title}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options.map(option => {
              const isSelected = currentAnswers.includes(option.id);
              return (
                <div 
                  key={option.id}
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionToggle(option.id)}
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: question.type === 'radio' ? '50%' : '4px',
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

          {question.type === 'checkbox' && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleNext}
                style={{ minWidth: '200px' }}
              >
                次の質問へ <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button onClick={handlePrev} className="btn btn-outline" style={{ minWidth: '200px', border: '2px solid var(--color-primary)', color: 'var(--color-primary)' }}>
              <ArrowLeft size={20} /> 戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
