<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title', 150);
            $table->text('content');
            $table->string('image', 255)->nullable();
            $table->string('media_type', 10)->nullable();

            $table->enum('status', ['visible', 'hidden'])
                ->default('visible');

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};