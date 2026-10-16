import {
  Shop,
  Ngo,
  Beneficiary,
  Volunteer,
  Donation,
  ItemIntelligenceRecord,
  RawMaterial,
  Recipe,
  DemandForecast,
  Sponsorship,
  AuditLog
} from '../types';

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Krishna Bhojanalaya',
    category: 'Pure Veg Traditional Bhojanalaya',
    location: 'Near Prem Mandir, Raman Reti',
    address: 'Shop 14, Raman Reti Marg, Vrindavan, UP 281121',
    city: 'Vrindavan',
    rating: 4.9,
    reputationScore: 100,
    reputationTier: 'Trusted Partner',
    verified: true,
    fssaiNumber: '12723056000412',
    phone: '+91 98371 45290',
    contactPerson: 'Radheshyam Agarwal',
    lat: 27.5706,
    lng: 77.6743,
    totalDonatedMeals: 1420,
    activeSurplusMeals: 30
  },
  {
    id: 'shop-2',
    name: 'Brijwasi Sweets & Bhojanalaya',
    category: 'Mithai & Traditional Restaurant',
    location: 'Holi Gate Market',
    address: 'Main Chowk, Holi Gate, Mathura, UP 281001',
    city: 'Mathura',
    rating: 4.8,
    reputationScore: 98,
    reputationTier: 'Trusted Partner',
    verified: true,
    fssaiNumber: '12721054000891',
    phone: '+91 94122 88410',
    contactPerson: 'Gopal Krishna Sharma',
    lat: 27.4924,
    lng: 77.6737,
    totalDonatedMeals: 2150,
    activeSurplusMeals: 0
  },
  {
    id: 'shop-3',
    name: 'Radharani Rasoi & Sweets',
    category: 'Dhaba & Community Meals',
    location: 'Radha Rani Temple Parikrama Marg',
    address: 'Near Shriji Mandir Stairs, Barsana, UP 281405',
    city: 'Barsana',
    rating: 4.7,
    reputationScore: 94,
    reputationTier: 'Active Partner',
    verified: true,
    fssaiNumber: '12724059000104',
    phone: '+91 97580 33129',
    contactPerson: 'Murari Lal Goswami',
    lat: 27.6475,
    lng: 77.3758,
    totalDonatedMeals: 890,
    activeSurplusMeals: 15
  },
  {
    id: 'shop-4',
    name: 'Govardhan Annapurna Dhaba',
    category: 'Highway Family Restaurant',
    location: 'Krishna Nagar, NH-19 Corridor',
    address: 'Plot 48, Mathura-Vrindavan Road, Mathura, UP 281004',
    city: 'Mathura',
    rating: 4.8,
    reputationScore: 104,
    reputationTier: 'Trusted Partner',
    verified: true,
    fssaiNumber: '12722055000780',
    phone: '+91 98970 11200',
    contactPerson: 'Devendra Yadav',
    lat: 27.5210,
    lng: 77.6820,
    totalDonatedMeals: 1780,
    activeSurplusMeals: 0
  }
];

