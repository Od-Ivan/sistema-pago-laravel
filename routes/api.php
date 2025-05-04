<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaypalPaymentController;

Route::post('/paypal/order/create', [PaypalPaymentController::class, 'createOrder']);
Route::post('/paypal/order/capture', [PaypalPaymentController::class, 'captureOrder']);
Route::post('/paypal/payment', [PaymentController::class, 'payWithPayPal']);
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});