<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function store(
        Request $request,
        Post $post
    ): JsonResponse {
        if ($post->status !== 'visible') {
            abort(404);
        }

        $like = Like::firstOrCreate([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => $like->wasRecentlyCreated
                ? 'Post liked successfully.'
                : 'Post is already liked.',
            'liked' => true,
            'likes_count' => $post->likes()->count(),
        ]);
    }

    public function destroy(
        Request $request,
        Post $post
    ): JsonResponse {
        Like::where('post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'Post unliked successfully.',
            'liked' => false,
            'likes_count' => $post->likes()->count(),
        ]);
    }
}