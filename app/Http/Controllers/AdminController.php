<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'users' => [
                'total' => User::count(),
                'active' => User::where(
                    'status',
                    'active'
                )->count(),
                'banned' => User::where(
                    'status',
                    'banned'
                )->count(),
            ],

            'posts' => [
                'total' => Post::count(),
                'visible' => Post::where(
                    'status',
                    'visible'
                )->count(),
                'hidden' => Post::where(
                    'status',
                    'hidden'
                )->count(),
            ],

            'comments' => [
                'total' => Comment::count(),
            ],

            'likes' => [
                'total' => Like::count(),
            ],
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::query()
            ->select([
                'id',
                'username',
                'email',
                'role',
                'status',
                'created_at',
            ])
            ->latest()
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function banUser(
        Request $request,
        User $user
    ): JsonResponse {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot ban your own account.',
            ], 422);
        }

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Admin accounts cannot be banned.',
            ], 422);
        }

        $user->update([
            'status' => 'banned',
        ]);

        return response()->json([
            'message' => 'User banned successfully.',
            'user' => $user->only([
                'id',
                'username',
                'email',
                'role',
                'status',
                'created_at',
            ]),
        ]);
    }

    public function unbanUser(
        User $user
    ): JsonResponse {
        $user->update([
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'User unbanned successfully.',
            'user' => $user->only([
                'id',
                'username',
                'email',
                'role',
                'status',
                'created_at',
            ]),
        ]);
    }

    public function deleteUser(
        Request $request,
        User $user
    ): JsonResponse {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Admin accounts cannot be deleted.',
            ], 422);
        }

        $user->load('posts');

        foreach ($user->posts as $post) {
            if ($post->image) {
                Storage::disk('public')->delete(
                    'posts/' . $post->image
                );
            }
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    public function posts(): JsonResponse
    {
        $posts = Post::query()
            ->with('user')
            ->withCount([
                'comments',
                'likes',
            ])
            ->latest()
            ->get();

        return response()->json([
            'posts' => $posts,
        ]);
    }

    public function hidePost(
        Post $post
    ): JsonResponse {
        $post->update([
            'status' => 'hidden',
        ]);

        $post->load('user');

        $post->loadCount([
            'comments',
            'likes',
        ]);

        return response()->json([
            'message' => 'Post hidden successfully.',
            'post' => $post,
        ]);
    }

    public function unhidePost(
        Post $post
    ): JsonResponse {
        $post->update([
            'status' => 'visible',
        ]);

        $post->load('user');

        $post->loadCount([
            'comments',
            'likes',
        ]);

        return response()->json([
            'message' => 'Post unhidden successfully.',
            'post' => $post,
        ]);
    }

    public function deletePost(
        Post $post
    ): JsonResponse {
        if ($post->image) {
            Storage::disk('public')->delete(
                'posts/' . $post->image
            );
        }

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully.',
        ]);
    }
}