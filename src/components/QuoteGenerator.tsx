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
  Alert
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
    
    // Create the quote header
    let quoteText = `QUOTE SUMMARY (${date})\n`;
    quoteText += `Discount Applied: ${discountName}\n\n`;
    
    // Create the table header
    quoteText += `| Part Number | Description | Qty | Unit Price | Line Total |\n`;
    quoteText += `|-------------|-------------|-----|------------|------------|\n`;
    
    // Add each item
    items.forEach(item => {
      quoteText += `| ${item.part_number} | ${item.description} | ${item.quantity} | $${item.discountedPrice.toFixed(2)} | $${item.lineTotal.toFixed(2)} |\n`;
    });
    
    // Add subtotal
    quoteText += `\nSubtotal: $${subtotal.toFixed(2)}\n`;
    
    // Add additional notes if any
    if (additionalNotes.trim()) {
      quoteText += `\nAdditional Notes:\n${additionalNotes}\n`;
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
