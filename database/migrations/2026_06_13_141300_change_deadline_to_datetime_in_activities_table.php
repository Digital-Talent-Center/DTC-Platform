<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Change deadline from date to datetime so overdue checks
     * can compare against the exact time, not just the day.
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dateTime('deadline')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->date('deadline')->nullable()->change();
        });
    }
};
