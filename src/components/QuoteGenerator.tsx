import React, { useState } from 'react';
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
  Checkbox
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QuoteItem } from '../types';

interface QuoteGeneratorProps {
  items: QuoteItem[];
  discountName: string;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ items, discountName }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showListPrice, setShowListPrice] = useState(true);
  const [useOutlookFormat, setUseOutlookFormat] = useState(true);

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

  const generateQuoteText = () => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const date = new Date().toLocaleDateString();
    
    // Calculate multiplier from first item if available
    const multiplier = items.length > 0 && items[0].list_price > 0 
      ? (items[0].discountedPrice / items[0].list_price).toFixed(4)
      : '1.0000';
    
    let quoteText = '';
    
    if (useOutlookFormat) {
      // Create the quote header in Outlook-friendly format
      quoteText = `QUOTE SUMMARY (${date})\r\n`;
      quoteText += `Discount Applied: ${discountName}${discountName !== 'None' ? ` (x${multiplier})` : ''}\r\n\r\n`;
      
      // Create the table header in Outlook-friendly format
      if (showListPrice) {
        quoteText += `Part Number\tDescription\tQty\tList Price\tUnit Price\tLine Total\r\n`;
      } else {
        quoteText += `Part Number\tDescription\tQty\tUnit Price\tLine Total\r\n`;
      }
      
      // Add each item in tab-delimited format
      items.forEach(item => {
        if (showListPrice) {
          quoteText += `${item.part_number}\t${item.description}\t${item.quantity}\t$${item.list_price.toFixed(2)}\t$${item.discountedPrice.toFixed(2)}\t$${item.lineTotal.toFixed(2)}\r\n`;
        } else {
          quoteText += `${item.part_number}\t${item.description}\t${item.quantity}\t$${item.discountedPrice.toFixed(2)}\t$${item.lineTotal.toFixed(2)}\r\n`;
        }
      });
      
      // Add subtotal
      quoteText += `\r\nSubtotal: $${subtotal.toFixed(2)}\r\n`;
      
      // Add additional notes if any
      if (additionalNotes.trim()) {
        quoteText += `\r\nAdditional Notes:\r\n${additionalNotes}\r\n`;
      }
    } else {
      // Create the quote header in markdown format
      quoteText = `QUOTE SUMMARY (${date})\n`;
      quoteText += `Discount Applied: ${discountName}${discountName !== 'None' ? ` (x${multiplier})` : ''}\n\n`;
      
      // Create the table header in markdown format
      if (showListPrice) {
        quoteText += `| Part Number | Description | Qty | List Price | Unit Price | Line Total |\n`;
        quoteText += `|-------------|-------------|-----|------------|------------|------------|\n`;
      } else {
        quoteText += `| Part Number | Description | Qty | Unit Price | Line Total |\n`;
        quoteText += `|-------------|-------------|-----|------------|------------|\n`;
      }
      
      // Add each item
      items.forEach(item => {
        if (showListPrice) {
          quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.list_price.toFixed(2)} | $${item.discountedPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} |\n`;
        } else {
          quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.discountedPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} |\n`;
        }
      });
      
      // Add subtotal
      quoteText += `\nSubtotal: $${subtotal.toFixed(2)}\n`;
      
      // Add additional notes if any
      if (additionalNotes.trim()) {
        quoteText += `\nAdditional Notes:\n${additionalNotes}\n`;
      }
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
          <Box sx={{ mb: 2 }}>
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
                  checked={useOutlookFormat}
                  onChange={(e) => setUseOutlookFormat(e.target.checked)}
                />
              }
              label="Outlook-friendly Format"
            />
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
