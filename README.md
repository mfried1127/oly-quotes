# Olympus Pricing Calculator and Quote Generator

A web application for internal users to search parts, apply discounts, input quantities, and generate professional, formatted quotes to paste directly into emails.

## Features

- **Product Search**: Search by part number or description
- **Discount Selection**: Apply predefined discounts to all products
- **Quantity Management**: Input quantities for each product
- **Quote Generation**: Create clean, formatted quotes ready for email
- **Copy to Clipboard**: Easily copy the generated quote

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure Supabase:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

## Supabase Setup

This application requires a Supabase backend with the following tables:

### Products Table
- `id`: integer (primary key)
- `part_number`: string
- `description`: string
- `list_price`: numeric

### Discounts Table
- `id`: integer (primary key)
- `name`: string
- `value`: numeric (decimal, e.g., 0.1 for 10%)

## Running the Application

```
npm start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

## Building for Production

```
npm run build
```

This creates an optimized production build in the `build` folder.

## Technologies Used

- React
- TypeScript
- Material UI
- Supabase

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
