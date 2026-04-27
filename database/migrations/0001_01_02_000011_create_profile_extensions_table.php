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
        Schema::create('profile_extensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->unique();
            $table->string('nim')->nullable()->unique(); // Student ID
            $table->string('faculty')->nullable();
            $table->string('major')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->text('about')->nullable();
            $table->string('role')->nullable(); // 'student', 'mentor', 'admin', etc.
            $table->json('social_links')->nullable(); // {github, linkedin, twitter, etc}
            $table->timestamp('profile_completed_at')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_extensions');
    }
};
