/**
 * Foody Loop RAG Knowledge Base
 * Authoritative domain chunks covering:
 * - FSSAI 2019 Surplus Food Recovery Statutory Regulations
 * - Foody Loop Platform Architecture & Workflows
 * - Role-specific operations (Shopkeeper, NGO, Volunteer, Donor, Admin)
 * - 4-digit Handover OTP Verification Security System
 * - Regional Geography
 */

export interface KnowledgeChunk {
  id: string;
  topic:
  | 'fssai_safety'
  | 'otp_handover'
  | 'shop_guide'
  | 'ngo_guide'
  | 'volunteer_guide'
  | 'donor_guide'
  | 'admin_guide'
  | 'general_platform'
  | 'troubleshooting'
  | 'hands_on_food'
  | 'delivery_benefits'
  | 'restaurant_items'
  | 'three_categories'
  | 'platform_pros';
  title: string;
  hindiTitle: string;
  keywords: string[];
  content: string;
  hindiContent: string;
}

export const RAG_KNOWLEDGE_BASE: KnowledgeChunk[] = [
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
  },

  // 10. The 3 Core Platform Stakeholder Categories
  {
    id: 'three-categories-ecosystem',
    topic: 'three_categories',
    title: 'The 3 Core Stakeholder Categories: Shops, NGOs, Delivery Partners',
    hindiTitle: '3 मुख्य श्रेणियां: दुकानें/रेस्टोरेंट, आश्रम/एनजीओ, डिलीवरी सारथी',
    keywords: ['3 categories', 'categories', 'श्रेणियां', 'stakeholders', 'shops', 'ngos', 'delivery partners', 'riders', 'दुकानें', 'आश्रम', 'डिलीवरी'],
    content: `Foody Loop is powered by 3 dedicated stakeholder categories working in synergy across the Braj Dham region:
1. Shops & Restaurants (दुकानें व रेस्टोरेंट): Halwais, traditional Bhojanalayas, sweets shops, caterers, and temple kitchens. They declare surplus cooked food, manage custom dishes/menu items with pre-verified holding temperatures (>=60°C hot-held), maintain 100% FSSAI hygiene standards, and generate the secure 4-digit Handover OTP.
2. NGOs & Ashrams (आश्रम व गैर-सरकारी संस्थाएं): Widow shelters, sadhu ashrams, and community kitchens (e.g. Sri Radha Rani Ashram, Vrindavan Seva Trust). They place 'Hands on Food' to express real-time distribution interest, claim verified surplus batches, inspect thermal packaging, and enter the shopkeeper's 4-digit OTP to verify receipt.
3. Delivery Partners / Volunteer Couriers (डिलीवरी सेवा सारथी): E-rickshaw and scooter drivers equipped with FSSAI-grade insulated thermal boxes. They are tracked live via GPS radar moving towards the restaurant for food pickup, transport meals within 15-20 minutes, and receive high-value community benefits provided by partner Ashrams (free daily prasad thali, ₹150 daily fuel/mobility allowance, ₹2 Lakh medical insurance, and FSSAI safe food courier certificate).`,
    hindiContent: `Foody Loop 3 प्रमुख श्रेणियों (स्टेकहोल्डर्स) के समन्वय पर आधारित है:
1. दुकानें व रेस्टोरेंट (Shops & Restaurants): हलवाई, पारंपरिक भोजनालय, मिष्ठान भंडार एवं मंदिर रसोई। ये अतिरिक्त भोजन घोषित करते हैं, अपने नियमित व्यंजनों का तापमान प्रबंधित करते हैं (≥60°C), और सुरक्षित 4-अंकीय हैंडओवर ओटीपी रखते हैं।
2. आश्रम व एनजीओ (NGOs & Ashrams): विधवा आश्रम, वृद्ध आश्रम, साधु सेवा ट्रस्ट एवं अन्नक्षेत्र (जैसे श्री राधा रानी आश्रम, वृन्दावन सेवा ट्रस्ट)। ये भोजन पर 'हाथ रखकर' अपनी वितरण रुचि दर्ज करते हैं, भोजन बैच क्लेम करते हैं, और दुकानदार का 4-अंकीय ओटीपी भरकर हैंडओवर की पुष्टि करते हैं।
3. डिलीवरी सेवा सारथी (Delivery Partners): ई-रिक्शा व बाइक चालक जो इंसुलेटेड थर्मल बॉक्स के साथ भोजन का सुरक्षित व त्वरित परिवहन करते हैं। इनकी लाइव लोकेशन मैप पर दिखती है, और इन्हें आश्रमों द्वारा निःशुल्क भोजन, दैनिक ₹150 पेट्रोल/चार्जिंग भत्ता, ₹2 लाख का स्वास्थ्य बीमा एवं FSSAI प्रमाण पत्र मिलता है।`
  },

  // 11. "Hands on Food" (हाथ रखना / दावा रुचि) & Live Courier Tracking
  {
    id: 'hands-on-food-mechanism',
    topic: 'hands_on_food',
    title: 'Hands on Food (हाथ रखना / दावा रुचि) & Real-time Courier Dispatch',
    hindiTitle: 'भोजन पर हाथ रखना (Hands on Food) व वास्तविक समय कूरियर रडार',
    keywords: ['hands on food', 'हाथ रखना', 'हाथ रखें', 'interest', 'रुचि', 'claim interest', 'realtime courier', 'delivery boy', 'कहाँ पहुंचा', 'live tracking', 'map radar'],
    content: `Hands on Food (हाथ रखना / दावा रुचि) Feature:
- When a restaurant declares surplus meals, ANY registered Ashram or NGO can place their 'Hands on Food' by clicking '✋ Hands on Food (हाथ रखें)'.
- Multiple Ashrams can place hands on the same food batch simultaneously! The system displays all interested Ashrams alongside requested portion counts (e.g. Radha Rani Ashram: 60 meals, Vrindavan Seva Trust: 40 meals).
- Placing hands on food automatically activates the nearest delivery courier, who immediately begins navigating towards the donor restaurant to collect the hot food batch.
- Real-time Courier Radar: The live map displays the courier vehicle puck moving in real time towards the restaurant (Status: HEADING_TO_SHOP, ETA countdown), then arriving at the shop (AT_SHOP_PICKUP), and finally delivering to the designated ashram (OUT_FOR_DELIVERY).
- This ensures absolute transparency so both restaurants and ashrams know exactly where the delivery boy has reached at any second.`,
    hindiContent: `'भोजन पर हाथ रखना' (Hands on Food) व लाइव सारथी ट्रैकिंग:
- जब कोई रेस्टोरेंट अतिरिक्त भोजन घोषित करता है, तो कोई भी आश्रम '✋ भोजन पर हाथ रखें' बटन दबाकर अपनी रुचि दर्ज कर सकता है।
- एक ही भोजन पर एक से अधिक आश्रम भी हाथ रख सकते हैं! सिस्टम सभी इच्छुक आश्रमों की सूची और उनकी आवश्यक थालियों की संख्या प्रदर्शित करता है।
- जैसे ही भोजन पर हाथ रखा जाता है, सिस्टम तुरंत नजदीकी डिलीवरी सारथी को दुकान की ओर भोजन उठाने के लिए रवाना कर देता है।
- लाइव रडार मैप पर दिखता है कि डिलीवरी बॉय इस समय कहाँ पहुँचा है, दुकान की ओर कितने मिनट में पहुँचेगा (HEADING_TO_SHOP), दुकान से कब भोजन उठा रहा है (AT_SHOP_PICKUP), और आश्रम की ओर कब निकला है।`
  },

  // 12. Delivery Partner Seva Perks & Community Benefits
  {
    id: 'delivery-partner-community-perks',
    topic: 'delivery_benefits',
    title: 'Delivery Partner Seva Perks & Community Benefits provided by Ashrams',
    hindiTitle: 'डिलीवरी सेवादारों को आश्रमों व समुदाय द्वारा प्रदत्त सुविधाएं व लाभ',
    keywords: ['benefits', 'perks', 'लाभ', 'सुविधाएं', 'free meal', 'निःशुल्क भोजन', 'prasad', 'प्रसाद', 'fuel allowance', 'पेट्रोल भत्ता', 'charging', 'insurance', 'बीमा', 'fssai certificate', 'rider benefits'],
    content: `Community Perks & Benefits for Delivery Partners (Couriers):
Partner Ashrams, NGOs, and the Foody Loop Community Fund provide 4 statutory welfare benefits to delivery riders:
1. Free Daily Prasad Thali at Partner Ashrams (निःशुल्क दोपहर व रात्रि प्रसादम): Riders completing 2 or more food rescues are entitled to unlimited nutritious hot prasad thali at participating Vrindavan Ashrams (e.g. Sri Radha Rani Ashram).
2. Daily Electric Scooter Charging & Fuel Allowance (₹150 दैनिक गतिशीलता भत्ता): Directly credited to riders completing 4 or more surplus pickups across Mathura & Vrindavan to offset mobility costs.
3. Comprehensive Seva Volunteer Medical & Accident Cover (₹2 लाख सुरक्षा बीमा): Active delivery partners receive ₹2,00,000 zero-cost accidental and hospitalization coverage during active delivery shifts.
4. FSSAI Certified Safe Food Courier Certificate (FSSAI विनियामक प्रमाण पत्र): Official digital certification issued jointly by FSSAI Mathura desk & Foody Loop acknowledging compliance with statutory food transport standards for career growth.`,
    hindiContent: `डिलीवरी सेवादारों के लिए आश्रमों व समुदाय द्वारा प्रदत्त लाभ:
1. सहयोगी आश्रमों में निःशुल्क दोपहर व रात्रि प्रसादम: 2 या अधिक पिकअप करने वाले सेवादारों को राधा रानी व अन्य आश्रमों में सम्मानपूर्वक निःशुल्क भोजन।
2. दैनिक ₹150 ई-स्कूटर चार्जिंग व पेट्रोल सहायता भत्ता: मथुरा-वृन्दावन में 4 या अधिक पिकअप करने पर सीधा गतिशीलता भत्ता।
3. ₹2,00,000 सम्पूर्ण स्वयंसेवक स्वास्थ्य व दुर्घटना सुरक्षा बीमा: ऑन-ड्यूटी भोजन परिवहन के दौरान सक्रिय राइडर्स को आपातकालीन बीमा।
4. FSSAI प्रमाणित स्वच्छ भोजन कूरियर प्रमाण पत्र: FSSAI विनियामक अनुपालन का आधिकारिक डिजिटल प्रमाण पत्र व सेवा स्टार बैज।`
  },

  // 13. Restaurant Custom Food Items Management
  {
    id: 'restaurant-dishes-custom-items',
    topic: 'restaurant_items',
    title: 'Restaurant Custom Dishes & 1-Click Surplus Declaration',
    hindiTitle: 'रेस्टोरेंट व्यंजन सूची प्रबंधन व 1-क्लिक अधिशेष भोजन घोषणा',
    keywords: ['custom item', 'add item', 'dish', 'menu', 'व्यंजन', 'items', 'recipe', 'thali', '1-click', 'surplus declare', 'holding temperature'],
    content: `Restaurant Custom Items & Dishes Management:
- Restaurant owners and chefs can configure their complete catalog of regular preparation dishes under the 'My Restaurant Dishes' (व्यंजन सूची प्रबंधन) tab.
- Key parameters saved per dish:
  * Dish Name in English & Hindi (e.g. Braj Special Paneer Bedmi Poori Thali / बृज स्पेशल पनीर पूरी).
  * Food Category: Cooked Meals, Snacks / Sweets, Breads / Roti, Rice & Lentils.
  * Default Portion Unit: Plates, Portions, Kg, Packets.
  * Standard Batch Quantity & Preparation Temperature (>=68°C for hot gravies, room temp for dry sweets).
  * Safe Shelf Life (hours) verified against FSSAI holding standards.
- 1-Click Surplus Declare (1-क्लिक अधिशेष घोषणा): When a batch remains unsold after afternoon or evening service, the chef clicks '1-Click Surplus Declare' on that item card. The system instantly pre-fills all safety parameters, generates the 4-digit Handover OTP, and broadcasts the donation to nearby ashrams in seconds!`,
    hindiContent: `रेस्टोरेंट व्यंजन प्रबंधन व 1-क्लिक अधिशेष घोषणा:
- रेस्टोरेंट व हलवाई अपनी दुकान के सभी नियमित व्यंजनों को 'व्यंजन सूची प्रबंधन' टैब में एक बार सेव करके रख सकते हैं।
- इसमें व्यंजन का नाम (हिंदी व अंग्रेजी), श्रेणी, डिफ़ॉल्ट मात्रा, थाली/किलो यूनिट, पकाने का तापमान (≥60°C) और सुरक्षित समय दर्ज होता है।
- 1-क्लिक अधिशेष घोषणा: दोपहर या रात की सेवा के बाद अतिरिक्त भोजन बचने पर शेफ सीधे उस व्यंजन के कार्ड पर '1-Click Surplus Declare' दबाते हैं। बिना दोबारा टाइप किए तुरंत 4-अंकीय ओटीपी बन जाता है और नजदीकी आश्रमों को अलर्ट चला जाता है।`
  },

  // 14. Platform Benefits, Pros, and Statutory Policies
  {
    id: 'platform-benefits-and-pros',
    topic: 'platform_pros',
    title: 'Platform Pros, Benefits, and Statutory Policies of Foody Loop',
    hindiTitle: 'Foody Loop के संपूर्ण फायदे, लाभ, विनियामक नीतियां एवं विशेषताएं',
    keywords: ['features', 'pros', 'benefits', 'फायदे', 'लाभ', 'policies', 'नीतियां', 'advantages', 'fssai regulations', 'why foody loop', 'zero wastage'],
    content: `Comprehensive Features, Pros, and Statutory Benefits of Foody Loop:
1. For Restaurants & Halwais:
   - 100% Zero Food Waste: Unsold pure vegetarian food is rescued within minutes instead of spoiling.
   - Reputation Tier Upgrades: Successful donors earn reputation points, moving up to 'Trusted Partner' tier recognized by district authorities.
   - Statutory FSSAI Protection: Full adherence to FSSAI Surplus Food Recovery Regulations 2019 protects donors from liability when adhering to holding temperatures.
   - Confidential 4-Digit OTP Security: Guarantees food is handed over only to authorized, verified couriers.
2. For Ashrams & Beneficiaries:
   - Fresh, Dignified, High-Protein Meals: Elderly mothers, sadhus, and pilgrim shelters receive hot Sattvik food directly inside thermal vessels.
   - Real-time Courier Radar: Ashrams see live GPS tracking of the delivery boy heading to the restaurant and towards their doorstep.
   - 'Hands on Food' Co-Sharing: Multiple ashrams can divide large surplus donations harmoniously according to their daily capacity.
3. For Delivery Partners:
   - Community Seva Perks: Free daily prasad thalis, daily fuel stipends, ₹2 Lakh medical insurance cover, and professional career certification.
4. For Society & Environment:
   - Significant Methane Emission Reduction: Preventing cooked food from decomposing in municipal open landfills.
   - Direct Alignment with UN Sustainable Development Goals: SDG 2 (Zero Hunger) & SDG 12 (Responsible Consumption & Production).`,
    hindiContent: `Foody Loop के सभी प्रमुख फीचर्स, लाभ और नीतियां:
1. रेस्टोरेंट व हलवाइयों के लिए:
   - शून्य अन्न बर्बादी: शुद्ध शाकाहारी अतिरिक्त भोजन मिनटों में जरूरतमंदों तक पहुँचता है।
   - प्रतिष्ठा स्कोर व FSSAI बैज: नियमित दाताओं को FSSAI द्वारा 'विश्वस्त भागीदार' (Trusted Partner) की मान्यता मिलती है।
   - कानूनी सुरक्षा: FSSAI 2019 नियमों के तहत तापमान मानकों का पालन करने पर पूर्ण विधिक संरक्षण।
   - 4-अंकीय ओटीपी सुरक्षा: अनधिकृत दावों या फर्जी दावों से 100% सुरक्षा।
2. आश्रमों व लाभार्थियों के लिए:
   - गरमा-गरम सात्त्विक भोजन: वृद्ध माताओं और साधुओं को स्वच्छ इंसुलेटेड बर्तनों में पौष्टिक आहार।
   - लाइव कूरियर रडार: डिलीवरी बॉय दुकान से भोजन कब ले रहा है, इसका रियल-टाइम मैप।
   - 'हाथ रखने' की सुविधा: एक से अधिक आश्रम आपस में बड़े भोजन बैच को बांट सकते हैं।
3. डिलीवरी सेवादारों के लिए:
   - आश्रमों में मुफ्त भोजन, दैनिक पेट्रोल भत्ता, ₹2 लाख का स्वास्थ्य बीमा एवं FSSAI प्रमाण पत्र।
4. पर्यावरण व समाज के लिए:
   - लैंडफिल मीथेन गैस में कमी एवं संयुक्त राष्ट्र SDG 2 (शून्य भुखमरी) के लक्ष्य की पूर्ति।`
  }
];

