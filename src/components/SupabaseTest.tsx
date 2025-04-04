import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress
} from '@mui/material';
import { testConnection, fetchProducts, fetchDiscounts, supabase } from '../supabaseClient';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState<boolean>(false);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [discountCount, setDiscountCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);

  const runConnectionTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test basic connection
      const result = await testConnection();
      setConnectionStatus(result ? 'Connected' : 'Failed');
      
      // Get products
      const products = await fetchProducts();
      setProductCount(products.length);
      
      // Get discounts
      const discounts = await fetchDiscounts();
      setDiscountCount(discounts.length);
      
      // List available tables
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tableError) {
        console.error('Error fetching tables:', tableError);
      } else {
        setTables(tableData.map(t => t.table_name));
      }
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConnectionStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Supabase Connection Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={runConnectionTest}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Test Connection'}
        </Button>
        
        <Typography 
          variant="body1" 
          component="span"
          color={
            connectionStatus === 'Connected' ? 'success.main' : 
            connectionStatus === 'Failed' || connectionStatus === 'Error' ? 'error.main' : 
            'text.primary'
          }
          sx={{ fontWeight: 'bold' }}
        >
          Status: {connectionStatus}
        </Typography>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Products Count" 
            secondary={productCount !== null ? productCount : 'Not tested'} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Discounts Count" 
            secondary={discountCount !== null ? discountCount : 'Not tested'} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Available Tables" 
            secondary={
              tables.length > 0 
                ? tables.join(', ') 
                : 'No tables found or not tested'
            } 
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default SupabaseTest;
