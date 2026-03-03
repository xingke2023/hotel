import { useState, useEffect, useCallback, useRef } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Order {
    id: number;
    status: string;
    price: number;
    customer_message?: string;
    house: House;
    buyer: { name: string };
    seller: { name: string };
    created_at: string;
    confirmed_at?: string;
    shipped_at?: string;
}


export default function HousesIndex() {
    const { auth } = usePage<any>().props;
    const [houses, setHouses] = useState<House[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
    const [customerMessage, setCustomerMessage] = useState('');
    const [showOrderConfirmDialog, setShowOrderConfirmDialog] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [showShipDialog, setShowShipDialog] = useState(false);
    const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
    const [referralData, setReferralData] = useState<any>(null);
    const [selectedReferredUser, setSelectedReferredUser] = useState<any>(null);
    const [showReferredUserDetails, setShowReferredUserDetails] = useState(false);
    const [walletData, setWalletData] = useState<any>(null);
    const [myHousesForSale, setMyHousesForSale] = useState<House[]>([]);
    const [showSellToPlatformDialog, setShowSellToPlatformDialog] = useState(false);
    const [selectedHouseForSale, setSelectedHouseForSale] = useState<House | null>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [settingsData, setSettingsData] = useState<any>(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [activeTab, setActiveTab] = useState<'home' | 'supply-demand' | 'mine' | 'my-houses' | 'my-orders' | 'my-referrals' | 'my-wallet' | 'my-profile' | 'settings'>('supply-demand');
    const [myHouses, setMyHouses] = useState<House[]>([]);
    const [editingHouse, setEditingHouse] = useState<House | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [myHousesSearch, setMyHousesSearch] = useState('');
    const [myHousesPage, setMyHousesPage] = useState(1);
    const [myHousesTotalPages, setMyHousesTotalPages] = useState(1);
    const itemsPerMyHousesPage = 10;
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [myOrdersPage, setMyOrdersPage] = useState(1);
    const [myOrdersTotalPages, setMyOrdersTotalPages] = useState(1);
    const itemsPerMyOrdersPage = 10;
    const [newHouse, setNewHouse] = useState({
        title: '',
        price: '',
        location: '',
        description: '',
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const [previousHousesLength, setPreviousHousesLength] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageChanging, setPageChanging] = useState(false);
    const itemsPerPage = 10;

    const fetchHouses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/houses', {
                params: { search }
            });
            const newHouses = response.data; // 直接使用data，因为不再有分页结构
            setHouses(newHouses);
            
            // 如果有新数据，重置到第一页
            if (newHouses.length !== previousHousesLength) {
                setCurrentPage(0);
            }
            setPreviousHousesLength(newHouses.length);
        } catch (error) {
            console.error('获取房屋列表失败:', error);
        } finally {
            setLoading(false);
        }
    }, [search, previousHousesLength]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('获取订单失败:', error);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const response = await axios.get('/api/orders', {
                params: {
                    page: myOrdersPage,
                    per_page: itemsPerMyOrdersPage,
                }
            });
            setMyOrders(response.data.data);
            setMyOrdersTotalPages(response.data.last_page);
        } catch (error) {
            console.error('获取我的订单失败:', error);
        }
    };

    const fetchMyHouses = async () => {
        try {
            const response = await axios.get('/api/my-houses', {
                params: {
                    page: myHousesPage,
                    per_page: itemsPerMyHousesPage,
                    search: myHousesSearch
                }
            });
            setMyHouses(response.data.data);
            setMyHousesTotalPages(response.data.last_page);
        } catch (error) {
            console.error('获取我的房屋失败:', error);
        }
    };

    const handleUpdateHouse = async (houseId: number) => {
        try {
            await axios.patch(`/api/houses/${houseId}/update-time`);
            fetchMyHouses();
            alert('房屋信息已更新！');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '更新失败';
            alert(errorMessage);
        }
    };

    const handleDeleteHouse = async (houseId: number) => {
        if (confirm('确定要删除这个房屋吗？')) {
            try {
                await axios.delete(`/api/houses/${houseId}`);
                fetchMyHouses();
                alert('房屋已删除！');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '删除失败';
                alert(errorMessage);
            }
        }
    };

    const handleEditHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHouse) return;

        try {
            await axios.put(`/api/houses/${editingHouse.id}`, {
                title: editingHouse.title,
                price: editingHouse.price,
                location: editingHouse.location,
                description: editingHouse.description,
            });
            setShowEditForm(false);
            setEditingHouse(null);
            fetchMyHouses();
            alert('房屋信息已修改！');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '修改失败';
            alert(errorMessage);
        }
    };

    useEffect(() => {
        fetchHouses();
        const interval = setInterval(() => {
            fetchHouses();
        }, 10000); // 每10秒更新数据
        
        // 自动滚动到下一页
        const pageInterval = setInterval(() => {
            if (houses.length > 0) {
                setPageChanging(true);
                setTimeout(() => {
                    setCurrentPage(prev => {
                        const totalPages = Math.ceil(houses.length / itemsPerPage);
                        const nextPage = (prev + 1) % totalPages;
                        console.log(`切换到第 ${nextPage + 1} 页，共 ${totalPages} 页，总记录数: ${houses.length}`);
                        return nextPage;
                    });
                    setTimeout(() => setPageChanging(false), 200);
                }, 100);
            }
        }, 4000); // 每4秒切换页面
        
        return () => {
            clearInterval(interval);
            clearInterval(pageInterval);
        };
    }, [fetchHouses, houses.length]);

    const handleAddHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/houses', newHouse);
            setNewHouse({ title: '', price: '', location: '', description: '' });
            setShowAddForm(false);
            
            // 如果当前在"我发布的"页面，刷新我的房屋列表
            if (activeTab === 'my-houses') {
                fetchMyHouses();
            } else {
                fetchHouses();
            }
            alert('房屋发布成功！');
        } catch (error) {
            console.error('添加房屋失败:', error);
            const errorMessage = error instanceof Error ? error.message : '添加房屋失败';
            alert(errorMessage);
        }
    };


    const handleOrderAction = async (orderId: number, action: string) => {
        try {
            await axios.patch(`/api/orders/${orderId}/${action}`);
            fetchOrders();
            fetchMyOrders();
            alert(`${action === 'confirm' ? '确认' : action === 'deliver' ? '交付' : '完成'}成功！`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '操作失败';
            alert(errorMessage);
        }
    };

    const handlePurchase = async (house: House) => {
        try {
            await axios.post('/api/orders', {
                house_id: house.id,
                customer_message: customerMessage
            });
            setShowPurchaseDialog(false);
            setSelectedHouse(null);
            setCustomerMessage('');
            fetchHouses(); // Refresh the house list to show updated status
            fetchMyHouses(); // Refresh my houses to show updated status
            alert('购买订单已提交，等待卖家确认！');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '购买失败';
            alert(errorMessage);
        }
    };

    const fetchPendingOrderForHouse = async (houseId: number) => {
        try {
            const response = await axios.get(`/api/houses/${houseId}/pending-order`);
            if (response.data) {
                setPendingOrder(response.data);
                setShowOrderConfirmDialog(true);
            }
        } catch (error) {
            console.error('获取待确认订单失败:', error);
        }
    };

    const handleOrderConfirmation = async (orderId: number, action: 'confirm' | 'reject') => {
        try {
            if (action === 'confirm') {
                await axios.patch(`/api/orders/${orderId}/confirm`);
                alert('订单已确认！');
            } else {
                await axios.patch(`/api/orders/${orderId}/reject`);
                alert('订单已拒绝！');
            }
            setShowOrderConfirmDialog(false);
            setPendingOrder(null);
            fetchMyHouses(); // Refresh my houses
            fetchOrders(); // Refresh orders
            fetchMyOrders(); // Refresh my orders
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '操作失败';
            alert(errorMessage);
        }
    };

    const fetchConfirmedOrderForHouse = async (houseId: number) => {
        try {
            const response = await axios.get(`/api/houses/${houseId}/confirmed-order`);
            if (response.data) {
                setShippingOrder(response.data);
                setShowShipDialog(true);
            }
        } catch (error) {
            console.error('获取已确认订单失败:', error);
        }
    };

    const handleShipping = async (orderId: number) => {
        try {
            await axios.patch(`/api/orders/${orderId}/ship`);
            setShowShipDialog(false);
            setShippingOrder(null);
            fetchMyHouses(); // Refresh my houses
            fetchOrders(); // Refresh orders
            fetchMyOrders(); // Refresh my orders
            alert('订单已发货！');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '发货失败';
            alert(errorMessage);
        }
    };

    const handleReceive = async (orderId: number) => {
        try {
            await axios.patch(`/api/orders/${orderId}/receive`);
            setShowOrderDetail(false);
            setSelectedOrder(null);
            fetchMyOrders(); // Refresh my orders
            alert('确认收货成功！');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '确认收货失败';
            alert(errorMessage);
        }
    };

    const handleRejectDelivery = async (orderId: number) => {
        if (confirm('确定要拒绝收货吗？订单将退回到待发货状态。')) {
            try {
                await axios.patch(`/api/orders/${orderId}/reject-delivery`);
                setShowOrderDetail(false);
                setSelectedOrder(null);
                fetchMyOrders(); // Refresh my orders
                alert('已拒绝收货，订单退回待发货状态！');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '拒绝收货失败';
                alert(errorMessage);
            }
        }
    };

    const fetchReferralData = async () => {
        try {
            const response = await axios.get('/api/referrals/my-referrals');
            setReferralData(response.data);
        } catch (error) {
            console.error('获取推荐数据失败:', error);
        }
    };

    const fetchReferredUserDetails = async (userId: number) => {
        try {
            const response = await axios.get(`/api/referrals/user/${userId}`);
            setSelectedReferredUser(response.data);
            setShowReferredUserDetails(true);
        } catch (error) {
            console.error('获取推荐用户详情失败:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('已复制到剪贴板！');
        });
    };

    const fetchWalletData = async () => {
        try {
            const response = await axios.get('/api/wallet/earnings');
            setWalletData(response.data);
        } catch (error) {
            console.error('获取钱包数据失败:', error);
        }
    };

    const fetchMyHousesForSale = async () => {
        try {
            const response = await axios.get('/api/wallet/my-houses-for-sale');
            setMyHousesForSale(response.data);
        } catch (error) {
            console.error('获取可售房屋失败:', error);
        }
    };

    const handleSellToPlatform = async (house: House) => {
        try {
            const response = await axios.post('/api/wallet/sell-to-platform', {
                house_id: house.id
            });
            setShowSellToPlatformDialog(false);
            setSelectedHouseForSale(null);
            fetchWalletData();
            fetchMyHousesForSale();
            fetchMyHouses();
            alert(`房屋已成功出售给平台，获得收益：¥${response.data.earning_amount}`);
        } catch (error) {
            console.error('出售房屋失败:', error);
            const errorMessage = error instanceof Error ? error.message : '出售房屋失败';
            alert(errorMessage);
        }
    };

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('/api/profile');
            setProfileData(response.data);
        } catch (error) {
            console.error('获取个人资料失败:', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.put('/api/profile', profileData);
            setShowEditProfile(false);
            alert('个人资料更新成功！');
            fetchProfileData();
        } catch (error) {
            console.error('更新个人资料失败:', error);
            const errorMessage = error instanceof Error ? error.message : '更新个人资料失败';
            alert(errorMessage);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        try {
            const response = await axios.post('/api/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('头像上传成功！');
            setAvatarFile(null);
            setAvatarPreview(null);
            fetchProfileData();
        } catch (error) {
            console.error('头像上传失败:', error);
            const errorMessage = error instanceof Error ? error.message : '头像上传失败';
            alert(errorMessage);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchSettingsData = async () => {
        try {
            const response = await axios.get('/api/settings/account-info');
            setSettingsData(response.data);
        } catch (error) {
            console.error('获取设置数据失败:', error);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/settings/change-password', passwordForm);
            setShowChangePassword(false);
            setPasswordForm({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
            alert('密码修改成功！');
        } catch (error: any) {
            console.error('修改密码失败:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessage = Object.values(errors).flat().join('\n');
                alert(errorMessage);
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('修改密码失败');
            }
        }
    };

    const handleLogout = async () => {
        if (confirm('确定要退出登录吗？')) {
            try {
                const response = await axios.post('/api/settings/logout');
                alert('已成功退出登录');
                // 重定向到登录页面
                window.location.href = '/login';
            } catch (error) {
                console.error('退出登录失败:', error);
                alert('退出登录失败');
            }
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'pending': '待卖家确认',
            'confirmed': '已确认待发货',
            'rejected': '卖家拒绝',
            'shipped': '已发货',
            'received': '确认收货',
            'cancelled': '已取消',
            'delivering': '交付中',
            'delivered': '已交付',
            'completed': '已完成'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'rejected': 'bg-red-100 text-red-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'received': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'delivering': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    useEffect(() => {
        if (activeTab === 'my-houses') {
            fetchMyHouses();
        } else if (activeTab === 'my-orders') {
            fetchMyOrders();
        }
    }, [myHousesPage, myHousesSearch, activeTab, myOrdersPage]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'my-houses':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            
                            <div className="flex gap-4">
                                <Input
                                    placeholder="搜索我的房屋..."
                                    value={myHousesSearch}
                                    onChange={(e) => {
                                        setMyHousesSearch(e.target.value);
                                        setMyHousesPage(1);
                                    }}
                                    className="w-64"
                                />
                                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                                    <DialogTrigger asChild>
                                        <Button>发布新房屋</Button>
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
                                                <Label htmlFor="location">位置</Label>
                                                <Input
                                                    id="location"
                                                    value={newHouse.location}
                                                    onChange={(e) => setNewHouse({...newHouse, location: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="description">描述</Label>
                                                <Input
                                                    id="description"
                                                    value={newHouse.description}
                                                    onChange={(e) => setNewHouse({...newHouse, description: e.target.value})}
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">发布</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-4 border-b">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                                    <div className="col-span-4">房屋信息</div>
                                    <div className="col-span-2">价格</div>
                                    <div className="col-span-2">状态</div>
                                    <div className="col-span-2">更新时间</div>
                                    <div className="col-span-2">操作</div>
                                </div>
                            </div>
                            
                            <div className="divide-y">
                                {myHouses.map((house) => (
                                    <div key={house.id} className="p-4 hover:bg-gray-50">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4">
                                                <h4 className="font-semibold text-gray-900">{house.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {house.location} | {house.description}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="font-bold text-green-600">
                                                    ¥{house.price.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <Badge className={
                                                    house.status === 'available' ? 'bg-green-100 text-green-800' : 
                                                    house.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    house.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                    house.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                    house.status === 'received' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }>
                                                    {house.status === 'available' ? '在售' : 
                                                     house.status === 'pending' ? '待卖家确认' : 
                                                     house.status === 'confirmed' ? '已确认待发货' : 
                                                     house.status === 'shipped' ? '已发货' :
                                                     house.status === 'received' ? '确认收货' :
                                                     '已售'}
                                                </Badge>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(house.updated_at || house.created_at).toLocaleDateString('zh-CN')}
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex gap-1">
                                                {house.status === 'pending' ? (
                                                    <Button 
                                                        size="sm" 
                                                        className="text-xs"
                                                        onClick={() => fetchPendingOrderForHouse(house.id)}
                                                    >
                                                        确认
                                                    </Button>
                                                ) : house.status === 'confirmed' ? (
                                                    <Button 
                                                        size="sm" 
                                                        className="text-xs"
                                                        onClick={() => fetchConfirmedOrderForHouse(house.id)}
                                                    >
                                                        发货
                                                    </Button>
                                                ) : house.status === 'shipped' ? (
                                                    <span className="text-xs text-purple-600">
                                                        已发货
                                                    </span>
                                                ) : house.status === 'received' ? (
                                                    <span className="text-xs text-green-600">
                                                        已完成
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="text-xs"
                                                            onClick={() => {
                                                                setEditingHouse(house);
                                                                setShowEditForm(true);
                                                            }}
                                                        >
                                                            修改
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="text-xs"
                                                            onClick={() => handleUpdateHouse(house.id)}
                                                        >
                                                            更新
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive"
                                                            className="text-xs"
                                                            onClick={() => handleDeleteHouse(house.id)}
                                                        >
                                                            删除
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {myHouses.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        您还没有发布任何房屋
                                    </div>
                                )}
                            </div>
                            
                            {/* 分页 */}
                            {myHousesTotalPages > 1 && (
                                <div className="p-4 border-t flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        第 {myHousesPage} 页，共 {myHousesTotalPages} 页
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={myHousesPage <= 1}
                                            onClick={() => setMyHousesPage(prev => prev - 1)}
                                        >
                                            上一页
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={myHousesPage >= myHousesTotalPages}
                                            onClick={() => setMyHousesPage(prev => prev + 1)}
                                        >
                                            下一页
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'home':
                return (
                    <div className="flex items-center justify-center h-96 text-gray-500">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">欢迎来到澳门房屋交易平台</h3>
                            <p>这里是首页内容</p>
                        </div>
                    </div>
                );
            case 'mine':
                return (
                    <div className="p-4">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">我的中心</h3>
                            <p className="text-gray-600">管理您的房屋、订单和个人信息</p>
                        </div>
                        
                        {!auth.user ? (
                            <div className="text-center py-8">
                                <h4 className="text-lg font-medium mb-4">请先登录以使用个人功能</h4>
                                <div className="space-y-3 max-w-xs mx-auto">
                                    <Link
                                        href="/login"
                                        className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        登录
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        注册
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <span>欢迎, {auth.user.name}</span>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        退出
                                    </Link>
                                </div>
                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* 我发布的 */}
                            <div 
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setActiveTab('my-houses');
                                    fetchMyHouses();
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-blue-600 text-xl">🏠</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">我发布的</h4>
                                        <p className="text-sm text-gray-500">管理发布的房屋</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• 查看已发布房屋</p>
                                    <p>• 编辑房屋信息</p>
                                    <p>• 管理房屋状态</p>
                                </div>
                            </div>

                            {/* 我购买的订单 */}
                            <div 
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setActiveTab('my-orders');
                                    fetchMyOrders();
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-green-600 text-xl">📋</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">我购买的订单</h4>
                                        <p className="text-sm text-gray-500">查看购买记录</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• 订单状态跟踪</p>
                                    <p>• 交易进度查看</p>
                                    <p>• 确认收房</p>
                                </div>
                            </div>

                            {/* 我的推荐 */}
                            <div 
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setActiveTab('my-referrals');
                                    fetchReferralData();
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-purple-600 text-xl">⭐</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">我的推荐</h4>
                                        <p className="text-sm text-gray-500">推荐好友奖励</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• 推荐好友注册</p>
                                    <p>• 获得佣金奖励</p>
                                    <p>• 推荐记录查看</p>
                                </div>
                            </div>

                            {/* 我的钱包 */}
                            <div 
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setActiveTab('my-wallet');
                                    fetchWalletData();
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-yellow-600 text-xl">💰</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">我的钱包</h4>
                                        <p className="text-sm text-gray-500">资金管理</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• 余额查看</p>
                                    <p>• 充值提现</p>
                                    <p>• 交易明细</p>
                                </div>
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">当前余额</span>
                                        <span className="font-semibold text-green-600">¥0.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* 我的资料 */}
                            <div 
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setActiveTab('my-profile');
                                    fetchProfileData();
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-red-600 text-xl">👤</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">我的资料</h4>
                                        <p className="text-sm text-gray-500">个人信息管理</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• 基本信息编辑</p>
                                    <p>• 头像设置</p>
                                    <p>• 联系方式更新</p>
                                </div>
                            </div>

                            {/* 设置 */}
                            <div 
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setActiveTab('settings');
                                    fetchSettingsData();
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-gray-600 text-xl">⚙️</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">设置</h4>
                                        <p className="text-sm text-gray-500">账户设置</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• 密码修改</p>
                                    <p>• 通知设置</p>
                                    <p>• 隐私设置</p>
                                </div>
                            </div>
                        </div>

                        {/* 快速统计 */}
                        <div className="mt-8 grid gap-4 md:grid-cols-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-sm opacity-90">发布房屋数</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-sm opacity-90">购买订单数</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-sm opacity-90">推荐好友数</div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
                                <div className="text-2xl font-bold">¥0</div>
                                <div className="text-sm opacity-90">累计收益</div>
                            </div>
                        </div>
                            </div>
                        )}
                    </div>
                );
            case 'my-referrals':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">我的推荐</h3>
                                <p className="text-gray-600">推荐好友，获得佣金奖励</p>
                            </div>
                        </div>

                        {referralData ? (
                            <>
                                {/* 推荐统计卡片 */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                                        <div className="text-2xl font-bold">{referralData.referred_users?.length || 0}</div>
                                        <div className="text-sm opacity-90">推荐好友数</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                                        <div className="text-2xl font-bold">¥{referralData.total_commissions || 0}</div>
                                        <div className="text-sm opacity-90">累计收益</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                                        <div className="text-2xl font-bold">¥{referralData.pending_commissions || 0}</div>
                                        <div className="text-sm opacity-90">待结算佣金</div>
                                    </div>
                                </div>

                                {/* 推荐链接和二维码 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold mb-4">我的推荐链接</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">推荐码</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={referralData.referral_code}
                                                    readOnly
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(referralData.referral_code)}
                                                >
                                                    复制
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">推荐链接</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={referralData.referral_link}
                                                    readOnly
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(referralData.referral_link)}
                                                >
                                                    复制
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 推荐制度说明 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-blue-900 mb-3">推荐制度</h4>
                                    <div className="text-blue-800 space-y-2">
                                        <p>• 分享您的推荐链接或推荐码给好友</p>
                                        <p>• 好友通过链接注册并完成房屋交易后，您将获得 <span className="font-semibold">{referralData.commission_rate}%</span> 的佣金奖励</p>
                                        <p>• 佣金实时计算，完成交易后自动结算到您的账户</p>
                                        <p>• 推荐好友越多，收益越丰厚！</p>
                                    </div>
                                </div>

                                {/* 推荐用户列表 */}
                                <div className="bg-white border border-gray-200 rounded-lg">
                                    <div className="p-4 border-b border-gray-200">
                                        <h4 className="text-lg font-semibold">推荐用户列表</h4>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {referralData.referred_users && referralData.referred_users.length > 0 ? (
                                            referralData.referred_users.map((user: any) => (
                                                <div
                                                    key={user.id}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => fetchReferredUserDetails(user.id)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                                <span className="text-purple-600 font-semibold">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                                <div className="text-xs text-gray-400">
                                                                    注册时间：{new Date(user.registered_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.completed_orders_count} 笔订单
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                总金额：¥{user.total_order_amount}
                                                            </div>
                                                            <div className="text-sm font-semibold text-green-600">
                                                                佣金：¥{user.commission_amount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <div className="text-4xl mb-2">👥</div>
                                                <div>还没有推荐用户</div>
                                                <div className="text-sm">分享您的推荐链接给好友吧！</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">⏳</div>
                                    <div>正在加载推荐数据...</div>
                                </div>
                            </div>
                        )}

                        {/* 推荐用户详情弹窗 */}
                        <Dialog open={showReferredUserDetails} onOpenChange={setShowReferredUserDetails}>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedReferredUser?.user?.name} 的订单详情
                                    </DialogTitle>
                                </DialogHeader>
                                {selectedReferredUser && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {selectedReferredUser.orders?.length || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">完成订单</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-green-600">
                                                        ¥{selectedReferredUser.total_order_amount || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">总交易额</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        ¥{selectedReferredUser.commission_amount || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">我的佣金</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-orange-600">
                                                        {selectedReferredUser.commission_rate || 10}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">佣金比例</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-h-64 overflow-y-auto">
                                            <div className="space-y-2">
                                                {selectedReferredUser.orders && selectedReferredUser.orders.length > 0 ? (
                                                    selectedReferredUser.orders.map((order: any) => (
                                                        <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{order.house?.title}</div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {order.house?.location}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        {new Date(order.created_at).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-green-600">
                                                                        ¥{order.price}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        佣金：¥{(order.price * 0.1).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        暂无完成的订单
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            case 'my-wallet':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">我的钱包</h3>
                                <p className="text-gray-600">管理您的收益和资金</p>
                            </div>
                        </div>

                        {walletData ? (
                            <>
                                {/* 资金统计卡片 */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                                        <div className="text-2xl font-bold">¥{walletData.balance || 0}</div>
                                        <div className="text-sm opacity-90">账户余额</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                                        <div className="text-2xl font-bold">¥{walletData.total_earnings || 0}</div>
                                        <div className="text-sm opacity-90">累计收益</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
                                        <div className="text-2xl font-bold">¥{walletData.pending_earnings || 0}</div>
                                        <div className="text-sm opacity-90">待结算收益</div>
                                    </div>
                                </div>

                                {/* 我要卖房间按钮 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold">房屋快速变现</h4>
                                        <Button
                                            onClick={() => {
                                                fetchMyHousesForSale();
                                                setShowSellToPlatformDialog(true);
                                            }}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            我要卖房间
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        快速将您的房屋出售给平台，立即获得现金收益
                                    </p>
                                </div>

                                {/* 卖房制度说明 */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-yellow-900 mb-3">卖房制度</h4>
                                    <div className="text-yellow-800 space-y-2">
                                        <p>• 您可以将自己的房屋直接出售给平台</p>
                                        <p>• 平台收购价格为房屋标价的 <span className="font-semibold">95%</span></p>
                                        <p>• 出售后立即到账，无需等待买家</p>
                                        <p>• 已有订单的房屋暂时无法出售给平台</p>
                                        <p>• 出售给平台后，房屋状态变更为已售出</p>
                                    </div>
                                </div>

                                {/* 收益列表 */}
                                <div className="bg-white border border-gray-200 rounded-lg">
                                    <div className="p-4 border-b border-gray-200">
                                        <h4 className="text-lg font-semibold">收益明细</h4>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {walletData.earnings && walletData.earnings.data && walletData.earnings.data.length > 0 ? (
                                            walletData.earnings.data.map((earning: any) => (
                                                <div key={earning.id} className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <div className="font-medium text-gray-900">{earning.title}</div>
                                                                <div className={`px-2 py-1 rounded-full text-xs ${
                                                                    earning.type === 'house_sale' ? 'bg-blue-100 text-blue-800' :
                                                                    earning.type === 'referral_commission' ? 'bg-purple-100 text-purple-800' :
                                                                    earning.type === 'platform_sale' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {earning.type === 'house_sale' ? '房屋销售' :
                                                                     earning.type === 'referral_commission' ? '推荐佣金' :
                                                                     earning.type === 'platform_sale' ? '平台回购' : '其他'}
                                                                </div>
                                                                <div className={`px-2 py-1 rounded-full text-xs ${
                                                                    earning.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    earning.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {earning.status === 'completed' ? '已完成' :
                                                                     earning.status === 'pending' ? '待结算' : '已取消'}
                                                                </div>
                                                            </div>
                                                            {earning.description && (
                                                                <div className="text-sm text-gray-500 mb-1">{earning.description}</div>
                                                            )}
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(earning.earned_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className={`text-lg font-semibold ${
                                                                earning.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                                                            }`}>
                                                                +¥{earning.amount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <div className="text-4xl mb-2">💰</div>
                                                <div>还没有收益记录</div>
                                                <div className="text-sm">开始销售房屋或推荐好友来获得收益吧！</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 分页 */}
                                    {walletData.earnings && walletData.earnings.last_page > 1 && (
                                        <div className="p-4 border-t flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                第 {walletData.earnings.current_page} 页，共 {walletData.earnings.last_page} 页
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={walletData.earnings.current_page <= 1}
                                                    onClick={() => {
                                                        // 实现分页逻辑
                                                    }}
                                                >
                                                    上一页
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={walletData.earnings.current_page >= walletData.earnings.last_page}
                                                    onClick={() => {
                                                        // 实现分页逻辑
                                                    }}
                                                >
                                                    下一页
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 卖房给平台对话框 */}
                                <Dialog open={showSellToPlatformDialog} onOpenChange={setShowSellToPlatformDialog}>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>选择要出售给平台的房屋</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            {myHousesForSale.length > 0 ? (
                                                <div className="grid gap-3 max-h-64 overflow-y-auto">
                                                    {myHousesForSale.map((house) => (
                                                        <div
                                                            key={house.id}
                                                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            onClick={() => setSelectedHouseForSale(house)}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{house.title}</div>
                                                                    <div className="text-sm text-gray-500">{house.location}</div>
                                                                    <div className="text-sm text-gray-400">{house.description}</div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-semibold text-blue-600">¥{house.price}</div>
                                                                    <div className="text-sm text-green-600">
                                                                        回购价：¥{(house.price * 0.95).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {selectedHouseForSale?.id === house.id && (
                                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                                    <div className="flex gap-2 justify-end">
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedHouseForSale(null);
                                                                            }}
                                                                        >
                                                                            取消
                                                                        </Button>
                                                                        <Button
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (confirm(`确认以 ¥${(house.price * 0.95).toFixed(2)} 的价格将"${house.title}"出售给平台吗？`)) {
                                                                                    handleSellToPlatform(house);
                                                                                }
                                                                            }}
                                                                        >
                                                                            确认出售
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <div className="text-4xl mb-2">🏠</div>
                                                    <div>没有可出售的房屋</div>
                                                    <div className="text-sm">您当前没有在售状态的房屋可以出售给平台</div>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">⏳</div>
                                    <div>正在加载钱包数据...</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'my-profile':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">我的资料</h3>
                                <p className="text-gray-600">管理您的个人信息</p>
                            </div>
                            <Button
                                onClick={() => setShowEditProfile(true)}
                                variant="outline"
                            >
                                编辑资料
                            </Button>
                        </div>

                        {profileData ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start space-x-6">
                                    {/* 头像部分 */}
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="relative">
                                            {profileData.avatar ? (
                                                <img
                                                    src={`/storage/${profileData.avatar}`}
                                                    alt="头像"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-500 text-2xl">👤</span>
                                                </div>
                                            )}
                                            {avatarPreview && (
                                                <img
                                                    src={avatarPreview}
                                                    alt="预览"
                                                    className="absolute inset-0 w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="text-sm"
                                                />
                                            </label>
                                            {avatarFile && (
                                                <Button
                                                    size="sm"
                                                    onClick={handleAvatarUpload}
                                                    className="w-full"
                                                >
                                                    上传头像
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 信息展示部分 */}
                                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.name || '未设置'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.nickname || '未设置'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.gender === 'male' ? '男' : 
                                                 profileData.gender === 'female' ? '女' : 
                                                 profileData.gender === 'other' ? '其他' : '未设置'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.age || '未设置'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.wechat || '未设置'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">电话号码</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.phone || '未设置'}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {profileData.email || '未设置'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 编辑资料对话框 */}
                                <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>编辑个人资料</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="name">姓名 *</Label>
                                                    <Input
                                                        id="name"
                                                        value={profileData?.name || ''}
                                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="nickname">昵称</Label>
                                                    <Input
                                                        id="nickname"
                                                        value={profileData?.nickname || ''}
                                                        onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="gender">性别</Label>
                                                    <select
                                                        id="gender"
                                                        value={profileData?.gender || ''}
                                                        onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="">请选择</option>
                                                        <option value="male">男</option>
                                                        <option value="female">女</option>
                                                        <option value="other">其他</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="age">年龄</Label>
                                                    <Input
                                                        id="age"
                                                        type="number"
                                                        min="1"
                                                        max="120"
                                                        value={profileData?.age || ''}
                                                        onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || null})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="wechat">微信号</Label>
                                                    <Input
                                                        id="wechat"
                                                        value={profileData?.wechat || ''}
                                                        onChange={(e) => setProfileData({...profileData, wechat: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone">电话号码</Label>
                                                    <Input
                                                        id="phone"
                                                        value={profileData?.phone || ''}
                                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="email">邮箱 *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileData?.email || ''}
                                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowEditProfile(false)}
                                                >
                                                    取消
                                                </Button>
                                                <Button type="submit">
                                                    保存
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">⏳</div>
                                    <div>正在加载个人资料...</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">设置</h3>
                                <p className="text-gray-600">账户设置和系统管理</p>
                            </div>
                        </div>

                        {settingsData ? (
                            <>
                                {/* 账户信息 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold mb-4">账户信息</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                #{settingsData.user.id}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {settingsData.user.name}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {settingsData.user.email}
                                                {settingsData.user.email_verified_at && (
                                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                        已验证
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">注册时间</label>
                                            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                                                {new Date(settingsData.user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 账户统计 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold mb-4">账户统计</h4>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {settingsData.stats.houses_count}
                                            </div>
                                            <div className="text-sm text-blue-800">发布房屋数</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {settingsData.stats.orders_count}
                                            </div>
                                            <div className="text-sm text-green-800">订单数量</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {settingsData.stats.referrals_count}
                                            </div>
                                            <div className="text-sm text-purple-800">推荐用户数</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {settingsData.stats.earnings_count}
                                            </div>
                                            <div className="text-sm text-orange-800">收益记录数</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 安全设置 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold mb-4">安全设置</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">修改密码</div>
                                                <div className="text-sm text-gray-600">更改您的登录密码</div>
                                            </div>
                                            <Button
                                                onClick={() => setShowChangePassword(true)}
                                                variant="outline"
                                            >
                                                修改密码
                                            </Button>
                                        </div>
                                        
                                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                                            <div>
                                                <div className="font-medium text-red-900">退出登录</div>
                                                <div className="text-sm text-red-700">退出当前账户</div>
                                            </div>
                                            <Button
                                                onClick={handleLogout}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                退出登录
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* 修改密码对话框 */}
                                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>修改密码</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <div>
                                                <Label htmlFor="current_password">当前密码 *</Label>
                                                <Input
                                                    id="current_password"
                                                    type="password"
                                                    value={passwordForm.current_password}
                                                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="new_password">新密码 *</Label>
                                                <Input
                                                    id="new_password"
                                                    type="password"
                                                    minLength={8}
                                                    value={passwordForm.new_password}
                                                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                                    required
                                                />
                                                <div className="text-xs text-gray-500 mt-1">
                                                    密码至少需要8个字符
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="new_password_confirmation">确认新密码 *</Label>
                                                <Input
                                                    id="new_password_confirmation"
                                                    type="password"
                                                    value={passwordForm.new_password_confirmation}
                                                    onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowChangePassword(false);
                                                        setPasswordForm({
                                                            current_password: '',
                                                            new_password: '',
                                                            new_password_confirmation: ''
                                                        });
                                                    }}
                                                >
                                                    取消
                                                </Button>
                                                <Button type="submit">
                                                    确认修改
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">⏳</div>
                                    <div>正在加载设置数据...</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'supply-demand':
            default:
                return (
                    <>
                        {/* 信息栏 - 包含标题和搜索栏 */}
                        <div className="bg-gray-700 rounded-t-lg border-b border-yellow-400 mb-0">
                            {/* 手机端标题 */}
                            <div className="md:hidden py-3 px-4 border-b border-gray-600">
                                <div className="text-center text-yellow-400 font-bold text-base">
                                    <span className="text-lg font-bold">
                                        {new Date().getMonth() + 1}月{new Date().getDate()}日澳门酒店实时牌价{' '}
                                    </span>
                                    <span className="text-xs text-gray-300">
                                        {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                            
                            {/* 搜索框和分页信息 */}
                            <div className="px-1 py-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                    
                                        <Input
                                            placeholder="搜索房屋..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-40 md:w-48 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2 md:gap-3 text-xs min-w-0">
                                        <span className="text-yellow-400 whitespace-nowrap">
                                            第 {currentPage + 1}/{Math.ceil(houses.length / itemsPerPage)} 页
                                        </span>
                                        
                                        <div className="flex items-center gap-0.5 md:gap-1">
                                            {Array.from({ length: Math.min(Math.ceil(houses.length / itemsPerPage), 6) }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-colors ${
                                                        i === currentPage ? 'bg-yellow-400' : 'bg-gray-500'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        
                                        <div className="text-gray-300 flex items-center gap-1 whitespace-nowrap">
                                            <span className="animate-pulse">每分钟更新</span>
                                        </div>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 overflow-hidden">
                            
                            
                            {/* 扁平化表头 - 机场大屏风格 - 占满宽度 */}
                            <div className="bg-gray-800 text-white text-sm font-bold border-b-2 border-yellow-400">
                                {/* 桌面端表头 */}
                                <div className="hidden md:flex items-center justify-between py-3 px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">房间信息</div>
                                        <div className="text-xs text-yellow-400">
                                            第 {currentPage + 1} / {Math.ceil(houses.length / itemsPerPage)} 页
                                        </div>
                                    </div>
                                    <div className="w-24 text-center">价格</div>
                                    <div className="w-20 text-center">时间</div>
                                    <div className="w-20 text-center">卖家</div>
                                    <div className="w-20 text-center">状态</div>
                                </div>
                            </div>
                            
                            <div className={`h-[500px] overflow-hidden relative bg-black ${pageChanging ? 'opacity-90' : 'opacity-100'} transition-opacity duration-200`} ref={scrollRef}>
                                <div 
                                    className="transition-transform duration-1000 ease-in-out"
                                    style={{
                                        transform: `translateY(-${currentPage * 500}px)` // 500px per page (10 items * 50px)
                                    }}
                                >
                                    {Array.from({ length: Math.ceil(houses.length / itemsPerPage) }, (_, pageIndex) => (
                                        <div key={pageIndex} className="h-[500px]">
                                            {houses
                                                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                                                .map((house, itemIndex) => (
                                                <div 
                                                    key={house.id}
                                                    className={`
                                                        border-b border-gray-700 text-white
                                                        ${itemIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
                                                        ${house.status === 'available' ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-500'}
                                                        hover:bg-gray-700 transition-all duration-300
                                                        transform hover:scale-105 cursor-pointer
                                                    `}
                                                    style={{
                                                        minHeight: '50px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '14px'
                                                    }}
                                                    onClick={() => {
                                                        if (house.status === 'available') {
                                                            setSelectedHouse(house);
                                                            setShowPurchaseDialog(true);
                                                        }
                                                    }}
                                                >
                                                    {/* 桌面端布局 */}
                                                    <div className="hidden md:flex items-center justify-between px-4 py-3 h-[50px]">
                                                        {/* 房间信息 */}
                                                        <div className="flex-1 truncate">
                                                            <span className="text-yellow-300 font-bold mr-2">
                                                                {String(house.id).padStart(3, '0')}
                                                            </span>
                                                            <span className="text-white font-semibold">
                                                                {house.title}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* 价格 */}
                                                        <div className="w-24 text-center">
                                                            <span className="text-green-400 font-bold text-lg">
                                                                ¥{house.price.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* 时间 */}
                                                        <div className="w-20 text-center text-gray-300 text-xs">
                                                            {new Date(house.created_at).toLocaleDateString('zh-CN', {
                                                                month: '2-digit',
                                                                day: '2-digit'
                                                            })}
                                                        </div>
                                                        
                                                        {/* 卖家 */}
                                                        <div className="w-20 text-center text-gray-300 text-xs truncate">
                                                            {house.user.name}
                                                        </div>
                                                        
                                                        {/* 状态 */}
                                                        <div className="w-20 text-center">
                                                            {house.status === 'available' ? (
                                                                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                                                                    可购买
                                                                </span>
                                                            ) : (
                                                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                                    {house.status === 'pending' ? '待确认' : '已售'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* 手机端布局 - 占满宽度，避免换行 */}
                                                    <div className="md:hidden px-3 py-2">
                                                        {/* 第一行：编号 + 房间标题 */}
                                                        <div className="flex items-center mb-1">
                                                            <span className="text-yellow-300 font-bold text-xs mr-2 flex-shrink-0">
                                                                {String(house.id).padStart(3, '0')}
                                                            </span>
                                                            <span className="text-white font-semibold text-sm flex-1 leading-tight">
                                                                {house.title}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* 第二行：价格 + 状态 */}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-green-400 font-bold text-base">
                                                                ¥{house.price.toLocaleString()}
                                                            </span>
                                                            <div>
                                                                {house.status === 'available' ? (
                                                                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                                                                        可购买
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                                        {house.status === 'pending' ? '待确认' : '已售'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {houses.length === 0 && !loading && (
                                <div className="text-center py-8 text-gray-500">
                                    暂无房屋信息
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="text-center py-8">
                                <span className="text-gray-500">加载中...</span>
                            </div>
                        )}
                    </>
                );
            case 'my-orders':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">我购买的订单</h3>
                                <p className="text-gray-600">查看您的购买记录和订单状态</p>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={() => setActiveTab('mine')}
                            >
                                返回我的中心
                            </Button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="divide-y divide-gray-200">
                                {myOrders.map((order) => (
                                    <div key={order.id} className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="font-semibold text-lg">{order.house.title}</h4>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {getStatusText(order.status)}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                    <div>位置: {order.house.location}</div>
                                                    <div>价格: ¥{order.price.toLocaleString()}</div>
                                                    <div>卖家: {order.seller.name}</div>
                                                    <div>下单时间: {new Date(order.created_at).toLocaleDateString('zh-CN')}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowOrderDetail(true);
                                                    }}
                                                >
                                                    查看详情
                                                </Button>
                                                {order.status === 'shipped' && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleReceive(order.id)}
                                                        >
                                                            确认收货
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleRejectDelivery(order.id)}
                                                        >
                                                            拒绝收货
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {myOrders.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        您还没有购买任何房屋
                                    </div>
                                )}
                            </div>
                            
                            {/* 分页 */}
                            {myOrdersTotalPages > 1 && (
                                <div className="p-4 border-t flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        第 {myOrdersPage} 页，共 {myOrdersTotalPages} 页
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={myOrdersPage <= 1}
                                            onClick={() => setMyOrdersPage(prev => prev - 1)}
                                        >
                                            上一页
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={myOrdersPage >= myOrdersTotalPages}
                                            onClick={() => setMyOrdersPage(prev => prev + 1)}
                                        >
                                            下一页
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <FrontendLayout title="澳门实时房价信息平台">
            
            <div className="flex h-screen flex-col">
                {/* 主要内容区域 */}
                <div className="flex-1 overflow-auto pb-20">
                    {renderTabContent()}
                </div>
                
                {/* 底部导航栏 */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
                    <div className="flex justify-around items-center px-2 py-1">
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 ${
                                activeTab === 'home'
                                    ? 'text-blue-600 bg-blue-50 scale-105'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                            <span className="text-xs font-medium">首页</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('supply-demand')}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 ${
                                activeTab === 'supply-demand'
                                    ? 'text-blue-600 bg-blue-50 scale-105'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                            <span className="text-xs font-medium">房源</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('mine')}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 ${
                                activeTab === 'mine'
                                    ? 'text-blue-600 bg-blue-50 scale-105'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-xs font-medium">我的</span>
                        </button>
                    </div>
                </div>
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
                                    <Label htmlFor="edit-location">位置</Label>
                                    <Input
                                        id="edit-location"
                                        value={editingHouse.location || ''}
                                        onChange={(e) => setEditingHouse({...editingHouse, location: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-description">描述</Label>
                                    <Input
                                        id="edit-description"
                                        value={editingHouse.description || ''}
                                        onChange={(e) => setEditingHouse({...editingHouse, description: e.target.value})}
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

                <Dialog open={showOrders} onOpenChange={setShowOrders}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>我的订单</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{order.house.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    买家: {order.buyer.name} | 卖家: {order.seller.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    价格: ¥{order.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getStatusColor(order.status)}>
                                                    {getStatusText(order.status)}
                                                </Badge>
                                                <div className="mt-2 space-x-2">
                                                    {order.status === 'pending' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleOrderAction(order.id, 'confirm')}
                                                        >
                                                            确认订单
                                                        </Button>
                                                    )}
                                                    {order.status === 'confirmed' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleOrderAction(order.id, 'deliver')}
                                                        >
                                                            标记交付
                                                        </Button>
                                                    )}
                                                    {order.status === 'delivered' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleOrderAction(order.id, 'complete')}
                                                        >
                                                            确认收货
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 订单详情Dialog */}
                <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>订单详情</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">订单编号</Label>
                                        <p className="text-sm">{selectedOrder.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">订单状态</Label>
                                        <Badge className={getStatusColor(selectedOrder.status)}>
                                            {getStatusText(selectedOrder.status)}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">房屋信息</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">房屋标题</Label>
                                            <p className="text-sm">{selectedOrder.house.title}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">位置</Label>
                                            <p className="text-sm">{selectedOrder.house.location}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">价格</Label>
                                            <p className="text-sm font-semibold text-green-600">¥{selectedOrder.price.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">房屋描述</Label>
                                            <p className="text-sm">{selectedOrder.house.description}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">交易信息</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">买家</Label>
                                            <p className="text-sm">{selectedOrder.buyer.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">卖家</Label>
                                            <p className="text-sm">{selectedOrder.seller.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">下单时间</Label>
                                            <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString('zh-CN')}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowOrderDetail(false)}
                                    >
                                        关闭
                                    </Button>
                                    <div className="flex gap-2">
                                        {/* 待卖家确认状态：买家无需操作，不显示确认按钮 */}
                                        {selectedOrder.status === 'pending' && (
                                            <span className="text-sm text-gray-500">
                                                等待卖家确认订单
                                            </span>
                                        )}
                                        
                                        {/* 已确认待发货状态：买家等待卖家发货 */}
                                        {selectedOrder.status === 'confirmed' && (
                                            <span className="text-sm text-gray-500">
                                                等待卖家发货
                                            </span>
                                        )}
                                        
                                        {/* 已发货状态：买家可以确认收货或拒绝收货 */}
                                        {selectedOrder.status === 'shipped' && (
                                            <>
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => handleRejectDelivery(selectedOrder.id)}
                                                >
                                                    拒绝收货
                                                </Button>
                                                <Button 
                                                    onClick={() => handleReceive(selectedOrder.id)}
                                                >
                                                    确认收货
                                                </Button>
                                            </>
                                        )}
                                        
                                        {/* 已确认收货状态：交易完成 */}
                                        {selectedOrder.status === 'received' && (
                                            <span className="text-sm text-green-600">
                                                交易已完成
                                            </span>
                                        )}
                                        
                                        {/* 卖家拒绝状态 */}
                                        {selectedOrder.status === 'rejected' && (
                                            <span className="text-sm text-red-600">
                                                卖家已拒绝订单
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* 购买确认Dialog */}
                <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>确认购买</DialogTitle>
                        </DialogHeader>
                        {selectedHouse && (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold mb-2">{selectedHouse.title}</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div>位置: {selectedHouse.location}</div>
                                        <div>价格: <span className="font-semibold text-green-600">¥{selectedHouse.price.toLocaleString()}</span></div>
                                        <div>卖家: {selectedHouse.user.name}</div>
                                        <div>描述: {selectedHouse.description}</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="customer-message">给卖家的留言 (可选)</Label>
                                        <textarea
                                            id="customer-message"
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            rows={3}
                                            placeholder="向卖家介绍您的购买意向、联系方式或其他信息..."
                                            value={customerMessage}
                                            onChange={(e) => setCustomerMessage(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="text-sm text-gray-600">
                                        <p>• 确认购买后，订单将提交给卖家</p>
                                        <p>• 卖家确认后即可进入交易流程</p>
                                        <p>• 如果24小时内卖家未响应，订单将自动取消</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => {
                                            setShowPurchaseDialog(false);
                                            setSelectedHouse(null);
                                            setCustomerMessage('');
                                        }}
                                    >
                                        取消
                                    </Button>
                                    <Button 
                                        className="flex-1"
                                        onClick={() => handlePurchase(selectedHouse)}
                                    >
                                        确认购买
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* 订单确认Dialog (卖家确认/拒绝订单) */}
                <Dialog open={showOrderConfirmDialog} onOpenChange={setShowOrderConfirmDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>订单确认</DialogTitle>
                        </DialogHeader>
                        {pendingOrder && (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <h4 className="font-semibold mb-2">房屋信息</h4>
                                    <div className="text-sm space-y-1">
                                        <div><strong>标题:</strong> {pendingOrder.house.title}</div>
                                        <div><strong>位置:</strong> {pendingOrder.house.location}</div>
                                        <div><strong>价格:</strong> <span className="font-semibold text-green-600">¥{pendingOrder.price.toLocaleString()}</span></div>
                                        <div><strong>描述:</strong> {pendingOrder.house.description}</div>
                                    </div>
                                </div>
                                
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold mb-2">买家信息</h4>
                                    <div className="text-sm space-y-1">
                                        <div><strong>买家:</strong> {pendingOrder.buyer.name}</div>
                                        <div><strong>下单时间:</strong> {new Date(pendingOrder.created_at).toLocaleString('zh-CN')}</div>
                                        <div><strong>订单编号:</strong> #{pendingOrder.id}</div>
                                    </div>
                                </div>
                                
                                {pendingOrder.customer_message && (
                                    <div className="border rounded-lg p-4 bg-yellow-50">
                                        <h4 className="font-semibold mb-2">客户留言</h4>
                                        <p className="text-sm text-gray-700">{pendingOrder.customer_message}</p>
                                    </div>
                                )}
                                
                                <div className="text-sm text-gray-600">
                                    <p>• 确认订单后，房屋状态将变为"已确认"，开始交易流程</p>
                                    <p>• 拒绝订单后，房屋将重新上架，可供其他买家购买</p>
                                    <p>• 请仔细核对订单信息后做出决定</p>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => handleOrderConfirmation(pendingOrder.id, 'reject')}
                                    >
                                        拒绝订单
                                    </Button>
                                    <Button 
                                        className="flex-1"
                                        onClick={() => handleOrderConfirmation(pendingOrder.id, 'confirm')}
                                    >
                                        确认订单
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* 发货确认Dialog */}
                <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>确认发货</DialogTitle>
                        </DialogHeader>
                        {shippingOrder && (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <h4 className="font-semibold mb-2">房屋信息</h4>
                                    <div className="text-sm space-y-1">
                                        <div><strong>标题:</strong> {shippingOrder.house.title}</div>
                                        <div><strong>位置:</strong> {shippingOrder.house.location}</div>
                                        <div><strong>价格:</strong> <span className="font-semibold text-green-600">¥{shippingOrder.price.toLocaleString()}</span></div>
                                        <div><strong>描述:</strong> {shippingOrder.house.description}</div>
                                    </div>
                                </div>
                                
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold mb-2">订单信息</h4>
                                    <div className="text-sm space-y-1">
                                        <div><strong>买家:</strong> {shippingOrder.buyer.name}</div>
                                        <div><strong>订单编号:</strong> #{shippingOrder.id}</div>
                                        <div><strong>确认时间:</strong> {new Date(shippingOrder.confirmed_at || shippingOrder.created_at).toLocaleString('zh-CN')}</div>
                                        <div><strong>当前状态:</strong> <Badge className="bg-blue-100 text-blue-800">已确认待发货</Badge></div>
                                    </div>
                                </div>
                                
                                {shippingOrder.customer_message && (
                                    <div className="border rounded-lg p-4 bg-yellow-50">
                                        <h4 className="font-semibold mb-2">客户留言</h4>
                                        <p className="text-sm text-gray-700">{shippingOrder.customer_message}</p>
                                    </div>
                                )}
                                
                                <div className="text-sm text-gray-600">
                                    <p>• 确认发货后，订单状态将变为"已发货"</p>
                                    <p>• 买家收到货物后可以确认收货，完成交易</p>
                                    <p>• 请确认已完成房屋交付准备工作</p>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => {
                                            setShowShipDialog(false);
                                            setShippingOrder(null);
                                        }}
                                    >
                                        取消
                                    </Button>
                                    <Button 
                                        className="flex-1"
                                        onClick={() => handleShipping(shippingOrder.id)}
                                    >
                                        确认发货
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            
        </FrontendLayout>
    );
}