import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function Payment() {
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onFormSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess('¡Pago realizado con éxito con tarjeta! 🎉');
    }, 2000);
  };

  const amount = '10.00';

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        Eliga la forma de Pago preferencial
      </h1>

      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => { setPaymentMethod('card'); setError(null); setSuccess(null); }}
          className={`px-4 py-2 rounded-md font-semibold ${
            paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Tarjeta de Crédito
        </button>
        <button
          onClick={() => { setPaymentMethod('paypal'); setError(null); setSuccess(null); }}
          className={`px-4 py-2 rounded-md font-semibold ${
            paymentMethod === 'paypal' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          PayPal
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      {paymentMethod === 'card' && (
        <form onSubmit={onFormSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Nombre completo en la tarjeta"
            className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={cardHolder}
            onChange={e => setCardHolder(e.target.value)}
            required
            autoComplete="cc-name"
          />
          <input
            type="text"
            placeholder="Número de tarjeta"
            className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            required
            maxLength={19}
            autoComplete="cc-number"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="MM/AA"
              className="w-1/3 px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
              required
              maxLength={5}
              autoComplete="cc-exp"
            />
            <input
              type="password"
              placeholder="CVC"
              className="w-1/4 px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={securityCode}
              onChange={e => setSecurityCode(e.target.value)}
              required
              maxLength={4}
              autoComplete="cc-csc"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-md font-semibold text-white transition ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Procesando pago...' : 'Confirmar pago'}
          </button>
        </form>
      )}

      {paymentMethod === 'paypal' && (
        <PayPalScriptProvider options={{ "client-id": "AXSY3Nkt8ax0FZab1cKnYbj9z9oZcI8TBBwR7Qcm13yItrUjCZEr_Kc66gFCGgL4olhjJVvloEzs4c5F", currency: "USD" }}>
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={async (data, actions) => {
              console.log('Creando orden...');
              const res = await fetch('http://127.0.0.1:8000/api/paypal/order/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: '10.00' }),
              });
              if (!res.ok) {
                const text = await res.text();
                console.error('Error en createOrder:', text);
                throw new Error('Error creando la orden');
              }
            
              const order = await res.json();
              return order.id;
            }}
            onApprove={async (data, actions) => {
              console.log('Pago aprobado, capturando orden...', data.orderID);
              const res = await fetch('http://127.0.0.1:8000/api/paypal/order/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID }),
              });

              if (!res.ok) {
                const text = await res.text();
                console.error('Error en onApprove:', text);
                throw new Error('Error capturando la orden');
              }
            
              const capture = await res.json();
              setSuccess('Pago realizado con éxito vía PayPal! 🎉');
              setError(null);
            }}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
}
