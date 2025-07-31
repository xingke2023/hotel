<?php

namespace App\Http\Controllers;

use App\Models\House;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HouseController extends Controller
{
    public function index()
    {
        return Inertia::render('houses/index');
    }

    public function list(Request $request)
    {
        $query = House::with('user')
            ->whereIn('status', ['available', 'pending']) // 只显示可售和待确认的房屋，排除已确认的
            ->orderBy('created_at', 'desc');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $houses = $query->get(); // 获取所有数据，不分页

        return response()->json($houses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $house = House::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'price' => $request->price,
            'location' => $request->location,
            'description' => $request->description,
        ]);

        return response()->json($house->load('user'));
    }

    public function myHouses(Request $request)
    {
        $query = House::with('user')
            ->where('user_id', auth()->id())
            ->orderBy('updated_at', 'desc');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $houses = $query->paginate($perPage);

        return response()->json($houses);
    }

    public function update(Request $request, House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $house->update([
            'title' => $request->title,
            'price' => $request->price,
            'location' => $request->location,
            'description' => $request->description,
        ]);

        return response()->json($house->load('user'));
    }

    public function destroy(House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        $house->delete();

        return response()->json(['message' => '房屋已删除']);
    }

    public function updateTime(House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        $house->touch(); // 更新updated_at时间戳

        return response()->json($house->load('user'));
    }

    public function relist(House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($house->status !== 'suspended') {
            return response()->json(['error' => '只有暂停销售的房屋可以重新上架'], 400);
        }

        $house->update(['status' => 'available']);

        return response()->json($house->load('user'));
    }

    public function updateStatus(Request $request, House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        $request->validate([
            'status' => 'required|in:available,suspended',
        ]);

        // 检查房屋当前状态是否允许修改
        if (!in_array($house->status, ['available', 'suspended'])) {
            return response()->json(['error' => '当前房屋状态不允许修改'], 400);
        }

        $house->update(['status' => $request->status]);

        return response()->json($house->load('user'));
    }
}
