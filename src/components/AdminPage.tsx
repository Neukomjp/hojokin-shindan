import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import { questions } from '../data/questions';

type Lead = {
  id: string;
  created_at: string;
  company_name: string;
  phone: string;
  email: string;
  max_amount: number;
  answers: Record<string, string[]>;
  scan_url?: string;
};

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Check initial session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch leads from Supabase', error);
      } else if (data) {
        setLeads(data as Lead[]);
      }
    };

    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: inputEmail,
      password: inputPassword,
    });

    if (signInError) {
      setError('メールアドレスかパスワードが間違っています。');
    } else {
      setInputPassword('');
      setInputEmail('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }} className="glass-panel text-center animate-fade-in">
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>管理者ログイン</h2>
        <p style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          リード情報を閲覧するにはパスワードを入力してください。
        </p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="メールアドレス (admin@example.com)"
                className="form-input"
                style={{ padding: '0.75rem', width: '100%', border: '1px solid var(--color-border)' }}
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="パスワード"
                className="form-input"
                style={{ padding: '0.75rem', width: '100%', border: error ? '2px solid var(--color-alert)' : '1px solid var(--color-border)' }}
                required
              />
            </div>
            {error && <p style={{ color: 'var(--color-alert)', fontSize: '0.8rem', textAlign: 'left' }}>{error}</p>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ログイン
          </button>
        </form>
        <div style={{ marginTop: '2rem' }}>
          <a href="#" className="btn-outline" style={{ display: 'inline-block', fontSize: '0.85rem' }}>診断ページに戻る</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>リード（顧客情報）管理画面</h1>
        <button onClick={handleLogout} className="btn-outline" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}>
          ログアウト
        </button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-bg-alt)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap' }}>登録日時</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap' }}>会社名</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap' }}>電話番号</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap' }}>メールアドレス</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap' }}>受給見込み額</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap' }}>詳細</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  まだ登録されたリード情報はありません。
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <Fragment key={lead.id}>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: expandedLeadId === lead.id ? '#f3fdf8' : 'transparent' }}>
                    <td style={{ padding: '1rem', color: 'var(--color-text-light)' }}>
                      {new Date(lead.created_at).toLocaleString('ja-JP')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{lead.company_name}</td>
                    <td style={{ padding: '1rem' }}>{lead.phone}</td>
                    <td style={{ padding: '1rem' }}>{lead.email}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      {lead.max_amount}万円
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                        className={expandedLeadId === lead.id ? "btn-outline" : "btn-primary"} 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--color-primary)', background: expandedLeadId === lead.id ? 'transparent' : 'var(--color-primary)', color: expandedLeadId === lead.id ? 'var(--color-primary)' : 'white' }}
                      >
                        {expandedLeadId === lead.id ? '閉じる' : '回答を見る'}
                      </button>
                    </td>
                  </tr>
                  {expandedLeadId === lead.id && (
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td colSpan={6} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.95rem', maxWidth: '800px', margin: '0 auto' }}>
                          <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem', fontWeight: 'bold' }}>診断時の回答内容</h4>
                          
                          {lead.scan_url && (
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '4px', borderLeft: '4px solid var(--color-secondary, #306ad4)' }}>
                              <span style={{ fontWeight: 'bold', marginRight: '0.5rem', color: 'var(--color-text-main)' }}>AI自動診断元のURL:</span>
                              <a href={lead.scan_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary, #306ad4)', textDecoration: 'underline' }}>
                                {lead.scan_url}
                              </a>
                            </div>
                          )}

                          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {questions.map(q => {
                              const ansKeys = lead.answers?.[q.id] || [];
                              const ansLabels = ansKeys.map(k => q.options.find(o => o.id === k)?.label || k).join('、 ');
                              return (
                                <li key={q.id}>
                                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>{q.title}</div>
                                  <div style={{ color: ansLabels ? 'var(--color-secondary, #306ad4)' : 'var(--color-text-light)' }}>
                                    {ansLabels || '（未回答）'}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <a href="#" className="btn-outline" style={{ display: 'inline-block' }}>診断ページに戻る</a>
      </div>
    </div>
  );
}
