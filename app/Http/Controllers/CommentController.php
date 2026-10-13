<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(
        Request $request,
        Post $post
    ): JsonResponse {
        if ($post->status !== 'visible') {
            abort(404);
        }

        $validated = $request->validate([
            'comment' => [
                'required',
                'string',
                'max:5000',
            ],
        ]);

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'comment' => $validated['comment'],
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => $comment,
        ], 201);
    }

    public function destroy(
        Request $request,
        Comment $comment
    ): JsonResponse {
        if (
            $comment->user_id !== $request->user()->id &&
            !$request->user()->isAdmin()
        ) {
            abort(403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
        ]);
    }
}