export interface Product {
  id: string;
  part_number: string;
  description: string;
  list_price: number;
  // Add any additional fields from your Supabase products table here
}

export interface Discount {
  id: string;
  name: string;
  value: number; // Stored as decimal (e.g., 0.25 for 25%)
  // Add any additional fields from your Supabase discounts table here
}

export interface QuoteItem extends Product {
  quantity: number;
  discountedPrice: number;
  lineTotal: number;
}

export interface QuoteState {
  items: QuoteItem[];
  selectedDiscountId: string | null;
  selectedDiscount: Discount | null;
}
