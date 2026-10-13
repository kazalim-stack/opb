<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(
        Request $request
    ): JsonResponse {
        $userId = $request->user()->id;

        $posts = Post::with([
            'user',
            'comments.user',
            'comments.likes',
        ])
            ->withCount([
                'comments',
                'likes',
            ])
            ->withExists([
                'likes as liked' => function ($query) use (
                    $userId
                ) {
                    $query->where(
                        'user_id',
                        $userId
                    );
                },
            ])
            ->where(
                'status',
                'visible'
            )
            ->latest()
            ->paginate(10);

        /*
        |--------------------------------------------------------------------------
        | Prepare Comment Like Information
        |--------------------------------------------------------------------------
        */

        $posts->getCollection()->each(
            function ($post) use ($userId) {
                $post->comments->each(
                    function ($comment) use ($userId) {
                        $comment->setAttribute(
                            'likes_count',
                            $comment->likes->count()
                        );

                        $comment->setAttribute(
                            'liked',
                            $comment->likes->contains(
                                'user_id',
                                $userId
                            )
                        );

                        $comment->unsetRelation(
                            'likes'
                        );
                    }
                );
            }
        );

        return response()->json($posts);
    }

    public function show(
        Post $post
    ): JsonResponse {
        if ($post->status !== 'visible') {
            abort(404);
        }

        $post->load([
            'user',
            'comments.user',
            'comments.likes',
        ]);

        $post->loadCount([
            'comments',
            'likes',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Prepare Comment Like Information
        |--------------------------------------------------------------------------
        */

        $userId = request()->user()->id;

        $post->comments->each(
            function ($comment) use ($userId) {
                $comment->setAttribute(
                    'likes_count',
                    $comment->likes->count()
                );

                $comment->setAttribute(
                    'liked',
                    $comment->likes->contains(
                        'user_id',
                        $userId
                    )
                );

                $comment->unsetRelation(
                    'likes'
                );
            }
        );

        return response()->json([
            'post' => $post,
        ]);
    }

    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:150',
            ],

            'content' => [
                'required',
                'string',
            ],

            'media' => [
                'nullable',
                'file',
                'max:20480',
                'mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov',
            ],
        ]);

        $sanitizedContent =
            HtmlSanitizer::clean(
                $validated['content']
            );

        if (
            trim($sanitizedContent) === ''
        ) {
            return response()->json([
                'message' =>
                    'Post content cannot be empty.',
            ], 422);
        }

        $mediaFilename = null;
        $mediaType = null;

        if ($request->hasFile('media')) {
            $media =
                $request->file('media');

            $extension = strtolower(
                $media->getClientOriginalExtension()
            );

            $imageExtensions = [
                'jpg',
                'jpeg',
                'png',
                'gif',
                'webp',
            ];

            $videoExtensions = [
                'mp4',
                'webm',
                'mov',
            ];

            if (
                in_array(
                    $extension,
                    $imageExtensions,
                    true
                )
            ) {
                $mediaType = 'image';
            } elseif (
                in_array(
                    $extension,
                    $videoExtensions,
                    true
                )
            ) {
                $mediaType = 'video';
            }

            $mediaFilename = uniqid(
                'post_',
                true
            ) . '.' . $extension;

            $media->storeAs(
                'posts',
                $mediaFilename,
                'public'
            );
        }

        try {
            $post = Post::create([
                'user_id' =>
                    $request->user()->id,

                'title' =>
                    $validated['title'],

                'content' =>
                    $sanitizedContent,

                'image' =>
                    $mediaFilename,

                'media_type' =>
                    $mediaType,

                'status' =>
                    'visible',
            ]);
        } catch (
            \Throwable $exception
        ) {
            if ($mediaFilename) {
                Storage::disk('public')
                    ->delete(
                        'posts/' .
                        $mediaFilename
                    );
            }

            throw $exception;
        }

        $post->load([
            'user',
            'comments.user',
            'comments.likes',
        ]);

        $post->loadCount([
            'comments',
            'likes',
        ]);

        /*
        |--------------------------------------------------------------------------
        | New Post Comment Like Defaults
        |--------------------------------------------------------------------------
        */

        $post->comments->each(
            function ($comment) {
                $comment->setAttribute(
                    'likes_count',
                    $comment->likes->count()
                );

                $comment->setAttribute(
                    'liked',
                    false
                );

                $comment->unsetRelation(
                    'likes'
                );
            }
        );

        return response()->json([
            'message' =>
                'Post created successfully.',

            'post' =>
                $post,
        ], 201);
    }

    public function update(
        Request $request,
        Post $post
    ): JsonResponse {
        if (
            $post->user_id !==
                $request->user()->id &&
            !$request->user()->isAdmin()
        ) {
            return response()->json([
                'message' =>
                    'You are not authorized to edit this post.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:150',
            ],

            'content' => [
                'required',
                'string',
            ],
        ]);

        $sanitizedContent =
            HtmlSanitizer::clean(
                $validated['content']
            );

        if (
            trim($sanitizedContent) === ''
        ) {
            return response()->json([
                'message' =>
                    'Post content cannot be empty.',
            ], 422);
        }

        $post->update([
            'title' =>
                $validated['title'],

            'content' =>
                $sanitizedContent,
        ]);

        $post->load([
            'user',
            'comments.user',
            'comments.likes',
        ]);

        $post->loadCount([
            'comments',
            'likes',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Prepare Comment Like Information
        |--------------------------------------------------------------------------
        */

        $userId = $request->user()->id;

        $post->comments->each(
            function ($comment) use ($userId) {
                $comment->setAttribute(
                    'likes_count',
                    $comment->likes->count()
                );

                $comment->setAttribute(
                    'liked',
                    $comment->likes->contains(
                        'user_id',
                        $userId
                    )
                );

                $comment->unsetRelation(
                    'likes'
                );
            }
        );

        return response()->json([
            'message' =>
                'Post updated successfully.',

            'post' =>
                $post,
        ]);
    }

    public function destroy(
        Request $request,
        Post $post
    ): JsonResponse {
        if (
            $post->user_id !==
                $request->user()->id &&
            !$request->user()->isAdmin()
        ) {
            return response()->json([
                'message' =>
                    'You are not authorized to delete this post.',
            ], 403);
        }

        if ($post->image) {
            Storage::disk('public')
                ->delete(
                    'posts/' .
                    $post->image
                );
        }

        $post->delete();

        return response()->json([
            'message' =>
                'Post deleted successfully.',
        ]);
    }
}