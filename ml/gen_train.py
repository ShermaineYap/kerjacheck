"""Generate the KerjaCheck TRAINING set from hand-written templates.

These templates were written from public descriptions of how job scams and
money-mule recruitment work in Malaysia (PDRM/CCID, NSRC, Bank Negara advisories
and news reports). They are synthetic. The blind test set is written separately
and never used for training.
"""
import json, random

random.seed(7)

def pick(xs): return random.choice(xs)

PAY_DAY = ["RM80", "RM100", "RM120", "RM150", "RM200", "RM250", "RM300", "RM500", "RM50-RM300", "RM100-RM800"]
PAY_MONTH = ["RM1,500", "RM2,000", "RM3,000", "RM3,500", "RM4,000", "RM5,000", "RM6,800"]
BANKS = ["Maybank", "CIMB", "Public Bank", "RHB", "Hong Leong", "Bank Islam", "AmBank", "BSN", "Bank Rakyat"]
EWALLET = ["TNG eWallet", "Touch 'n Go", "Boost", "GrabPay", "ShopeePay", "DuitNow"]
APPS = ["Telegram", "WhatsApp", "WeChat", "Line"]
GREET = ["Hi", "Hello", "Hai", "Salam", "Dear student", "Hi dear", "Hello 👋", "Assalamualaikum", "Hi there", "Morning", ""]
EMO = ["", "", "", " 🔥", " 💰", " 💯", " ✅", " 😊", " 🙏", " 💸💸", " 📢"]
CONTACT = [
    "PM me for details", "WhatsApp wa.me/60XXXXXXXXX", "Contact HR on Telegram @hr_XXXX",
    "DM now, limited slots", "Reply YES if interested", "Add my WhatsApp 01X-XXX XXXX",
    "Klik link untuk daftar", "Whatsapp saya sekarang", "Text me fast", "Slot terhad, PM cepat",
]
FAKECO = ["Global Pay Solutions Sdn Bhd", "Vertex Trading Enterprise", "Smart Asia Digital", "MY Finance Hub",
          "Golden Bridge Logistics", "Prime Venture Capital", "NextGen Ecommerce", "Sunrise Media Agency",
          "Starlight Marketing", "Unity Payment Services"]

# ------------------------------------------------------------------ MULE
MULE = [
    "{g}! We are hiring part-time finance assistant{e}. Your job: receive customer payments into your personal bank account and transfer to company account. Pay {pd}/day. Only need a {b} account.",
    "Rent your bank account {pm}/month{e}. Safe, no risk, legal. Just pass us your ATM card and online banking ID. {c}",
    "Kerja mudah{e}! Pinjamkan akaun bank anda kepada syarikat kami, dapat {pm} sebulan. Hanya perlu serahkan kad ATM dan password online banking. {c}",
    "Cari student yang ada akaun {b}. Kami bayar {pd} sehari untuk terima duit dari pelanggan dan pindahkan ke akaun syarikat. {c}",
    "Need payment agent to help {co} receive funds from clients and transfer out through {ew}. Earn 3% commission on every transaction{e}. {c}",
    "Want easy money? Sell your unused bank account for {pm} cash{e}. No question asked. {c}",
    "{g}, can you help open a new {b} account for our company? We pay RM800 once done. Need your IC and you pass us the card after. {c}",
    "Crypto OTC trader wanted{e}. Buyers transfer RM into your account, you buy USDT and send to our wallet. Keep 2% per transaction. {c}",
    "Tolong daftar syarikat SSM atas nama awak, kami bayar RM3,000{e}. Lepas tu bagi kami buka akaun bank syarikat. {c}",
    "Part time job: just let us use your bank acc to receive money, then you transfer to my boss. Each time you get RM50{e}. Very simple la. {c}",
    "Collection agent needed. Collect payments from customers into your own account then forward to us within 1 hour. {pd} per day{e}. {c}",
    "{ew} top-up agent: customers transfer to your account, you reload their wallet / forward balance to our merchant account. Earn {pd} daily{e}.",
    "Hi bro, nak duit cepat? Bagi pinjam akaun bank 2 minggu je, dapat RM1,500{e}. Selamat, tak ada risiko. {c}",
    "Accounting job WFH{e}. Duty: check incoming transfers in your account and pay out to suppliers list we send. {pd}/day, paid daily. {c}",
    "{co} is looking for remote payment processing staff. You will receive client deposits in your personal account and remit to our overseas partner. Salary {pm} + bonus{e}.",
    "Need someone to receive my friend's money in your account and withdraw cash for me. I give you RM200{e}. Can ah? {c}",
    "Boleh share TAC/OTP bank dengan kami untuk verify transaksi syarikat? Setiap verification dapat RM30{e}. {c}",
    "Looking for students with {b} or {b2} account. Just need to receive and transfer funds, 10 minutes a day, {pd} per day{e}. {c}",
    "Kerja part time: jadi ejen bayaran. Duit masuk akaun anda, anda transfer semula ke akaun yang kami bagi. Komisen 5%{e}. {c}",
    "Our company cannot open more bank accounts, so we pay students {pm} to use their accounts for our business payments{e}. 100% safe. {c}",
    "Job: buy USDT using money we send to your bank account, then send the USDT to our wallet address. Earn RM50-RM200 per order{e}. {c}",
    "Easy job for students: give us your online banking login, we handle everything, you get {pm} monthly{e}. {c}",
    "{g}! Got job for you. Just need your bank card and pin, we return after 1 month and pay you {pm}{e}. {c}",
    "Ejen kutipan diperlukan. Terima bayaran pelanggan dalam akaun peribadi dan pindahkan kepada syarikat setiap hari. Gaji {pd} sehari{e}.",
    "Finance admin (remote) at {co}. Responsibilities: process incoming payments via your personal account, reconcile and transfer to company within the same day. {pd}/day{e}.",
    "Can lend me your e-wallet account? My account kena limit. I transfer money in, you transfer out to my supplier, I pay you RM100{e}.",
]

