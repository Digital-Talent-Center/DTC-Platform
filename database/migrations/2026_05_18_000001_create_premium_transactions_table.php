<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Buat tabel premium_transactions untuk menyimpan data transaksi Midtrans.
 * Tidak memodifikasi tabel yang sudah ada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('premium_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Data order
            $table->string('order_id')->unique();       // ID unik dikirim ke Midtrans
            $table->string('snap_token');               // Token Snap dari Midtrans
            $table->integer('amount');                  // Total dalam rupiah
            $table->string('duration');                 // '7-hari' | '1-bulan' | '3-bulan'
            $table->string('post_title');               // Judul post yang dipromosikan

            // Status pembayaran
            $table->string('status')->default('pending'); // pending | paid | failed | cancelled

            // Data dari callback Midtrans (nullable — diisi saat callback)
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('payment_type')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            // Index untuk query cepat by user
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('premium_transactions');
    }
};
