export type Option = {
  id: string;
  label: string;
};

export type Question = {
  id: string;
  title: string;
  type: 'radio' | 'checkbox';
  options: Option[];
};

export const questions: Question[] = [
  {
    id: 'employeeCount',
    title: '1. 現在の従業員数（役員、パートアルバイト含む）を教えてください。',
    type: 'radio',
    options: [
      { id: '0名', label: '0名' },
      { id: '1-5名', label: '1〜5名' },
      { id: '6-20名', label: '6〜20名' },
      { id: '21-50名', label: '21〜50名' },
      { id: '51-100名', label: '51〜100名' },
      { id: '101-300名', label: '101〜300名' },
      { id: '301名以上', label: '301名以上' }
    ]
  },
  {
    id: 'industry',
    title: '2. 貴社の業種を教えてください。',
    type: 'radio',
    options: [
      { id: '製造業', label: '製造業' },
      { id: 'サービス業', label: 'サービス業' },
      { id: '情報通信・IT業', label: '情報通信・IT業' },
      { id: '飲食業', label: '飲食業' },
      { id: '小売業', label: '小売業' },
      { id: '建設業', label: '建設業' },
      { id: 'その他', label: 'その他（個人事業主を含む）' }
    ]
  },
  {
    id: 'companyStatus',
    title: '3. 会社の現状について、当てはまるものを全てお選びください。',
    type: 'checkbox',
    options: [
      { id: 'social_insurance', label: '雇用保険、社会保険に加入している' },
      { id: 'no_labor_violations', label: '追加残業未払い・会社都合解雇など、労務違反をしていない' },
    ]
  },
  {
    id: 'businessInitiatives',
    title: '4. 「事業」を成長・改善するために実施したいこと。当てはまるものを全てお選びください。',
    type: 'checkbox',
    options: [
      { id: 'hp_ec', label: 'ホームページ制作・ECサイト・採用サイト等（動画含み）・広告出稿を発注したい' },
      { id: 'new_business', label: '新規事業を立ち上げたい（または直近新規事業を開始したばかり）' },
      { id: 'it_tools', label: 'ITツール・クラウドサービスを導入し、社内をDX化したい' },
      { id: 'ai_dev', label: 'システム・AI開発を発注したい' },
      { id: 'machines_interior', label: '機械設備や内装工事を発注したい' },
      { id: 'ac_lighting', label: '業務用エアコン、照明などを入れ替えたい' },
      { id: 'm_and_a', label: '買い手もしくは売り手として、事業承継やM＆Aに取り組みたい' },
    ]
  },
  {
    id: 'budget',
    title: '5. 機械やシステム等への「設備投資予算」のイメージを教えてください。',
    type: 'radio',
    options: [
      { id: '未定', label: '未定' },
      { id: '150万円未満', label: '150万円未満' },
      { id: '150万円〜300万円', label: '150万円〜300万円' },
      { id: '300万円〜500万円', label: '300万円〜500万円' },
      { id: '500万円〜1,000万円', label: '500万円〜1,000万円' },
      { id: '1,000万円〜', label: '1,000万円〜' }
    ]
  },
  {
    id: 'employeeInitiatives',
    title: '6. 「従業員」に関すること。当てはまるものを全てお選びください。',
    type: 'checkbox',
    options: [
      { id: 'ai_training', label: 'AI研修を導入して業務改善に取り組みたい' },
      { id: 'external_training', label: '外部研修を受講してもらい社員にスキルアップを促したい' },
      { id: 'hire_new', label: '１年以内に正社員またはアルバイトを１名以上雇用する可能性がある' },
      { id: 'childbirth', label: '今後、ご家庭で子供が生まれる可能性がある従業員がいる' },
      { id: 'part_time_improvement', label: 'アルバイトの待遇改善・給与アップなど行い、できるだけ長く働いてもらいたい' },
      { id: 'senior_improvement', label: '60歳以上の待遇改善・給与アップなど行い、できるだけ長く働いてもらいたい' },
    ]
  }
];

export type DiagnosisResult = {
  maxAmount: number;
  subsidyCards: SubsidyCard[];
  employeeSubsidies: string[];
};

export type SubsidyCard = {
  id: string;
  title: string;
  description: string;
  maxAmount: number;
  url: string;
};

