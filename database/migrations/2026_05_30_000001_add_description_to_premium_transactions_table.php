<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambahkan kolom post_description ke tabel premium_transactions.
 * Menyimpan deskripsi detail kegiatan yang diisi user saat membuat Premium Post.
 * Nullable agar data lama tidak terpengaruh.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('premium_transactions', function (Blueprint $table) {
            $table->text('post_description')->nullable()->after('post_title');
        });
    }

    public function down(): void
    {
        Schema::table('premium_transactions', function (Blueprint $table) {
            $table->dropColumn('post_description');
        });
    }
};
