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
        Schema::create('earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['house_sale', 'referral_commission', 'platform_sale']);
            $table->decimal('amount', 10, 2);
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('related_order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('related_house_id')->nullable()->constrained('houses')->onDelete('set null');
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->timestamp('earned_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('earnings');
    }
};
