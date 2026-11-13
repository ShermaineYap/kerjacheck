export type Lang = "en" | "ms";

export const T = {
  en: {
    tagline: "Job offer checker for students",
    h1: "Got a part-time job offer on WhatsApp? Check it before you reply.",
    lede: "Paste the message. KerjaCheck marks the red flags the way a teacher marks a paper, and tells you what to do next. What you paste never leaves your phone.",
    label: "The job offer you received",
    placeholder: "Paste the whole message here, including the pay and what they ask you to do…",
    check: "Check this offer",
    clear: "Clear",
    tryExample: "No message handy? Try one:",
    emptyError: "Paste a message first. Even a few lines is enough.",
    verdict: {
      mule: "This looks like money-mule recruitment.",
      job_scam: "This looks like a job scam.",
      caution: "Be careful with this one.",
      clear: "No red flags found.",
    },
    verdictSub: {
      mule: "If you say yes, your bank account could be used to move scam money. The account gets frozen and police reports are made against you, not them.",
      job_scam: "They will ask for your money or your personal details before you ever get paid.",
      caution: "Some things don't add up. Check the company before you reply or share anything.",
      clear: "That doesn't prove it's real. Do the quick checks below before you share your IC or bank details.",
    },
    risk: "Risk",
    marked: "Your message, marked",
    nothingMarked: "Nothing in the wording matched a known red-flag pattern.",
    flags: "What we found",
    modelNote: (p: number) => `The trained classifier rates this ${p}% likely to be a scam or mule offer, based on wording seen in known cases.`,
    modelWords: "Words that pushed the score up:",
    next: "What to do now",
    actions: {
      danger: [
        { t: "Don't send money, your IC, or your bank details. Don't reply 'yes'.", href: "" },
        { t: "Check their phone number, bank account or company on Semak Mule (PDRM).", href: "https://semakmule.rmp.gov.my/" },
        { t: "Already sent money or shared your account? Call the National Scam Response Centre at 997 now.", href: "tel:997" },
        { t: "Tell a friend who might get the same message. Scammers reuse them.", href: "" },
      ],
      safe: [
        { t: "Look up the company on SSM e-Search to confirm it is registered.", href: "https://www.ssm-einfo.my/" },
        { t: "Check the recruiter's phone number on Semak Mule (PDRM).", href: "https://semakmule.rmp.gov.my/" },
        { t: "A real employer never asks you to pay first, or to let their money pass through your account.", href: "" },
      ],
    },
    privacy: "Runs entirely in your browser. Nothing you paste is sent or stored.",
    how: "How it works and how we tested it",
    back: "Back to the checker",
    disclaimer: "KerjaCheck gives guidance, not legal advice. When in doubt, call 997.",
  },
  ms: {
    tagline: "Penyemak tawaran kerja untuk pelajar",
    h1: "Dapat tawaran kerja sambilan di WhatsApp? Semak dulu sebelum balas.",
    lede: "Tampal mesej itu. KerjaCheck menanda tanda bahaya seperti cikgu menanda kertas, dan beritahu apa yang perlu dibuat. Apa yang anda tampal tidak keluar dari telefon anda.",
    label: "Tawaran kerja yang anda terima",
    placeholder: "Tampal keseluruhan mesej di sini, termasuk gaji dan apa yang mereka minta anda buat…",
    check: "Semak tawaran ini",
    clear: "Padam",
    tryExample: "Tiada mesej? Cuba contoh:",
    emptyError: "Tampal mesej dahulu. Beberapa baris pun cukup.",
    verdict: {
      mule: "Ini kelihatan seperti merekrut akaun keldai.",
      job_scam: "Ini kelihatan seperti penipuan kerja.",
      caution: "Berhati-hati dengan tawaran ini.",
      clear: "Tiada tanda bahaya ditemui.",
    },
    verdictSub: {
      mule: "Jika anda setuju, akaun bank anda boleh digunakan untuk memindahkan wang penipuan. Akaun dibekukan dan laporan polis dibuat ke atas anda, bukan mereka.",
      job_scam: "Mereka akan minta wang atau maklumat peribadi anda sebelum anda dibayar.",
      caution: "Ada perkara yang tidak kena. Semak syarikat itu sebelum membalas atau berkongsi apa-apa.",
      clear: "Itu tidak membuktikan ia benar. Buat semakan ringkas di bawah sebelum berkongsi IC atau butiran bank.",
    },
    risk: "Risiko",
    marked: "Mesej anda, sudah ditanda",
    nothingMarked: "Tiada perkataan yang sepadan dengan corak tanda bahaya yang diketahui.",
    flags: "Apa yang kami jumpa",
    modelNote: (p: number) => `Pengelas terlatih menilai mesej ini ${p}% berkemungkinan penipuan atau tawaran akaun keldai, berdasarkan perkataan dalam kes yang diketahui.`,
    modelWords: "Perkataan yang menaikkan skor:",
    next: "Apa perlu dibuat sekarang",
    actions: {
      danger: [
        { t: "Jangan hantar wang, IC atau butiran bank. Jangan balas 'ya'.", href: "" },
        { t: "Semak nombor telefon, akaun bank atau syarikat mereka di Semak Mule (PDRM).", href: "https://semakmule.rmp.gov.my/" },
        { t: "Sudah hantar wang atau kongsi akaun? Hubungi Pusat Respons Scam Kebangsaan di 997 sekarang.", href: "tel:997" },
        { t: "Beritahu kawan yang mungkin terima mesej sama. Penipu guna semula mesej mereka.", href: "" },
      ],
      safe: [
        { t: "Cari syarikat itu di SSM e-Search untuk pastikan ia berdaftar.", href: "https://www.ssm-einfo.my/" },
        { t: "Semak nombor telefon perekrut di Semak Mule (PDRM).", href: "https://semakmule.rmp.gov.my/" },
        { t: "Majikan sebenar tidak akan minta anda bayar dahulu, atau salurkan wang mereka melalui akaun anda.", href: "" },
      ],
    },
    privacy: "Berjalan sepenuhnya dalam pelayar anda. Apa yang anda tampal tidak dihantar atau disimpan.",
    how: "Cara ia berfungsi dan cara kami mengujinya",
    back: "Kembali ke penyemak",
    disclaimer: "KerjaCheck memberi panduan, bukan nasihat undang-undang. Jika ragu, hubungi 997.",
  },
} as const;

export const EXAMPLES = [
  {
    name: { en: "RM100/day 'accounting' job", ms: "Kerja 'akaun' RM100 sehari" },
    text: "Hi dear 😊 We are hiring part-time online accounting assistant, work from home, RM100 per day paid daily. Very simple job: customer payments will come into your personal bank account, then you transfer to the company accounts we give you. Only need Maybank or CIMB account. Interested pls WhatsApp me, limited slots!",
  },
  {
    name: { en: "Like & follow task", ms: "Tugasan like & follow" },
    text: "Kerja part time dari rumah 📱 Hanya perlu follow dan like page Instagram, setiap screenshot dapat RM10! Gaji sehari boleh sampai RM300. Lepas 5 task pertama, kena top-up RM100 untuk naik level VIP dan dapat komisen lebih tinggi. PM cepat, slot terhad.",
  },
  {
    name: { en: "Café crew, Bukit Jalil", ms: "Krew kafe, Bukit Jalil" },
    text: "We're hiring part-time crew for our café in Bukit Jalil! RM9.50/hour, weekends and public holidays. Take orders, prepare drinks, keep the counter clean. Training provided, meals included. Salary is paid monthly into your bank account. Walk in with your resume any weekday 2-5pm and ask for Aina, or apply on JobStreet.",
  },
];
