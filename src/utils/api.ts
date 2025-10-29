const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api`;

const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface CheckoutData {
  customerName: string;
  customerEmail: string;
  sessionId: string;
}

export interface Receipt {
  orderId: string;
  total: number;
  timestamp: string;
  items: any[];
  customerName: string;
  customerEmail: string;
}

export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`, { headers });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getCart(sessionId: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/cart?sessionId=${sessionId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  async addToCart(productId: string, quantity: number, sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity, sessionId }),
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
  },

  async removeFromCart(cartItemId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return response.json();
  },

  async checkout(data: CheckoutData): Promise<{ receipt: Receipt }> {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to checkout');
    }
    return response.json();
  },
};
