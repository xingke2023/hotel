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
        Schema::create('houses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title'); // 房屋标题描述
            $table->decimal('price', 10, 2); // 价格
            $table->string('location')->nullable(); // 位置
            $table->text('description')->nullable(); // 详细描述
            $table->enum('status', ['available', 'sold', 'pending'])->default('available'); // 状态
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('houses');
    }
};
