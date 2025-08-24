<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\House;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 获取所有房屋
        $houses = House::all();
        
        foreach ($houses as $house) {
            // 生成1200-1800之间的随机价格
            $newPrice = rand(1200, 1800);
            $house->update(['price' => $newPrice]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 不提供回滚功能，因为我们不知道原始价格
        // 如果需要回滚，请手动恢复数据
    }
};