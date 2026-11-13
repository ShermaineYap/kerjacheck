**Try it:** https://kerjacheck.vercel.app · **Code:** https://github.com/ShermaineYap/kerjacheck · **Pathway:** Hackathon

## Inspiration

In October 2026, a 22-year-old final-year student in Kuching took an online "accounting job" paying RM100 a day. Her task was to receive money into her own bank account and transfer it on. Three police reports were later lodged against that account, and the money she passed on came from other people's losses ([Malay Mail](https://www.malaymail.com/news/malaysia/2026/10/04/final-year-student-falls-for-rm100-a-day-accounting-job-that-turned-her-bank-account-into-a-mule-account/237609)).

I'm a university student in Malaysia, and offers like this land in student WhatsApp and Telegram groups all the time. Scam syndicates now *recruit* students as well as robbing them.

## The problem

- Malaysians lost **RM2.77 billion** to online scams in 2025, up from RM1.57 billion in 2024 ([Malay Mail](https://www.malaymail.com/amp/news/malaysia/2026/05/16/malaysia-scam-losses-surge-from-rm128b-in-2023-to-rm277b-in-2025-investment-fraud-leads-cases-says-deputy-minister/220167)).
- The Home Minister says syndicates offer university students **RM1,000–RM2,000** to use their bank accounts as mule accounts ([The Sun](https://thesun.my/news/malaysia-news/people-issues/students-targeted-as-money-mule-account)).
- Police warn about "like and share" part-time jobs that end with a request for an upfront "top-up" ([FMT](https://www.freemalaysiatoday.com/category/nation/2026/04/07/bukit-aman-warns-of-like-and-share-approach-in-online-job-scams)).

The police tool, **Semak Mule**, checks whether a bank account, phone number or company has *already been reported* ([Malay Mail](https://malaymail.com/news/malaysia/2026/11/09/fighting-scammers-with-ai-and-data-how-budget-2027-is-sharpening-malaysias-cybercrime-defences/241923)). It can't read a new job offer and tell a student that saying yes would make them the mule. That earlier moment, before the student replies, is the one KerjaCheck is built for.

**Intended users:** Malaysian secondary and university students looking for part-time income, plus the friends, parents and campus advisors they forward suspicious offers to.

## What it does

1. **Paste the offer** you received on WhatsApp, Telegram or social media.
2. **See the red flags marked** like a teacher marks an exam paper. The exact dangerous phrases are highlighted and numbered with a red pen: "payments will come into your personal bank account, then you transfer", "top-up RM100 to unlock VIP", "send IC front & back + bank details, no interview".
3. **Understand why.** Each flag gets a plain-language explanation in **English or Bahasa Melayu**. KerjaCheck also separates **money-mule recruitment** (they use *your account*) from **job scams** (they take *your money*), because the consequences and next steps are different.
4. **Know what to do next:** check the number or account on Semak Mule (PDRM), call **997** (National Scam Response Centre) if money or account details were already shared, or look the company up on SSM e-Search.

**Privacy by design:** everything runs in the browser. There's no server and no API, and nothing you paste is sent or stored. That matters for a tool people use on messages containing names, phone numbers and amounts.

## How we built it

- **15 explainable red-flag rules** in English, Malay and Manglish, based on how PDRM/CCID, NSRC, Bank Negara and Malaysian news describe these schemes. The flags cover receiving and forwarding money, renting accounts, ATM cards, PINs and TAC, registering companies in your name, crypto conversion, upfront fees and top-ups, buying orders with your own money, like/share tasks, guaranteed returns, and asking for your IC before any interview. Each rule returns the exact text it matched, which is what gets highlighted. Rules also know some legitimate contexts, such as "bring your IC on the first day for payroll".
- **A trained classifier.** It is a logistic regression on character 3–5-grams, so it copes with "u", "ur", "akaun" and typos, plus words and word pairs, weighted with TF-IDF. It was trained with scikit-learn on 960 labelled messages. I exported it to a 260 KB JSON file and re-implemented the maths in TypeScript, and an automated parity test confirms that Python and TypeScript give identical probabilities (maximum difference about 1e-15).
- **Decision layer.** A strong rule hit flags the message, and the classifier decides between mule and job scam. With no rule hit, the classifier on its own can only raise a caution unless it is at least 85% sure. Each check takes under a millisecond.
- **Interface:** Next.js and TypeScript, mobile-first, deployed on Vercel. Fonts are Atkinson Hyperlegible, chosen for legibility, and Kalam for the "teacher's pen". It is keyboard accessible, respects reduced motion and has a full Bahasa Melayu interface.

## How we tested it (measured, not claimed)

Scoring a model on its own training data proves nothing, so the test messages were written by a **separate process that never saw the rules, the model or the training data**. Each blind set is balanced between real jobs, job scams and mule offers, and about half are deliberately hard cases: real cashier, clerk and freelance jobs full of bank and payment vocabulary, and scams written formally with invented company names. The engine was **committed to Git before each blind run**, so the history shows the order of events.

| Run | Messages | Scams caught | Real jobs wrongly flagged | 3-way accuracy |
|---|---|---|---|---|
| Blind set A, v1 (first look) | 150 | 97.0% | 22.0% | 86.7% |
| Blind set A, v2 (tuned after looking at A, so not independent) | 150 | 98.0% | 8.0% | 94.7% |
| **Blind set B, v2.1 (final, never used for tuning)** | **120** | **96.3%** | **22.5%** | **87.5%** |

On the final set, **rules alone caught 51%** of scams and **the classifier alone caught 96.3%**, wrongly flagging 15% of real jobs. Combining them kept recall at 96.3% but **raised** false alarms to 22.5%, because some rules fire on real jobs. I ship the combination anyway because the rules are what make the result explainable: they produce the highlighted phrases and the reasons, which a probability alone can't give. Cutting the rules' false alarms is the top item under "What's next". All three runs, the confusion matrix and the scripts are in the repo and on the app's "How we tested it" page.

## Challenges

- **Real jobs talk about money too.** My first version flagged 22% of real jobs on blind set A because the classifier learned that "bank account" means danger. Broadening the training data with real cashier, clerk, freelancer and e-wallet support jobs brought that down on set A. The fresh set B then showed the problem isn't solved: the rules can't yet tell "you receive a client's deposit for your work" from "you receive deposits and forward them".
- **Keeping the evaluation honest.** After I tuned on set A, its numbers no longer counted, so I commissioned a second blind set and report that one as the final result.

## Honest limitations

- All messages are synthetic or paraphrased from news reports, and the test sets were written by an AI model following public descriptions of scams, not collected from victims. Real-world accuracy will be lower.
- On the final set, 9 of 40 real jobs got a warning (2 as "be careful"). 7 of these were deliberately hard cases where money flows *to* the student.
- 3 of 80 scams were missed: a fully formal Malay "product evaluator" job, a Manglish DuitNow cash-out, and an onboarding message asking for an IC selfie.
- "No red flags" never means "safe", and the app always shows how to verify. Chinese and Tamil scripts are not supported yet.

## What's next (feasibility and scalability)

- **Teach the rules which way money flows**, which is the main cause of false alarms.
- **A Telegram/WhatsApp-forward bot**, so students can check an offer where it arrives.
- **Opt-in reporting** of real messages, to retrain on actual scams with consent.
- **Campus pilots** with student affairs offices. The app costs nothing to run because it is a static site, and the model updates by shipping a new JSON file.

## Built with

Next.js · TypeScript · React · Python · scikit-learn · Vercel · Playwright · ffmpeg · Piper TTS

## AI and third-party disclosure

- I used Claude (Anthropic) as an AI coding assistant to build this project. The blind test sets were generated by separate Claude instances that had no access to the code.
- The demo video narration is AI text-to-speech (Piper, voice "lessac").
- No external API is called at runtime. Fonts: Atkinson Hyperlegible and Kalam (SIL Open Font License).
