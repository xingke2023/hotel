<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\House;
use App\Models\User;
use Faker\Factory as Faker;

class HouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('zh_CN');
        
        // 确保有用户存在
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => '系统管理员',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        $locations = [
            '澳门半岛', '氹仔', '路环', '新口岸', '南湾', '西湾', '东望洋', '花地玛堂',
            '大三巴', '议事亭前地', '新马路', '十月初五街', '河边新街', '关前街',
            '威尼斯人', '新濠天地', '银河', '美高梅', '永利', '金沙城中心'
        ];

        $houseTypes = [
            '豪华海景别墅', '精装修公寓', '商业写字楼', '温馨小户型', '复式豪宅',
            '江景房', '市中心公寓', '新装修套房', '投资物业', '度假别墅',
            '商铺', '工作室', 'loft公寓', '花园洋房', '高层住宅'
        ];

        $descriptions = [
            '交通便利，配套齐全', '精装修，拎包入住', '投资首选，回报率高',
            '环境优美，适合居住', '商业地段，人流量大', '新楼盘，品质保证',
            '学区房，教育资源丰富', '地铁沿线，出行方便', '配套完善，生活便利',
            '景观优美，视野开阔', '安静舒适，远离喧嚣', '设施完备，管理完善'
        ];

        for ($i = 0; $i < 200; $i++) {
            House::create([
                'user_id' => $user->id,
                'title' => $faker->randomElement($houseTypes) . ' - ' . $faker->randomElement($locations),
                'price' => $faker->numberBetween(500000, 20000000), // 50万到2000万
                'location' => $faker->randomElement($locations),
                'description' => $faker->randomElement($descriptions),
                'status' => $faker->randomElement(['available', 'available', 'available', 'sold', 'pending']), // 更多可用房源
                'created_at' => $faker->dateTimeBetween('-30 days', 'now'),
                'updated_at' => now(),
            ]);
        }
    }
}
