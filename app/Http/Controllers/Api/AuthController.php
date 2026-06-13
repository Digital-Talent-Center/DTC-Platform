<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ProfileExtension;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

/**
 * Autentikasi berbasis token Sanctum untuk klien mobile (Flutter).
 * Tidak mengganggu alur login SPA (Inertia) yang sudah ada.
 */
class AuthController extends Controller
{
    /**
     * Registrasi mahasiswa baru — memirror RegisteredUserController (web),
     * tetapi mengembalikan JSON + token, bukan redirect Inertia.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'nim' => 'nullable|string|max:20',
            'faculty' => 'nullable|string|max:255',
            'study_program' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
        ]);

        ProfileExtension::create([
            'user_id' => $user->id,
            'nim' => $request->nim,
            'faculty' => $request->faculty,
            'major' => $request->study_program,
            'role' => 'student',
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user->load('profileExtension')),
        ], 201);
    }

    /**
     * Login dengan email + password, mengembalikan token Sanctum.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user->load('profileExtension')),
        ]);
    }

    /**
     * Data user yang sedang login (dipakai untuk refresh sesi mobile).
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userPayload($request->user()->load('profileExtension')),
        ]);
    }

    /**
     * Hapus token akses yang dipakai saat ini (logout dari device tsb).
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * Bentuk payload user yang konsisten (camelCase) untuk klien mobile.
     */
    private function userPayload(User $user): array
    {
        $p = $user->profileExtension;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $p->role ?? 'student',
            'profile' => $p ? [
                'nim' => $p->nim,
                'faculty' => $p->faculty,
                'major' => $p->major,
                'phone' => $p->phone,
                'avatarUrl' => $p->avatar_url,
                'about' => $p->about,
                'role' => $p->role,
            ] : null,
        ];
    }
}