# ------------------------------------------------------------------ JOB SCAM
SCAM = [
    "Part-time job: like & share TikTok videos, earn {pd}/day{e}! First tasks free, then top-up RM100 to unlock VIP tasks with higher commission. {c}",
    "Shopee order booster wanted{e}. Buy products using your own money, we refund you + 20% commission within 30 minutes. {c}",
    "Online job: rate hotels on our app, earn RM30 per review{e}. Need deposit RM200 to activate your account. {c}",
    "Data entry from home, salary {pm}{e}. Pay RM150 registration fee for training kit first. {c}",
    "Kerja part time tekan like dan follow, gaji {pd} sehari{e}! Perlu bayar yuran pendaftaran RM50 dulu. {c}",
    "{g}, congratulations, your application is successful{e}. Please send IC front & back plus bank account details to confirm your position. No interview needed.",
    "Task job: complete 30 orders per set. If your balance becomes negative, you need to top up to continue and withdraw{e}. Commission up to {pd}/day. {c}",
    "Invest RM500 in our trading task and get RM1,500 back in 2 hours{e}! Guaranteed profit, many students already join. {c}",
    "Congratulations! You are selected for our remote job with salary {pm}{e}. Please contact our HR on {app} to start.",
    "Copywriting job {pd} per day, no experience needed{e}. Only need to pay RM100 deposit for uniform and laptop software. {c}",
    "Kerja online subscribe YouTube channel, RM10 setiap screenshot{e}. Masuk group Telegram untuk tugasan seterusnya. {c}",
    "Earn {pd} daily by completing simple tasks on our app{e}. Recharge RM50 first to get your task package. {c}",
    "Job offer from {co}: work 1-2 hours/day from phone, salary {pm}{e}. Small processing fee RM80 required for contract. {c}",
    "Mystery shopper: buy items from our merchant list using your money, receive full refund + 30% commission{e}. {c}",
    "Cari pekerja part time, kerja dari rumah, gaji {pm}{e}. Perlu beli starter kit RM120 sebelum mula. {c}",
    "Hi, I am HR from {co}. We found your resume online. Daily salary {pd}, just give Google Maps reviews{e}. Add my {app}: @hr_XXXX",
    "Join our VIP task group{e}. Level 1 free, Level 2 needs RM300 recharge, Level 3 earns RM3,000/day. {c}",
    "Kerja masuk data, gaji RM150 sehari{e}. Bayar RM60 untuk 'activation' akaun kerja. Wang akan dipulangkan. {c}",
    "Earn passive income! Deposit RM200 working capital, system auto-trade for you, withdraw daily profit {pd}{e}. {c}",
    "Urgent hiring{e}! Typing job RM40 per page. Pay RM99 for the typing software license first. {c}",
    "Your task commission is frozen. To withdraw {pd}, please pay 15% tax / unlock fee to our finance department{e}.",
    "Product review job: we send you items, you pay first then claim back cashback {pd}{e}. Many people earn RM5k/month. {c}",
    "Hello! Remote position available, {pm}/month for 2 hours of work daily{e}. To register please send your IC photo, selfie and bank details. {c}",
    "Kerja like Instagram, satu like RM5{e}. Tapi kena deposit dulu RM100 untuk jadi member rasmi. {c}",
    "Amazon/Lazada rating job{e}: complete orders with your own balance, earn commission. More deposit = more commission. {c}",
    "Training fee RM250 is required before you can start this {pd}/day job{e}. Fee is refundable after 1st salary. {c}",
]

