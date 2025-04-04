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

  // Only fetch discounts once when component mounts
  useEffect(() => {
    const loadDiscounts = async () => {
      setLoading(true);
      try {
        const discountData = await fetchDiscounts();
        setDiscounts(discountData);
        
        // If no discount is selected and we have discounts, select the first one
        if (selectedDiscountId === null && discountData.length > 0) {
          onDiscountChange(discountData[0]);
        }
      } catch (error) {
        console.error('Error loading discounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscounts();
    // Remove onDiscountChange and selectedDiscountId from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDiscountChange = (event: SelectChangeEvent<string>) => {
    const discountId = event.target.value;
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
      </Box>
    </Paper>
  );
};

export default DiscountSelector;
