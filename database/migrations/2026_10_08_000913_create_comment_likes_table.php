<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('comment_likes')) {
            Schema::create('comment_likes', function (Blueprint $table) {
                $table->id();

                $table->foreignId('comment_id')
                    ->constrained('comments')
                    ->cascadeOnDelete();

                $table->foreignId('user_id')
                    ->constrained('users')
                    ->cascadeOnDelete();

                $table->timestamp('created_at')
                    ->useCurrent();

                $table->unique(
                    ['comment_id', 'user_id'],
                    'unique_comment_like'
                );
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_likes');
    }
};