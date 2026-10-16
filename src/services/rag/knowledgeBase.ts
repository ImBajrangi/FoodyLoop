/**
 * Foody Loop RAG Knowledge Base
 * Authoritative domain chunks covering:
 * - FSSAI 2019 Surplus Food Recovery Statutory Regulations
 * - Foody Loop Platform Architecture & Workflows
 * - Role-specific operations (Shopkeeper, NGO, Volunteer, Donor, Admin)
 * - 4-digit Handover OTP Verification Security System
 * - Regional Geography (Mathura, Vrindavan, Barsana, Govardhan)
 */

export interface KnowledgeChunk {
  id: string;
  topic: 'fssai_safety' | 'otp_handover' | 'shop_guide' | 'ngo_guide' | 'volunteer_guide' | 'donor_guide' | 'admin_guide' | 'general_platform' | 'troubleshooting';
  title: string;
  hindiTitle: string;
  keywords: string[];
  content: string;
  hindiContent: string;
}

export const RAG_KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // 1. Handover OTP System
  {
    id: 'otp-protocol',
    topic: 'otp_handover',
    title: 'Confidential 4-Digit Pickup Handover OTP Protocol',
    hindiTitle: '4-अंकीय सुरक्षित पिकअप हैंडओवर ओटीपी प्रणाली',
    keywords: ['otp', 'ओटीपी', 'handover', 'हैंडओवर', 'pickup code', 'पिकअप', 'code', 'कोड', 'verification', 'सत्यापन', 'confirm', 'पुष्टि', 'fraud', 'safety'],
    content: `Foody Loop implements a secure 4-digit Handover OTP protocol to guarantee that surplus food reaches authorized ashrams and prevent fake claims or missed pickups:
1. When surplus food is donated or claimed, a confidential 4-digit OTP (e.g. 4928) is generated specifically for the donor shop.
2. The shopkeeper sees this OTP on their Shop Dashboard at the top alert banner and on their active donation card.
3. The shopkeeper DOES NOT have an OTP input box — they keep this OTP confidential until the pickup courier/NGO representative arrives.
4. When the NGO representative or volunteer arrives at the shop, they inspect the food packaging and ask the shopkeeper for this 4-digit OTP.
5. The NGO representative enters this 4-digit code in their NGO/Courier App under 'Claimed Deliveries'.
6. Once the NGO enters the matching OTP and clicks 'Confirm Handover & Received', the system records the transaction into the immutable audit log and marks the status as DELIVERED / COLLECTED.`,
    hindiContent: `Foody Loop में 4-अंकीय सुरक्षित हैंडओवर ओटीपी (Handover OTP) प्रणाली का उपयोग किया जाता है:
1. जब भी कोई भोजन दान किया या क्लेम किया जाता है, तो दुकानदार के लिए 4-अंकीय गोपनीय ओटीपी (जैसे 4928) तैयार होता है।
2. दुकानदार को यह ओटीपी अपने शॉप डैशबोर्ड के सबसे ऊपर और डोनेशन कार्ड पर साफ़ दिखाई देता है।
3. दुकानदार के पास कोई इनपुट बॉक्स नहीं होता—उन्हें केवल यह ओटीपी आश्रम प्रतिनिधि या राइडर को देना होता है।
4. जब आश्रम प्रतिनिधि या सेवादार दुकान पर पहुँचते हैं, तो वे भोजन की गुणवत्ता देखकर दुकानदार से यह 4-अंकीय ओटीपी माँगते हैं।
5. आश्रम प्रतिनिधि अपने ऐप में 'दावाकृत डिलीवरी' के अंदर यह ओटीपी दर्ज करते हैं।
6. सही ओटीपी डालते ही हैंडओवर सफलतापूर्वक सत्यापित हो जाता है और भोजन आश्रम में वितरित मान लिया जाता है।`
  },

  // 2. FSSAI Food Safety Regulations
  {
    id: 'fssai-temperature-limits',
    topic: 'fssai_safety',
    title: 'FSSAI Statutory Temperature & Holding Limits (Surplus Food Regulations 2019)',
    hindiTitle: 'एफएसएसएआई विनियामक खाद्य सुरक्षा व तापमान नियम (2019)',
    keywords: ['fssai', 'एफएसएसएआई', 'temperature', 'तापमान', 'safety', 'सुरक्षा', 'hot held', 'गरम', 'refrigerated', 'ठंडा', 'chilled', 'hours', 'घंटे', 'expiry', 'खराब', 'rules', 'नियम'],
    content: `Under FSSAI Surplus Food Recovery Regulations (2019) and Codex CAC/RCP 39-1993:
- Hot Prepared Foods (Dal, Gravy, Rice, Khichdi, Sabji): Must be maintained at or above 60°C (>= 60°C) inside insulated thermal urns or containers. Maximum holding limit is 4 hours before consumption.
- Chilled / Refrigerated Foods: Must be held at or below 5°C (<= 5°C). Maximum holding window is 24 to 48 hours depending on dairy content.
- Ambient Cooked Foods: Must be distributed and consumed within 2 to 3 hours of preparation if uninsulated.
- Packaging Requirements: Grade 5 food-grade virgin containers, tamper-evident seals, and mandatory allergen declaration (e.g. Sattvik, dairy/ghee content).
- Donations failing hygiene declaration or exceeding safe time windows are automatically blocked by Foody Loop's safety eligibility gate.`,
    hindiContent: `FSSAI अतिरिक्त भोजन नियमन (2019) व कोडेक्स मानकों के अनुसार:
- गरम पके भोजन (दाल, सब्जी, चावल, खिचड़ी): तापमान हर हाल में 60°C या उससे अधिक (>= 60°C) इंसुलेटेड थर्मल बर्तनों में होना चाहिए। वितरण व सेवन की अधिकतम सीमा 4 घंटे है।
- ठंडे/प्रशीतित खाद्य पदार्थ: तापमान 5°C या उससे कम (<= 5°C) होना चाहिए।
- सामान्य कमरे के तापमान पर रखा पका भोजन: तैयारी के 2 से 3 घंटे के भीतर वितरित होना अनिवार्य है।
- पैकेजिंग: फूड-ग्रेड 5 इंसुलेटेड कंटेनर, सील बंद और एलर्जी सूचना (जैसे सात्त्विक, बिना लहसुन-प्याज, घी/डेयरी) आवश्यक है।`
  },

  // 3. Shopkeeper Operations
  {
    id: 'shop-donation-workflow',
    topic: 'shop_guide',
    title: 'How Shopkeepers & Restaurants Donate Surplus Food',
    hindiTitle: 'दुकानदार व रेस्टोरेंट अतिरिक्त भोजन कैसे दान करें',
    keywords: ['shop', 'दुकान', 'restaurant', 'रेस्टोरेंट', 'donate', 'दान', 'halwai', 'हलवाई', 'post donation', 'surplus', 'अतिरिक्त भोजन', 'meals', 'थाली', 'fssai number'],
    content: `Shopkeeper Workflow on Foody Loop:
1. Log in to the Shop Dashboard with your registered 10-digit mobile number and PIN (or select your shop from the quick access list).
2. Click the prominent 'DONATE SURPLUS FOOD' (नया भोजन दान करें) button.
3. Select the prepared dish (e.g. Mathura Poori Sabzi, Dal Rice Combo, Khichdi Prasadam), quantity (number of meals), and storage condition (Hot-held >=60°C or Chilled).
4. Complete the 5-point FSSAI safety checklist (Fresh preparation, hygiene declaration, food-grade packaging, temperature verification, within safety window).
5. Submit the donation. The system generates a 4-digit Handover OTP instantly.
6. When the matched Ashram or courier arrives, show them the 4-digit OTP to complete handover.`,
    hindiContent: `Foody Loop पर दुकानदारों के लिए भोजन दान की प्रक्रिया:
1. अपने पंजीकृत 10-अंकीय मोबाइल नंबर से शॉप डैशबोर्ड में लॉगिन करें।
2. 'नया भोजन दान करें' (DONATE SURPLUS FOOD) बटन पर क्लिक करें।
3. व्यंजन चुनें (जैसे मथुरा पूरी सब्जी, दाल-चावल, खिचड़ी), थाली की संख्या (मात्रा) और तापमान स्थिति चुनें।
4. 5-सूत्रीय FSSAI सुरक्षा चेकलिस्ट की पुष्टि करें।
5. दान सबमिट करते ही स्क्रीन पर तुरंत 4-अंकीय हैंडओवर ओटीपी दिखाई देगा।
6. जब आश्रम का वाहन या सेवादार पहुंचे, उन्हें यह ओटीपी बताएं ताकि वे भोजन प्राप्त कर सकें।`
  },

  // 4. NGO / Ashram Operations
  {
    id: 'ngo-claim-workflow',
    topic: 'ngo_guide',
    title: 'How Ashrams and NGOs Claim Surplus Food and Confirm Delivery',
    hindiTitle: 'आश्रम और एनजीओ भोजन का दावा (Claim) और डिलीवरी पुष्टि कैसे करें',
    keywords: ['ngo', 'एनजीओ', 'ashram', 'आश्रम', 'claim', 'दावा', 'receive', 'प्राप्त', 'elderly', 'विधवा', 'vrindavan', 'capacity', 'क्षमता', 'meals per day'],
    content: `Ashram & NGO Food Recovery Workflow:
1. Log in to the Donor / NGO App as an Ashram or NGO partner.
2. In the 'Surplus Food & Courier Dispatch Hub' (उपलब्ध भोजन), view hot meals available from restaurants in your vicinity.
3. Click 'Claim Food for Ashram' (भोजन दावा करें). Foody Loop's smart matching engine calculates distance, transit time, and assigns a volunteer courier.
4. Go to 'Claimed Deliveries' (दावाकृत वितरण).
5. When the courier or your team picks up the food from the shop, ask the shopkeeper for their confidential 4-digit OTP.
6. Enter the 4-digit OTP in the input box and click 'Confirm Handover & Received' (हैंडओवर व प्राप्ति की पुष्टि करें).
7. The status updates to DELIVERED and the meals are credited to your daily served count.`,
    hindiContent: `आश्रमों व एनजीओ के लिए भोजन प्राप्त करने की प्रक्रिया:
1. एनजीओ / आश्रम ऐप में लॉगिन करें।
2. 'अतिरिक्त भोजन प्रबंधन' सेक्शन में आसपास की दुकानों से उपलब्ध गरमा-गरम भोजन की सूची देखें।
3. 'भोजन दावा करें' (Claim Food) बटन पर क्लिक करें। सिस्टम दूरी और समय की गणना करके सेवादार असाइन करता है।
4. 'दावाकृत वितरण' (Claimed Deliveries) टैब में जाएं।
5. दुकान पर पहुंचकर दुकानदार से उनका 4-अंकीय ओटीपी पूछें।
6. ऐप में 4-अंकीय ओटीपी दर्ज करके 'हैंडओवर व प्राप्ति की पुष्टि करें' पर क्लिक करें।
7. डिलीवरी सफल होते ही भोजन आपके आश्रम के दैनिक वितरण में जुड़ जाता है।`
  },

  // 5. Volunteer Couriers
  {
    id: 'volunteer-delivery-workflow',
    topic: 'volunteer_guide',
    title: 'Volunteer Courier Pickup and Transit Guidelines',
    hindiTitle: 'सेवादार / कूरियर राइडर पिकअप एवं परिवहन दिशा-निर्देश',
    keywords: ['volunteer', 'सेवादार', 'courier', 'कूरियर', 'rider', 'राइडर', 'bike', 'e-rickshaw', 'delivery', 'पिकअप', 'transit', 'रास्ता'],
    content: `Volunteer Delivery Guidelines:
1. Couriers operate within the Braj corridor (Mathura, Vrindavan, Barsana, Govardhan) using e-rickshaws or motorcycles equipped with thermal insulated carry bags.
2. Upon receiving a pickup dispatch alert, navigate to the donor shop.
3. Verify that the food packaging is intact and thermal seal is unbroken.
4. Request the 4-digit Handover OTP from the shopkeeper.
5. Deliver hot meals to the assigned ashram within the estimated 15-20 minute transit window.`,
    hindiContent: `सेवादार राइडर्स के लिए दिशा-निर्देश:
1. सेवादार मथुरा-वृन्दावन परिक्रमा मार्ग में ई-रिक्शा या बाइक से इंसुलेटेड बैग में भोजन ले जाते हैं।
2. पिकअप का अलर्ट मिलने पर संबंधित दुकान पर पहुँचें।
3. देखें कि पैकिंग सुरक्षित है और भोजन गरम है।
4. दुकानदार से उनका 4-अंकीय ओटीपी प्राप्त करें।
5. तय समय (15-20 मिनट) के अंदर वृद्ध व विधवा आश्रम में भोजन पहुँचाएं।`
  },

  // 6. Commemorative Sponsorship & Donors
  {
    id: 'sponsorship-annadaan',
    topic: 'donor_guide',
    title: 'Commemorative Meal Sponsorship (Annadaan) & 80G Tax Exemption',
    hindiTitle: 'स्मृति अन्नदान प्रायोजन व 80G आयकर छूट प्रमाण पत्र',
    keywords: ['sponsor', 'प्रायोजन', 'annadaan', 'अन्नदान', 'birthday', 'जन्मदिन', 'punyatithi', 'पुण्यतिथि', 'certificate', 'प्रमाण पत्र', '80g', 'tax', 'आयकर', 'bhandara', 'भंडारा'],
    content: `Commemorative Meal Sponsorship on Foody Loop:
- Devotees across India and abroad can sponsor fresh meals for ashram mothers and sadhus in Vrindavan on special occasions (Birthdays, Tithi, Punyatithi, Anniversaries).
- Cost is approximately ₹40 per wholesome Sattvik thali.
- Every sponsor instantly receives an official digital 'Braj Seva Impact Certificate' with QR code verification.
- Donations are eligible for 50% tax deduction under Section 80G of the Income Tax Act.
- Real-time GPS and distribution photos are linked to the sponsorship record in the database.`,
    hindiContent: `स्मृति अन्नदान प्रायोजन:
- देश-विदेश के श्रद्धालु अपने जन्मदिन, विवाह वर्षगांठ या परिजनों की पुण्यतिथि पर वृन्दावन के आश्रमों में सात्त्विक भोजन प्रायोजित कर सकते हैं।
- प्रति थाली लगभग ₹40 का योगदान रहता है।
- प्रत्येक अन्नदाता को तुरंत आधिकारिक 'बृज सेवा प्रभाव प्रमाण-पत्र' (Impact Certificate) प्राप्त होता है।
- आयकर अधिनियम की धारा 80G के तहत 50% कर छूट प्राप्त होती है।`
  },

  // 7. Admin & Regulator Room
  {
    id: 'admin-regulatory-control',
    topic: 'admin_guide',
    title: 'Food Safety Officer & Master Control Room Capabilities',
    hindiTitle: 'खाद्य सुरक्षा अधिकारी व एडमिन कंट्रोल रूम सुविधाएं',
    keywords: ['admin', 'एडमिन', 'fso', 'अधिकारी', 'regulator', 'नियंत्रक', 'approve', 'स्वीकृत', 'permit', 'परमिट', 'flag', 'जांच', 'hold', 'रोक', 'audit', 'ऑडिट', 'database'],
    content: `Food Safety Officer (Admin) Portal:
- Regulatory Review: Approve, verify, or place on hold newly registered shops and NGOs based on FSSAI license numbers.
- One-Click Portal Access: Directly open any permitted shop or NGO dashboard from the roster to inspect live operations.
- ACID Atomic Concurrency Lock: Prevents two NGOs from simultaneously claiming the same donation batch.
- Immutable Audit Trail: Every verification, approval, flag, and food handover is permanently logged with timestamps.
- Braj Demand vs Supply Gap Analysis: Real-time telemetry monitoring meal surpluses vs deficits across Vrindavan, Mathura, Barsana, and Govardhan.`,
    hindiContent: `एडमिन व खाद्य सुरक्षा अधिकारी पोर्टल:
- विनियामक समीक्षा: FSSAI लाइसेंस के आधार पर नई दुकानों व आश्रमों को सत्यापित (Permit) या होल्ड पर रखना।
- 1-क्लिक पोर्टल एक्सेस: अधिकृत दुकानों व आश्रमों के डैशबोर्ड को सीधे खोलकर निरीक्षण करना।
- कॉन्करेंसी सुरक्षा: एक ही भोजन को दो आश्रमों द्वारा एक साथ क्लेम करने से रोकना।
- स्थायी ऑडिट लॉग: प्रत्येक अनुमोदन, फ्लैग और डिलीवरी का डेटाबेस रिकॉर्ड।
- मांग व आपूर्ति विश्लेषण: मथुरा, वृन्दावन, बरसाना और गोवर्धन में भोजन उपलब्धता का विश्लेषण।`
  },

  // 8. Regional Coverage in Braj
  {
    id: 'braj-geographic-coverage',
    topic: 'general_platform',
    title: 'Braj Regional Hubs: Mathura, Vrindavan, Barsana & Govardhan',
    hindiTitle: 'बृज क्षेत्रीय केंद्र: मथुरा, वृन्दावन, बरसाना व गोवर्धन',
    keywords: ['mathura', 'मथुरा', 'vrindavan', 'वृन्दावन', 'barsana', 'बरसाना', 'govardhan', 'गोवर्धन', 'raman reti', 'vishram ghat', 'daan ghati', 'location', 'कहाँ', 'city', 'शहर'],
    content: `Foody Loop is actively deployed in the holy Braj Dham corridor:
1. Vrindavan Hub: Covers Raman Reti, Chattikara Road, Parikrama Marg, Banke Bihari temple zone, and widow/elder ashrams.
2. Mathura Hub: Covers Vishram Ghat, Krishna Janmabhoomi corridor, and junction eateries.
3. Barsana Hub: Covers Shriji Temple base, Priya Kund, and Maan Mandir Annakshetra.
4. Govardhan Hub: Covers Daan Ghati, Radhakund, and parikrama pilgrim shelters.`,
    hindiContent: `Foody Loop बृज क्षेत्र के प्रमुख केंद्रों पर संचालित है:
1. वृन्दावन केंद्र: रमन रेती, छटीकरा मार्ग, परिक्रमा मार्ग, बाँके बिहारी परिक्षेत्र एवं माताजी आश्रम।
2. मथुरा केंद्र: विश्राम घाट, श्रीकृष्ण जन्मभूमि परिक्षेत्र एवं रेलवे जंक्शन।
3. बरसाना केंद्र: श्रीजी मंदिर तलहटी, प्रिया कुंड एवं मान मंदिर अन्नक्षेत्र।
4. गोवर्धन केंद्र: दानघाटी, राधाकुंड एवं परिक्रमा मार्ग।`
  },

  // 9. Troubleshooting & Common Issues
  {
    id: 'troubleshooting-faq',
    topic: 'troubleshooting',
    title: 'Troubleshooting: Incorrect OTP, Food Expiry, or Pickup Delays',
    hindiTitle: 'समस्या समाधान: गलत ओटीपी, समय सीमा समाप्ति या पिकअप में देरी',
    keywords: ['error', 'समस्या', 'wrong otp', 'गलत ओटीपी', 'delayed', 'देरी', 'expired', 'खराब', 'help', 'मदद', 'support', 'सहायता'],
    content: `Frequently Asked Questions & Troubleshooting:
Q: What if the NGO enters the wrong OTP?
A: The system alerts 'गलत ओटीपी! कृपया दुकानदार से सही 4-अंकीय कोड प्राप्त करें।' Ask the shopkeeper to read the code from their screen. It is also displayed in the shop's top navigation bar.

Q: What happens if food exceeds the safe holding limit?
A: Foody Loop automatically locks donations that pass their 'safeUntil' threshold to prevent distributing stale food, and logs a safety event for the Food Safety Officer.

Q: Can multiple NGOs claim portions of the same large donation?
A: Yes, Foody Loop supports group/partial allocation for large batches (e.g. 100+ meals), reserving portions atomically.

Q: What if our shop or NGO is not permitted yet?
A: New registrations are placed in 'Under Review' status. The Food Safety Officer verifies FSSAI credentials before granting full matching rights.`,
    hindiContent: `अक्सर पूछे जाने वाले प्रश्न व समाधान:
प्रश्न: यदि एनजीओ गलत ओटीपी दर्ज कर दे तो क्या होगा?
उत्तर: ऐप में 'गलत ओटीपी' का अलर्ट आएगा। दुकानदार से अपनी स्क्रीन या टॉप नेवबार से 4-अंकीय कोड देखकर दोबारा बताने को कहें।

प्रश्न: यदि भोजन का सुरक्षित समय समाप्त हो जाए तो क्या होगा?
उत्तर: Foody Loop समय सीमा (safeUntil) समाप्त होने पर उस भोजन को स्वतः ब्लॉक कर देता है ताकि बासी भोजन किसी तक न पहुंचे।

प्रश्न: क्या एक बड़े दान को दो आश्रम आपस में बाँट सकते हैं?
उत्तर: हाँ, 100+ थाली जैसे बड़े लॉट को दो या अधिक आश्रम अपनी क्षमता के अनुसार बाँट सकते हैं।

प्रश्न: नई दुकान या आश्रम को परमिट कैसे मिलता है?
उत्तर: पंजीकरण के बाद खाद्य सुरक्षा अधिकारी (Admin) FSSAI लाइसेंस की जांच करके 1-क्लिक में अधिकृत (Permit) करते हैं।`
  }
];
