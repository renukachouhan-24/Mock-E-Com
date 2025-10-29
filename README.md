# Mock E-Com Cart

A full-stack shopping cart application built for a coding assignment screening. This project demonstrates UI development, API integration, and database management using modern web technologies.

## Tech Stack

### Frontend
- **React 18** - UI library with functional components and hooks
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool and dev server

### Backend
- **Supabase Edge Functions** - Serverless API endpoints (Deno runtime)
- **PostgreSQL** - Relational database via Supabase
- **Row Level Security (RLS)** - Database security policies

## Features

### Products Page
- Display 10 pre-loaded tech products with images from Pexels
- Grid layout responsive for mobile, tablet, and desktop
- Add to cart functionality with loading states
- Stock availability display

### Shopping Cart
- View all added items with quantities
- Update item quantities (increase/decrease)
- Remove items from cart
- Real-time total calculation
- Empty cart state with call-to-action

### Checkout Flow
- Customer information form (name & email)
- Order summary with itemized breakdown
- Order placement with database persistence
- Success modal with order receipt
- Order ID, timestamp, and total display

### Additional Features
- Session-based cart management (persists across page refreshes)
- Error handling with user-friendly messages
- Loading indicators for async operations
- Responsive design for all screen sizes
- Clean, modern UI with smooth transitions

## API Endpoints

All endpoints are implemented as a single Supabase Edge Function:

### GET /api/products
Returns all available products.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "price": 79.99,
    "description": "Product description",
    "image_url": "https://...",
    "stock": 50
  }
]
```

### GET /api/cart?sessionId={sessionId}
Get all cart items for a session.

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "name": "Product Name",
      "price": 79.99,
      "quantity": 2,
      "subtotal": 159.98
    }
  ],
  "total": 159.98
}
```

### POST /api/cart
Add item to cart.

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1,
  "sessionId": "session_123"
}
```

### PUT /api/cart/:id
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/:id
Remove item from cart.

### POST /api/checkout
Complete purchase and create order.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "sessionId": "session_123"
}
```

**Response:**
```json
{
  "message": "Order placed successfully",
  "receipt": {
    "orderId": "uuid",
    "total": 159.98,
    "timestamp": "2025-10-29T12:00:00Z",
    "items": [...],
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }
}
```

## Database Schema

### products
- `id` (uuid, primary key)
- `name` (text)
- `price` (numeric)
- `description` (text)
- `image_url` (text)
- `stock` (integer)
- `created_at` (timestamptz)

### cart_items
- `id` (uuid, primary key)
- `product_id` (uuid, foreign key)
- `quantity` (integer)
- `session_id` (text)
- `user_id` (uuid, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### orders
- `id` (uuid, primary key)
- `customer_name` (text)
- `customer_email` (text)
- `total` (numeric)
- `items` (jsonb)
- `session_id` (text)
- `created_at` (timestamptz)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (database already configured)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables are already configured:**
   The `.env` file contains Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
project/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── Header.tsx
│   ├── context/          # React context for state management
│   │   └── CartContext.tsx
│   ├── pages/            # Page components
│   │   ├── Products.tsx
│   │   ├── Cart.tsx
│   │   └── Checkout.tsx
│   ├── utils/            # Utility functions
│   │   ├── api.ts        # API client functions
│   │   └── session.ts    # Session management
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── supabase/
│   └── functions/        # Edge Functions (serverless API)
│       └── api/
│           └── index.ts  # All API endpoints
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Key Implementation Details

### Session Management
- Unique session ID generated for each user
- Stored in localStorage for persistence
- Used to associate cart items without authentication

### State Management
- React Context API for global cart state
- Custom hooks for cart operations
- Automatic cart refresh after mutations

### Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Loading states for better UX

### Database Security
- Row Level Security (RLS) enabled on all tables
- Public read access for products
- Session-based access control for carts

## Bonus Features Implemented

- **Real stock data** - Products include stock quantities
- **Database persistence** - All data stored in PostgreSQL via Supabase
- **Loading/error states** - Comprehensive feedback throughout the app
- **Responsive design** - Works seamlessly on mobile, tablet, and desktop
- **Session persistence** - Cart survives page refreshes
- **Order history** - Orders saved to database with full details

## Screenshots

### Products Page
Displays a grid of products with images, prices, and add-to-cart buttons.

### Cart Page
Shows cart items with quantity controls, item removal, and total calculation.

### Checkout Page
Customer information form with order summary and receipt modal.

## Testing the Application

1. **Browse Products:** Start at the homepage to view all products
2. **Add to Cart:** Click "Add to Cart" on any product
3. **View Cart:** Click the Cart icon in the header to see your items
4. **Update Quantities:** Use +/- buttons to adjust quantities
5. **Remove Items:** Click the trash icon to remove items
6. **Checkout:** Click "Proceed to Checkout" and fill out the form
7. **Complete Order:** Submit the form to see your receipt

## API Testing

You can test the API directly using curl or Postman:

```bash
# Get all products
curl https://brnymxrcehdwhdwixkyz.supabase.co/functions/v1/api/products \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Add to cart
curl -X POST https://brnymxrcehdwhdwixkyz.supabase.co/functions/v1/api/cart \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"productId":"uuid","quantity":1,"sessionId":"test_session"}'
```

## Development Notes

- The database is pre-seeded with 10 sample products
- Products use high-quality images from Pexels
- All API endpoints include proper CORS headers
- TypeScript ensures type safety throughout the codebase
- Tailwind CSS provides consistent, responsive styling

## Submission Checklist

- [x] Full-stack implementation (frontend + backend + database)
- [x] REST API with all required endpoints
- [x] React functional components with hooks
- [x] Product listing page
- [x] Shopping cart functionality
- [x] Checkout form with validation
- [x] Receipt modal on successful order
- [x] Responsive design
- [x] Error handling and loading states
- [x] Database persistence
- [x] Clean, organized code structure
- [x] Comprehensive README with setup instructions

## Author

Created as a coding assignment to demonstrate full-stack development skills with React, Node.js, and database integration.

## Timeline

Completed within the 48-hour deadline (Submission: October 29, 2025)
