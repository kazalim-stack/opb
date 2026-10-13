<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'post_id',
        'user_id',
        'comment',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(CommentLike::class);
    }

    public function likedBy()
    {
        return $this->belongsToMany(
            User::class,
            'comment_likes'
        )->withPivot('created_at');
    }
}