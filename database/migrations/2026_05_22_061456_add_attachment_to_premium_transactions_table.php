<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambahkan kolom attachment_path ke tabel premium_transactions.
 * Menyimpan path gambar/file yang diupload user saat membuat Premium Post.
 * Nullable agar data lama tidak terpengaruh.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('premium_transactions', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('post_title');
        });
    }

    public function down(): void
    {
        Schema::table('premium_transactions', function (Blueprint $table) {
            $table->dropColumn('attachment_path');
        });
    }
};
