<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:50',
                'unique:users,username',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
            ],
        ]);

        $user = User::create([
            'name' => $validated['username'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => [
                'required',
                'string',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        $user = User::where(
            'username',
            $credentials['username']
        )->first();

        if (
            !$user ||
            !Hash::check(
                $credentials['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'username' => [
                    'Invalid username or password.',
                ],
            ]);
        }

        if ($user->status === 'banned') {
            throw ValidationException::withMessages([
                'username' => [
                    'This account has been banned.',
                ],
            ]);
        }

        Auth::login($user, true);

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'csrf_token' => csrf_token(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
            'csrf_token' => csrf_token(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}