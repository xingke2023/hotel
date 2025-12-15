<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ExchangeRateController extends Controller
{
    public function getRate()
    {
        // 缓存汇率30分钟，减少API调用
        $rate = Cache::remember('hkd_cny_rate', 1800, function () {
            try {
                $response = Http::timeout(10)->get('https://open.er-api.com/v6/latest/HKD');

                if ($response->successful() && isset($response['rates']['CNY'])) {
                    return $response['rates']['CNY'];
                }

                // 如果API失败，返回默认值
                return 0.92;
            } catch (\Exception $e) {
                // 出错时返回默认值
                return 0.92;
            }
        });

        return response()->json([
            'rate' => $rate,
            'base' => 'HKD',
            'target' => 'CNY'
        ]);
    }
}
