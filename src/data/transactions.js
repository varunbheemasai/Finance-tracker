export const INITIAL_TRANSACTIONS = [
  { id: 1,  desc: "Monthly Salary",       amount: 95000, type: "income",  category: "salary",        date: "2026-04-01" },
  { id: 2,  desc: "Freelance Project",    amount: 22000, type: "income",  category: "freelance",     date: "2026-04-03" },
  { id: 3,  desc: "Apartment Rent",       amount: 18000, type: "expense", category: "housing",       date: "2026-04-02" },
  { id: 4,  desc: "Grocery Shopping",     amount: 3200,  type: "expense", category: "food",          date: "2026-04-04" },
  { id: 5,  desc: "Uber Rides",           amount: 1400,  type: "expense", category: "transport",     date: "2026-04-04" },
  { id: 6,  desc: "Doctor Visit",         amount: 800,   type: "expense", category: "health",        date: "2026-04-05" },
  { id: 7,  desc: "Netflix Subscription", amount: 649,   type: "expense", category: "entertainment", date: "2026-04-06" },
  { id: 8,  desc: "Monthly Salary",       amount: 95000, type: "income",  category: "salary",        date: "2026-03-01" },
  { id: 9,  desc: "Zomato Orders",        amount: 4100,  type: "expense", category: "food",          date: "2026-03-10" },
  { id: 10, desc: "Metro Pass",           amount: 600,   type: "expense", category: "transport",     date: "2026-03-12" },
  { id: 11, desc: "Freelance Project",    amount: 15000, type: "income",  category: "freelance",     date: "2026-03-20" },
  { id: 12, desc: "Apartment Rent",       amount: 18000, type: "expense", category: "housing",       date: "2026-03-02" },
  { id: 13, desc: "Electricity Bill",     amount: 2200,  type: "expense", category: "housing",       date: "2026-03-08" },
  { id: 14, desc: "Gym Membership",       amount: 1200,  type: "expense", category: "health",        date: "2026-03-15" },
  { id: 15, desc: "Monthly Salary",       amount: 92000, type: "income",  category: "salary",        date: "2026-02-01" },
  { id: 16, desc: "Grocery Shopping",     amount: 2900,  type: "expense", category: "food",          date: "2026-02-07" },
  { id: 17, desc: "Apartment Rent",       amount: 18000, type: "expense", category: "housing",       date: "2026-02-02" },
  { id: 18, desc: "Movie Tickets",        amount: 1200,  type: "expense", category: "entertainment", date: "2026-02-14" },
  { id: 19, desc: "Freelance Project",    amount: 18000, type: "income",  category: "freelance",     date: "2026-02-22" },
  { id: 20, desc: "Monthly Salary",       amount: 92000, type: "income",  category: "salary",        date: "2026-01-01" },
  { id: 21, desc: "Apartment Rent",       amount: 18000, type: "expense", category: "housing",       date: "2026-01-02" },
  { id: 22, desc: "Grocery Shopping",     amount: 3600,  type: "expense", category: "food",          date: "2026-01-09" },
  { id: 23, desc: "Spotify",             amount: 199,   type: "expense", category: "entertainment", date: "2026-01-15" },
  { id: 24, desc: "Monthly Salary",       amount: 92000, type: "income",  category: "salary",        date: "2025-12-01" },
  { id: 25, desc: "Apartment Rent",       amount: 17000, type: "expense", category: "housing",       date: "2025-12-02" },
  { id: 26, desc: "Grocery Shopping",     amount: 3000,  type: "expense", category: "food",          date: "2025-12-10" },
  { id: 27, desc: "Freelance Bonus",      amount: 10000, type: "income",  category: "freelance",     date: "2025-12-20" },
  { id: 28, desc: "Monthly Salary",       amount: 88000, type: "income",  category: "salary",        date: "2025-11-01" },
  { id: 29, desc: "Apartment Rent",       amount: 17000, type: "expense", category: "housing",       date: "2025-11-02" },
  { id: 30, desc: "Grocery Shopping",     amount: 2800,  type: "expense", category: "food",          date: "2025-11-08" },
];

export const CATEGORIES = [
  "salary", "freelance", "food", "transport",
  "housing", "health", "entertainment", "other"
];

export const CAT_COLORS = {
  salary:        "#4ade80",
  freelance:     "#22d3ee",
  food:          "#fbbf24",
  transport:     "#60a5fa",
  housing:       "#a78bfa",
  health:        "#34d399",
  entertainment: "#f97316",
  other:         "#9ca3af",
};

export const CAT_EMOJI = {
  salary:        "💼",
  freelance:     "💻",
  food:          "🍜",
  transport:     "🚇",
  housing:       "🏠",
  health:        "💊",
  entertainment: "🎮",
  other:         "📦",
};
