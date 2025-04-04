# Supabase Setup for Olympus Pricing Calculator

This directory contains files related to your Supabase database configuration.

## Database Setup

The `init-data.sql` file contains SQL commands to:
1. Create the necessary tables (`pricing` and `discounts`)
2. Insert sample data into these tables

## How to Use

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project: `ibirthivnuospywsxrxb`
3. Go to the SQL Editor
4. Copy the contents of `init-data.sql` or upload the file
5. Run the SQL commands

## Table Structure

### Pricing Table
- `id`: Serial primary key
- `part_number`: Text, unique identifier for each product
- `description`: Text description of the product
- `list_price`: Decimal value representing the list price

### Discounts Table
- `id`: Serial primary key
- `name`: Text name of the discount
- `value`: Decimal value representing the discount percentage (e.g., 0.1 for 10%)

## Troubleshooting

If you encounter any issues with the database connection:

1. Verify your Supabase URL and anon key in the `.env` file
2. Check the browser console for error messages
3. Ensure the tables exist in your Supabase database
4. Confirm that the column names match the expected structure
