import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axios';

interface House {
    id: number;
    title: string;
    price: number;
    location: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface MyHousesProps {
    onFetchPendingOrder: (houseId: number) => void;
    onFetchConfirmedOrder: (houseId: number) => void;
    onBack: () => void;
}

export default function MyHouses({ onFetchPendingOrder, onFetchConfirmedOrder, onBack }: MyHousesProps) {
    const [myHouses, setMyHouses] = useState<House[]>([]);
    const [myHousesSearch, setMyHousesSearch] = useState('');
    const [myHousesPage, setMyHousesPage] = useState(1);
    const [myHousesTotalPages, setMyHousesTotalPages] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingHouse, setEditingHouse] = useState<House | null>(null);
    const [newHouse, setNewHouse] = useState({
        title: '',
        price: '',
        description: '',
    });

    const itemsPerMyHousesPage = 10;

    const fetchMyHouses = async () => {
        try {
            const response = await axios.get('/api/my-houses', {
                params: {
                    search: myHousesSearch,
                    page: myHousesPage,
                    per_page: itemsPerMyHousesPage,
                }
            });
            setMyHouses(response.data.data || []);
            setMyHousesTotalPages(response.data.last_page || 1);
        } catch (error) {
            console.error('获取我的房屋失败:', error);
        }
    };

    useEffect(() => {
        fetchMyHouses();
    }, [myHousesSearch, myHousesPage]);

