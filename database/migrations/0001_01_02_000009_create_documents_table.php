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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type'); // 'pdf', 'guide', 'resource', 'template', etc.
            $table->string('category'); // 'co-guide', 'co-library', 'tutorial', etc.
            $table->string('competition')->nullable(); // e.g., 'ICPC', 'CTF', 'Hackathon'
            $table->string('level')->nullable(); // 'beginner', 'intermediate', 'advanced'
            $table->year('year')->nullable();
            $table->string('file_path')->nullable(); // Path to uploaded file
            $table->string('file_icon')->nullable(); // Icon representation
            $table->text('tags')->nullable(); // JSON or comma-separated
            $table->integer('views_count')->default(0);
            $table->integer('downloads_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('category');
            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
