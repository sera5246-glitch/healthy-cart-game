/**
 * healthy-cart-game / js / data.js
 * 영양교육 - 영양표시 읽기: 24종 간식 영양성분 및 식약처 영양 신호등 데이터
 * 기준: 식품의약품안전처 '어린이 기호식품 영양신호등(색상표시제)' 기준 준수
 */

const TRAFFIC_LIGHT_CRITERIA = {
  // 간식용 어린이 기호식품 1회 섭취참고량 기준
  snack: {
    sugar: {
      name: "당류",
      unit: "g",
      green: { max: 3, label: "녹색 (안심)", desc: "3g 미만: 안심하고 먹을 수 있는 건강한 수준이에요!" },
      yellow: { min: 3, max: 17, label: "황색 (적당히)", desc: "3g 이상 ~ 17g 미만: 하루 권장량을 넘지 않게 적당히 섭취해요." },
      red: { min: 17, label: "적색 (주의)", desc: "17g 이상: 과다 섭취 시 충치와 비만을 유발할 수 있으니 주의해요!" }
    },
    sodium: {
      name: "나트륨",
      unit: "mg",
      green: { max: 100, label: "녹색 (안심)", desc: "100mg 미만: 짜지 않고 순한 건강 식품이에요!" },
      yellow: { min: 100, max: 200, label: "황색 (적당히)", desc: "100mg 이상 ~ 200mg 미만: 짭짤한 맛이 있으니 과식하지 마세요." },
      red: { min: 200, label: "적색 (주의)", desc: "200mg 이상: 혈압 상승과 갈증을 일으킬 수 있는 짠 음식이에요!" }
    },
    fat: {
      name: "지방",
      unit: "g",
      green: { max: 1.5, label: "녹색 (안심)", desc: "1.5g 미만: 기름기가 적고 담백해요." },
      yellow: { min: 1.5, max: 6.0, label: "황색 (적당히)", desc: "1.5g 이상 ~ 6.0g 미만: 적당한 지방이 들어있어요." },
      red: { min: 6.0, label: "적색 (주의)", desc: "6.0g 이상: 기름기가 많아 칼로리가 높아요!" }
    },
    saturatedFat: {
      name: "포화지방",
      unit: "g",
      green: { max: 0.7, label: "녹색 (안심)", desc: "0.7g 미만: 혈관을 건강하게 지켜줘요." },
      yellow: { min: 0.7, max: 2.5, label: "황색 (적당히)", desc: "0.7g 이상 ~ 2.5g 미만: 혈관 건강을 위해 조금만 드세요." },
      red: { min: 2.5, label: "적색 (주의)", desc: "2.5g 이상: 혈관에 나쁜 찌꺼기가 쌓일 수 있어 주의해요!" }
    }
  },
  // 음료류 기준
  beverage: {
    sugar: {
      name: "당류",
      unit: "g",
      green: { max: 2.5, label: "녹색 (안심)", desc: "2.5g 미만: 단맛이 적고 수분 보충에 좋아요." },
      yellow: { min: 2.5, max: 11.0, label: "황색 (적당히)", desc: "2.5g 이상 ~ 11g 미만: 설탕이 제법 들어있어 갈증 날 때만 마셔요." },
      red: { min: 11.0, label: "적색 (주의)", desc: "11g 이상: 각설탕 여러 개 분량의 당류 폭탄! 물을 대신 마셔요." }
    },
    sodium: {
      name: "나트륨",
      unit: "mg",
      green: { max: 50, label: "녹색 (안심)", desc: "50mg 미만: 깔끔하고 순한 음료입니다." },
      yellow: { min: 50, max: 100, label: "황색 (적당히)", desc: "50mg ~ 100mg: 약간의 염분이 들어있어요." },
      red: { min: 100, label: "적색 (주의)", desc: "100mg 이상: 음료 치고 나트륨 함량이 높아요!" }
    },
    fat: {
      name: "지방",
      unit: "g",
      green: { max: 0.5, label: "녹색 (안심)", desc: "0.5g 미만: 무지방에 가까워요." },
      yellow: { min: 0.5, max: 2.0, label: "황색 (적당히)", desc: "0.5g ~ 2.0g: 부드러운 유지방 수준이에요." },
      red: { min: 2.0, label: "적색 (주의)", desc: "2.0g 이상: 음료치고 지방 함량이 높아요." }
    },
    saturatedFat: {
      name: "포화지방",
      unit: "g",
      green: { max: 0.3, label: "녹색 (안심)", desc: "0.3g 미만: 혈관에 안전해요." },
      yellow: { min: 0.3, max: 1.0, label: "황색 (적당히)", desc: "0.3g ~ 1.0g: 적정 수준의 유지방이에요." },
      red: { min: 1.0, label: "적색 (주의)", desc: "1.0g 이상: 동물성 포화지방이 많아요." }
    }
  }
};

