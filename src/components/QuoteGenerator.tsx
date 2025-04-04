import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  Box,
  TextField,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QuoteItem } from '../types';

interface QuoteGeneratorProps {
  items: QuoteItem[];
  discountName: string;
  showCustomerPrice?: boolean;
  profitMargin?: string;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ 
  items, 
  discountName,
  showCustomerPrice: initialShowCustomerPrice = false,
  profitMargin: initialProfitMargin = '0.20'
}) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showListPrice, setShowListPrice] = useState(true);
  const [formatType, setFormatType] = useState<string>('bulletPoints');
  const [localShowCustomerPrice, setLocalShowCustomerPrice] = useState(initialShowCustomerPrice);
  const [localProfitMargin, setLocalProfitMargin] = useState(initialProfitMargin);

  // Update local state when props change
  useEffect(() => {
    setLocalShowCustomerPrice(initialShowCustomerPrice);
    setLocalProfitMargin(initialProfitMargin);
  }, [initialShowCustomerPrice, initialProfitMargin]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateQuoteText());
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFormatChange = (
    event: React.MouseEvent<HTMLElement>,
    newFormat: string,
  ) => {
    if (newFormat !== null) {
      setFormatType(newFormat);
    }
  };

  const handleProfitMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters except decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure the value is a valid number between 0 and 1
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue < 1) {
      setLocalProfitMargin(value);
    } else if (value === '' || value === '.') {
      setLocalProfitMargin(value);
    }
  };

  const calculateCustomerPrice = (discountedPrice: number): number => {
    const margin = parseFloat(localProfitMargin) || 0;
    if (margin <= 0) return discountedPrice;
    
    // Customer Price = Discounted Price / (1 - Profit Margin)
    return discountedPrice / (1 - margin);
  };

  const generateQuoteText = () => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const date = new Date().toLocaleDateString();
    
    // Calculate multiplier from first item if available
    const multiplier = items.length > 0 && items[0].list_price > 0 
      ? (items[0].discountedPrice / items[0].list_price).toFixed(4)
      : '1.0000';
    
    // Calculate customer subtotal if showing customer price
    const customerSubtotal = localShowCustomerPrice 
      ? items.reduce((sum, item) => sum + (calculateCustomerPrice(item.discountedPrice) * item.quantity), 0)
      : 0;
    
    let quoteText = '';
    
    // Create the quote header
    quoteText = `QUOTE SUMMARY (${date})\r\n`;
    quoteText += `Discount Applied: ${discountName}${discountName !== 'None' ? ` (x${multiplier})` : ''}\r\n`;
    if (localShowCustomerPrice) {
      quoteText += `Distribution Profit Margin: ${(parseFloat(localProfitMargin) * 100).toFixed(0)}%\r\n`;
    }
    quoteText += `\r\n`;
    
    if (formatType === 'bulletPoints') {
      // Bullet point format
      items.forEach((item, index) => {
        const customerPrice = calculateCustomerPrice(item.discountedPrice);
        const customerLineTotal = customerPrice * item.quantity;
        
        quoteText += `• ${item.part_number} - ${item.description}\r\n`;
        quoteText += `  Quantity: ${item.quantity}\r\n`;
        
        if (showListPrice) {
          quoteText += `  List Price: $${item.list_price.toFixed(2)}\r\n`;
        }
        
        quoteText += `  Your Price: $${item.discountedPrice.toFixed(2)}\r\n`;
        
        if (localShowCustomerPrice) {
          quoteText += `  Customer Price: $${customerPrice.toFixed(2)}\r\n`;
        }
        
        quoteText += `  Line Total: $${item.lineTotal.toFixed(2)}\r\n`;
        
        if (localShowCustomerPrice) {
          quoteText += `  Customer Total: $${customerLineTotal.toFixed(2)}\r\n`;
        }
        
        // Add a blank line between items except for the last item
        if (index < items.length - 1) {
          quoteText += `\r\n`;
        }
      });
      
      // Add subtotal
      quoteText += `\r\n`;
      if (localShowCustomerPrice) {
        quoteText += `Your Subtotal: $${subtotal.toFixed(2)}\r\n`;
        quoteText += `Customer Subtotal: $${customerSubtotal.toFixed(2)}\r\n`;
        quoteText += `Distribution Profit: $${(customerSubtotal - subtotal).toFixed(2)}\r\n`;
      } else {
        quoteText += `Subtotal: $${subtotal.toFixed(2)}\r\n`;
      }
    } else if (formatType === 'tabDelimited') {
      // Tab-delimited format
      // Create the table header
      if (showListPrice && localShowCustomerPrice) {
        quoteText += `Part Number\tDescription\tQty\tList Price\tYour Price\tCustomer Price\tLine Total\tCustomer Total\r\n`;
      } else if (showListPrice) {
        quoteText += `Part Number\tDescription\tQty\tList Price\tYour Price\tLine Total\r\n`;
      } else if (localShowCustomerPrice) {
        quoteText += `Part Number\tDescription\tQty\tYour Price\tCustomer Price\tLine Total\tCustomer Total\r\n`;
      } else {
        quoteText += `Part Number\tDescription\tQty\tYour Price\tLine Total\r\n`;
      }
      
      // Add each item in tab-delimited format
      items.forEach(item => {
        const customerPrice = calculateCustomerPrice(item.discountedPrice);
        const customerLineTotal = customerPrice * item.quantity;
        
        if (showListPrice && localShowCustomerPrice) {
          quoteText += `${item.part_number}\t${item.description}\t${item.quantity}\t$${item.list_price.toFixed(2)}\t$${item.discountedPrice.toFixed(2)}\t$${customerPrice.toFixed(2)}\t$${item.lineTotal.toFixed(2)}\t$${customerLineTotal.toFixed(2)}\r\n`;
        } else if (showListPrice) {
          quoteText += `${item.part_number}\t${item.description}\t${item.quantity}\t$${item.list_price.toFixed(2)}\t$${item.discountedPrice.toFixed(2)}\t$${item.lineTotal.toFixed(2)}\r\n`;
        } else if (localShowCustomerPrice) {
          quoteText += `${item.part_number}\t${item.description}\t${item.quantity}\t$${item.discountedPrice.toFixed(2)}\t$${customerPrice.toFixed(2)}\t$${item.lineTotal.toFixed(2)}\t$${customerLineTotal.toFixed(2)}\r\n`;
        } else {
          quoteText += `${item.part_number}\t${item.description}\t${item.quantity}\t$${item.discountedPrice.toFixed(2)}\t$${item.lineTotal.toFixed(2)}\r\n`;
        }
      });
      
      // Add subtotal
      quoteText += `\r\n`;
      if (localShowCustomerPrice) {
        quoteText += `Your Subtotal: $${subtotal.toFixed(2)}\r\n`;
        quoteText += `Customer Subtotal: $${customerSubtotal.toFixed(2)}\r\n`;
        quoteText += `Distribution Profit: $${(customerSubtotal - subtotal).toFixed(2)}\r\n`;
      } else {
        quoteText += `Subtotal: $${subtotal.toFixed(2)}\r\n`;
      }
    } else {
      // Markdown format
      // Create the table header in markdown format
      if (showListPrice && localShowCustomerPrice) {
        quoteText += `| Part Number | Description | Qty | List Price | Your Price | Customer Price | Line Total | Customer Total |\n`;
        quoteText += `|-------------|-------------|-----|------------|------------|---------------|------------|----------------|\n`;
      } else if (showListPrice) {
        quoteText += `| Part Number | Description | Qty | List Price | Your Price | Line Total |\n`;
        quoteText += `|-------------|-------------|-----|------------|------------|------------|\n`;
      } else if (localShowCustomerPrice) {
        quoteText += `| Part Number | Description | Qty | Your Price | Customer Price | Line Total | Customer Total |\n`;
        quoteText += `|-------------|-------------|-----|------------|---------------|------------|----------------|\n`;
      } else {
        quoteText += `| Part Number | Description | Qty | Your Price | Line Total |\n`;
        quoteText += `|-------------|-------------|-----|------------|------------|\n`;
      }
      
      // Add each item
      items.forEach(item => {
        const customerPrice = calculateCustomerPrice(item.discountedPrice);
        const customerLineTotal = customerPrice * item.quantity;
        
        if (showListPrice && localShowCustomerPrice) {
          quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.list_price.toFixed(2)} | $${item.discountedPrice.toFixed(2)} | $${customerPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} | $${customerLineTotal.toFixed(2)} |\n`;
        } else if (showListPrice) {
          quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.list_price.toFixed(2)} | $${item.discountedPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} |\n`;
        } else if (localShowCustomerPrice) {
          quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.discountedPrice.toFixed(2)} | $${customerPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} | $${customerLineTotal.toFixed(2)} |\n`;
        } else {
          quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.discountedPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} |\n`;
        }
      });
      
      // Add subtotal
      quoteText += `\n`;
      if (localShowCustomerPrice) {
        quoteText += `Your Subtotal: $${subtotal.toFixed(2)}\n`;
        quoteText += `Customer Subtotal: $${customerSubtotal.toFixed(2)}\n`;
        quoteText += `Distribution Profit: $${(customerSubtotal - subtotal).toFixed(2)}\n`;
      } else {
        quoteText += `Subtotal: $${subtotal.toFixed(2)}\n`;
      }
    }
    
    // Add additional notes if any
    if (additionalNotes.trim()) {
      quoteText += `\r\nAdditional Notes:\r\n${additionalNotes}\r\n`;
    }
    
    return quoteText;
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Generate Quote
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpen}
          disabled={items.length === 0}
        >
          Create Quote
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        Click "Create Quote" to generate a formatted quote that can be copied directly into an email.
      </Typography>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Quote Summary
          <Button 
            variant="outlined" 
            startIcon={<ContentCopyIcon />} 
            onClick={handleCopyToClipboard}
            sx={{ position: 'absolute', right: 16, top: 8 }}
          >
            Copy to Clipboard
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Format:</Typography>
            <ToggleButtonGroup
              value={formatType}
              exclusive
              onChange={handleFormatChange}
              aria-label="quote format"
              size="small"
            >
              <ToggleButton value="bulletPoints" aria-label="bullet points">
                Bullet Points
              </ToggleButton>
              <ToggleButton value="tabDelimited" aria-label="table">
                Table
              </ToggleButton>
              <ToggleButton value="markdown" aria-label="markdown">
                Markdown
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={showListPrice}
                  onChange={(e) => setShowListPrice(e.target.checked)}
                />
              }
              label="Show List Price"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={localShowCustomerPrice}
                  onChange={(e) => setLocalShowCustomerPrice(e.target.checked)}
                />
              }
              label="Show Customer Price"
            />
            
            {localShowCustomerPrice && (
              <TextField
                label="Profit Margin"
                value={localProfitMargin}
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
          
          <TextField
            label="Additional Notes (Optional)"
            multiline
            rows={2}
            fullWidth
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mt: 2, 
              fontFamily: 'monospace', 
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            {generateQuoteText()}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Quote copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default QuoteGenerator;