export const INITIAL_NGOS: Ngo[] = [
  {
    id: 'ngo-1',
    name: 'Braj Seva Foundation',
    category: 'Food Recovery',
    address: 'Plot 7, Chattikara Road, Vrindavan, UP 281121',
    city: 'Vrindavan',
    capacity: 500,
    dailyServed: 380,
    verified: true,
    contactPerson: 'Vipin Bihari Das',
    phone: '+91 98200 44102',
    lat: 27.5850,
    lng: 77.6620,
    activeVolunteers: 6
  },
  {
    id: 'ngo-2',
    name: 'Vrindavan Food Relief (FFLV Partner)',
    category: 'Community Kitchen',
    address: 'Sunrakh Road, Near Kaliya Ghat, Vrindavan, UP 281121',
    city: 'Vrindavan',
    capacity: 1200,
    dailyServed: 950,
    verified: true,
    contactPerson: 'Dr. Ananya Pandey',
    phone: '+91 98110 55430',
    lat: 27.5890,
    lng: 77.6980,
    activeVolunteers: 14
  },
  {
    id: 'ngo-3',
    name: 'Mathura Annapurna Seva Trust',
    category: 'Charitable Trust',
    address: 'Near Bhuteshwar Railway Station, Mathura, UP 281001',
    city: 'Mathura',
    capacity: 400,
    dailyServed: 310,
    verified: true,
    contactPerson: 'Satish Chandra Gupta',
    phone: '+91 94560 99281',
    lat: 27.5020,
    lng: 77.6690,
    activeVolunteers: 4
  },
  {
    id: 'ngo-4',
    name: 'Barsana Ladliji Seva Samiti',
    category: 'Shelter Management',
    address: 'Rangili Gali, Barsana, UP 281405',
    city: 'Barsana',
    capacity: 350,
    dailyServed: 240,
    verified: true,
    contactPerson: 'Kishori Lal',
    phone: '+91 96900 12344',
    lat: 27.6490,
    lng: 77.3780,
    activeVolunteers: 3
  }
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'Radharani Widow & Elder Care Ashram',
    category: 'Ashram',
    address: 'Parikrama Marg, Raman Reti, Vrindavan',
    city: 'Vrindavan',
    residentsCount: 120,
    currentMealRequirement: 100,
    preferredFoods: ['Dal Rice', 'Khichdi Prasadam', 'Poori Sabzi'],
    receivingHours: '11:30 AM - 3:30 PM & 6:30 PM - 9:00 PM',
    lat: 27.5740,
    lng: 77.6710,
    verified: true
  },
  {
    id: 'ben-2',
    name: 'Yamuna Ghat Night Shelter & Shramik Basti',
    category: 'Night Shelter',
    address: 'Near Vishram Ghat Steps, Mathura',
    city: 'Mathura',
    residentsCount: 250,
    currentMealRequirement: 200,
    preferredFoods: ['Dal Rice', 'Paneer Thali', 'Roti Sabzi'],
    receivingHours: '12:00 PM - 4:00 PM & 7:00 PM - 10:00 PM',
    lat: 27.4980,
    lng: 77.6830,
    verified: true
  },
  {
    id: 'ben-3',
    name: 'Braj Balika Seva Ashram',
    category: 'Ashram',
    address: 'Bhanu Sarovar Marg, Barsana',
    city: 'Barsana',
    residentsCount: 180,
    currentMealRequirement: 150,
    preferredFoods: ['Poori Sabzi', 'Dal Rice', 'Halwa / Sweets'],
    receivingHours: '11:00 AM - 3:00 PM',
    lat: 27.6450,
    lng: 77.3720,
    verified: true
  },
  {
    id: 'ben-4',
    name: 'Raman Reti Vriddhashram',
    category: 'Elder Care',
    address: 'Behind Iskcon Temple, Vrindavan',
    city: 'Vrindavan',
    residentsCount: 90,
    currentMealRequirement: 80,
    preferredFoods: ['Khichdi', 'Soft Dal Rice', 'Roti Sabzi'],
    receivingHours: '12:00 PM - 3:00 PM',
    lat: 27.5720,
    lng: 77.6780,
    verified: true
  }
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'Arun Sharma',
    phone: '+91 98971 22340',
    vehicleType: 'E-Scooter (Insulated Box)',
    city: 'Vrindavan',
    currentStatus: 'Available',
    completedDeliveries: 142,
    rating: 4.95
  },
  {
    id: 'vol-2',
    name: 'Sunil Verma',
    phone: '+91 97600 88210',
    vehicleType: 'Delivery Van',
    city: 'Mathura',
    currentStatus: 'Available',
    completedDeliveries: 289,
    rating: 4.9
  },
  {
    id: 'vol-3',
    name: 'Deepa Yadav',
    phone: '+91 94100 55412',
    vehicleType: 'Cargo Bike',
    city: 'Barsana',
    currentStatus: 'Available',
    completedDeliveries: 94,
    rating: 4.85
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'DON-2026-891',
    donorShopId: 'shop-1',
    donorShopName: 'Krishna Bhojanalaya',
    city: 'Vrindavan',
    foodItem: 'Dal Rice & Fresh Poori Sabzi',
    foodCategory: 'Cooked Meals',
    quantity: 35,
    unit: 'meals',
    preparedAt: '2026-10-16T11:00:00+05:30',
    readyAt: '2026-10-16T11:45:00+05:30',
    safeUntil: '2026-10-16T16:30:00+05:30',
    storageCondition: 'hot_held',
    packagingStatus: 'Food-grade stainless steel dabba + sealed containers',
    handlingInstructions: 'Maintain lid seal during transit. Consume within safe window.',
    allergenNotice: 'Pure vegetarian; No onions, no garlic (Sattvik). Contains dairy (ghee).',
    status: 'DELIVERED',
    fssaiChecklist: {
      preparedFresh: true,
      hygieneDeclaration: true,
      cleanPackaging: true,
      temperatureVerified: true,
      withinWindow: true
    },
    matchedNgoId: 'ngo-1',
    matchedNgoName: 'Braj Seva Foundation',
    targetBeneficiaryId: 'ben-1',
    targetBeneficiaryName: 'Radharani Widow & Elder Care Ashram',
    assignedVolunteerId: 'vol-1',
    assignedVolunteerName: 'Arun Sharma',
    distanceKm: 2.1,
    estimatedTravelTimeMin: 12,
    otpCode: '4928',
    createdAt: '2026-10-16T09:30:00+05:30',
    collectedAt: '2026-10-16T10:15:00+05:30',
    deliveredAt: '2026-10-16T10:45:00+05:30'
  },
  {
    id: 'DON-2026-892',
    donorShopId: 'shop-3',
    donorShopName: 'Radharani Rasoi & Sweets',
    city: 'Barsana',
    foodItem: 'Poori Chole & Besan Ladoo',
    foodCategory: 'Cooked Meals',
    quantity: 15,
    unit: 'meals',
    preparedAt: '2026-10-16T10:00:00+05:30',
    readyAt: '2026-10-16T11:15:00+05:30',
    safeUntil: '2026-10-16T17:00:00+05:30',
    storageCondition: 'room_temp',
    packagingStatus: 'Thermal sealed food boxes with labels',
    handlingInstructions: 'Keep in shade. Distribute promptly.',
    allergenNotice: 'Contains gram flour (besan) and ghee.',
    status: 'MATCHED',
    fssaiChecklist: {
      preparedFresh: true,
      hygieneDeclaration: true,
      cleanPackaging: true,
      temperatureVerified: true,
      withinWindow: true
    },
    matchedNgoId: 'ngo-4',
    matchedNgoName: 'Barsana Ladliji Seva Samiti',
    targetBeneficiaryId: 'ben-3',
    targetBeneficiaryName: 'Braj Balika Seva Ashram',
    assignedVolunteerId: 'vol-3',
    assignedVolunteerName: 'Deepa Yadav',
    distanceKm: 1.8,
    estimatedTravelTimeMin: 9,
    otpCode: '7154',
    createdAt: '2026-10-16T10:45:00+05:30'
  }
];