const SNACK_DATA = [
  // ==========================================
  // 1. 과자·스낵류 (4종)
  // ==========================================
  {
    id: "chips",
    name: "바삭 감자칩",
    category: "과자류",
    subCategory: "snack",
    image: "assets/images/snacks/chips.svg",
    servingSize: "1봉지 (50g)",
    calories: 275,
    tagline: "바삭하고 짭조름한 오리지널 감자칩",
    isHealthy: false,
    nutrients: { carb: 28, sugar: 1.2, protein: 3.1, fat: 17.5, saturatedFat: 5.2, transFat: 0.1, cholesterol: 0, sodium: 290 },
    dailyRatio: { carb: 9, sugar: 1, protein: 6, fat: 32, saturatedFat: 35, cholesterol: 0, sodium: 15 },
    trafficLight: { sugar: "green", sodium: "red", fat: "red", saturatedFat: "red" },
    sugarCubes: 0.4,
    educationTip: "당류는 적지만 기름에 튀겨 나트륨(290mg)과 포화지방(5.2g)이 모두 빨간불이에요!",
    doctorQuote: "바삭한 소리와 짠맛에 이끌리기 쉽지만, 기름에 튀겨 포화지방이 매우 높아요. 주 1회 이하로 소량만 먹는 것이 좋아요!"
  },
  {
    id: "ramen",
    name: "치즈 라면스낵",
    category: "과자류",
    subCategory: "snack",
    image: "assets/images/snacks/ramen.svg",
    servingSize: "1봉 (55g)",
    calories: 260,
    tagline: "뿌려먹는 마법의 짭짤 치즈 시즈닝 라면과자",
    isHealthy: false,
    nutrients: { carb: 34, sugar: 4.5, protein: 4.0, fat: 12.0, saturatedFat: 5.5, transFat: 0, cholesterol: 2, sodium: 460 },
    dailyRatio: { carb: 10, sugar: 5, protein: 7, fat: 22, saturatedFat: 37, cholesterol: 1, sodium: 23 },
    trafficLight: { sugar: "yellow", sodium: "red", fat: "red", saturatedFat: "red" },
    sugarCubes: 1.5,
    educationTip: "나트륨이 무려 460mg으로 강력한 적색(빨간불)! 기름에 튀긴 면이라 포화지방도 빨간불이에요.",
    doctorQuote: "라면스낵 1봉지의 나트륨은 어린이 하루 권장량의 1/3에 달해요. 짠맛에 미각이 둔해질 수 있으니 주의하세요!"
  },
  {
    id: "popcorn",
    name: "달콤 카라멜 팝콘",
    category: "과자류",
    subCategory: "snack",
    image: "assets/images/snacks/popcorn.svg",
    servingSize: "1컵 (70g)",
    calories: 310,
    tagline: "고소한 옥수수에 진한 카라멜을 입힌 극장 팝콘",
    isHealthy: false,
    nutrients: { carb: 48, sugar: 22.0, protein: 2.5, fat: 12.0, saturatedFat: 3.8, transFat: 0.1, cholesterol: 5, sodium: 140 },
    dailyRatio: { carb: 15, sugar: 22, protein: 5, fat: 22, saturatedFat: 25, cholesterol: 2, sodium: 7 },
    trafficLight: { sugar: "red", sodium: "yellow", fat: "red", saturatedFat: "red" },
    sugarCubes: 7.3,
    educationTip: "옥수수는 곡물이지만 설탕과 버터 시럽을 듬뿍 코팅해 당류(22g 빨강)와 포화지방이 매우 높아요.",
    doctorQuote: "영화 볼 때 무심코 계속 먹다 보면 각설탕 7개와 밥 한 공기 이상의 칼로리를 섭취하게 됩니다."
  },
  {
    id: "rice_cracker",
    name: "유기농 현미 쌀과자",
    category: "과자류",
    subCategory: "snack",
    image: "assets/images/snacks/rice_cracker.svg",
    servingSize: "1봉 (30g)",
    calories: 110,
    tagline: "기름에 튀기지 않고 열과 압력으로 구운 쌀과자",
    isHealthy: true,
    nutrients: { carb: 24, sugar: 0.8, protein: 2.2, fat: 0.5, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 18 },
    dailyRatio: { carb: 7, sugar: 1, protein: 4, fat: 1, saturatedFat: 1, cholesterol: 0, sodium: 1 },
    trafficLight: { sugar: "green", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 0.3,
    educationTip: "당류, 나트륨, 지방 모두 완벽한 올 초록불(All Green)! 기름이 없어 담백하고 소화도 잘돼요.",
    doctorQuote: "과자가 먹고 싶을 땐 기름에 튀기지 않은 통곡물 쌀과자를 선택하는 것이 훌륭한 건강 습관입니다."
  },

  // ==========================================
  // 2. 베이커리·디저트 (4종)
  // ==========================================
  {
    id: "chocopie",
    name: "달콤 쫀득 초코파이",
    category: "베이커리",
    subCategory: "snack",
    image: "assets/images/snacks/chocopie.svg",
    servingSize: "1봉 (35g)",
    calories: 168,
    tagline: "부드러운 빵 속에 달콤한 마시멜로와 초콜릿 코팅",
    isHealthy: false,
    nutrients: { carb: 23, sugar: 18.5, protein: 1.8, fat: 7.8, saturatedFat: 4.8, transFat: 0.1, cholesterol: 4, sodium: 120 },
    dailyRatio: { carb: 7, sugar: 19, protein: 3, fat: 14, saturatedFat: 32, cholesterol: 1, sodium: 6 },
    trafficLight: { sugar: "red", sodium: "yellow", fat: "red", saturatedFat: "red" },
    sugarCubes: 6.2,
    educationTip: "작은 1봉지에 당류가 18.5g(빨강!), 포화지방도 4.8g(빨강!)이에요. 단맛이 강해 중독되기 쉬워요.",
    doctorQuote: "마시멜로와 초콜릿 코팅 때문에 당류와 포화지방이 매우 높아요. 특별한 날에만 1개씩 드세요."
  },
  {
    id: "cookie",
    name: "수제 초코칩 쿠키",
    category: "베이커리",
    subCategory: "snack",
    image: "assets/images/snacks/cookie.svg",
    servingSize: "1개 (45g)",
    calories: 220,
    tagline: "버터 풍미 가득한 바삭한 초코칩 쿠키",
    isHealthy: false,
    nutrients: { carb: 28, sugar: 16.0, protein: 2.5, fat: 11.0, saturatedFat: 6.5, transFat: 0.2, cholesterol: 15, sodium: 150 },
    dailyRatio: { carb: 9, sugar: 16, protein: 5, fat: 20, saturatedFat: 43, cholesterol: 5, sodium: 8 },
    trafficLight: { sugar: "yellow", sodium: "yellow", fat: "red", saturatedFat: "red" },
    sugarCubes: 5.3,
    educationTip: "버터를 많이 넣어 포화지방(6.5g)이 1일 기준치의 43%에 달해요! 혈관 건강을 위해 주의해야 해요.",
    doctorQuote: "고소한 버터와 초콜릿 때문에 포화지방 수치가 빨간불입니다. 하루에 1개 이상 먹지 않는 것이 좋습니다."
  },
  {
    id: "donut",
    name: "달콤 글레이즈드 도넛",
    category: "베이커리",
    subCategory: "snack",
    image: "assets/images/snacks/donut.svg",
    servingSize: "1개 (52g)",
    calories: 255,
    tagline: "기름에 튀긴 빵 위에 하얀 설탕 시럽을 입힌 도넛",
    isHealthy: false,
    nutrients: { carb: 31, sugar: 21.0, protein: 3.0, fat: 13.0, saturatedFat: 5.8, transFat: 0.1, cholesterol: 10, sodium: 240 },
    dailyRatio: { carb: 10, sugar: 21, protein: 5, fat: 24, saturatedFat: 39, cholesterol: 3, sodium: 12 },
    trafficLight: { sugar: "red", sodium: "red", fat: "red", saturatedFat: "red" },
    sugarCubes: 7.0,
    educationTip: "당류, 나트륨, 지방, 포화지방 4대 항목이 모두 빨간불(All Red)! 가장 주의해야 할 간식 중 하나예요.",
    doctorQuote: "기름에 튀긴 데다 설탕 코팅까지 더해져 혈당을 급격히 올리고 비만을 부르는 대표적인 고열량 저영양 식품이에요."
  },
  {
    id: "jelly",
    name: "알록달록 무지개 젤리",
    category: "베이커리",
    subCategory: "snack",
    image: "assets/images/snacks/jelly.svg",
    servingSize: "1봉 (50g)",
    calories: 165,
    tagline: "쫄깃쫄깃 귀여운 곰돌이 모양 과일맛 젤리",
    isHealthy: false,
    nutrients: { carb: 38, sugar: 26.0, protein: 3.0, fat: 0.1, saturatedFat: 0.05, transFat: 0, cholesterol: 0, sodium: 25 },
    dailyRatio: { carb: 12, sugar: 26, protein: 5, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 1 },
    trafficLight: { sugar: "red", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 8.6,
    educationTip: "지방이 0이라도 전체 무게 50g 중 절반 이상인 26g이 전부 설탕! 치아에 달라붙어 충치 발생 1위 간식이에요.",
    doctorQuote: "젤리는 치아 틈새에 달라붙어 충치균을 빠르게 증식시켜요. 젤리를 먹은 후에는 꼭 물로 입을 헹구고 양치질을 해야 해요!"
  },

  // ==========================================
  // 3. 음료수 (4종)
  // ==========================================
  {
    id: "cola",
    name: "톡톡 탄산음료",
    category: "음료수",
    subCategory: "beverage",
    image: "assets/images/snacks/cola.svg",
    servingSize: "1캔 (250ml)",
    calories: 110,
    tagline: "시원하고 톡 쏘는 청량 탄산음료",
    isHealthy: false,
    nutrients: { carb: 28, sugar: 27.5, protein: 0, fat: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 15 },
    dailyRatio: { carb: 9, sugar: 28, protein: 0, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 1 },
    trafficLight: { sugar: "red", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 9.1,
    educationTip: "당류가 무려 27.5g! 각설탕 9개를 물에 녹여 마시는 것과 같아요. 충치와 급격한 혈당 상승의 주범입니다.",
    doctorQuote: "갈증 날 때 탄산음료를 마시면 오히려 몸속 수분이 빠져나가요. 물이나 보리차를 마시는 습관을 길러보세요!"
  },
  {
    id: "barley_tea",
    name: "구수한 유기농 보리차",
    category: "음료수",
    subCategory: "beverage",
    image: "assets/images/snacks/barley_tea.svg",
    servingSize: "1병 (330ml)",
    calories: 0,
    tagline: "국산 유기농 겉보리를 정성껏 우려낸 천연 보리차",
    isHealthy: true,
    nutrients: { carb: 0, sugar: 0, protein: 0, fat: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5 },
    dailyRatio: { carb: 0, sugar: 0, protein: 0, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 0 },
    trafficLight: { sugar: "green", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 0,
    educationTip: "당류 0g, 카페인 0mg, 칼로리 0 kcal! 몸속 수분을 가장 건강하고 빠르게 채워주는 음료의 왕입니다.",
    doctorQuote: "갈증 해소와 체온 조절에 가장 이상적인 음료입니다. 달콤한 주스 대신 보리차를 자주 마셔주세요!"
  },
  {
    id: "juice",
    name: "100% 착즙 오렌지주스",
    category: "음료수",
    subCategory: "beverage",
    image: "assets/images/snacks/juice.svg",
    servingSize: "1병 (200ml)",
    calories: 95,
    tagline: "물 한 방울 없이 오렌지를 그대로 착즙한 주스",
    isHealthy: false,
    nutrients: { carb: 22, sugar: 19.5, protein: 1.2, fat: 0.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 12 },
    dailyRatio: { carb: 7, sugar: 20, protein: 2, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 1 },
    trafficLight: { sugar: "red", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 6.5,
    educationTip: "100% 과즙이라도 식이섬유가 빠져 과일 당류가 농축되어 있어요. 당류(19.5g)가 빨간불이니 한 번에 많이 마시면 안 돼요.",
    doctorQuote: "주스로 마시는 것보다 생과일을 그대로 씹어 먹는 것이 식이섬유를 함께 섭취해 혈당을 천천히 올립니다."
  },
  {
    id: "energy_drink",
    name: "파워 에너지 드링크",
    category: "음료수",
    subCategory: "beverage",
    image: "assets/images/snacks/energy_drink.svg",
    servingSize: "1캔 (250ml)",
    calories: 125,
    tagline: "타우린과 고카페인이 함유된 활력 탄산음료",
    isHealthy: false,
    nutrients: { carb: 30, sugar: 28.0, protein: 0.5, fat: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 110 },
    dailyRatio: { carb: 9, sugar: 28, protein: 1, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 6 },
    trafficLight: { sugar: "red", sodium: "red", fat: "green", saturatedFat: "green" },
    sugarCubes: 9.3,
    educationTip: "당류 빨간불에 음료 기준 나트륨도 빨간불! 특히 성장기 어린이에게 수면 장애와 두근거림을 유발하는 고카페인 음료예요.",
    doctorQuote: "어린이나 청소년은 성인보다 카페인 분해 능력이 떨어져 두통과 불안을 유발해요. 절대 마시지 않도록 권장합니다."
  },

  // ==========================================
  // 4. 유제품 (6종)
  // ==========================================
  {
    id: "milk",
    name: "고소한 저지방 흰우유",
    category: "유제품",
    subCategory: "beverage",
    image: "assets/images/snacks/milk.svg",
    servingSize: "1팩 (200ml)",
    calories: 85,
    tagline: "키가 쑥쑥! 칼슘과 단백질이 풍부한 흰우유",
    isHealthy: true,
    nutrients: { carb: 9, sugar: 4.2, protein: 6.2, fat: 2.0, saturatedFat: 0.9, transFat: 0, cholesterol: 10, sodium: 80 },
    dailyRatio: { carb: 3, sugar: 4, protein: 11, fat: 4, saturatedFat: 6, cholesterol: 3, sodium: 4 },
    trafficLight: { sugar: "yellow", sodium: "yellow", fat: "yellow", saturatedFat: "yellow" },
    sugarCubes: 1.4,
    educationTip: "우유의 당류(4.2g)는 인공 설탕이 아닌 자연 젖당(Lactose)! 뼈를 튼튼하게 만드는 칼슘 210mg이 들어있어요.",
    doctorQuote: "흰우유는 인공 감미료가 없는 자연 그대로의 완전식품입니다. 매일 1~2잔씩 꾸준히 마시면 키 성장에 큰 도움이 됩니다."
  },
  {
    id: "yogurt",
    name: "딸기 그릭요거트",
    category: "유제품",
    subCategory: "snack",
    image: "assets/images/snacks/yogurt.svg",
    servingSize: "1컵 (85g)",
    calories: 95,
    tagline: "단백질과 유산균이 살아있는 딸기 요거트",
    isHealthy: true,
    nutrients: { carb: 13, sugar: 6.8, protein: 7.2, fat: 1.4, saturatedFat: 0.6, transFat: 0, cholesterol: 5, sodium: 45 },
    dailyRatio: { carb: 4, sugar: 7, protein: 13, fat: 3, saturatedFat: 4, cholesterol: 2, sodium: 2 },
    trafficLight: { sugar: "yellow", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 2.2,
    educationTip: "단백질(7.2g)이 풍부하고 나트륨과 포화지방이 모두 안심 초록불이에요! 과일 당류가 약간 있어 노랑불이지만 모범 간식이에요.",
    doctorQuote: "장 건강에 좋은 유산균과 성장기 필수 단백질이 듬뿍 들어있는 모범 건강 간식이랍니다!"
  },
  {
    id: "plain_yogurt",
    name: "무가당 플레인 요거트",
    category: "유제품",
    subCategory: "snack",
    image: "assets/images/snacks/plain_yogurt.svg",
    servingSize: "1컵 (100g)",
    calories: 65,
    tagline: "설탕을 전혀 넣지 않은 순수 원유 발효 요거트",
    isHealthy: true,
    nutrients: { carb: 4.8, sugar: 2.2, protein: 8.0, fat: 1.2, saturatedFat: 0.5, transFat: 0, cholesterol: 4, sodium: 40 },
    dailyRatio: { carb: 1, sugar: 2, protein: 15, fat: 2, saturatedFat: 3, cholesterol: 1, sodium: 2 },
    trafficLight: { sugar: "green", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 0.7,
    educationTip: "당류(2.2g)마저 초록불인 무설탕 요거트! 고단백(8g)에 살아있는 생유산균이 가득해 장이 건강해져요.",
    doctorQuote: "달콤한 과일 요거트 대신 무가당 플레인 요거트에 생딸기나 블루베리를 얹어 먹으면 최고의 건강 간식이 됩니다."
  },
  {
    id: "banana_milk",
    name: "달콤 단지 바나나우유",
    category: "유제품",
    subCategory: "beverage",
    image: "assets/images/snacks/banana_milk.svg",
    servingSize: "1병 (240ml)",
    calories: 195,
    tagline: "달콤하고 부드러운 전 국민의 추억의 항아리 우유",
    isHealthy: false,
    nutrients: { carb: 28, sugar: 24.0, protein: 5.5, fat: 6.0, saturatedFat: 3.2, transFat: 0.1, cholesterol: 20, sodium: 110 },
    dailyRatio: { carb: 9, sugar: 24, protein: 10, fat: 11, saturatedFat: 21, cholesterol: 7, sodium: 6 },
    trafficLight: { sugar: "red", sodium: "red", fat: "red", saturatedFat: "red" },
    sugarCubes: 8.0,
    educationTip: "우유라는 이름이지만 설탕이 무려 24g(각설탕 8개)이나 들어있어 당류, 포화지방, 나트륨 모두 빨간불이에요!",
    doctorQuote: "가공우유(초코, 딸기, 바나나우유)는 흰우유에 비해 설탕이 매우 많이 들어있으니 흰우유를 우선 선택하세요."
  },
  {
    id: "cheese",
    name: "쫄깃 스트링 치즈",
    category: "유제품",
    subCategory: "snack",
    image: "assets/images/snacks/cheese.svg",
    servingSize: "1개 (24g)",
    calories: 60,
    tagline: "결대로 쭉쭉 찢어먹는 100% 자연 모짜렐라 치즈",
    isHealthy: true,
    nutrients: { carb: 0.5, sugar: 0.2, protein: 6.0, fat: 3.8, saturatedFat: 2.1, transFat: 0, cholesterol: 15, sodium: 95 },
    dailyRatio: { carb: 0, sugar: 0, protein: 11, fat: 7, saturatedFat: 14, cholesterol: 5, sodium: 5 },
    trafficLight: { sugar: "green", sodium: "green", fat: "yellow", saturatedFat: "yellow" },
    sugarCubes: 0.1,
    educationTip: "당류가 거의 0g(초록불)! 단백질 6g과 칼슘이 가득해 성장기 뼈 건강에 아주 유익한 간식이에요.",
    doctorQuote: "찢어먹는 재미가 있는 스트링 치즈는 설탕 걱정 없이 양질의 단백질과 칼슘을 보충할 수 있는 착한 치즈입니다."
  },
  {
    id: "icecream",
    name: "바닐라 초코 소프트콘",
    category: "유제품",
    subCategory: "snack",
    image: "assets/images/snacks/icecream.svg",
    servingSize: "1개 (140ml)",
    calories: 240,
    tagline: "부드러운 바닐라 아이스크림에 달콤 초코 시럽 코팅",
    isHealthy: false,
    nutrients: { carb: 32, sugar: 25.0, protein: 3.5, fat: 11.5, saturatedFat: 6.5, transFat: 0.2, cholesterol: 25, sodium: 90 },
    dailyRatio: { carb: 10, sugar: 25, protein: 6, fat: 21, saturatedFat: 43, cholesterol: 8, sodium: 5 },
    trafficLight: { sugar: "red", sodium: "green", fat: "red", saturatedFat: "red" },
    sugarCubes: 8.3,
    educationTip: "시원하고 부드럽지만 당류(25g 빨강)와 포화지방(6.5g 빨강)이 매우 높아 더위를 식히려다 충치와 비만을 부를 수 있어요.",
    doctorQuote: "여름철 더울 땐 아이스크림 대신 차가운 과일 슬라이스나 얼린 바나나를 셔벗처럼 즐겨보세요."
  },

  // ==========================================
  // 5. 신선 과일·채소 (4종)
  // ==========================================
  {
    id: "tomato",
    name: "달콤 아삭 방울토마토 컵",
    category: "신선식품",
    subCategory: "snack",
    image: "assets/images/snacks/tomato.svg",
    servingSize: "1컵 (120g)",
    calories: 24,
    tagline: "비타민C와 수분이 톡 터지는 천연 방울토마토",
    isHealthy: true,
    nutrients: { carb: 5.2, sugar: 2.8, protein: 1.2, fat: 0.2, saturatedFat: 0.05, transFat: 0, cholesterol: 0, sodium: 8 },
    dailyRatio: { carb: 2, sugar: 3, protein: 2, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 0 },
    trafficLight: { sugar: "green", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 0.9,
    educationTip: "모든 항목이 반짝이는 '올 초록불(All Green)'! 항산화 성분 라이코펜과 비타민이 풍부한 최고의 슈퍼푸드예요.",
    doctorQuote: "언제 먹어도 부담 없는 최고의 영양 우등생 간식! 공부할 때 곁에 두고 먹으면 눈 건강과 피로 회복에 아주 좋아요."
  },
  {
    id: "apple",
    name: "아삭 슬라이스 사과",
    category: "신선식품",
    subCategory: "snack",
    image: "assets/images/snacks/apple.svg",
    servingSize: "1팩 (100g)",
    calories: 55,
    tagline: "껍질째 먹는 상큼 달콤한 신선 사과 슬라이스",
    isHealthy: true,
    nutrients: { carb: 14.0, sugar: 11.0, protein: 0.3, fat: 0.2, saturatedFat: 0.03, transFat: 0, cholesterol: 0, sodium: 2 },
    dailyRatio: { carb: 4, sugar: 11, protein: 1, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 0 },
    trafficLight: { sugar: "yellow", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 3.6,
    educationTip: "사과의 당분은 천연 과당이며, 껍질에 식이섬유(펙틴)가 풍부해 장 속 노폐물을 밖으로 배출해줘요.",
    doctorQuote: "아침에 먹는 사과는 '금사과'! 인공 과자 대신 아삭한 사과를 씹으면 턱 근육과 뇌 발달에도 도움이 됩니다."
  },
  {
    id: "banana",
    name: "자연 그대로 바나나",
    category: "신선식품",
    subCategory: "snack",
    image: "assets/images/snacks/banana.svg",
    servingSize: "1개 (100g)",
    calories: 90,
    tagline: "운동 전후 최고의 에너지원! 칼륨이 풍부한 생바나나",
    isHealthy: true,
    nutrients: { carb: 22.0, sugar: 12.0, protein: 1.1, fat: 0.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1 },
    dailyRatio: { carb: 7, sugar: 12, protein: 2, fat: 1, saturatedFat: 1, cholesterol: 0, sodium: 0 },
    trafficLight: { sugar: "yellow", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 4.0,
    educationTip: "체내 나트륨을 배출해주는 칼륨(360mg)이 풍부해요. 나트륨과 포화지방이 초록불인 훌륭한 자연 간식입니다.",
    doctorQuote: "체육 활동이나 놀이터에서 뛰어놀기 전 바나나를 먹으면 지속적인 에너지를 내는 데 큰 도움이 됩니다."
  },
  {
    id: "sweetpotato",
    name: "달콤 꿀 군고구마",
    category: "신선식품",
    subCategory: "snack",
    image: "assets/images/snacks/sweetpotato.svg",
    servingSize: "1개 (100g)",
    calories: 130,
    tagline: "오븐에 노릇하게 구워낸 식이섬유 듬뿍 꿀고구마",
    isHealthy: true,
    nutrients: { carb: 31.0, sugar: 14.0, protein: 1.5, fat: 0.2, saturatedFat: 0.05, transFat: 0, cholesterol: 0, sodium: 25 },
    dailyRatio: { carb: 10, sugar: 14, protein: 3, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 1 },
    trafficLight: { sugar: "yellow", sodium: "green", fat: "green", saturatedFat: "green" },
    sugarCubes: 4.6,
    educationTip: "달콤하지만 풍부한 식이섬유(3.5g) 덕분에 포만감이 오래가고 혈당이 천천히 올라가는 착한 탄수화물이에요.",
    doctorQuote: "밀가루 빵 대신 군고구마를 간식으로 선택하면 장 건강과 면역력(비타민A)을 동시에 지킬 수 있어요."
  },

  // ==========================================
  // 6. 견과·건강바 (2종)
  // ==========================================
  {
    id: "nuts",
    name: "하루 한 줌 견과류",
    category: "견과류",
    subCategory: "snack",
    image: "assets/images/snacks/nuts.svg",
    servingSize: "1봉 (25g)",
    calories: 145,
    tagline: "아몬드, 호두, 캐슈넛이 듬뿍 들어간 영양 간식",
    isHealthy: true,
    nutrients: { carb: 6, sugar: 1.6, protein: 4.8, fat: 12.2, saturatedFat: 1.3, transFat: 0, cholesterol: 0, sodium: 6 },
    dailyRatio: { carb: 2, sugar: 2, protein: 9, fat: 23, saturatedFat: 9, cholesterol: 0, sodium: 0 },
    trafficLight: { sugar: "green", sodium: "green", fat: "red", saturatedFat: "yellow" },
    sugarCubes: 0.5,
    educationTip: "당류(1.6g)와 나트륨(6mg)이 완벽한 초록불! 지방은 뇌세포를 건강하게 하는 착한 불포화지방산이에요.",
    doctorQuote: "견과류의 지방은 뇌세포를 건강하게 만드는 착한 기름(오메가-3)입니다. 무염 견과류를 하루 한 줌 먹으면 머리가 똑똑해져요!"
  },
  {
    id: "oatbar",
    name: "통밀 바나나 오트밀바",
    category: "간식류",
    subCategory: "snack",
    image: "assets/images/snacks/oatbar.svg",
    servingSize: "1개 (38g)",
    calories: 135,
    tagline: "귀리와 통밀, 건바나나로 만든 든든한 에너지바",
    isHealthy: true,
    nutrients: { carb: 22, sugar: 5.4, protein: 3.5, fat: 3.8, saturatedFat: 0.6, transFat: 0, cholesterol: 0, sodium: 75 },
    dailyRatio: { carb: 7, sugar: 5, protein: 6, fat: 7, saturatedFat: 4, cholesterol: 0, sodium: 4 },
    trafficLight: { sugar: "yellow", sodium: "green", fat: "yellow", saturatedFat: "green" },
    sugarCubes: 1.8,
    educationTip: "식이섬유가 풍부한 통밀과 귀리로 만들어 포만감이 오래가요. 포화지방(0.6g)과 나트륨(75mg)이 초록불로 혈관에 부담이 적어요.",
    doctorQuote: "배가 출출할 때 과자 대신 오트밀바를 선택해보세요. 곡물의 건강함과 은은한 단맛을 느낄 수 있어요!"
  }
];

const GAME_MISSIONS = [
  {
    level: 1,
    title: "1단계: 신호등 탐험가",
    badgeName: "영양 탐정 뱃지",
    targetDescription: "마트의 다양한 간식들을 뒤집어서 영양성분표를 읽고, 신호등 색깔을 3개 이상 확인해보세요!",
    instruction: "간식 카드를 클릭하거나 [🔄 성분표 보기] 버튼을 눌러 뒷면 영양성분표를 확인하세요. 3가지 이상 확인 후 다음 미션으로 넘어갑니다.",
    type: "explore",
    targetCount: 3,
    checkProgress: (state) => state.inspectedItems.size,
    isCompleted: (state) => state.inspectedItems.size >= 3,
    rewardMessage: "참 잘했어요! 간식 포장지 뒤에는 우리 몸에 미치는 숨은 비밀(영양성분표)이 적혀있다는 걸 배웠군요!"
  },
  {
    level: 2,
    title: "2단계: 당류를 잡아라! (설탕 주의보)",
    badgeName: "치아 수호자 뱃지",
    targetDescription: "충치와 소아비만을 부르는 '당류 빨간불(적색)' 간식을 피해, 안전한 간식 3가지를 카트에 담으세요!",
    instruction: "성분표의 '당류' 항목이 초록불이나 노랑불인 간식 3개를 골라 장바구니에 쏙 담아보세요.",
    type: "cart",
    targetCount: 3,
    checkProgress: (state) => state.cart.filter(item => item.trafficLight.sugar !== 'red').length,
    isCompleted: (state) => {
      const validItems = state.cart.filter(item => item.trafficLight.sugar !== 'red');
      const redSugarItems = state.cart.filter(item => item.trafficLight.sugar === 'red');
      return validItems.length >= 3 && redSugarItems.length === 0;
    },
    rewardMessage: "대단해요! 달콤한 설탕 폭탄 유혹을 이겨내고 치아와 혈관을 지키는 훌륭한 간식들을 선택했습니다!"
  },
  {
    level: 3,
    title: "3단계: 나트륨 다이어트! (소금 줄이기)",
    badgeName: "혈관 지킴이 뱃지",
    targetDescription: "혈압을 높이고 붓기를 유발하는 소금을 줄여요! '나트륨 초록불' 간식을 3가지 이상 담으세요!",
    instruction: "간식 뒷면 성분표에서 나트륨이 '녹색(100mg 미만)'인 착한 간식들을 장바구니에 채워보세요.",
    type: "cart",
    targetCount: 3,
    checkProgress: (state) => state.cart.filter(item => item.trafficLight.sodium === 'green').length,
    isCompleted: (state) => {
      const greenSodiumItems = state.cart.filter(item => item.trafficLight.sodium === 'green');
      const redSodiumItems = state.cart.filter(item => item.trafficLight.sodium === 'red');
      return greenSodiumItems.length >= 3 && redSodiumItems.length === 0;
    },
    rewardMessage: "완벽해요! 짠맛 대신 재료 본연의 영양을 살린 저나트륨 간식 장바구니를 멋지게 완성했습니다!"
  },
  {
    level: 4,
    title: "4단계: 영양 만점 골든 카트 (최종 마스터)",
    badgeName: "어린이 영양 박사 뱃지",
    targetDescription: "빨간불이 하나도 없는 '건강 안심 간식' 4가지를 담아 완벽한 골든 카트를 완성하세요!",
    instruction: "당류, 나트륨, 포화지방 모두 빨간불이 없는 간식을 담고 최종 영양 성적표를 받아보세요!",
    type: "cart",
    targetCount: 4,
    checkProgress: (state) => state.cart.filter(item => {
      const tl = item.trafficLight;
      return tl.sugar !== 'red' && tl.sodium !== 'red' && tl.fat !== 'red' && tl.saturatedFat !== 'red';
    }).length,
    isCompleted: (state) => {
      const allSafe = state.cart.every(item => {
        const tl = item.trafficLight;
        return tl.sugar !== 'red' && tl.sodium !== 'red' && tl.fat !== 'red' && tl.saturatedFat !== 'red';
      });
      return state.cart.length >= 4 && allSafe;
    },
    rewardMessage: "축하합니다! 당신은 스스로 건강한 음식을 구별하고 선택할 수 있는 진정한 '어린이 영양 박사'입니다!"
  }
];
