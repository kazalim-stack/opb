<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentLikeController extends Controller
{
    public function store(
        Request $request,
        Comment $comment
    ): JsonResponse {
        CommentLike::firstOrCreate([
            'comment_id' => $comment->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Comment liked successfully.',
            'liked' => true,
            'likes_count' => CommentLike::where(
                'comment_id',
                $comment->id
            )->count(),
        ]);
    }

    public function destroy(
        Request $request,
        Comment $comment
    ): JsonResponse {
        CommentLike::where(
            'comment_id',
            $comment->id
        )
            ->where(
                'user_id',
                $request->user()->id
            )
            ->delete();

        return response()->json([
            'message' => 'Comment unliked successfully.',
            'liked' => false,
            'likes_count' => CommentLike::where(
                'comment_id',
                $comment->id
            )->count(),
        ]);
    }
}