# ------------------------------------------------------------------ LEGIT
CAFES = ["Kopi Kita", "The Daily Grind", "Mamak Corner", "Brew & Co", "Kedai Makan Pak Ali", "Bakery Sri Jaya", "Nasi Lemak House"]
PLACES = ["Subang Jaya", "Bukit Jalil", "Cheras", "Petaling Jaya", "Shah Alam", "Puchong", "Kota Damansara", "Bangsar", "Setapak", "Kajang"]
LEGIT = [
    "Hiring part-time crew at {cafe}, {pl}{e}. RM9/hour, weekends. Duties: take orders, serve drinks, clean up. Walk in with resume or apply on JobStreet.",
    "Tuition teacher needed for SPM Add Maths, RM50/hour, {pl}. Must have at least B+ in Add Maths. WhatsApp 01X-XXX XXXX with your results{e}.",
    "Kami mencari pembantu kedai part time di {pl}, RM8 sejam. Gaji dibayar ke akaun bank setiap bulan. Datang temuduga Sabtu ini{e}.",
    "Promoter for weekend roadshow at Mid Valley, RM120/day. Dress code black. Payment within 14 days after event{e}. Apply via Google Form.",
    "Part-time cashier wanted at {cafe}. Handle cash and card payments, RM9/hour, shift 6pm-11pm. Training provided{e}.",
    "Data Analyst Intern at a fintech in KL. Allowance RM1,200/month. Skills: SQL, Excel, Power BI. Apply through Hiredly with your CV and transcript.",
    "Library assistant (student job), 8 hours per week, RM10/hour. Apply through the student portal before Friday. Interview at Student Affairs office.",
    "Event crew needed URGENT tomorrow at {pl}{e}, RM100/day, 8am-6pm, lunch provided. No experience needed. Salary paid by bank transfer within 7 days.",
    "Freelance graphic designer for our cafe menu, RM200 per poster. Payment by bank transfer after delivery. Send portfolio to our email.",
    "Research assistant, 10 hours/week, RM12/hour, Faculty of Computing. Email your CV to the lecturer. Payment through university payroll.",
    "Sales advisor (part-time) at phone shop, {pl}. Basic RM1,200 + commission. EPF/SOCSO provided. Walk-in interview Mon-Fri 10am-5pm.",
    "Online English tutor, RM40/hour, flexible schedule. Interview via Zoom, payslip provided monthly{e}.",
    "Kerja sambilan pelayan restoran di {pl}, RM8.50 sejam, makan percuma. Hubungi pengurus kami atau datang terus ke kedai{e}.",
    "We are hiring barista (part time) for our new outlet in {pl}! RM10/hour + tips. Apply on Maukerja or DM our official IG page{e}.",
    "Warehouse packer, Shah Alam, RM90/day, 9am-6pm. Transport not provided. Weekly pay to your bank account. Contact HR office during working hours.",
    "Need a math tutor for my son (Form 2), 2x a week at our home in {pl}. RM45/hour. Please WhatsApp me your experience{e}.",
    "Internship: Software Engineering Intern, 6 months, RM1,500 allowance. Apply via LinkedIn with CV and portfolio. Selected candidates will be called for a technical interview.",
    "Student ambassador for open day, RM80/day, 2 days. Registration through the university careers centre. No fees involved.",
    "Part-time admin assistant at a tuition centre in {pl}. Answer calls, update attendance in Excel. RM9/hour. Send resume to our email{e}.",
    "Kami perlukan jurulatih renang sambilan untuk kanak-kanak, RM60 sejam, {pl}. Sijil diperlukan. Hantar resume melalui e-mel{e}.",
    "Fast food crew, flexible hours, RM9.50/hour. Apply online on our official careers website. Free meal and uniform provided.",
    "Photographer for convocation day, RM300 per session. Bring own camera. Payment after photos delivered, via bank transfer{e}.",
    "Survey enumerator for a university research project, RM15 per completed interview, {pl} area. Briefing session on campus this Saturday.",
    "Bookkeeping assistant (part-time) at an accounting firm in {pl}. Enter invoices into SQL Accounting, RM12/hour. Accounting students preferred{e}.",
    "Cashier/Kerani kaunter part time di kedai runcit {pl}. Kendalikan wang tunai, RM8 sejam. Gaji dibayar setiap minggu{e}.",
    "Delivery helper for furniture shop, RM100/day, Saturday and Sunday. Must be able to lift heavy items. Call the shop during office hours.",
]


