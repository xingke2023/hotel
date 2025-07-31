<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\House;
use App\Models\User;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a second user first
        $buyer = User::create([
            'name' => 'Buyer User',
            'email' => 'buyer@example.com',
            'password' => bcrypt('password'),
        ]);
        
        // Get first user (seller) and some houses
        $seller = User::first();
        $houses = House::where('user_id', $seller->id)->take(5)->get();

        // Create sample orders with different statuses
        $statuses = ['pending', 'confirmed', 'delivered', 'completed', 'cancelled'];
        
        foreach ($houses as $index => $house) {
            $status = $statuses[$index % count($statuses)];
            Order::create([
                'house_id' => $house->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $house->user_id,
                'price' => $house->price,
                'status' => $status,
                'created_at' => now()->subDays($index + 1),
                'updated_at' => now()
            ]);
        }
    }
}