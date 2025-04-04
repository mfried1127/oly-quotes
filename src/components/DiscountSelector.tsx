import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { Discount } from '../types';
import { fetchDiscounts } from '../supabaseClient';

interface DiscountSelectorProps {
  selectedDiscountId: string | null;
  onDiscountChange: (discount: Discount | null) => void;
}

const DiscountSelector: React.FC<DiscountSelectorProps> = ({ 
  selectedDiscountId, 
  onDiscountChange 
}) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load discounts on initial mount
  useEffect(() => {
    const loadDiscounts = async () => {
      setLoading(true);
      try {
        console.log('Fetching discounts...');
        const discountData = await fetchDiscounts();
        console.log('Fetched discounts:', discountData);
        setDiscounts(discountData);
        
        // Only select the first discount on initial load if none is selected
        if (initialLoad && selectedDiscountId === null && discountData.length > 0) {
          console.log('Auto-selecting first discount:', discountData[0]);
          onDiscountChange(discountData[0]);
          setInitialLoad(false);
        }
      } catch (error) {
        console.error('Error loading discounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscounts();
  }, [initialLoad, onDiscountChange, selectedDiscountId]);

  // Handle when selectedDiscountId changes but doesn't match any discount
  useEffect(() => {
    if (discounts.length > 0 && selectedDiscountId !== null) {
      const discountExists = discounts.some(d => d.id === selectedDiscountId);
      if (!discountExists) {
        console.log('Selected discount not found, selecting first discount');
        onDiscountChange(discounts[0]);
      }
    }
  }, [discounts, selectedDiscountId, onDiscountChange]);

  const handleDiscountChange = (event: SelectChangeEvent<string>) => {
    const discountId = event.target.value;
    console.log('Discount selected:', discountId);
    const selectedDiscount = discounts.find(d => d.id === discountId) || null;
    onDiscountChange(selectedDiscount);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Discount Selection
      </Typography>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth disabled={loading}>
          <InputLabel id="discount-select-label">Discount</InputLabel>
          <Select
            labelId="discount-select-label"
            id="discount-select"
            value={selectedDiscountId || ''}
            label="Discount"
            onChange={handleDiscountChange}
          >
            {discounts.map((discount) => (
              <MenuItem key={discount.id} value={discount.id}>
                {discount.name} (x{(1 - discount.value).toFixed(4)})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading discounts...
          </Typography>
        )}
        {!loading && discounts.length === 0 && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            No discounts available. Please check your connection to Supabase.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default DiscountSelector;
