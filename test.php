<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
Illuminate\Support\Facades\Route::withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
$user = App\Models\User::first();
Auth::login($user);
$request = Illuminate\Http\Request::create(
    '/api/midtrans/create-transaction', 'POST',
    ['duration' => '1-bulan', 'post_title' => 'test']
);
$request->setUserResolver(function () use ($user) { return $user; });
$response = $kernel->handle($request);
echo $response->getContent();