    const handleAddHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/houses', newHouse);
            setNewHouse({ title: '', price: '', description: '' });
            setShowAddForm(false);
            fetchMyHouses();
            alert('房屋发布成功！');
        } catch (error) {
            console.error('添加房屋失败:', error);
            const errorMessage = error instanceof Error ? error.message : '添加房屋失败';
            alert(errorMessage);
        }
    };

    const handleEditHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHouse) return;
        
        try {
            await axios.put(`/api/houses/${editingHouse.id}`, editingHouse);
            setShowEditForm(false);
            setEditingHouse(null);
            fetchMyHouses();
            alert('房屋修改成功！');
        } catch (error) {
            console.error('修改房屋失败:', error);
            alert('修改房屋失败');
        }
    };

    const handleUpdateHouse = async (houseId: number) => {
        try {
            await axios.patch(`/api/houses/${houseId}/update-time`);
            fetchMyHouses();
            alert('房屋信息已更新！');
        } catch (error) {
            console.error('更新房屋失败:', error);
            alert('更新房屋失败');
        }
    };

    const handleDeleteHouse = async (houseId: number) => {
        if (!confirm('确定要删除这套房屋吗？')) return;
        
        try {
            await axios.delete(`/api/houses/${houseId}`);
            fetchMyHouses();
            alert('房屋删除成功！');
        } catch (error) {
            console.error('删除房屋失败:', error);
            alert('删除房屋失败');
        }
    };

    const handleRelistHouse = async (houseId: number) => {
        if (!confirm('确定要重新上架这套房屋吗？')) return;
        
        try {
            await axios.patch(`/api/houses/${houseId}/relist`);
            fetchMyHouses();
            alert('房屋重新上架成功！');
        } catch (error) {
            console.error('重新上架失败:', error);
            alert('重新上架失败');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* 顶部导航栏 - 移动端优化 */}
                <div className="mb-6 md:mb-8">
                    {/* 移动端布局 */}
                    <div className="block md:hidden">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="flex items-center space-x-1 px-3 py-2 hover:bg-white/80 transition-colors"
                            >
                                <span>←</span>
                                <span className="text-sm">返回</span>
                            </Button>
                            
                            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                                        <span className="mr-1">+</span>
                                        发布
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>发布房屋信息</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddHouse} className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">房屋标题</Label>
                                            <Input
                                                id="title"
                                                value={newHouse.title}
                                                onChange={(e) => setNewHouse({...newHouse, title: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="price">价格</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={newHouse.price}
                                                onChange={(e) => setNewHouse({...newHouse, price: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">描述（入住事项）</Label>
                                            <Textarea
                                                id="description"
                                                value={newHouse.description}
                                                onChange={(e) => setNewHouse({...newHouse, description: e.target.value})}
                                                placeholder="请输入房屋描述和入住事项，支持多行输入..."
                                                className="min-h-[100px] resize-y"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">发布</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        
                        {/* 移动端标题 */}
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">我发布的房屋</h1>
                            <p className="text-gray-600 text-sm mt-1">管理您发布的房屋信息</p>
                        </div>
                        
                        {/* 移动端搜索框 */}
                        <div className="relative">
                            <Input
                                placeholder="搜索房屋..."
                                value={myHousesSearch}
                                onChange={(e) => {
                                    setMyHousesSearch(e.target.value);
                                    setMyHousesPage(1);
                                }}
                                className="w-full pl-10 bg-white/80 backdrop-blur-sm border-white/50 focus:bg-white transition-colors"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">🔍</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 桌面端布局 */}
                    <div className="hidden md:block">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={onBack}
                                    className="flex items-center space-x-2 hover:bg-white/80 transition-colors"
                                >
                                    <span>←</span>
                                    <span>返回</span>
                                </Button>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">我发布的房屋</h1>
                                    <p className="text-gray-600 mt-1">管理您发布的房屋信息</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Input
                                        placeholder="搜索房屋..."
                                        value={myHousesSearch}
                                        onChange={(e) => {
                                            setMyHousesSearch(e.target.value);
                                            setMyHousesPage(1);
                                        }}
                                        className="w-80 pl-10 bg-white/80 backdrop-blur-sm border-white/50 focus:bg-white transition-colors"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">🔍</span>
                                    </div>
                                </div>
                                
                                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                                            <span className="mr-2">+</span>
                                            发布新房屋
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>发布房屋信息</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddHouse} className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">房屋标题</Label>
                                                <Input
                                                    id="title"
                                                    value={newHouse.title}
                                                    onChange={(e) => setNewHouse({...newHouse, title: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="price">价格</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={newHouse.price}
                                                    onChange={(e) => setNewHouse({...newHouse, price: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="description">描述（入住事项）</Label>
                                                <Textarea
                                                    id="description"
                                                    value={newHouse.description}
                                                    onChange={(e) => setNewHouse({...newHouse, description: e.target.value})}
                                                    placeholder="请输入房屋描述和入住事项，支持多行输入..."
                                                    className="min-h-[100px] resize-y"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">发布</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 房屋网格 - 移动端优化 */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {myHouses.map((house) => (
                        <div key={house.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            {/* 房屋图片占位区 */}
                            <div className="h-32 md:h-48 bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center relative">
                                <div className="text-4xl md:text-6xl opacity-20">🏠</div>
                                <div className="absolute top-2 right-2 md:top-4 md:right-4">
                                    <Badge className={
                                        house.status === 'available' ? 'bg-green-500 text-white border-0 shadow-lg text-xs' : 
                                        house.status === 'pending' ? 'bg-yellow-500 text-white border-0 shadow-lg text-xs' :
                                        house.status === 'confirmed' ? 'bg-blue-500 text-white border-0 shadow-lg text-xs' :
                                        house.status === 'shipped' ? 'bg-purple-500 text-white border-0 shadow-lg text-xs' :
                                        house.status === 'received' ? 'bg-green-500 text-white border-0 shadow-lg text-xs' :
                                        house.status === 'suspended' ? 'bg-orange-500 text-white border-0 shadow-lg text-xs' :
                                        'bg-gray-500 text-white border-0 shadow-lg text-xs'
                                    }>
                                        {house.status === 'available' ? '在售' : 
                                         house.status === 'pending' ? '待确认' : 
                                         house.status === 'confirmed' ? '待发货' : 
                                         house.status === 'shipped' ? '已发货' :
                                         house.status === 'received' ? '已完成' :
                                         house.status === 'suspended' ? '暂停销售' :
                                         '已售'}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* 房屋信息 */}
                            <div className="p-4 md:p-6">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {house.title}
                                </h3>
                                
                                <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-blue-500 mr-2 text-sm">📍</span>
                                        <span className="text-xs md:text-sm line-clamp-1">{house.location || '位置未填写'}</span>
                                    </div>
                                    
                                    {house.description && (
                                        <div className="flex items-start text-gray-600">
                                            <span className="text-blue-500 mr-2 mt-0.5 text-sm">📝</span>
                                            <span className="text-xs md:text-sm line-clamp-3 whitespace-pre-line">{house.description}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center text-gray-500">
                                        <span className="text-blue-500 mr-2 text-sm">🕒</span>
                                        <span className="text-xs">更新于 {new Date(house.updated_at || house.created_at).toLocaleDateString('zh-CN')}</span>
                                    </div>
                                </div>
                                
                                {/* 价格 */}
                                <div className="mb-3 md:mb-4">
                                    <div className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        ¥{house.price.toLocaleString()}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500">房屋价格</div>
                                </div>
                                
                                {/* 操作按钮 - 移动端优化 */}
                                <div className="flex flex-col md:flex-row gap-2">
                                    {house.status === 'pending' ? (
                                        <Button
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all text-sm"
                                            onClick={() => onFetchPendingOrder(house.id)}
                                        >
                                            查看订单
                                        </Button>
                                    ) : house.status === 'confirmed' ? (
                                        <Button
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all text-sm"
                                            onClick={() => onFetchConfirmedOrder(house.id)}
                                        >
                                            安排发货
                                        </Button>
                                    ) : house.status === 'shipped' ? (
                                        <div className="w-full px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-lg text-xs font-medium text-center border border-purple-200">
                                            等待买家确认
                                        </div>
                                    ) : house.status === 'received' ? (
                                        <div className="w-full px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-lg text-xs font-medium text-center border border-green-200">
                                            交易完成
                                        </div>
                                    ) : house.status === 'suspended' ? (
                                        <Button
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all text-sm"
                                            onClick={() => handleRelistHouse(house.id)}
                                        >
                                            重新上架
                                        </Button>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-1 md:gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                                onClick={() => {
                                                    setEditingHouse(house);
                                                    setShowEditForm(true);
                                                }}
                                            >
                                                编辑
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                                                onClick={() => handleUpdateHouse(house.id)}
                                            >
                                                刷新
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                                                onClick={() => handleDeleteHouse(house.id)}
                                            >
                                                删除
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 空状态 - 移动端优化 */}
                    {myHouses.length === 0 && (
                        <div className="col-span-full">
                            <div className="text-center py-12 md:py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mb-4 md:mb-6">
                                    <div className="text-2xl md:text-4xl">🏠</div>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">还没有发布房屋</h3>
                                <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4">开始发布您的第一套房屋，让更多人看到您的优质房源</p>
                                <Button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <span className="mr-2">+</span>
                                    立即发布房屋
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 分页 - 移动端优化 */}
                    {myHousesTotalPages > 1 && (
                        <div className="col-span-full mt-6 md:mt-8">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-4 md:p-6">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
                                    <div className="text-xs md:text-sm text-gray-600 order-2 md:order-1">
                                        第 {myHousesPage} 页，共 {myHousesTotalPages} 页
                                    </div>
                                    <div className="flex gap-2 md:gap-3 order-1 md:order-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={myHousesPage <= 1}
                                            onClick={() => setMyHousesPage(prev => prev - 1)}
                                            className="text-xs md:text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:hover:bg-gray-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                                        >
                                            <span className="md:hidden">←</span>
                                            <span className="hidden md:inline">← 上一页</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={myHousesPage >= myHousesTotalPages}
                                            onClick={() => setMyHousesPage(prev => prev + 1)}
                                            className="text-xs md:text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:hover:bg-gray-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                                        >
                                            <span className="md:hidden">→</span>
                                            <span className="hidden md:inline">下一页 →</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 编辑房屋Dialog */}
                <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>修改房屋信息</DialogTitle>
                        </DialogHeader>
                        {editingHouse && (
                            <form onSubmit={handleEditHouse} className="space-y-4">
                                <div>
                                    <Label htmlFor="edit-title">房屋标题</Label>
                                    <Input
                                        id="edit-title"
                                        value={editingHouse.title}
                                        onChange={(e) => setEditingHouse({...editingHouse, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-price">价格</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        value={editingHouse.price}
                                        onChange={(e) => setEditingHouse({...editingHouse, price: parseFloat(e.target.value) || 0})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-description">描述（入住事项）</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editingHouse.description || ''}
                                        onChange={(e) => setEditingHouse({...editingHouse, description: e.target.value})}
                                        placeholder="请输入房屋描述和入住事项，支持多行输入..."
                                        className="min-h-[100px] resize-y"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">保存修改</Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setShowEditForm(false);
                                            setEditingHouse(null);
                                        }}
                                        className="flex-1"
                                    >
                                        取消
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}