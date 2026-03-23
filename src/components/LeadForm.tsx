import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

type Props = {
  onSubmit: (leadData: { companyName: string; phone: string; email: string }) => void;
  maxAmount?: number;
};

export default function LeadForm({ onSubmit, maxAmount }: Props) {
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
              最大 <span style={{ fontSize: '3rem' }}>{maxAmount}</span> 万円
            </p>
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
