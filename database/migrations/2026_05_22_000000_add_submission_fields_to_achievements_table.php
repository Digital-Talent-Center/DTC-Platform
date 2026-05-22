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
        Schema::table('achievements', function (Blueprint $table) {
            // Student information
            $table->string('nim')->nullable()->after('user_id');
            $table->string('nama_lengkap')->nullable()->after('nim');
            
            // Academic year and dates
            $table->string('tahun_ajaran')->nullable()->after('nama_lengkap');
            $table->date('tanggal_mulai')->nullable()->after('tahun_ajaran');
            $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
            
            // Activity details
            $table->string('jenis')->nullable()->after('category');
            $table->string('tingkat')->nullable()->after('jenis');
            $table->string('keikutsertaan')->nullable()->after('tingkat');
            
            // Links and files
            $table->string('link_sertifikat')->nullable()->after('description');
            $table->string('bukti_path')->nullable()->after('link_sertifikat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achievements', function (Blueprint $table) {
            $table->dropColumn([
                'nim',
                'nama_lengkap',
                'tahun_ajaran',
                'tanggal_mulai',
                'tanggal_selesai',
                'jenis',
                'tingkat',
                'keikutsertaan',
                'link_sertifikat',
                'bukti_path',
            ]);
        });
    }
};
