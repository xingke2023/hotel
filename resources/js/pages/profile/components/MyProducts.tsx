import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function MyProducts() {
    const { auth } = usePage<any>().props;
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addForm, setAddForm] = useState({
        title: '',
        price: 0,
        description: ''
    });
    
    // 编辑状态
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingHouse, setEditingHouse] = useState<House | null>(null);
    const [editForm, setEditForm] = useState({
        title: '',
        price: 0,
        description: ''
    });
    
    // 刷新状态
    const [refreshingId, setRefreshingId] = useState<number | null>(null);

    const itemsPerPage = 12;

    const fetchHouses = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/my-houses', {
                params: {
                    page: currentPage,
                    search: searchTerm,
                    per_page: itemsPerPage,
                }
            });
            setHouses(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
        } catch (error) {
            console.error('获取房屋列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHouses();
    }, [currentPage]);
    
    // 搜索功能
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchHouses();
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);
    
    // 添加房间功能
    const handleAddHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/houses', addForm);
            setShowAddDialog(false);
            setAddForm({
                title: '',
                price: 0,
                description: ''
            });
            fetchHouses(); // 刷新列表
            alert('房间添加成功！');
        } catch (error) {
            console.error('添加房间失败:', error);
            alert('添加房间失败');
        }
    };

    const handleStatusToggle = async (house: House) => {
        try {
            const newStatus = house.status === 'available' ? 'suspended' : 'available';
            await axios.patch(`/api/houses/${house.id}/status`, {
                status: newStatus
            });
            fetchHouses();
        } catch (error) {
            console.error('更新房屋状态失败:', error);
            alert('更新状态失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const handleDelete = async (house: House) => {
        if (!confirm(`确定要删除房屋"${house.title}"吗？此操作不可撤销。`)) {
            return;
        }

        try {
            await axios.delete(`/api/houses/${house.id}`);
            fetchHouses();
            alert('房屋删除成功！');
        } catch (error) {
            console.error('删除房屋失败:', error);
            alert('删除失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const openEditDialog = (house: House) => {
        setEditingHouse(house);
        setEditForm({
            title: house.title,
            price: house.price,
            description: house.description
        });
        setShowEditDialog(true);
    };

    const handleEdit = async () => {
        if (!editingHouse) return;

        if (!editForm.title.trim() || editForm.price <= 0) {
            alert('请填写完整的房屋信息');
            return;
        }

        try {
            await axios.put(`/api/houses/${editingHouse.id}`, editForm);
            fetchHouses();
            setShowEditDialog(false);
            setEditingHouse(null);
            alert('房屋信息更新成功！');
        } catch (error) {
            console.error('更新房屋信息失败:', error);
            alert('更新失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const handleRefresh = async (house: House) => {
        if (refreshingId === house.id) return;
        
        setRefreshingId(house.id);
        try {
            // 刷新就是先下架再上架的操作
            console.log('开始刷新房源，先下架...');
            
            // 第一步：下架房源
            await axios.patch(`/api/houses/${house.id}/status`, {
                status: 'suspended'
            });
            
            // 等待一小段时间确保状态更新
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log('房源已下架，现在重新上架...');
            
            // 第二步：重新上架房源
            await axios.patch(`/api/houses/${house.id}/status`, {
                status: 'available'
            });
            
            console.log('房源刷新完成');
            
            // 重新获取数据以确保显示最新的updated_at
            await fetchHouses();
            
            alert('房源刷新成功！已更新排名。');
        } catch (error) {
            console.error('刷新房源失败:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || '未知错误';
            alert('刷新失败：' + errorMessage);
            
            // 如果刷新失败，重新获取数据确保状态正确
            await fetchHouses();
        } finally {
            setRefreshingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border-green-200';
            case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available': return '已上架';
            case 'suspended': return '已下架';
            case 'pending': return '审核中';
            default: return '未知状态';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="text-center">
                    <div className="text-4xl mb-2">⏳</div>
                    <p className="text-gray-500">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link 
                        href="/profile" 
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2"
                    >
                        ← 返回
                    </Link>
                    <h3 className="text-xl font-semibold">房源管理</h3>
                    <p className="text-gray-600">管理您发布的所有房源</p>
                </div>
                <div className="text-sm text-gray-500">
                    共 {houses.length} 个房源
                </div>
            </div>
            
            {/* 搜索和添加按钮区域 */}
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <Input
                        placeholder="输入关键词搜索房源..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>
                <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    + 添加房源
                </Button>
            </div>

            {houses.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {houses.map((house) => (
                        <div key={house.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-3">
                            {/* 第一行：标题、状态、价格 */}
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{house.title}</h4>
                                <Badge className={`${getStatusColor(house.status)} text-xs px-1.5 py-0.5 shrink-0`}>
                                    {getStatusText(house.status)}
                                </Badge>
                            </div>
                            
                            {/* 第二行：价格、位置、时间 */}
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="font-medium text-green-600">¥{house.price.toLocaleString()}</span>
                                <div className="flex items-center gap-2 text-gray-500 truncate ml-2">
                                    <span>{new Date(house.updated_at).toLocaleDateString('zh-CN', {month: 'numeric', day: 'numeric'})}</span>
                                </div>
                            </div>
                            
                            {/* 第三行：操作按钮 */}
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(house)}
                                    className="flex-1 text-xs h-6 px-2"
                                >
                                    编辑
                                </Button>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRefresh(house)}
                                    disabled={refreshingId === house.id}
                                    className="flex-1 text-xs h-6 px-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                                    title="刷新房源 - 更新updated_at时间，可以最新排名排前"
                                >
                                    {refreshingId === house.id ? '...' : '刷新?'}
                                </Button>
                                
                                {(house.status === 'available' || house.status === 'suspended') && (
                                    <Button
                                        size="sm"
                                        className={`flex-1 text-xs h-6 px-2 ${
                                            house.status === 'available' 
                                                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                        onClick={() => handleStatusToggle(house)}
                                    >
                                        {house.status === 'available' ? '下架' : '上架'}
                                    </Button>
                                )}
                                
                                {(house.status === 'available' || house.status === 'suspended') && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-2 h-6"
                                        onClick={() => handleDelete(house)}
                                    >
                                        删
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">还没有发布房源</h3>
                    <p className="text-gray-500">去发布您的第一个房源吧！</p>
                </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            第 {currentPage} 页，共 {totalPages} 页
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                上一页
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 编辑弹窗 */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>编辑房源信息</DialogTitle>
                    </DialogHeader>
                    {editingHouse && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-title">房源 *</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    placeholder="请输入房源信息"
                                    className="mt-1"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="edit-price">价格 (元) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                    placeholder="请输入价格"
                                    className="mt-1"
                                />
                            </div>
                            
                            
                            <div>
                                <Label htmlFor="edit-description">入住要求</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    placeholder="请输入入住要求和注意事项..."
                                    className="mt-1 min-h-[100px] resize-y"
                                />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={handleEdit}
                                    className="flex-1"
                                    disabled={!editForm.title || editForm.price <= 0}
                                >
                                    保存修改
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowEditDialog(false);
                                        setEditingHouse(null);
                                    }}
                                    className="flex-1"
                                >
                                    取消
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 添加房间弹窗 */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>添加新房间</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddHouse} className="space-y-4">
                        <div>
                            <Label htmlFor="add-title">房间标题 *</Label>
                            <Input
                                id="add-title"
                                value={addForm.title}
                                onChange={(e) => setAddForm({...addForm, title: e.target.value})}
                                placeholder="请输入房间标题"
                                required
                                className="mt-1"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="add-price">价格 (元) *</Label>
                            <Input
                                id="add-price"
                                type="number"
                                value={addForm.price}
                                onChange={(e) => setAddForm({...addForm, price: Number(e.target.value)})}
                                placeholder="请输入价格"
                                required
                                min="0"
                                className="mt-1"
                            />
                        </div>
                        
                        
                        <div>
                            <Label htmlFor="add-description">房间描述</Label>
                            <Textarea
                                id="add-description"
                                value={addForm.description}
                                onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                                placeholder="请输入房间描述"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                                确认添加
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowAddDialog(false)}
                                className="flex-1"
                            >
                                取消
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}