export const INITIAL_ITEM_INTELLIGENCE: ItemIntelligenceRecord[] = [
  {
    id: 'item-1',
    name: 'Dal Rice Combo',
    hindiName: 'दाल चावल थाली',
    avgDailyPrepared: 100,
    avgDailySold: 92,
    avgDailySurplus: 8,
    surplusRate: 8.0,
    productionCostInr: 45,
    sellingPriceInr: 90,
    salesVariability: 'Low',
    aiInsight: 'Demand highly stable across weekdays. High demand match with nearby Ashrams.',
    demandTrend: [90, 94, 91, 89, 95, 98, 92]
  },
  {
    id: 'item-2',
    name: 'Special Paneer Thali',
    hindiName: 'शाही पनीर थाली',
    avgDailyPrepared: 80,
    avgDailySold: 55,
    avgDailySurplus: 25,
    surplusRate: 31.25,
    productionCostInr: 85,
    sellingPriceInr: 180,
    salesVariability: 'High',
    aiInsight: 'Surplus rate is elevated (31%). Recommend reducing afternoon batch by 15 plates.',
    demandTrend: [50, 52, 60, 48, 55, 70, 55]
  },
  {
    id: 'item-3',
    name: 'Samosa & Kachori Batch',
    hindiName: 'समोसा एवं खस्ता कचौरी',
    avgDailyPrepared: 150,
    avgDailySold: 110,
    avgDailySurplus: 40,
    surplusRate: 26.6,
    productionCostInr: 12,
    sellingPriceInr: 25,
    salesVariability: 'Moderate',
    aiInsight: 'Afternoon tea rush drops post 5:30 PM. Shift to smaller secondary fry batch.',
    demandTrend: [105, 115, 108, 112, 120, 130, 110]
  },
  {
    id: 'item-4',
    name: 'Mathura Poori Sabzi',
    hindiName: 'मथुरा बेडमी पूरी सब्ज़ी',
    avgDailyPrepared: 120,
    avgDailySold: 110,
    avgDailySurplus: 10,
    surplusRate: 8.3,
    productionCostInr: 30,
    sellingPriceInr: 60,
    salesVariability: 'Low',
    aiInsight: 'Breakfast demand is consistent. High pilgrimage turnover on weekends.',
    demandTrend: [110, 108, 112, 114, 118, 125, 110]
  },
  {
    id: 'item-5',
    name: 'Sattvik Khichdi Prasadam',
    hindiName: 'सात्त्विक मूंग दाल खिचड़ी',
    avgDailyPrepared: 60,
    avgDailySold: 55,
    avgDailySurplus: 5,
    surplusRate: 8.3,
    productionCostInr: 28,
    sellingPriceInr: 50,
    salesVariability: 'Low',
    aiInsight: 'Preferred by elderly residents and shelters. Zero waste record on Ekadashi.',
    demandTrend: [55, 54, 56, 55, 58, 62, 55]
  }
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'rm-1',
    name: 'Fresh Paneer',
    hindiName: 'ताज़ा पनीर',
    quantity: 20,
    unit: 'kg',
    costPerUnit: 340,
    expiryDays: 2,
    minThreshold: 5
  },
  {
    id: 'rm-2',
    name: 'Basmati Rice',
    hindiName: 'बासमती चावल',
    quantity: 45,
    unit: 'kg',
    costPerUnit: 75,
    expiryDays: 90,
    minThreshold: 15
  },
  {
    id: 'rm-3',
    name: 'Potatoes (Aloo)',
    hindiName: 'आलू',
    quantity: 30,
    unit: 'kg',
    costPerUnit: 22,
    expiryDays: 14,
    minThreshold: 10
  },
  {
    id: 'rm-4',
    name: 'Sharbati Wheat Flour',
    hindiName: 'गेहूँ का आटा',
    quantity: 50,
    unit: 'kg',
    costPerUnit: 38,
    expiryDays: 45,
    minThreshold: 15
  },
  {
    id: 'rm-5',
    name: 'Pure Desi Ghee & Oil',
    hindiName: 'देसी घी एवं तेल',
    quantity: 18,
    unit: 'L',
    costPerUnit: 210,
    expiryDays: 60,
    minThreshold: 5
  },
  {
    id: 'rm-6',
    name: 'Yellow Moong & Arhar Dal',
    hindiName: 'दाल (मूंग एवं अरहर)',
    quantity: 25,
    unit: 'kg',
    costPerUnit: 140,
    expiryDays: 90,
    minThreshold: 8
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    itemName: 'Special Paneer Thali',
    portionUnit: 'plate',
    ingredients: [
      { rawMaterialId: 'rm-1', name: 'Fresh Paneer', quantityPerPortion: 0.12, unit: 'kg' },
      { rawMaterialId: 'rm-2', name: 'Basmati Rice', quantityPerPortion: 0.15, unit: 'kg' },
      { rawMaterialId: 'rm-4', name: 'Wheat Flour', quantityPerPortion: 0.08, unit: 'kg' },
      { rawMaterialId: 'rm-5', name: 'Ghee & Oil', quantityPerPortion: 0.02, unit: 'L' }
    ]
  },
  {
    id: 'rec-2',
    itemName: 'Dal Rice Combo',
    portionUnit: 'plate',
    ingredients: [
      { rawMaterialId: 'rm-2', name: 'Basmati Rice', quantityPerPortion: 0.18, unit: 'kg' },
      { rawMaterialId: 'rm-6', name: 'Moong / Arhar Dal', quantityPerPortion: 0.08, unit: 'kg' },
      { rawMaterialId: 'rm-5', name: 'Ghee & Oil', quantityPerPortion: 0.015, unit: 'L' }
    ]
  },
  {
    id: 'rec-3',
    itemName: 'Samosa & Kachori Batch',
    portionUnit: 'portion (2 pcs)',
    ingredients: [
      { rawMaterialId: 'rm-3', name: 'Potatoes (Aloo)', quantityPerPortion: 0.15, unit: 'kg' },
      { rawMaterialId: 'rm-4', name: 'Wheat Flour', quantityPerPortion: 0.09, unit: 'kg' },
      { rawMaterialId: 'rm-5', name: 'Ghee & Oil', quantityPerPortion: 0.04, unit: 'L' }
    ]
  }
];

