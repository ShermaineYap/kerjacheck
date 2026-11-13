// Red-flag rules, written from public PDRM/CCID, NSRC and Bank Negara advisories
// and Malaysian news reports on job scams and money-mule recruitment.
// Each rule explains itself in English and Malay.

export type RuleCategory = "mule" | "job_scam" | "caution";

export interface Rule {
  id: string;
  category: RuleCategory;
  weight: number; // 1 = strong red flag on its own, 0.5 = supporting signal
  title: { en: string; ms: string };
  why: { en: string; ms: string };
  patterns: RegExp[];
  /** if set, the rule only fires when this also matches somewhere in the message */
  requires?: RegExp;
  /** if set, the rule does not fire when this matches (a legitimate context) */
  unless?: RegExp;
}

const ACCT = /\b(account|acc|akaun|akaun bank|bank acc\w*|e-?wallet|tng|touch\s?'?n\s?go|duitnow|boost|grabpay|shopeepay)\b/i;

export const RULES: Rule[] = [
  {
    id: "receive-forward",
    category: "mule",
    weight: 1,
    title: { en: "Receive money and pass it on", ms: "Terima wang dan pindahkan semula" },
    why: {
      en: "Real employers never route customer money through a worker's personal account. Receiving funds and forwarding them is exactly how mule accounts move stolen money, and the account holder is the one investigated.",
      ms: "Majikan sebenar tidak akan menyalurkan wang pelanggan melalui akaun peribadi pekerja. Terima dan pindahkan wang ialah cara akaun keldai digunakan, dan pemilik akaun yang akan disiasat.",
    },
    patterns: [
      /\b(receiv\w*|terima|collect\w*|kutip\w*|incoming|duit masuk|wang masuk|(?:money|payments?|funds?|duit|wang) (?:will )?(?:come|comes|coming|masuk) (?:in)?(?:to|into|ke)?|deposits? in|transfers? (?:to|into) (?:your|ur) (?:bank )?(?:account|acc)|(?:send|transfer|bank in|bayar|pay)\w* (?:money |duit |wang |funds? )?(?:to|into|ke) (?:your|ur) (?:bank )?(?:account|acc|akaun)|(?:to|into|ke dalam|dalam|ke) akaun (?:anda|awak|akak|abang|kamu))\b[^.!?\n]{0,90}?\b(transfer\w*|forward\w*|pindah\w*|remit\w*|pay(?:s|ing)? out|send (?:it|them|back|out|to)|withdraw\w*|keluarkan|reload|bank in)\b/gi,
      /\b(transfer|send)\w* (?:in|masuk)\b[^.!?\n]{0,40}\b(transfer|send|pindah)\w* (?:out|keluar)\b/gi,
    ],
    requires: ACCT,
    unless: /\b(at the counter|di kaunter|cash register|cash count|till)\b/i,
  },
  {
    id: "rent-account",
    category: "mule",
    weight: 1,
    title: { en: "Renting, lending or selling a bank account", ms: "Sewa, pinjam atau jual akaun bank" },
    why: {
      en: "Letting someone else use your bank or e-wallet account is an offence. Syndicates pay students RM1,000-RM2,000 for this, then the account is frozen and police reports land on the owner.",
      ms: "Membenarkan orang lain menggunakan akaun bank atau e-dompet anda adalah satu kesalahan. Sindiket membayar pelajar RM1,000-RM2,000, kemudian akaun dibekukan dan laporan polis dibuat ke atas pemilik akaun.",
    },
    patterns: [
      /\b(rent|rental|sewa\w*|sell|jual|lend|lending|pinjam\w*|borrow|use|guna\w*)\b[^.!?\n]{0,30}?\b(bank )?(account|acc|akaun|e-?wallet)s?\b/gi,
      /\b(open|buka|create)\w*\b[^.!?\n]{0,25}?\b(account|akaun)\b[^.!?\n]{0,60}?\b(for (us|our|me|the company)|untuk (kami|syarikat)|pass (us|me)|bagi (kami|saya))/gi,
    ],
    requires: /\b(rm ?\d|pay|bayar|dapat|earn|komisen|commission|get|cash|duit|gaji|salary|reward)/i,
  },
  {
    id: "credentials",
    category: "mule",
    weight: 1,
    title: { en: "Asks for your ATM card, PIN, banking login or TAC/OTP", ms: "Minta kad ATM, PIN, login perbankan atau TAC/OTP" },
    why: {
      en: "No job needs your ATM card, PIN, online-banking password or TAC. Whoever holds them controls your account, and you remain legally responsible for what passes through it.",
      ms: "Tiada pekerjaan memerlukan kad ATM, PIN, kata laluan perbankan dalam talian atau TAC anda. Sesiapa yang memegangnya mengawal akaun anda, dan anda tetap bertanggungjawab di sisi undang-undang.",
    },
    patterns: [
      /\b(atm card|kad atm|bank card|debit card|kad debit|online banking (id|login|password|username)|(password|kata laluan) (online banking|perbankan)|banking login|internet banking (id|password)|tac|otp|pin number|card and pin|kad dan pin)\b/gi,
    ],
  },
  {
    id: "register-for-them",
    category: "mule",
    weight: 1,
    title: { en: "Register a company or account in your name for them", ms: "Daftar syarikat atau akaun atas nama anda untuk mereka" },
    why: {
      en: "Shell companies and accounts opened in a student's name are used to launder scam money. The name on the registration is the person police come to.",
      ms: "Syarikat dan akaun yang dibuka atas nama pelajar digunakan untuk mengubah wang haram. Nama pada pendaftaran itulah yang akan dicari polis.",
    },
    patterns: [
      /\b(atas nama (awak|anda|kau|you)|in your name|under your name)\b/gi,
      /\b(daftar|register)\w*\b[^.!?\n]{0,30}\b(ssm|syarikat|company)\b/gi,
    ],
    requires: /\b(rm ?\d|bayar|pay|dapat|earn|komisen|commission|reward)/i,
  },
  {
    id: "crypto-conversion",
    category: "mule",
    weight: 1,
    title: { en: "Convert money to crypto and send it on", ms: "Tukar wang kepada kripto dan hantar" },
    why: {
      en: "'OTC trader' or 'USDT agent' jobs that put other people's money through your account and out as crypto are a common laundering route.",
      ms: "Kerja 'pedagang OTC' atau 'ejen USDT' yang menyalurkan wang orang lain melalui akaun anda dan keluar sebagai kripto ialah cara biasa pengubahan wang haram.",
    },
    patterns: [/\b(usdt|crypto|kripto|otc|p2p|bitcoin|btc)\b[^.!?\n]{0,90}\b(wallet|send|hantar|transfer|account|akaun)\b/gi],
    requires: ACCT,
  },
  {
    id: "payment-agent-title",
    category: "mule",
    weight: 0.6,
    title: { en: "'Payment / collection agent' job title", ms: "Jawatan 'ejen bayaran / kutipan'" },
    why: {
      en: "Mule recruiters disguise the work as 'payment agent', 'collection agent', 'finance assistant' or 'payment processing'. Check whether the job is really moving money through your own account.",
      ms: "Perekrut akaun keldai menyamarkan kerja sebagai 'ejen bayaran', 'ejen kutipan', 'pembantu kewangan' atau 'pemprosesan bayaran'. Semak sama ada kerja itu sebenarnya memindahkan wang melalui akaun anda sendiri.",
    },
    patterns: [
      /\b(payment|collection|transaction|remittance) (agent|processing|processor|staff|handler)s?\b/gi,
      /\bejen (bayaran|kutipan|transaksi|pembayaran)\b/gi,
      /\b(personal|own|peribadi|sendiri) (bank )?(account|akaun)\b/gi,
    ],
  },
  {
    id: "upfront-fee",
    category: "job_scam",
    weight: 1,
    title: { en: "You must pay before you can earn", ms: "Perlu bayar sebelum boleh dapat duit" },
    why: {
      en: "Deposits, 'top-ups', registration, training, activation or 'unlock' fees are the core of job scams. Police warn that any job asking for advance payment should be treated as a scam.",
      ms: "Deposit, 'top-up', yuran pendaftaran, latihan, pengaktifan atau 'unlock' ialah teras penipuan kerja. Polis memberi amaran bahawa kerja yang meminta bayaran pendahuluan perlu dianggap penipuan.",
    },
    patterns: [
      /\b(deposit|top[- ]?up(?! agent)|recharge|registration fee|register fee|yuran|processing fee|activation( fee)?|pengaktifan|training fee|starter kit|working capital|modal kerja|unlock fee|withdrawal fee|tax fee|admin fee|membership fee|joining fee|uniform deposit|license fee)\b/gi,
      /\b(pay|bayar)\b[^.!?\n]{0,30}\b(first|dulu|dahulu|before (you|u) (start|can)|to (activate|unlock|start|register|join|withdraw|continue))\b/gi,
      /\b(beli|buy|purchase)\b[^.!?\n]{0,20}\b(starter kit|kit|software|license|package)\b[^.!?\n]{0,30}\b(before|sebelum|first|dulu)\b/gi,
    ],
    requires: /\b(job|kerja|work|task|tugas\w*|earn|gaji|salary|commission|komisen|income|position|jawatan|hiring|member|account|akaun|withdraw)\b/i,
  },
  {
    id: "own-money-orders",
    category: "job_scam",
    weight: 1,
    title: { en: "Buy orders with your own money for commission", ms: "Beli pesanan dengan duit sendiri untuk komisen" },
    why: {
      en: "'Order booster', 'product review' and 'rating' jobs pay small commissions at first, then the amounts grow until you can't withdraw.",
      ms: "Kerja 'order booster', ulasan produk dan 'rating' membayar komisen kecil pada mulanya, kemudian jumlahnya bertambah sehingga anda tidak dapat mengeluarkan wang.",
    },
    patterns: [
      /\b(own money|own balance|own fund|(?:using|use|guna) (?:your|ur) (?:own )?money|duit sendiri|wang sendiri|pay first|bayar dulu|you pay first)\b[^.!?\n]{0,90}\b(refund|reimburs\w*|commission|komisen|cashback|claim)/gi,
      /\b(order|orders|pesanan|purchase|buy)\b[^.!?\n]{0,60}\b(commission|komisen|cashback)\b/gi,
      /\b(negative balance|baki negatif|frozen|dibekukan)\b/gi,
    ],
  },
  {
    id: "click-tasks",
    category: "job_scam",
    weight: 0.7,
    title: { en: "Paid to like, share, follow or review", ms: "Dibayar untuk like, share, follow atau ulasan" },
    why: {
      en: "Police specifically warn about 'like and share' and review-task jobs. They start with tiny payouts to build trust before asking for deposits.",
      ms: "Polis memberi amaran khusus tentang kerja 'like dan share' dan tugasan ulasan. Ia bermula dengan bayaran kecil untuk membina kepercayaan sebelum meminta deposit.",
    },
    patterns: [
      /\b(like|likes|share|follow|subscribe|review|reviews|rating|rate|tekan like|screenshot|ulasan)\b[^.!?\n]{0,60}\b(rm ?\d+|earn|gaji|commission|komisen|per (like|review|task|screenshot)|setiap)\b/gi,
      /\b(vip|task group|task package|tugasan seterusnya|level \d)\b/gi,
      /\b(rm ?\d+|gaji|salary)\b[^.!?\n]{0,40}\b(likes?|share|reviews?|rating|follow|subscribe)\b/gi,
    ],
  },
  {
    id: "guaranteed-returns",
    category: "job_scam",
    weight: 1,
    title: { en: "Guaranteed or unrealistic returns", ms: "Pulangan dijamin atau tidak realistik" },
    why: {
      en: "Nobody can guarantee profit. 'Invest RM500, get RM1,500 in two hours' is the hook of investment and task scams, which caused the largest losses in Malaysia last year.",
      ms: "Tiada siapa boleh menjamin keuntungan. 'Laburkan RM500, dapat RM1,500 dalam dua jam' ialah umpan penipuan pelaburan dan tugasan, yang menyebabkan kerugian terbesar di Malaysia tahun lalu.",
    },
    patterns: [
      /\b(guarantee\w*|dijamin|jaminan untung|confirm (profit|untung)|sure (profit|win)|passive income|auto[- ]?trade|double (your|ur) money|\d+% (profit|return|pulangan))\b/gi,
      /\b(transfer|pay|bayar|deposit|top[- ]?up)\s*rm ?[\d,]+[^.!?\n]{0,25}\b(receive|get|dapat|return|terima)\s*rm ?[\d,]+/gi,
      /\b(invest|labur)\w*\b[^.!?\n]{0,40}\b(get|dapat)\b[^.!?\n]{0,30}\brm ?\d/gi,
    ],
  },
  {
    id: "id-before-interview",
    category: "job_scam",
    weight: 1,
    title: { en: "Wants your IC or bank details before any interview", ms: "Minta IC atau butiran bank sebelum temuduga" },
    why: {
      en: "A copy of your IC, a selfie and bank details are enough to open accounts in your name. Real employers collect them after an offer, through HR, not over chat.",
      ms: "Salinan IC, swafoto dan butiran bank sudah cukup untuk membuka akaun atas nama anda. Majikan sebenar mengambilnya selepas tawaran dibuat, melalui HR, bukan melalui chat.",
    },
    patterns: [
      /\b(ic|mykad|identity card|kad pengenalan|ic photo|ic front|selfie|swafoto)\b[^.!?\n]{0,80}\b(bank (account|details|acc)|akaun bank|butiran bank)\b/gi,
      /\b(no interview|without interview|tanpa temuduga|tak perlu temuduga|tidak perlu temuduga)\b/gi,
    ],
    unless: /\b(bring|first day|hari pertama|bawa|payroll|onboarding|on-boarding|after (the |your )?(offer|interview))\b/i,
  },
  {
    id: "too-easy-pay",
    category: "caution",
    weight: 0.5,
    title: { en: "High pay for very little work", ms: "Gaji tinggi untuk kerja yang terlalu mudah" },
    why: {
      en: "Pay of RM100+ a day for a few minutes on your phone is far above what part-time work in Malaysia pays. Ask what the work really is.",
      ms: "Bayaran RM100+ sehari untuk beberapa minit di telefon jauh melebihi gaji kerja sambilan di Malaysia. Tanya apa sebenarnya kerja itu.",
    },
    patterns: [
      /\b(easy|simple|mudah|senang|10 minutes|few minutes|1-2 hours?|from (your |ur )?phone|guna phone|no skill|tanpa kemahiran)\b[^\n]{0,80}\brm ?\d{3,}/gi,
      /\brm ?\d{3,}\b[^\n]{0,60}\b(easy|simple|mudah|senang|10 minutes|few minutes|1-2 hours?|from (your |ur )?phone)\b/gi,
    ],
  },
  {
    id: "private-channel",
    category: "caution",
    weight: 0.4,
    title: { en: "Moves you to Telegram or a private chat", ms: "Bawa anda ke Telegram atau chat peribadi" },
    why: {
      en: "Scammers move conversations to Telegram or private chats where they can delete messages and change identities. Check the company through its official website or SSM.",
      ms: "Penipu memindahkan perbualan ke Telegram atau chat peribadi supaya boleh padam mesej dan tukar identiti. Semak syarikat melalui laman web rasmi atau SSM.",
    },
    patterns: [/\b(telegram|wechat|line id|signal app|@hr_\w+|hr on telegram)\b/gi],
  },
  {
    id: "unsolicited-offer",
    category: "caution",
    weight: 0.4,
    title: { en: "You were 'selected' without applying", ms: "Anda 'terpilih' tanpa memohon" },
    why: {
      en: "Messages saying you were selected, or that they found your resume online, are a common opener. Did you actually apply?",
      ms: "Mesej yang mengatakan anda terpilih, atau mereka jumpa resume anda dalam talian, ialah pembuka biasa. Adakah anda memohon?",
    },
    patterns: [
      /\b(you (are|have been) selected|you('| a)re selected|congratulations?,? (you|your application)|found your (resume|cv) online|anda telah dipilih|tahniah,? anda)\b/gi,
    ],
  },
  {
    id: "pressure",
    category: "caution",
    weight: 0.3,
    title: { en: "Pressure to act fast", ms: "Desakan untuk bertindak cepat" },
    why: {
      en: "'Limited slots' and 'reply now' are used to stop you checking. A real job will still be there after you verify it.",
      ms: "'Slot terhad' dan 'balas sekarang' digunakan supaya anda tidak sempat menyemak. Kerja sebenar masih ada selepas anda membuat semakan.",
    },
    patterns: [/\b(limited slots?|slot terhad|act now|reply (yes|now)|cepat sebelum|fast fast|first come first serve|dm now|pm cepat)\b/gi],
  },
];

export interface RuleHit {
  rule: Rule;
  spans: { start: number; end: number; text: string }[];
}

export function runRules(text: string): RuleHit[] {
  const hits: RuleHit[] = [];
  for (const rule of RULES) {
    if (rule.requires && !rule.requires.test(text)) continue;
    if (rule.unless && rule.unless.test(text)) continue;
    const spans: RuleHit["spans"] = [];
    for (const p of rule.patterns) {
      p.lastIndex = 0;
      for (const m of text.matchAll(p)) {
        if (m.index === undefined) continue;
        spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
      }
    }
    if (spans.length) hits.push({ rule, spans });
  }
  return hits;
}