LEGIT += [
    "Part-time cashier at {cafe}, {pl}. Handle cash and card payments, do end-of-day cash count. RM9/hour. Salary credited to your bank account every month{e}.",
    "Accounts clerk (part-time) at a trading company in {pl}. Key in invoices, follow up with customers on overdue payments by phone, update records. RM10/hour, office hours.",
    "Freelance video editor needed for our cafe TikTok, RM150 per video. 50% upfront, balance after delivery, paid to your bank account{e}. Send your portfolio.",
    "Customer support (part-time) for a payments app, Cyberjaya office. Help users with failed transfers and account login issues via chat. RM12/hour, training provided.",
    "Kerani akaun sambilan di {pl}. Tugas: rekod resit, sediakan invois, semak penyata bank syarikat. RM9 sejam. Hantar resume ke e-mel HR kami{e}.",
    "Hiring promoter for credit card booth at shopping mall, {pl}. Basic RM100/day + RM20 per approved application. Company is licensed, interview at our office.",
    "Need part time driver to deliver goods around Klang Valley using company van, RM100/day. Licence D required{e}.",
    "Bank internship (3 months) at a branch in {pl}. Allowance RM1,000. Apply through the bank's official careers page. Bring IC and bank account details on your first day for payroll.",
    "Social media admin for small bakery, create posts and reply DMs, RM800/month, can WFH{e}. Interview via Google Meet.",
    "Boss nak cari part timer jaga kedai handphone {pl}, RM80 sehari, boleh start esok, takyah pengalaman. Datang terus kedai{e}.",
    "Our shop need part time helper la, weekend only, RM9 per hour. Can come shop ask for Ms Tan. Pay every Saturday cash or bank in also can{e}.",
    "Wedding photographer assistant, RM150 per event. Client pays deposit to our company, you get paid after the event by bank transfer{e}.",
    "Mystery shopper for retail audit: visit the outlet, buy one item (reimbursed with receipt up to RM30), fill in the report. Fee RM40 per visit, paid monthly{e}.",
    "Tuition centre need BM and English teacher for UPSR/PT3 kids, RM40-RM60 per hour depending on experience. Interview at centre, bring your certificates.",
    "Weekend part-timer for car wash in {pl}, RM70/day + tips. Must be 18+. Walk in Saturday morning{e}.",
    "IT support intern at university's ICT department. Fix lab PCs, reset student accounts. RM800/month allowance. Apply via student portal.",
    "Looking for a Chinese tutor for my daughter, Std 4, at our house in {pl}. RM50/hour, 2 times a week. Please WhatsApp me your experience ah{e}.",
    "Pembantu jualan pasar malam, RM60 satu malam + makan. Kena pandai kira duit dan layan pelanggan. Hubungi abang Din{e}.",
    "F&B crew wanted urgently for new outlet opening in {pl}. RM9.50/hr, OT paid, EPF & SOCSO. Apply at the outlet or through our official Instagram{e}.",
    "Freelance translator (English to BM) for a publisher, RM0.08 per word. Payment within 30 days after invoice, by bank transfer. Sample test required.",
]
MULE += [
    "Agent top-up game diperlukan! Pelanggan bayar ke akaun bank anda, anda forward ke akaun boss dan simpan RM10 setiap order{e}. {c}",
    "Looking for students with e-wallet + bank account for 'cashout' job. We send money to your account, you withdraw from ATM and deposit to our agent. RM50 each time{e}.",
    "Kak, boleh tolong terima deposit pelanggan dalam akaun akak? Nanti saya ambil. Upah RM80 setiap kali{e}. {c}",
    "Bro, my friend's company need to borrow your account to receive payment only, after that you transfer back, you can keep RM300{e}. Confirm safe one.",
    "{co} hiring Accounts Receivable Associate (remote). You will receive client remittances via your personal DuitNow and settle them to our partner accounts daily. {pd}/day{e}.",
    "Merchant onboarding assistant: receive settlement funds from merchants into your own account, then release them to the vendor list. Commission per batch{e}. {c}",
    "We help you open a salary account during training, then our finance team will keep the card and online banking for payroll processing. Salary {pm}{e}.",
    "Boss cari student ada akaun bank tak guna. Sewa 1 bulan RM1,200, bagi kad ATM dan nombor pin je{e}. {c}",
    "Our boss give you money in your account, you help buy USDT on Binance P2P and send to his wallet ah. Each time got RM100{e}.",
]
SCAM += [
    "Part-time assistant to our director: buy gift cards / reload PINs using your own money and send the codes, reimbursed with commission end of week{e}. {c}",
    "Merchant task today! Limited quota{e}. Transfer RM1,000 receive RM1,300. Transfer RM3,000 receive RM3,900. {c}",
    "Eh u want simple job? Screenshot follow IG page only, each one RM10. Later got reception task need put some money, confirm return one{e}.",
    "Online assistant, simple task at home, salary {pd}. Need 18+ and bank account. First need to pay RM88 membership to get task{e}. {c}",
    "Pre-funded orders: you fund each order first, the system returns principal + 8% commission after completion{e}. {c}",
    "Hiring social media assistant RM25/hour, simple tasks: follow and like our clients' pages. Later join our premium team by investing RM200 for higher income{e}.",
    "Tahniah anda terpilih sebagai pembantu pemasaran digital. Sila buat transaksi pertama RM100 untuk aktifkan akaun kerja, komisen 30% dipulangkan{e}.",
    "Offer letter attached{e}. Please pay RM350 for the uniform and laptop setup before your start date. Amount will be refunded in your first salary.",
]

