<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Autentikasi gabungan untuk route /api:
 *  - Mobile  : Bearer token Sanctum (Authorization: Bearer <token>).
 *  - Web SPA : session cookie (guard 'web') — perilaku lama dipertahankan.
 *
 * Saat token valid, user di-set pada guard default sehingga seluruh
 * pemanggilan Auth::user()/auth()->id()/$request->user() di controller
 * tetap bekerja tanpa perubahan.
 */
class AuthenticateApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();

        if ($bearer) {
            $accessToken = PersonalAccessToken::findToken($bearer);

            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;

                if (method_exists($user, 'withAccessToken')) {
                    $user->withAccessToken($accessToken);
                }

                Auth::setUser($user);
                $request->setUserResolver(fn () => $user);

                // Catat pemakaian token (best-effort).
                $accessToken->forceFill(['last_used_at' => now()])->save();

                return $next($request);
            }

            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Fallback: SPA pakai session cookie (tidak berubah dari sebelumnya).
        if (Auth::guard('web')->check()) {
            Auth::shouldUse('web');

            return $next($request);
        }

        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
