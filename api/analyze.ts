import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // 1. Scrape the URL
    console.log(`Scraping URL: ${url}`);
    
    let fetchResponse;
    try {
      fetchResponse = await fetch(url.startsWith('http') ? url : `https://${url}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        },
      });
    } catch (networkError: any) {
      console.error('Network error during fetch:', networkError);
      throw new Error(`サイトへのアクセスに失敗しました。URLが間違っているか、サイトが存在しない可能性があります。(${networkError.message})`);
    }

    if (!fetchResponse.ok) {
      throw new Error(`サイトからエラーが返されました: ${fetchResponse.status} ${fetchResponse.statusText}`);
    }

    const html = await fetchResponse.text();
    const $ = cheerio.load(html);

    // Remove noisy elements to extract clean text
    $('script, style, noscript, iframe, img, svg, video, footer, nav, header').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000); // 8k chars limit for token safety

    if (!textContent || textContent.length < 50) {
      throw new Error('Not enough readable text found on the website to perform analysis.');
    }

    console.log(`Extracted text length: ${textContent.length} characters`);

    // 2. Analyze with OpenAI
    const prompt = `
以下のテキストはある企業のWebサイトから抽出した文章です。
この会社が補助金を申請する前提で、以下の6つの質問に対する最も当てはまる回答と、その会社におすすめの補助金活用プラン（提案テキスト）をJSONフォーマットで推測して出力してください。
会社情報が読み取れない項目や不明な項目は、一番一般的（または無難）な選択肢を選んでください。

【Webサイトのテキスト】
${textContent}

【回答すべき項目と選択肢】
1. 従業員数（ID: q1）
選択肢:
- "1" (0名（一人社長・フリーランス）)
- "2" (1〜5名)
- "3" (6〜20名)
- "4" (21〜50名)
- "5" (51名以上)

2. 業種（ID: q2）
選択肢:
- "1" (IT・通信)
- "2" (飲食・宿泊)
- "3" (小売・卸売)
- "4" (製造・建設)
- "5" (医療・福祉)
- "6" (美容・サロン)
- "7" (士業・コンサルティング)
- "8" (その他サービス業)

3. 予定している取り組み（複数選択可）（ID: q3）
※最低1つ、最大4つまで選んでください。
選択肢:
- "1" (ITツールの導入（会計・決済など）)
- "2" (新規事業・サービスの展開)
- "3" (Webサイト・ECサイトの制作)
- "4" (機械設備・システムの導入)
- "5" (店舗の改装・設備の刷新)
- "6" (正社員の新規雇用)
- "7" (非正規社員の正社員化・処遇改善)
- "8" (テレワーク環境の整備)
- "9" (従業員の教育・研修)

4. 予算（自己資金）（ID: q4）
選択肢:
- "1" (50万円未満)
- "2" (50万円〜100万円未満)
- "3" (100万円〜500万円未満)
- "4" (500万円〜1000万円未満)
- "5" (1000万円以上)
※推測が難しければ "3" を選んでください。

5. 実施時期（ID: q5）
選択肢:
- "1" (すでに実施済み)
- "2" (3ヶ月以内)
- "3" (半年以内)
- "4" (1年以内)
- "5" (未定)
※推測が難しければ "3" を選んでください。

6. 創業年数（ID: q6）
選択肢:
- "1" (これから創業（1年未満含む）)
- "2" (1〜2年未満)
- "3" (2〜5年未満)
- "4" (5〜10年未満)
- "5" (10年以上)

【出力形式（厳守）】
以下のJSONスキーマに完全に従って出力してください。その他のテキストは一切含めないでください。

{
  "q1": ["選択したプロパティの番号 (例: '3')"],
  "q2": ["選択したプロパティの番号 (例: '1')"],
  "q3": ["選択したプロパティの番号1", "選択したプロパティの番号2", ...],
  "q4": ["選択したプロパティの番号"],
  "q5": ["選択したプロパティの番号"],
  "q6": ["選択したプロパティの番号"],
  "aiProposal": "サイトの情報から読み取れる企業の特徴に基づき、高額な補助金が見込める野心的な事業計画（例：『AIケアプラン自動作成事業（2000万補助）』『介護施設AI経営ダッシュボード（1500万補助）』など）を箇条書きで3〜4つ提案してください。その際、各提案に対して活用を想定する具体的な補助金名（例：『事業再構築補助金』『ものづくり補助金』『IT導入補助金』『省力化投資補助金』など）を必ず明記してください。最後は必ず『これ、うまく設計すれば\n3000万〜1億補助取れる可能性あります。』という強気な文章で締めくくってください。"
}
`;

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Low temperature for deterministic output
    });

    const resultText = response.choices[0].message.content;
    if (!resultText) {
      throw new Error('Empty response from OpenAI');
    }

    const resultJson = JSON.parse(resultText);
    console.log('Analysis complete:', resultJson);

    return res.status(200).json(resultJson);

  } catch (error: any) {
    console.error('Error during URL analysis:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
