import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { calculateDiagnosis } from '../data/questions';

type Props = {
  onSubmit: (leadData: { companyName: string; phone: string; email: string }) => void;
  maxAmount?: number;
  answers?: Record<string, string[]>;
};

export default function LeadForm({ onSubmit, maxAmount, answers }: Props) {
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({
    companyName: '',
    phone: '',
    email: '',
  });

  const result = answers ? calculateDiagnosis(answers) : null;

  const validate = () => {
    let isValid = true;
    const newErrors = { companyName: '', phone: '', email: '' };

    if (!formData.companyName.trim()) {
      newErrors.companyName = '会社名は必須項目です。';
      isValid = false;
    }
    
    const phoneRegex = /^[0-9-]{10,13}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号は必須項目です。';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = '有効な電話番号を入力してください。';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須項目です。';
      isValid = false;
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = '有効なメールアドレスを入力してください。';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="container mt-8 animate-fade-in">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {maxAmount !== undefined && maxAmount > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>あなたの受給見込み額</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0, lineHeight: 1.2 }}>
              最大 <span style={{ fontSize: '3rem' }}>{maxAmount.toLocaleString()}</span> 万円
            </p>
          </div>
        )}

        {/* ブラー付き診断結果プレビュー（フォームの上に表示） */}
        {result && (
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            {/* ブラーオーバーレイ */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.9) 100%)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}>
              <div style={{ 
                background: 'white', 
                padding: '1.5rem 2.5rem', 
                borderRadius: 'var(--radius-md)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                textAlign: 'center',
                maxWidth: '400px',
              }}>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  🔍 診断結果の全容をチェック
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>
                  以下のフォームを送信すると、すべての診断結果を確認できます
                </p>
              </div>
            </div>

            {/* ブラーされた結果コンテンツ */}
            <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
              {/* 金額内訳テーブルプレビュー */}
              <div style={{ padding: '1.5rem', marginBottom: '1rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                  📊 金額の内訳
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>制度名</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>最大額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subsidyCards.filter(c => c.id !== 'syouene').map((card) => (
                      <tr key={card.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.7rem', marginRight: '0.4rem', background: 'var(--color-primary-light)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>補助金</span>
                          {card.title}
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {card.maxAmount.toLocaleString()} 万円
                        </td>
                      </tr>
                    ))}
                    {result.employeeSubsidies.map((sub, idx) => (
                      <tr key={`e-${idx}`} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{ color: '#e67e22', fontWeight: 600, fontSize: '0.7rem', marginRight: '0.4rem', background: '#fef3e2', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>助成金</span>
                          {sub.name}
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 700, color: '#e67e22' }}>
                          {sub.amount.toLocaleString()} 万円
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 補助金カードプレビュー（最大2つ） */}
              {result.subsidyCards.slice(0, 2).map((card) => (
                <div key={card.id} style={{ padding: '1.5rem', marginBottom: '1rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.7rem', background: 'var(--color-primary-light)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>補助金</span>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', margin: '0.5rem 0' }}>{card.title}</h3>
                  <div style={{ background: 'var(--color-primary-light)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>最大</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', marginLeft: '0.4rem' }}>{card.maxAmount.toLocaleString()}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginLeft: '0.1rem' }}>万円</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-center" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          診断結果をご覧になる前に
        </h2>
        <p className="text-center" style={{ marginBottom: '2rem', color: 'var(--color-text-light)' }}>
          ご入力いただいた情報を元に、担当のコンサルタントからより詳しい制度のご案内を行わせていただく場合がございます。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              会社名 <span className="required">必須</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="例：Sala合同会社"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            {errors.companyName && <div style={{ color: 'var(--color-alert)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.companyName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              電話番号 <span className="required">必須</span>
            </label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="例：03-1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {errors.phone && <div style={{ color: 'var(--color-alert)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              メールアドレス <span className="required">必須</span>
            </label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="例：info@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div style={{ color: 'var(--color-alert)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.email}</div>}
          </div>

          <div className="text-center mt-8">
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', maxWidth: '400px' }}>
              診断結果を見る <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

