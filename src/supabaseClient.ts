import { createClient } from '@supabase/supabase-js';
import { Product, Discount } from './types';

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://ibirthivnuospywsxrxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaXJ0aGl2bnVvc3B5d3N4cnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODg4OTEsImV4cCI6MjA1ODc2NDg5MX0.sLjS0Zuab0hz30N3YFt_ntHC5j7Wp4-ol9QmbLwjnPM';

// Log Supabase configuration (without showing full key for security)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log connection status
console.log('Supabase client initialized');

// Database table schema types (internal use only)
type DbProduct = {
  id: string;
  item: string;
  description: string;
  list_price: number;
  created_at?: string;
  updated_at?: string;
};

type DbDiscount = {
  id: string;
  discount: string;
  multiplier: number;
  created_at?: string;
  updated_at?: string;
};

// Table names in Supabase
const PRODUCTS_TABLE = 'pricing';
const DISCOUNTS_TABLE = 'discounts';

// Test Supabase connection
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from(PRODUCTS_TABLE).select('count()', { count: 'exact' });
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Connection test successful. Data:', data);
    return true;
  } catch (error) {
    console.error('Connection test exception:', error);
    return false;
  }
};

// API functions for products
export const fetchProducts = async (searchTerm: string = ''): Promise<Product[]> => {
  try {
    console.log(`Fetching products from table: ${PRODUCTS_TABLE}`);
    console.log(`Search term: ${searchTerm || 'none'}`);
    
    let query = supabase
      .from(PRODUCTS_TABLE)
      .select('*');
    
    if (searchTerm) {
      // Improved search with multiple conditions and better pattern matching
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // If the search term is a part number (exact match)
      if (/^[A-Za-z0-9-]+$/.test(searchTermLower)) {
        // First try exact match on item (part number)
        query = query.or(
          `item.eq.${searchTermLower},` +
          `item.ilike.${searchTermLower}%`  // Starts with search term
        );
      } else {
        // For more general searches, use broader matching
        query = query.or(
          `item.ilike.%${searchTermLower}%,` +
          `description.ilike.%${searchTermLower}%`
        );
      }
      
      // Limit results for performance
      query = query.limit(50);
    } else {
      // If no search term, just return the first 20 items
      query = query.limit(20);
    }
    
    // Order results by part number
    query = query.order('item', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} products:`, data);
    
    // Map the database schema to our application's expected structure
    return (data || []).map((item: DbProduct) => ({
      id: item.id,
      part_number: item.item,
      description: item.description,
      list_price: item.list_price
    }));
  } catch (error) {
    console.error('Error with Supabase query:', error);
    return [];
  }
};

// API functions for discounts
export const fetchDiscounts = async (): Promise<Discount[]> => {
  try {
    console.log(`Fetching discounts from table: ${DISCOUNTS_TABLE}`);
    
    const { data, error } = await supabase
      .from(DISCOUNTS_TABLE)
      .select('*');
    
    if (error) {
      console.error('Error fetching discounts:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} discounts:`, data);
    
    // Map the database schema to our application's expected structure
    return (data || []).map((item: DbDiscount) => ({
      id: item.id,
      name: `${item.discount}%`,
      value: 1 - item.multiplier
    }));
  } catch (error) {
    console.error('Error with Supabase query:', error);
    return [];
  }
};
