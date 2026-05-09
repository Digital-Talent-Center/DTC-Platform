<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index()
    {
        // Mengambil semua user beserta data profile
        $users = User::with('profileExtension')->get();

        $students = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'major' => $user->profileExtension?->major ?? 'N/A',
                'nim' => $user->profileExtension?->nim ?? 'N/A',
                'status' => 'ACTIVE', // Status default
            ];
        });

        return Inertia::render('admin/Student-Management', [
            'students' => $students
        ]);
    }
}
