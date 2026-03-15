// Food nickname generator
export interface FoodNickname {
  name: string;
  category: "korean" | "world" | "dessert";
  language: "ko" | "en";
}

// Food list
const FOOD_NICKNAMES: Record<string, FoodNickname[]> = {
  ko: [
    // Korean food
    { name: "김치찌개", category: "korean", language: "ko" },
    { name: "비빔밥", category: "korean", language: "ko" },
    { name: "떡볶이", category: "korean", language: "ko" },
    { name: "삼겹살", category: "korean", language: "ko" },
    { name: "치킨", category: "korean", language: "ko" },
    { name: "라면", category: "korean", language: "ko" },
    { name: "순대", category: "korean", language: "ko" },
    { name: "김밥", category: "korean", language: "ko" },
    { name: "된장찌개", category: "korean", language: "ko" },
    { name: "갈비찜", category: "korean", language: "ko" },
    { name: "불고기", category: "korean", language: "ko" },
    { name: "잡채", category: "korean", language: "ko" },
    { name: "만두", category: "korean", language: "ko" },
    { name: "떡국", category: "korean", language: "ko" },
    { name: "콩나물국밥", category: "korean", language: "ko" },
    { name: "불닭볶음면", category: "korean", language: "ko" },
    { name: "치킨무", category: "korean", language: "ko" },
    { name: "김치볶음밥", category: "korean", language: "ko" },
    { name: "떡갈비", category: "korean", language: "ko" },
    { name: "순두부찌개", category: "korean", language: "ko" },

    // World food (Korean names)
    { name: "피자", category: "world", language: "ko" },
    { name: "파스타", category: "world", language: "ko" },
    { name: "스테이크", category: "world", language: "ko" },
    { name: "샌드위치", category: "world", language: "ko" },
    { name: "햄버거", category: "world", language: "ko" },
    { name: "초밥", category: "world", language: "ko" },
    { name: "라멘", category: "world", language: "ko" },
    { name: "카레", category: "world", language: "ko" },
    { name: "타코", category: "world", language: "ko" },
    { name: "케밥", category: "world", language: "ko" },

    // Dessert
    { name: "아이스크림", category: "dessert", language: "ko" },
    { name: "케이크", category: "dessert", language: "ko" },
    { name: "도넛", category: "dessert", language: "ko" },
    { name: "쿠키", category: "dessert", language: "ko" },
    { name: "마카롱", category: "dessert", language: "ko" },
    { name: "초콜릿", category: "dessert", language: "ko" },
    { name: "푸딩", category: "dessert", language: "ko" },
    { name: "와플", category: "dessert", language: "ko" },
  ],
  en: [
    // Korean Food (English)
    { name: "Kimchi Stew", category: "korean", language: "en" },
    { name: "Bibimbap", category: "korean", language: "en" },
    { name: "Tteokbokki", category: "korean", language: "en" },
    { name: "Pork Belly", category: "korean", language: "en" },
    { name: "Chicken", category: "korean", language: "en" },
    { name: "Ramen", category: "korean", language: "en" },

    // World Food
    { name: "Pizza", category: "world", language: "en" },
    { name: "Pasta", category: "world", language: "en" },
    { name: "Steak", category: "world", language: "en" },
    { name: "Sandwich", category: "world", language: "en" },
    { name: "Burger", category: "world", language: "en" },
    { name: "Sushi", category: "world", language: "en" },
    { name: "Taco", category: "world", language: "en" },
    { name: "Kebab", category: "world", language: "en" },

    // Dessert
    { name: "Ice Cream", category: "dessert", language: "en" },
    { name: "Cake", category: "dessert", language: "en" },
    { name: "Donut", category: "dessert", language: "en" },
    { name: "Cookie", category: "dessert", language: "en" },
    { name: "Macaron", category: "dessert", language: "en" },
    { name: "Chocolate", category: "dessert", language: "en" },
  ],
};

// Detect user language
export function detectUserLanguage(): "ko" | "en" {
  if (typeof window === "undefined") return "ko";

  const lang = navigator.language || "ko";

  return lang.startsWith("ko") ? "ko" : "en";
}

// Nickname generation function
export function generateFoodNickname(
  language?: "ko" | "en" | "auto",
  category?: "korean" | "world" | "dessert" | "random",
): string {
  // Determine language
  const targetLanguage =
    language === "auto" || !language ? detectUserLanguage() : language;

  // Get food list
  let foods = FOOD_NICKNAMES[targetLanguage];

  // Filter by category
  if (category && category !== "random") {
    foods = foods.filter((food) => food.category === category);
  }

  // Select random food
  const randomFood = foods[Math.floor(Math.random() * foods.length)];

  // Generate random number (1000-9999)
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;

  return `${randomFood.name}${randomNumber}`;
}

// Generate multiple nicknames (for duplicate checking)
export function generateMultipleNicknames(
  count: number = 5,
  language?: "ko" | "en" | "auto",
  category?: "korean" | "world" | "dessert" | "random",
): string[] {
  const nicknames: string[] = [];

  for (let i = 0; i < count; i++) {
    nicknames.push(generateFoodNickname(language, category));
  }

  return nicknames;
}
