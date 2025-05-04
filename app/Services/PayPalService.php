<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PayPalService
{
    protected $baseUrl;
    protected $clientId;
    protected $clientSecret;

    public function __construct()
    {
        $mode = config('paypal.mode', 'sandbox');
        $this->baseUrl = $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        $this->clientId = config("paypal.{$mode}.client_id");
        $this->clientSecret = config("paypal.{$mode}.client_secret");
    }

    public function getAccessToken()
    {
        $response = Http::asForm()->withBasicAuth($this->clientId, $this->clientSecret)
            ->post("{$this->baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->failed()) {
            throw new \Exception('Error obteniendo token de PayPal');
        }

        return $response->json('access_token');
    }

    public function createOrder($amount, $currency = 'USD')
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)->post("{$this->baseUrl}/v2/checkout/orders", [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => $currency,
                    'value' => $amount,
                ],
            ]],
            'application_context' => [
                'return_url' => config('paypal.success_url'),
                'cancel_url' => config('paypal.cancel_url'),
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception('Error creando orden de PayPal');
        }

        return $response->json();
    }

    public function captureOrder($orderId)
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/v2/checkout/orders/{$orderId}/capture");

        if ($response->failed()) {
            throw new \Exception('Error capturando orden de PayPal');
        }

        return $response->json();
    }
}
