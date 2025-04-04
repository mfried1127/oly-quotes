import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { QuoteItem, Discount } from '../types';

interface QuoteTableProps {
  items: QuoteItem[];
  selectedDiscount: Discount | null;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const QuoteTable: React.FC<QuoteTableProps> = ({
  items,
  selectedDiscount,
  onQuantityChange,
  onRemoveItem
}) => {
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onQuantityChange(id, quantity);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountRate = selectedDiscount ? selectedDiscount.value : 0;
  const discountName = selectedDiscount ? selectedDiscount.name : 'None';

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quote Items
      </Typography>
      
      {items.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
          No items added to the quote yet. Search and add products above.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">List Price</TableCell>
                  <TableCell align="right">
                    Discounted Price ({discountName})
                  </TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.part_number}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">${item.list_price.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.discountedPrice.toFixed(2)}</TableCell>
                    <TableCell align="right" width="100px">
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        inputProps={{ min: 1, style: { textAlign: 'right' } }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">${item.lineTotal.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="h6">
              Subtotal: ${subtotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discount Applied: {discountName} ({(discountRate * 100).toFixed(0)}%)
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default QuoteTable;