export function calculateDiagnosis(answers: Record<string, string[]>): DiagnosisResult {
  let maxAmount = 0;
  const employeeSubsidies: string[] = [];
  const subsidyCards: SubsidyCard[] = [];

  const companyStatus = answers['companyStatus'] || [];
  const hasPrerequisites = companyStatus.includes('social_insurance') && companyStatus.includes('no_labor_violations');
  const employeeInitiatives = answers['employeeInitiatives'] || [];
  
  // Rules for Employee Subsidies (requires prerequisites)
  if (hasPrerequisites) {
    if (employeeInitiatives.includes('ai_training')) {
      maxAmount += 30;
      employeeSubsidies.push('事業展開等リスキリング支援コース（人材開発支援助成金）');
      employeeSubsidies.push('教育訓練休暇等付与コース（人材開発支援助成金）');
    }
    if (employeeInitiatives.includes('external_training')) {
      maxAmount += 30;
      employeeSubsidies.push('教育訓練休暇等付与コース（人材開発支援助成金）');
    }
    if (employeeInitiatives.includes('hire_new')) {
      maxAmount += 80;
      employeeSubsidies.push('正社員化コース（キャリアアップ助成金）');
    }
    if (employeeInitiatives.includes('childbirth')) {
      maxAmount += 82;
      employeeSubsidies.push('出生時両立支援コース（両立支援等助成金）');
      employeeSubsidies.push('育児休業等支援コース（両立支援等助成金）');
    }
    if (employeeInitiatives.includes('part_time_improvement')) {
      maxAmount += 180;
      employeeSubsidies.push('賞与・退職金制度コース（キャリアアップ助成金）');
      employeeSubsidies.push('賃金規定等共通化コース（キャリアアップ助成金）');
      employeeSubsidies.push('正社員化コース（キャリアアップ助成金）');
    }
  }

  const businessInitiatives = answers['businessInitiatives'] || [];
  const budget = answers['budget']?.[0] || '未定';
  const employeeCount = answers['employeeCount']?.[0] || '0名';
  const industry = answers['industry']?.[0] || 'その他';

  // 小規模事業者持続化補助金の判定
  let isSmallBusiness = false;
  const isServiceOrRetail = ['サービス業', '情報通信・IT業', '飲食業', '小売業', 'その他'].includes(industry);
  if (isServiceOrRetail) {
    if (['0名', '1-5名'].includes(employeeCount)) isSmallBusiness = true;
  } else {
    // 建設業、製造業など
    if (['0名', '1-5名', '6-20名'].includes(employeeCount)) isSmallBusiness = true;
  }

  if (isSmallBusiness) {
    subsidyCards.push({
      id: 'syoukibo',
      title: '小規模事業者持続化補助金',
      description: '小規模事業者が、働き方改革や被用者保険の適用拡大、賃金引上げ、インボイス導入等の制度変更に対応するため、経営計画を作成し、それらに基づいて行う販路開拓の取組み等の経費の一部を補助するものです。',
      maxAmount: 250,
      url: 'https://r6.jizokukahojokin.info/'
    });
  }

  subsidyCards.push({
    id: 'syouene',
    title: '省エネルギー投資促進支援事業費補助金',
    description: '業務用エアコンやLED・業務用給湯器等、事前に登録・公表されている指定設備の入替を行う際に使える補助金です。目安として、大体10年以上前の設備の入れ替えが対象になります。',
    maxAmount: 10000,
    url: 'https://syouenehojyokin.sii.or.jp/'
  });

  // IT導入補助金（デジタル化・AI導入補助金）
  if (businessInitiatives.includes('it_tools') && budget !== '未定') {
    subsidyCards.unshift({
      id: 'it_dounyu',
      title: 'IT導入補助金（デジタル化・AI導入等）',
      description: '中小企業・小規模事業者等が業務効率化・売上アップをするためのＩＴツールを導入する場合に補助します。事前に登録されたツール・事業者から選んで導入をおこないます。',
      maxAmount: 350,
      url: 'https://it-shien.smrj.go.jp/'
    });
  }

  // ものづくり補助金
  if (businessInitiatives.includes('machines_interior') && budget !== '未定') {
    let maxMonoAmount = 859;
    if (employeeCount === '6-20名') maxMonoAmount = 1250;
    else if (employeeCount === '21-50名') maxMonoAmount = 2500;
    else if (['51-100名', '101-300名', '301名以上'].includes(employeeCount)) maxMonoAmount = 3500;

    subsidyCards.unshift({
      id: 'monodukuri',
      title: 'ものづくり補助金',
      description: '中小企業・小規模事業者等の生産性向上に資する「革新的な新製品・新サービス開発」や海外需要開拓を行う事業のために必要な設備投資等に要する経費の一部を補助する制度です。',
      maxAmount: maxMonoAmount,
      url: 'http://portal.monodukuri-hojo.jp'
    });
  }

  // 新事業進出補助金
  if (businessInitiatives.includes('new_business')) {
    let maxShinJigyoAmount = 3000;
    if (employeeCount === '21-50名') maxShinJigyoAmount = 5000;
    else if (employeeCount === '51-100名') maxShinJigyoAmount = 7000;
    else if (['101-300名', '301名以上'].includes(employeeCount)) maxShinJigyoAmount = 9000;

    subsidyCards.unshift({
      id: 'shinjigyo',
      title: '新事業進出補助金',
      description: '既存事業とは異なる新たな事業の立ち上げや、業態転換などに必要な設備投資・システム構築費用を補助する制度です。',
      maxAmount: maxShinJigyoAmount,
      url: 'https://jigyou-saikouchiku.go.jp/'
    });
  }

  // 中小企業省力化投資補助金
  if (businessInitiatives.includes('it_tools') || businessInitiatives.includes('machines_interior')) {
    let maxShoryokukaAmount = 1000;
    if (employeeCount === '6-20名') maxShoryokukaAmount = 2000;
    else if (employeeCount === '21-50名') maxShoryokukaAmount = 4000;
    else if (employeeCount === '51-100名') maxShoryokukaAmount = 6500;
    else if (['101-300名', '301名以上'].includes(employeeCount)) maxShoryokukaAmount = 10000;

    subsidyCards.unshift({
      id: 'shoryokuka',
      title: '中小企業省力化投資補助金',
      description: 'IoT、ロボット等の人手不足解消に効果がある汎用製品を導入するための事業費等の経費の一部を補助する制度です。',
      maxAmount: maxShoryokukaAmount,
      url: 'https://shoryokuka.smrj.go.jp/'
    });
  }

  // Deduplicate array
  const uniqueEmployeeSubsidies = Array.from(new Set(employeeSubsidies));

  return {
    maxAmount,
    subsidyCards,
    employeeSubsidies: uniqueEmployeeSubsidies
  };
}
