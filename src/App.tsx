import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar,
  Paper
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
          
          <QuoteGenerator 
            items={quoteItems} 
            discountName={selectedDiscount?.name || 'None'} 
          />
        </Box>
      </Container>
    </>
  );
}

export default App;
