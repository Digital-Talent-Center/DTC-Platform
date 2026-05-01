<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // e.g., 'tutorial', 'step-by-step', 'reference'
            $table->string('level')->nullable(); // 'beginner', 'intermediate', 'advanced'
            $table->year('year')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_icon')->nullable();
            $table->json('tags')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('downloads_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index('category');
            $table->index('level');
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guides');
    }
};