export const INITIAL_FORECASTS: DemandForecast[] = [
  {
    date: '2026-10-17',
    dayOfWeek: 'Saturday',
    festivalEvent: 'Weekend Vrindavan Parikrama Inflow',
    expectedDemandLow: 140,
    expectedDemandHigh: 165,
    suggestedPreparation: 152,
    predictedSurplus: 12,
    stockoutRisk: 'Low',
    confidenceScore: 92,
    explainableReason: 'Saturday pilgrim influx at Prem Mandir increases footfall by 35%. Dal Rice and Poori demand peak.'
  },
  {
    date: '2026-10-18',
    dayOfWeek: 'Sunday',
    festivalEvent: 'Sunday Maha-Aarti Rush',
    expectedDemandLow: 160,
    expectedDemandHigh: 190,
    suggestedPreparation: 175,
    predictedSurplus: 14,
    stockoutRisk: 'Moderate',
    confidenceScore: 89,
    explainableReason: 'Sunday family dining and parikrama footfall. Recommend staggered afternoon batch preparation.'
  },
  {
    date: '2026-10-19',
    dayOfWeek: 'Monday',
    expectedDemandLow: 75,
    expectedDemandHigh: 90,
    suggestedPreparation: 82,
    predictedSurplus: 6,
    stockoutRisk: 'Low',
    confidenceScore: 94,
    explainableReason: 'Standard weekday volume. Baseline historical average across last 4 consecutive Mondays.'
  },
  {
    date: '2026-10-20',
    dayOfWeek: 'Tuesday',
    expectedDemandLow: 80,
    expectedDemandHigh: 95,
    suggestedPreparation: 88,
    predictedSurplus: 7,
    stockoutRisk: 'Low',
    confidenceScore: 93,
    explainableReason: 'Stable local community lunch traffic. High demand for Dal Rice combo.'
  },
  {
    date: '2026-10-21',
    dayOfWeek: 'Wednesday',
    festivalEvent: 'Papankusha Ekadashi Vrat Rush',
    expectedDemandLow: 110,
    expectedDemandHigh: 135,
    suggestedPreparation: 120,
    predictedSurplus: 8,
    stockoutRisk: 'Elevated',
    confidenceScore: 88,
    explainableReason: 'Ekadashi fasting causes shift towards fruit, sabudana, and pure sattvik meals. Standard grain prep should be reduced.'
  }
];

