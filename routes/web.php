<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 首页
Route::get('/', function () {
    return Inertia::render('home/index');
})->name('home');

// 公开路由 - 不需要登录  
Route::get('houses', [App\Http\Controllers\HouseController::class, 'index'])->name('houses');
Route::get('api/houses', [App\Http\Controllers\HouseController::class, 'list'])->name('api.houses');

// 视频页面路由
Route::get('videos', function () {
    return Inertia::render('Videos');
})->name('videos');
Route::get('api/videos', [\App\Http\Controllers\VideoController::class, 'getVideos'])->name('api.videos');
Route::post('api/videos/{video}/view', [\App\Http\Controllers\VideoController::class, 'incrementViews'])->name('api.videos.view');
Route::post('api/videos/{video}/like', [\App\Http\Controllers\VideoController::class, 'toggleLike'])->name('api.videos.like');

// 个人中心页面 - 需要认证
Route::get('profile', function () {
    return Inertia::render('profile/index');
})->middleware(['auth', 'verified'])->name('profile');

// 投资工具选择页面
Route::get('investment-tools', function () {
    return Inertia::render('InvestmentTools');
})->name('investment-tools');

// 计算器页面
Route::get('calculator', function () {
    return Inertia::render('Calculator');
})->name('calculator');

// 计算器1页面
Route::get('calculator1', function () {
    return Inertia::render('Calculator1');
})->name('calculator1');

// 1221投注系统页面
Route::get('calculator2', function () {
    return Inertia::render('Calculator2');
})->name('calculator2');

// 多策略投注系统页面
Route::get('calculator3', function () {
    return Inertia::render('Calculator3');
})->name('calculator3');

// 楼梯分层平注页面
Route::get('calculator4', function () {
    return Inertia::render('Calculator4');
})->name('calculator4');


// Calculator6页面
Route::get('calculator6', function () {
    return Inertia::render('Calculator6');
})->name('calculator6');

// Calculator7页面
Route::get('calculator7', function () {
    return Inertia::render('Calculator7');
})->name('calculator7');

// 胜退输进楼梯缆页面
Route::get('calculator5', function () {
    return Inertia::render('Calculator5');
})->name('calculator5');

// 九式宝缆页面  
Route::get('calculator8', function () {
    return Inertia::render('Calculator8');
})->name('calculator8');

