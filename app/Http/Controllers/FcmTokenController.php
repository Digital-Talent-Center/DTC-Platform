<?php

namespace App\Http\Controllers;

use App\Models\FcmToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Menyimpan dan menghapus FCM device token dari klien mobile.
 */
class FcmTokenController extends Controller
{
    /**
     * POST /api/fcm-token
     * Simpan (upsert) FCM token untuk user yang sedang login.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string|min:10',
            'platform' => 'nullable|string|in:android,ios',
        ]);

        FcmToken::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'token'   => $request->input('token'),
            ],
            [
                'platform' => $request->input('platform', 'android'),
            ]
        );

        return response()->json(['message' => 'FCM token saved.']);
    }

    /**
     * DELETE /api/fcm-token
     * Hapus FCM token saat user logout dari device.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        FcmToken::where('user_id', Auth::id())
            ->where('token', $request->input('token'))
            ->delete();

        return response()->json(['message' => 'FCM token removed.']);
    }
}