def fill(t):
    b = pick(BANKS)
    return " ".join(t.format(
        g=pick(GREET), e=pick(EMO), pd=pick(PAY_DAY), pm=pick(PAY_MONTH), b=b,
        b2=pick([x for x in BANKS if x != b]), ew=pick(EWALLET), app=pick(APPS), c=pick(CONTACT),
        co=pick(FAKECO), cafe=pick(CAFES), pl=pick(PLACES),
    ).split()).strip(" ,!")

def vary(s):
    r = random.random()
    if r < 0.15: s = s.lower()
    elif r < 0.22: s = s.upper() if len(s) < 120 else s
    if random.random() < 0.2: s = s.replace(" you ", " u ").replace("your ", "ur ")
    if random.random() < 0.1: s = s + " " + pick(["Thanks", "TQ", "Terima kasih", "pls share to friends", ""])
    return s.strip()

rows = []
for label, temps, n in [("mule", MULE, 300), ("job_scam", SCAM, 300), ("legit", LEGIT, 360)]:
    seen = set()
    while len([r for r in rows if r["label"] == label]) < n:
        s = vary(fill(pick(temps)))
        if s in seen: continue
        seen.add(s)
        rows.append({"text": s, "label": label})
random.shuffle(rows)
with open("/home/claude/kerjacheck/data/train.jsonl", "w") as f:
    for i, r in enumerate(rows):
        r["id"] = f"t{i:04d}"
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(len(rows))
