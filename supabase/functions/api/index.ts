import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.replace('/api/', '');
    const method = req.method;

    if (path === 'products' && method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'cart' && method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Session ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products(id, name, price, image_url)
        `)
        .eq('session_id', sessionId);

      if (cartError) throw cartError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = cartItems.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.products.name,
        price: item.products.price,
        image_url: item.products.image_url,
        quantity: item.quantity,
        subtotal: parseFloat(item.products.price) * item.quantity,
      }));

      const total = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0);

      return new Response(JSON.stringify({ items, total }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'cart' && method === 'POST') {
      const body = await req.json();
      const { productId, quantity, sessionId } = body;

      if (!productId || !quantity || !sessionId) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: existing, error: existingError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', productId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ message: 'Cart updated', data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{ product_id: productId, quantity, session_id: sessionId }])
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ message: 'Item added to cart', data }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (path.startsWith('cart/') && method === 'DELETE') {
      const cartItemId = path.split('/')[1];

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Item removed from cart' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.startsWith('cart/') && method === 'PUT') {
      const cartItemId = path.split('/')[1];
      const body = await req.json();
      const { quantity } = body;

      if (!quantity || quantity < 1) {
        return new Response(JSON.stringify({ error: 'Invalid quantity' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Quantity updated', data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'checkout' && method === 'POST') {
      const body = await req.json();
      const { customerName, customerEmail, sessionId } = body;

      if (!customerName || !customerEmail || !sessionId) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products(id, name, price)
        `)
        .eq('session_id', sessionId);

      if (cartError) throw cartError;

      if (!cartItems || cartItems.length === 0) {
        return new Response(JSON.stringify({ error: 'Cart is empty' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = cartItems.map((item: any) => ({
        productId: item.products.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
        subtotal: parseFloat(item.products.price) * item.quantity,
      }));

      const total = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerName,
          customer_email: customerEmail,
          total,
          items: JSON.stringify(items),
          session_id: sessionId,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({
        message: 'Order placed successfully',
        receipt: {
          orderId: order.id,
          total,
          timestamp: order.created_at,
          items,
          customerName,
          customerEmail,
        },
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});