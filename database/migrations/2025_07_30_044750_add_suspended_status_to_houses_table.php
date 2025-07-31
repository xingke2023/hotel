<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE houses MODIFY COLUMN status ENUM('available', 'pending', 'confirmed', 'shipped', 'received', 'sold', 'suspended') DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE houses MODIFY COLUMN status ENUM('available', 'pending', 'confirmed', 'shipped', 'received', 'sold') DEFAULT 'available'");
    }
};
