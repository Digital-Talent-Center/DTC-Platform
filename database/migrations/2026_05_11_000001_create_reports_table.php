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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reason', [
                'inappropriate_content',
                'spam',
                'harassment',
                'false_information',
                'copyright_violation',
                'other'
            ])->default('other');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'under_review', 'resolved', 'dismissed'])->default('pending');
            $table->string('action_taken')->nullable(); // 'post_removed', 'user_warned', 'user_suspended', 'no_action'
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('post_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('reason');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
