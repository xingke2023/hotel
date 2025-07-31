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
        Schema::table('users', function (Blueprint $table) {
            $table->string('real_name')->nullable()->after('name')->comment('真实姓名');
            $table->date('birth_date')->nullable()->after('email')->comment('出生日期');
            $table->text('bio')->nullable()->after('phone')->comment('个人简介');
            $table->string('whatsapp')->nullable()->after('wechat')->comment('WhatsApp号码');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['real_name', 'birth_date', 'bio', 'whatsapp']);
        });
    }
};