// Calculator21页面
Route::get('calculator21', function () {
    return Inertia::render('Calculator21');
})->name('calculator21');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('example', function () {
        return Inertia::render('example');
    })->name('example');
    Route::post('api/houses', [App\Http\Controllers\HouseController::class, 'store'])->name('api.houses.store');
    Route::get('api/my-houses', [App\Http\Controllers\HouseController::class, 'myHouses'])->name('api.my-houses');
    Route::put('api/houses/{house}', [App\Http\Controllers\HouseController::class, 'update'])->name('api.houses.update');
    Route::delete('api/houses/{house}', [App\Http\Controllers\HouseController::class, 'destroy'])->name('api.houses.destroy');
    Route::patch('api/houses/{house}/update-time', [App\Http\Controllers\HouseController::class, 'updateTime'])->name('api.houses.update-time');
    Route::patch('api/houses/{house}/relist', [App\Http\Controllers\HouseController::class, 'relist'])->name('api.houses.relist');
    Route::patch('api/houses/{house}/status', [App\Http\Controllers\HouseController::class, 'updateStatus'])->name('api.houses.update-status');
    
    Route::post('api/orders', [App\Http\Controllers\OrderController::class, 'store'])->name('api.orders.store');
    Route::get('api/orders', [App\Http\Controllers\OrderController::class, 'myOrders'])->name('api.orders');
    Route::get('api/my-purchases', [App\Http\Controllers\OrderController::class, 'myPurchases'])->name('api.orders.purchases');
    Route::get('api/my-sales', [App\Http\Controllers\OrderController::class, 'mySales'])->name('api.orders.sales');
    Route::get('api/pending-sales-count', [App\Http\Controllers\OrderController::class, 'getPendingSalesCount'])->name('api.orders.pending-sales-count');
    Route::patch('api/orders/{order}/confirm', [App\Http\Controllers\OrderController::class, 'confirm'])->name('api.orders.confirm');
    Route::patch('api/orders/{order}/deliver', [App\Http\Controllers\OrderController::class, 'deliver'])->name('api.orders.deliver');
    Route::patch('api/orders/{order}/complete', [App\Http\Controllers\OrderController::class, 'complete'])->name('api.orders.complete');
    Route::patch('api/orders/{order}/reject', [App\Http\Controllers\OrderController::class, 'reject'])->name('api.orders.reject');
    Route::patch('api/orders/{order}/ship', [App\Http\Controllers\OrderController::class, 'ship'])->name('api.orders.ship');
    Route::patch('api/orders/{order}/receive', [App\Http\Controllers\OrderController::class, 'receive'])->name('api.orders.receive');
    Route::patch('api/orders/{order}/buyer-review', [App\Http\Controllers\OrderController::class, 'buyerReview'])->name('api.orders.buyer-review');
    Route::patch('api/orders/{order}/seller-review', [App\Http\Controllers\OrderController::class, 'sellerReview'])->name('api.orders.seller-review');
    Route::patch('api/orders/{order}/cancel', [App\Http\Controllers\OrderController::class, 'cancel'])->name('api.orders.cancel');
    Route::patch('api/orders/{order}/reject-delivery', [App\Http\Controllers\OrderController::class, 'rejectDelivery'])->name('api.orders.reject-delivery');
    Route::patch('api/orders/{order}/relist', [App\Http\Controllers\OrderController::class, 'relistHouseFromOrder'])->name('api.orders.relist');
    Route::get('api/houses/{house}/pending-order', [App\Http\Controllers\OrderController::class, 'getPendingOrderForHouse'])->name('api.houses.pending-order');
    Route::get('api/houses/{house}/confirmed-order', [App\Http\Controllers\OrderController::class, 'getConfirmedOrderForHouse'])->name('api.houses.confirmed-order');
    
    Route::get('api/referrals/my-referrals', [App\Http\Controllers\ReferralController::class, 'getMyReferrals'])->name('api.referrals.my-referrals');
    Route::get('api/referrals/user/{user}', [App\Http\Controllers\ReferralController::class, 'getReferredUserDetails'])->name('api.referrals.user-details');
    
    Route::get('api/wallet/earnings', [App\Http\Controllers\WalletController::class, 'getEarnings'])->name('api.wallet.earnings');
    Route::post('api/wallet/sell-to-platform', [App\Http\Controllers\WalletController::class, 'sellHouseToPlatform'])->name('api.wallet.sell-to-platform');
    Route::get('api/wallet/my-houses-for-sale', [App\Http\Controllers\WalletController::class, 'getMyHousesForSale'])->name('api.wallet.my-houses-for-sale');
    
    Route::get('api/profile', [App\Http\Controllers\ProfileController::class, 'show'])->name('api.profile.show');
    Route::put('api/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('api.profile.update');
    Route::post('api/profile/avatar', [App\Http\Controllers\ProfileController::class, 'uploadAvatar'])->name('api.profile.upload-avatar');
    Route::get('api/profile/avatar', [App\Http\Controllers\ProfileController::class, 'getAvatarUrl'])->name('api.profile.avatar-url');
    
    Route::post('api/settings/change-password', [App\Http\Controllers\SettingsController::class, 'changePassword'])->name('api.settings.change-password');
    Route::post('api/settings/logout', [App\Http\Controllers\SettingsController::class, 'logout'])->name('api.settings.logout');
    Route::get('api/settings/account-info', [App\Http\Controllers\SettingsController::class, 'getAccountInfo'])->name('api.settings.account-info');
    
    // 卖家申请相关API
    Route::post('api/seller/apply', [App\Http\Controllers\SellerApplicationController::class, 'apply'])->name('api.seller.apply');
    Route::get('api/seller/status', [App\Http\Controllers\SellerApplicationController::class, 'status'])->name('api.seller.status');
});

// 生物识别认证API路由
Route::prefix('api/biometric')->group(function () {
    Route::get('/credentials', [App\Http\Controllers\BiometricAuthController::class, 'checkCredentials']);
    Route::post('/register/options', [App\Http\Controllers\BiometricAuthController::class, 'generateRegistrationOptions']);
    Route::post('/register/verify', [App\Http\Controllers\BiometricAuthController::class, 'verifyRegistration']);
    Route::post('/authenticate/options', [App\Http\Controllers\BiometricAuthController::class, 'generateAuthenticationOptions']);
    Route::post('/authenticate/verify', [App\Http\Controllers\BiometricAuthController::class, 'verifyAuthentication']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
