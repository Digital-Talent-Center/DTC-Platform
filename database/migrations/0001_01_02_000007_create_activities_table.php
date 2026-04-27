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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // 'login', 'post_created', 'comment_added', 'achievement_unlocked', etc.
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('completed');
            $table->bigInteger('relatable_id')->nullable();
            $table->string('relatable_type')->nullable(); // 'Post', 'Achievement', etc.
            $table->timestamp('activity_date');
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('type');
            $table->index('activity_date');
            $table->index(['relatable_id', 'relatable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
