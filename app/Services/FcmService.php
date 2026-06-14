<?php

namespace App\Services;

use App\Models\FcmToken;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Layanan pengiriman push notification via Firebase Cloud Messaging HTTP v1 API.
 *
 * Menggunakan service account JSON yang di-set di .env:
 *   FIREBASE_CREDENTIALS_PATH=storage/app/firebase-service-account.json
 *
 * Jika file credentials tidak tersedia, notifikasi in-app tetap dibuat
 * tetapi push notification dilewatkan (graceful degradation).
 */
class FcmService
{
    private ?string $projectId = null;
    private ?string $accessToken = null;
    private ?int $tokenExpiresAt = null;

    /**
     * Kirim notifikasi ke semua device milik user.
     *
     * @param  User   $user     User penerima
     * @param  string $title    Judul notifikasi
     * @param  string $body     Isi notifikasi
     * @param  array  $data     Data payload tambahan (type, actor_name, dll.)
     * @param  string $category Kategori notifikasi in-app (ACHIEVEMENT, ACTIVITY, SYSTEM, dll.)
     */
    public function sendToUser(
        User $user,
        string $title,
        string $body,
        array $data = [],
        string $category = 'SYSTEM',
    ): void {
        // 1. Simpan notifikasi in-app ke tabel notifications agar muncul di daftar notifikasi.
        try {
            Notification::create([
                'user_id'  => $user->id,
                'category' => $category,
                'title'    => $title,
                'message'  => $body,
            ]);
        } catch (\Throwable $e) {
            Log::warning('[FCM] Gagal simpan notifikasi in-app: ' . $e->getMessage());
        }

        // 2. Kirim push notification ke semua token FCM milik user.
        $tokens = FcmToken::where('user_id', $user->id)->pluck('token')->all();

        if (empty($tokens)) {
            Log::info("[FCM] User #{$user->id} tidak punya FCM token, skip push.");
            return;
        }

        foreach ($tokens as $token) {
            $this->sendPush($user->id, $token, $title, $body, $data);
        }
    }

    /**
     * Kirim satu push notification ke satu device token.
     */
    private function sendPush(int $userId, string $token, string $title, string $body, array $data): void
    {
        try {
            $accessToken = $this->getAccessToken();
            if ($accessToken === null) {
                return; // credentials tidak tersedia
            }

            $projectId = $this->projectId;
            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            // Pastikan semua data value adalah string (FCM requirement).
            $stringData = [];
            foreach ($data as $k => $v) {
                $stringData[$k] = (string) $v;
            }

            $payload = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => $stringData,
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'channel_id' => 'dtc_default_channel',
                        ],
                    ],
                ],
            ];

            $response = Http::withToken($accessToken)
                ->timeout(10)
                ->post($url, $payload);

            if ($response->successful()) {
                Log::info("[FCM] Push sent to user #{$userId}");
            } else {
                $error = $response->json('error.details.0.errorCode')
                      ?? $response->json('error.status')
                      ?? 'UNKNOWN';

                Log::warning("[FCM] Push failed for user #{$userId}: {$error}");

                // Hapus token invalid agar tidak dipakai lagi.
                if (in_array($error, ['UNREGISTERED', 'INVALID_ARGUMENT', 'NOT_FOUND'])) {
                    FcmToken::where('user_id', $userId)->where('token', $token)->delete();
                    Log::info("[FCM] Removed invalid token for user #{$userId}");
                }
            }
        } catch (\Throwable $e) {
            Log::error("[FCM] Exception sending push to user #{$userId}: " . $e->getMessage());
        }
    }

    /**
     * Dapatkan OAuth2 access token dari service account JSON.
     * Token di-cache di memori selama masa berlaku.
     */
    private function getAccessToken(): ?string
    {
        // Gunakan cached token jika masih valid.
        if ($this->accessToken && $this->tokenExpiresAt && time() < $this->tokenExpiresAt - 60) {
            return $this->accessToken;
        }

        $credPath = $this->getCredentialsPath();
        if ($credPath === null || !file_exists($credPath)) {
            Log::info('[FCM] Firebase credentials not found, push notifications disabled.');
            return null;
        }

        try {
            $sa = json_decode(file_get_contents($credPath), true);
            $this->projectId = $sa['project_id'] ?? null;

            $now = time();
            $header  = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $payload = base64url_encode(json_encode([
                'iss'   => $sa['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud'   => 'https://oauth2.googleapis.com/token',
                'iat'   => $now,
                'exp'   => $now + 3600,
            ]));

            $unsigned = "{$header}.{$payload}";
            openssl_sign($unsigned, $signature, $sa['private_key'], OPENSSL_ALGO_SHA256);
            $jwt = $unsigned . '.' . base64url_encode($signature);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            ]);

            if ($response->successful()) {
                $this->accessToken = $response->json('access_token');
                $this->tokenExpiresAt = $now + ($response->json('expires_in', 3600));
                return $this->accessToken;
            }

            Log::error('[FCM] Failed to get access token: ' . $response->body());
            return null;
        } catch (\Throwable $e) {
            Log::error('[FCM] getAccessToken error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Path ke file service account JSON.
     *
     * Mendukung dua env key:
     *   FIREBASE_CREDENTIALS      (sesuai spec baru)
     *   FIREBASE_CREDENTIALS_PATH (key lama, tetap didukung)
     *
     * FIREBASE_CREDENTIALS diprioritaskan jika keduanya di-set.
     */
    private function getCredentialsPath(): ?string
    {
        // Prioritas: FIREBASE_CREDENTIALS → FIREBASE_CREDENTIALS_PATH
        $path = env('FIREBASE_CREDENTIALS') ?: env('FIREBASE_CREDENTIALS_PATH');
        if (!$path) {
            return null;
        }
        // Support relative path (dari base_path).
        if (!str_starts_with($path, '/') && !preg_match('/^[a-zA-Z]:/', $path)) {
            $path = base_path($path);
        }
        return $path;
    }
}

// ── Helper function ──────────────────────────────────────────────
if (!function_exists('base64url_encode')) {
    function base64url_encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