export const INITIAL_SPONSORSHIPS: Sponsorship[] = [
  {
    id: 'SPON-2026-101',
    sponsorName: 'Amit & Neha Singhal',
    phone: '+91 98101 22849',
    occasion: 'Daughter Aaradhya 5th Birthday',
    honoreeName: 'Aaradhya Singhal',
    preferredDate: '2026-10-25',
    preferredCity: 'Vrindavan',
    mealsSponsored: 300,
    budgetInr: 12000,
    beneficiaryLocationId: 'ben-1',
    beneficiaryLocationName: 'Radharani Widow & Elder Care Ashram',
    status: 'Paid & Allocated',
    dedicationMessage: 'May Radha Rani bless our beloved daughter Aaradhya with health, joy and wisdom.',
    certificateId: 'CERT-FL-2026-8941',
    createdAt: '2026-10-15T14:30:00+05:30'
  },
  {
    id: 'SPON-2026-102',
    sponsorName: 'Vikramaditya Oberoi',
    phone: '+91 98210 99401',
    occasion: 'Father Punya Tithi (In Loving Memory)',
    honoreeName: 'Late Shri Rameshwar Oberoi',
    preferredDate: '2026-10-16',
    preferredCity: 'Mathura',
    mealsSponsored: 200,
    budgetInr: 8000,
    beneficiaryLocationId: 'ben-2',
    beneficiaryLocationName: 'Yamuna Ghat Night Shelter & Shramik Basti',
    status: 'Completed',
    dedicationMessage: 'In holy remembrance and prayer for eternal peace on the sacred Yamuna banks.',
    certificateId: 'CERT-FL-2026-8919',
    createdAt: '2026-10-14T09:15:00+05:30'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-1001',
    timestamp: '2026-10-16 10:45:12',
    actor: 'Arun Sharma (Volunteer)',
    action: 'DELIVERY_CONFIRMED',
    category: 'Logistics',
    details: 'Verified OTP #4928 and completed handover of 35 Dal Rice meals at Radharani Widow Ashram.'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-10-16 10:15:40',
    actor: 'Arun Sharma (Volunteer)',
    action: 'PICKUP_COLLECTION_VERIFIED',
    category: 'Safety',
    details: 'Completed physical temperature check (68°C) and food seal inspection at Krishna Bhojanalaya.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-10-16 09:32:05',
    actor: 'Foody Loop AI Matching Engine',
    action: 'MATCH_PROPOSED',
    category: 'Donation',
    details: 'Geospatial match found: Radharani Ashram (2.1 km, 12 min travel time, required 100 meals).'
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-10-16 09:30:22',
    actor: 'Radheshyam Agarwal (Shopkeeper)',
    action: 'DONATION_DECLARED',
    category: 'Donation',
    details: 'Listed 35 meals surplus; FSSAI declaration checklist submitted with safe window till 16:30.'
  },
  {
    id: 'LOG-1005',
    timestamp: '2026-10-15 16:20:00',
    actor: 'Admin Verification Desk',
    action: 'ORGANIZATION_VERIFIED',
    category: 'Verification',
    details: 'Radharani Rasoi (Barsana) FSSAI license 12724059000104 verified and marked Active Partner.'
  }
];
