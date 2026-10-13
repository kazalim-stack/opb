<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentLikeController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/api/register', [AuthController::class, 'register']);

Route::post('/api/login', [AuthController::class, 'login']);

Route::post('/api/logout', [AuthController::class, 'logout'])
    ->middleware('auth');

Route::get('/api/me', [AuthController::class, 'me'])
    ->middleware('auth');


/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Posts
    |--------------------------------------------------------------------------
    */

    Route::get('/api/posts', [PostController::class, 'index']);

    Route::get('/api/posts/{post}', [PostController::class, 'show']);

    Route::post('/api/posts', [PostController::class, 'store']);

    Route::put('/api/posts/{post}', [PostController::class, 'update']);

    Route::delete('/api/posts/{post}', [PostController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Likes
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/api/posts/{post}/like',
        [LikeController::class, 'store']
    );

    Route::delete(
        '/api/posts/{post}/like',
        [LikeController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Comments
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/api/posts/{post}/comments',
        [CommentController::class, 'store']
    );

    Route::delete(
        '/api/comments/{comment}',
        [CommentController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Comment Likes
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/api/comments/{comment}/like',
        [CommentLikeController::class, 'store']
    );

    Route::delete(
        '/api/comments/{comment}/like',
        [CommentLikeController::class, 'destroy']
    );
});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])
    ->prefix('api/admin')
    ->group(function () {

        Route::get(
            '/dashboard',
            [AdminController::class, 'dashboard']
        );

        /*
        |--------------------------------------------------------------------------
        | User Management
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/users',
            [AdminController::class, 'users']
        );

        Route::patch(
            '/users/{user}/ban',
            [AdminController::class, 'banUser']
        );

        Route::patch(
            '/users/{user}/unban',
            [AdminController::class, 'unbanUser']
        );

        Route::delete(
            '/users/{user}',
            [AdminController::class, 'deleteUser']
        );

        /*
        |--------------------------------------------------------------------------
        | Post Management
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/posts',
            [AdminController::class, 'posts']
        );

        Route::patch(
            '/posts/{post}/hide',
            [AdminController::class, 'hidePost']
        );

        Route::patch(
            '/posts/{post}/unhide',
            [AdminController::class, 'unhidePost']
        );

        Route::delete(
            '/posts/{post}',
            [AdminController::class, 'deletePost']
        );
    });


/*
|--------------------------------------------------------------------------
| React Application
|--------------------------------------------------------------------------
|
| All non-API routes are handled by React.
|
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');