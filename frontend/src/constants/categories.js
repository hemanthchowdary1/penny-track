export const CATS = [
  { name: "Food",          icon: "🍜", color: "#f59e0b" },
  { name: "Travel",        icon: "✈️",  color: "#3b82f6" },
  { name: "Shopping",      icon: "🛍️", color: "#ec4899" },
  { name: "Bills",         icon: "⚡",  color: "#8b5cf6" },
  { name: "Health",        icon: "💊", color: "#10b981" },
  { name: "Entertainment", icon: "🎬", color: "#f97316" },
  { name: "Other",         icon: "📦", color: "#6b7280" },
];

export const getCat = (name) =>
  CATS.find((c) => c.name === name) || { icon: "📦", color: "#6b7280", name };