import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import ProductSearch from './components/ProductSearch';
import DiscountSelector from './components/DiscountSelector';
import QuoteTable from './components/QuoteTable';
import QuoteGenerator from './components/QuoteGenerator';
import { Product, QuoteItem, Discount } from './types';

function App() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [showCustomerPrice, setShowCustomerPrice] = useState(false);
  const [profitMargin, setProfitMargin] = useState('0.20');

  // Calculate line totals whenever items or discount changes
  useEffect(() => {
    if (quoteItems.length > 0) {
      const discountMultiplier = selectedDiscount ? 1 - selectedDiscount.value : 1;
      
      const updatedItems = quoteItems.map(item => {
        const discountedPrice = item.list_price * discountMultiplier;
        return {
          ...item,
          discountedPrice,
          lineTotal: discountedPrice * item.quantity
        };
      });
      
      setQuoteItems(updatedItems);
    }
  }, [selectedDiscount, quoteItems]);

  const handleAddProduct = (product: Product) => {
    // Check if product already exists in the quote
    const existingItem = quoteItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increment quantity if product already exists
      handleQuantityChange(product.id, existingItem.quantity + 1);
    } else {
      // Add new product with default quantity of 1
      const discountMultiplier = selectedDiscount ? 1 - selectedDiscount.value : 1;
      const discountedPrice = product.list_price * discountMultiplier;
      
      const newItem: QuoteItem = {
        ...product,
        quantity: 1,
        discountedPrice,
        lineTotal: discountedPrice
      };
      
      setQuoteItems([...quoteItems, newItem]);
    }
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const updatedItems = quoteItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
          lineTotal: item.discountedPrice * quantity
        };
      }
      return item;
    });
    
    setQuoteItems(updatedItems);
  };

  const handleRemoveItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const handleDiscountChange = (discount: Discount | null) => {
    setSelectedDiscount(discount);
    setSelectedDiscountId(discount?.id || null);
  };

  const handleProfitMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters except decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure the value is a valid number between 0 and 1
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue < 1) {
      setProfitMargin(value);
    } else if (value === '' || value === '.') {
      setProfitMargin(value);
    }
  };

  const calculateCustomerPrice = (discountedPrice: number): number => {
    const margin = parseFloat(profitMargin) || 0;
    if (margin <= 0) return discountedPrice;
    
    // Customer Price = Discounted Price / (1 - Profit Margin)
    return discountedPrice / (1 - margin);
  };

  // Calculate customer subtotal
  const customerSubtotal = quoteItems.reduce(
    (sum, item) => sum + (calculateCustomerPrice(item.discountedPrice) * item.quantity), 
    0
  );

  // Calculate regular subtotal
  const subtotal = quoteItems.reduce(
    (sum, item) => sum + item.lineTotal, 
    0
  );

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Olympus Pricing Calculator
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h4" gutterBottom>
              Quote Generator
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Search for products, select quantities, apply discounts, and generate formatted quotes for email.
            </Typography>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <ProductSearch onAddProduct={handleAddProduct} />
            </Box>
            <Box sx={{ width: '300px' }}>
              <DiscountSelector 
                selectedDiscountId={selectedDiscountId} 
                onDiscountChange={handleDiscountChange} 
              />
            </Box>
          </Box>
          
          <QuoteTable 
            items={quoteItems}
            selectedDiscount={selectedDiscount}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
          />
          
          {quoteItems.length > 0 && (
            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Price through Distribution
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showCustomerPrice}
                      onChange={(e) => setShowCustomerPrice(e.target.checked)}
                    />
                  }
                  label="Show Customer Price"
                />
                
                {showCustomerPrice && (
                  <TextField
                    label="Profit Margin"
                    value={profitMargin}
                    onChange={handleProfitMarginChange}
                    variant="outlined"
                    size="small"
                    sx={{ width: '150px' }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">%</InputAdornment>,
                    }}
                    helperText="Enter as decimal (e.g., 0.20 for 20%)"
                  />
                )}
              </Box>
              
              {showCustomerPrice && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Distribution Profit Margin: {(parseFloat(profitMargin) * 100).toFixed(0)}%
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Your Subtotal:</Typography>
                      <Typography variant="body1" fontWeight="bold">${subtotal.toFixed(2)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Customer Subtotal:</Typography>
                      <Typography variant="body1" fontWeight="bold">${customerSubtotal.toFixed(2)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Distribution Profit:</Typography>
                      <Typography variant="body1" fontWeight="bold">${(customerSubtotal - subtotal).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          )}
          
          <QuoteGenerator 
            items={quoteItems} 
            discountName={selectedDiscount?.name || 'None'} 
            showCustomerPrice={showCustomerPrice}
            profitMargin={profitMargin}
          />
        </Box>
      </Container>
    </>
  );
}

export default App;
