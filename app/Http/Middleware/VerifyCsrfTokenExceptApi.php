<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sama persis dengan ValidateCsrfToken bawaan Laravel (dipakai web SPA),
 * tetapi MELEWATI pemeriksaan CSRF untuk request yang membawa Bearer token.
 *
 * Alasannya: klien mobile memakai token Sanctum (stateless) dan tidak
 * memiliki cookie XSRF-TOKEN. SPA browser tetap dilindungi CSRF seperti semula.
 */
class VerifyCsrfTokenExceptApi extends ValidateCsrfToken
{
    /**
     * Rute yang dikecualikan dari CSRF.
     * `api/auth/*` (login & register) hanya dipakai klien mobile yang belum
     * memiliki token saat login, jadi tidak punya cookie XSRF — SPA web login
     * lewat route web `/login`, bukan endpoint ini.
     */
    protected $except = [
        'api/auth/login',
        'api/auth/register',
    ];

    public function handle($request, Closure $next): Response
    {
        // Request ber-Bearer token (mobile yang sudah login) tidak perlu CSRF.
        if ($request->bearerToken()) {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
