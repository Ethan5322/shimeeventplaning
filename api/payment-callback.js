// Chapa Payment Callback Handler
// This serverless function runs on Vercel when Chapa sends payment confirmation

export default async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, tx_ref, amount, transaction_id } = req.body;

    console.log('Payment Callback Received:', {
      status,
      tx_ref,
      amount,
      transaction_id,
      timestamp: new Date().toISOString()
    });

    // Payment successful
    if (status === 'success') {
      console.log(`✅ Payment confirmed: ${tx_ref} - ETB ${amount}`);

      // TODO: Update your database here
      // Example: Update Supabase booking status to "paid"
      // const { data, error } = await supabase
      //   .from('shime_bookings')
      //   .update({ payment_status: 'completed' })
      //   .eq('booking_ref', tx_ref);

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed',
        booking_ref: tx_ref,
        amount: amount,
        transaction_id: transaction_id
      });
    }

    // Payment pending
    if (status === 'pending') {
      console.log(`⏳ Payment pending: ${tx_ref}`);
      return res.status(200).json({
        success: false,
        message: 'Payment pending',
        booking_ref: tx_ref
      });
    }

    // Payment failed
    console.log(`❌ Payment failed: ${tx_ref}`);
    return res.status(400).json({
      success: false,
      message: 'Payment failed',
      booking_ref: tx_ref
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
