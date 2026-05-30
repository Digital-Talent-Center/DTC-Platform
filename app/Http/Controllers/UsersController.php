<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function destroy(int $id): \Illuminate\Http\RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return back();
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'nim'                   => 'nullable|string|max:20',
            'major'                 => 'nullable|string|max:100',
            'role'                  => 'nullable|in:student,admin',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'role'     => $request->input('role', 'student'),
        ]);

        $user->profileExtension()->create([
            'nim'   => $request->nim,
            'major' => $request->major,
        ]);

        return back();
    }

    public function update(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email,'.$id,
            'password'              => 'nullable|string|min:8|confirmed',
            'nim'                   => 'nullable|string|max:20',
            'major'                 => 'nullable|string|max:100',
            'role'                  => 'nullable|in:student,admin',
        ]);

        $user = User::findOrFail($id);

        $user->name  = $request->name;
        $user->email = $request->email;
        $user->role  = $request->input('role', $user->role);

        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }

        $user->save();

        $user->profileExtension()->updateOrCreate([], [
            'nim'   => $request->nim,
            'major' => $request->major,
        ]);

        return back();
    }

    public function index()
    {
        $users = User::with('profileExtension')->where('role', '!=', 'admin')->get();

        $students = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
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
