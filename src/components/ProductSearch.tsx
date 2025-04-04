import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  Box, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Typography,
  Paper,
  Chip,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Product } from '../types';
import { fetchProducts } from '../supabaseClient';

interface ProductSearchProps {
  onAddProduct: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);

  // Debounced search function
  const searchProducts = useCallback(async () => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setShowNoResults(false);
      return;
    }
    
    setLoading(true);
    setShowNoResults(false);
    
    try {
      const results = await fetchProducts(searchTerm);
      setProducts(results);
      
      // Show "no results" message if needed
      if (results.length === 0) {
        setShowNoResults(true);
      }
      
      // Add to recent searches if we got results
      if (results.length > 0 && !recentSearches.includes(searchTerm)) {
        setRecentSearches(prev => [searchTerm, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, recentSearches]);

  // Trigger search when searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchProducts();
      } else if (searchTerm.length === 0) {
        setProducts([]);
        setShowNoResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchProducts]);

  const handleAddProduct = (product: Product) => {
    onAddProduct(product);
  };
  
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setProducts([]);
    setShowNoResults(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Products
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Search by part number or description"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type at least 3 characters to search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {/* Recent searches */}
        {recentSearches.length > 0 && !loading && products.length === 0 && !showNoResults && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Recent searches:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {recentSearches.map((term, index) => (
                <Chip 
                  key={index} 
                  label={term} 
                  size="small" 
                  onClick={() => handleRecentSearchClick(term)} 
                  clickable
                />
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {showNoResults && (
          <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
            No products found matching "{searchTerm}"
          </Typography>
        )}
        
        {products.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary">
              Found {products.length} products matching "{searchTerm}"
            </Typography>
            
            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {products.map((product) => (
                <ListItem 
                  key={product.id}
                  secondaryAction={
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleAddProduct(product)}
                    >
                      Add
                    </Button>
                  }
                  divider
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                          {product.part_number}
                        </Typography>
                        <Typography variant="body2" component="span">
                          - {product.description}
                        </Typography>
                      </Box>
                    }
                    secondary={`List Price: $${product.list_price.toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ProductSearch;
