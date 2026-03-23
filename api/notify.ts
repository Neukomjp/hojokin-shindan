import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !adminEmail) {
    console.error('Missing RESEND_API_KEY or ADMIN_EMAIL environment variable');
    return res.status(500).json({ error: 'Email configuration is missing' });
  }

  try {
    const { companyName, phone, email, maxAmount, scanUrl } = req.body;

    if (!companyName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resend = new Resend(apiKey);

    const diagnosisType = scanUrl ? `AI自動診断（${scanUrl}）` : '手動アンケート診断';
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    const { error } = await resend.emails.send({
      from: '補助金診断システム <onboarding@resend.dev>',
      to: adminEmail,
      subject: `【新規リード】${companyName} 様が補助金診断を完了しました`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2E7D32, #43A047); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">📋 新規リード通知</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
              新しいお問い合わせがありました。
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 8px; font-weight: bold; color: #555; width: 140px;">登録日時</td>
                <td style="padding: 12px 8px; color: #333;">${now}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee; background: #f9f9f9;">
                <td style="padding: 12px 8px; font-weight: bold; color: #555;">会社名</td>
                <td style="padding: 12px 8px; color: #333; font-weight: bold;">${companyName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 8px; font-weight: bold; color: #555;">電話番号</td>
                <td style="padding: 12px 8px; color: #333;">${phone || '未入力'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee; background: #f9f9f9;">
                <td style="padding: 12px 8px; font-weight: bold; color: #555;">メール</td>
                <td style="padding: 12px 8px; color: #333;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 8px; font-weight: bold; color: #555;">受給見込み額</td>
                <td style="padding: 12px 8px; color: #2E7D32; font-weight: bold; font-size: 18px;">${maxAmount || 0}万円</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 12px 8px; font-weight: bold; color: #555;">診断方法</td>
                <td style="padding: 12px 8px; color: #333;">${diagnosisType}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://hojokin-shindan-five.vercel.app/#admin"
                style="display: inline-block; background: #2E7D32; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                管理画面で詳細を確認 →
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #999; font-size: 11px; margin-top: 16px;">
            補助金診断システムからの自動通知メールです
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
