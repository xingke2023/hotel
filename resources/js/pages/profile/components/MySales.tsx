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

interface OrderMessage {
    id: number;
    action: string;
    message?: string;
    rating?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface Order {
    id: number;
    status: string;
    price: number;
    house: House;
    buyer: { id: number; name: string };
    seller: { id: number; name: string };
    created_at: string;
    confirmed_at?: string;
    shipped_at?: string;
    messages: OrderMessage[];
    buyer_review?: string;
    seller_review?: string;
    buyer_rating?: string;
    seller_rating?: string;
    buyer_reviewed: boolean;
    seller_reviewed: boolean;
}

export default function MySales() {
    const { auth } = usePage<any>().props;
    const [availableHouses, setAvailableHouses] = useState<House[]>([]);
    const [mySales, setMySales] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [mySalesPage, setMySalesPage] = useState(1);
    const [mySalesTotalPages, setMySalesTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
    
    // 重新上架编辑状态
    const [showRelistDialog, setShowRelistDialog] = useState(false);
    const [relistingOrder, setRelistingOrder] = useState<Order | null>(null);
    const [editingHouse, setEditingHouse] = useState({
        title: '',
        price: 0,
        location: '',
        description: ''
    });

    // 卖家评价买家弹窗状态
    const [showSellerReviewDialog, setShowSellerReviewDialog] = useState(false);
    const [sellerReviewingOrder, setSellerReviewingOrder] = useState<Order | null>(null);
    const [sellerReviewMessage, setSellerReviewMessage] = useState('');
    const [sellerReviewRating, setSellerReviewRating] = useState<'好' | '中' | '差' | ''>('');

    // 订单确认弹窗状态
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // 订单拒绝弹窗状态
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const itemsPerMySalesPage = 10;

    const fetchMySales = async () => {
        try {
            const response = await axios.get('/api/my-sales', {
                params: {
                    page: mySalesPage,
                    per_page: itemsPerMySalesPage,
                    search: searchTerm,
                    status: selectedStatus === 'all' ? '' : selectedStatus,
                }
            });
            setAvailableHouses(response.data.available_houses || []);
            setMySales(response.data.orders?.data || []);
            setMySalesTotalPages(response.data.orders?.last_page || 1);
        } catch (error: any) {
            console.error('获取我的销售数据失败:', error);
        }
    };

    useEffect(() => {
        fetchMySales();
    }, [mySalesPage]);
    
    // 搜索和筛选功能
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setMySalesPage(1);
            fetchMySales();
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedStatus, selectedDateFilter]);
    
    // 日期过滤函数
    const filterOrdersByDate = (orders: Order[]) => {
        if (selectedDateFilter === 'all') return orders;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            
            switch (selectedDateFilter) {
                case 'today':
                    return orderDay.getTime() === today.getTime();
                case 'yesterday':  
                    return orderDay.getTime() === yesterday.getTime();
                case 'before':
                    return orderDay.getTime() < yesterday.getTime();
                default:
                    return true;
            }
        });
    };
    
    // 状态过滤函数
    const filterOrdersByStatus = (orders: Order[]) => {
        if (selectedStatus === 'all') return orders;
        return orders.filter(order => order.status === selectedStatus);
    };
    
    // 获取过滤后的订单 - 先按日期筛选，再按状态筛选
    const filteredOrders = filterOrdersByStatus(filterOrdersByDate(mySales));
    
    // 获取订单状态统计
    const getStatusCounts = () => {
        const counts = {
            all: filteredOrders.length,
            pending: 0,
            confirmed: 0,
            shipped: 0,
            received: 0,
            rejected: 0,
            cancelled: 0
        };
        
        filteredOrders.forEach(order => {
            if (counts.hasOwnProperty(order.status)) {
                counts[order.status as keyof typeof counts]++;
            }
        });
        
        return counts;
    };
    
    const statusCounts = getStatusCounts();
    
    // 获取日期筛选统计
    const getDateCounts = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const counts = {
            all: mySales.length,
            today: 0,
            yesterday: 0,
            before: 0
        };
        
        mySales.forEach(order => {
            const orderDate = new Date(order.created_at);
            const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            
            if (orderDay.getTime() === today.getTime()) {
                counts.today++;
            } else if (orderDay.getTime() === yesterday.getTime()) {
                counts.yesterday++;
            } else if (orderDay.getTime() < yesterday.getTime()) {
                counts.before++;
            }
        });
        
        return counts;
    };
    
    const dateCounts = getDateCounts();

    const handleOrderCancel = async (orderId: number, message: string) => {
        if (!message.trim()) {
            alert('请填写取消原因');
            return;
        }
        
        try {
            await axios.patch(`/api/orders/${orderId}/cancel`, {
                message: message
            });
            fetchMySales();
            alert('订单取消成功！');
        } catch (error: any) {
            console.error('取消订单失败:', error);
            alert('取消订单失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const handleRelistFromOrder = (order: Order) => {
        setRelistingOrder(order);
        setEditingHouse({
            title: order.house.title,
            price: order.house.price,
            location: order.house.location,
            description: order.house.description
        });
        setShowRelistDialog(true);
    };

    const confirmRelistHouse = async () => {
        if (!relistingOrder) return;
        
        try {
            // 更新房屋信息并重新上架
            await axios.put(`/api/houses/${relistingOrder.house.id}`, editingHouse);
            await axios.patch(`/api/orders/${relistingOrder.id}/relist`);
            
            fetchMySales();
            setShowRelistDialog(false);
            setRelistingOrder(null);
            alert('房屋重新上架成功！');
        } catch (error: any) {
            console.error('重新上架失败:', error);
            alert('重新上架失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 打开卖家评价弹窗
    const openSellerReviewDialog = (order: Order) => {
        setSellerReviewingOrder(order);
        setSellerReviewMessage('');
        setSellerReviewRating('');
        setShowSellerReviewDialog(true);
    };

    // 确认卖家评价
    const confirmSellerReview = async () => {
        if (!sellerReviewingOrder || !sellerReviewRating) {
            alert('请选择评价等级');
            return;
        }

        try {
            await axios.patch(`/api/orders/${sellerReviewingOrder.id}/seller-review`, {
                message: sellerReviewMessage,
                rating: sellerReviewRating
            });
            fetchMySales();
            setShowSellerReviewDialog(false);
            setSellerReviewingOrder(null);
            alert('评价成功！');
        } catch (error: any) {
            console.error('评价失败:', error);
            alert('评价失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 打开订单确认弹窗
    const openConfirmDialog = (order: Order) => {
        setConfirmingOrder(order);
        setConfirmMessage('');
        setShowConfirmDialog(true);
    };

    // 确认订单
    const handleOrderConfirm = async () => {
        if (!confirmingOrder) return;
        
        const defaultMessage = `卖家${auth?.user?.name || ''}已接受您的订单`;
        const message = confirmMessage || defaultMessage;
        
        try {
            await axios.patch(`/api/orders/${confirmingOrder.id}/confirm`, {
                seller_message: message
            });
            setShowConfirmDialog(false);
            setConfirmingOrder(null);
            setConfirmMessage('');
            fetchMySales();
            alert('订单确认成功！');
        } catch (error: any) {
            console.error('确认订单失败:', error);
            alert('确认订单失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 打开订单拒绝弹窗
    const openRejectDialog = (order: Order) => {
        setRejectingOrder(order);
        setRejectReason('');
        setShowRejectDialog(true);
    };

    // 拒绝订单
    const handleOrderReject = async () => {
        if (!rejectingOrder || !rejectReason) {
            alert('请选择拒绝理由');
            return;
        }
        
        try {
            await axios.patch(`/api/orders/${rejectingOrder.id}/reject`, {
                seller_message: rejectReason
            });
            setShowRejectDialog(false);
            setRejectingOrder(null);
            setRejectReason('');
            fetchMySales();
            alert('订单已拒绝');
        } catch (error: any) {
            console.error('拒绝订单失败:', error);
            alert('拒绝订单失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 常见拒绝理由
    const rejectReasons = [
        '房屋已被预留',
        '房屋信息有误',
        '价格已调整',
        '暂时不出售',
        '买家资质不符',
        '其他原因'
    ];

    const getActionText = (action: string): string => {
        switch (action) {
            case 'placed_order': return '下单';
            case 'confirmed': return '确认订单';
            case 'rejected': return '拒绝订单';
            case 'cancelled': return '取消订单';
            case 'shipped': return '发货';
            case 'received': return '交易完成';
            case 'rejected_delivery': return '拒收';
            case 'reviewed': return '评价';
            default: return '未知操作';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'received': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'user_cancelled': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'seller_cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'rejected_delivery': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return '等待卖家确认';
            case 'confirmed': return '卖家已确认';
            case 'shipped': return '卖家已协助完成入住';
            case 'received': return '交易完成';
            case 'rejected': return '订单被拒绝';
            case 'cancelled': return '已取消';
            case 'user_cancelled': return '买家已取消';
            case 'seller_cancelled': return '卖家已取消';
            case 'rejected_delivery': return '买家已拒收';
            default: return '未知状态';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <Link 
                        href="/profile" 
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2"
                    >
                        ← 返回
                    </Link>
                    <h3 className="text-xl font-semibold">房源销售订单管理</h3>
                    
                </div>
            </div>

            {/* 所有订单区域 */}
            <div>
                

                {/* 搜索和筛选区域 */}
                <div className="space-y-4 mb-6">
                    {/* 搜索框和日期筛选 */}
                    <div className="flex flex-wrap items-center gap-4">
                        <Input
                            placeholder="按关键词搜索房源"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                        
                        {/* 日期筛选Badge */}
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: '全部', count: dateCounts.all },
                                { key: 'today', label: '今日', count: dateCounts.today },
                                { key: 'yesterday', label: '昨日', count: dateCounts.yesterday },
                                { key: 'before', label: '之前', count: dateCounts.before },
                            ].map((dateFilter) => (
                                <Badge
                                    key={dateFilter.key}
                                    variant={selectedDateFilter === dateFilter.key ? "default" : "outline"}
                                    className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                                        selectedDateFilter === dateFilter.key 
                                            ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md border-orange-600' 
                                            : 'hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                    onClick={() => setSelectedDateFilter(dateFilter.key)}
                                >
                                    {dateFilter.label} ({dateFilter.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                    
                    {/* 状态筛选Badge */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: '全部', count: statusCounts.all },
                            { key: 'pending', label: '等待确认', count: statusCounts.pending },
                            { key: 'confirmed', label: '已确认', count: statusCounts.confirmed },
                            { key: 'shipped', label: '已入住', count: statusCounts.shipped },
                            { key: 'received', label: '已完成', count: statusCounts.received },
                            { key: 'rejected', label: '已拒绝', count: statusCounts.rejected },
                            { key: 'cancelled', label: '已取消', count: statusCounts.cancelled },
                        ].map((status) => (
                            <Badge
                                key={status.key}
                                variant={selectedStatus === status.key ? "default" : "outline"}
                                className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                                    selectedStatus === status.key 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md border-blue-600' 
                                        : 'hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'
                                }`}
                                onClick={() => setSelectedStatus(status.key)}
                            >
                                {status.label} ({status.count})
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-3">
                        {/* 第一行：标题、状态 */}
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{order.house.title}</h4>
                            <Badge className={`${getStatusColor(order.status)} text-xs px-1.5 py-0.5 shrink-0`}>
                                {getStatusText(order.status)}
                            </Badge>
                        </div>
                        
                        {/* 第二行：价格、买家、时间 */}
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-medium text-green-600">¥{order.price.toLocaleString()}</span>
                            <div className="flex items-center gap-2 text-gray-500 truncate ml-2">
                                <span className="flex items-center gap-0.5">
                                    <span>👤</span>
                                    <span className="truncate max-w-12">{order.buyer.name}</span>
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <span>🕒</span>
                                    <span className="truncate max-w-16">{new Date(order.created_at).toLocaleDateString('zh-CN', {month: 'numeric', day: 'numeric'})}</span>
                                </span>
                            </div>
                        </div>
                        
                        {/* 第三行：操作按钮 */}
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDetail(true);
                                }}
                                className="text-xs h-7 px-10"
                            >
                                详情
                            </Button>
                            
                            {order.status === 'pending' && (
                                <>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-10"
                                        onClick={() => openConfirmDialog(order)}
                                    >
                                        接受
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-10 h-7"
                                        onClick={() => openRejectDialog(order)}
                                    >
                                        拒绝
                                    </Button>
                                </>
                            )}
                            
                            {order.status === 'confirmed' && (
                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-10"
                                    onClick={async () => {
                                        // 显示确认对话框
                                        const confirmed = window.confirm(
                                            `确认发货 ${order.house.title}？\n买家：${order.buyer.name}\n价格：¥${order.price.toLocaleString()}\n\n确认后将标记订单为已发货状态。`
                                        );
                                        
                                        if (!confirmed) {
                                            return; // 用户取消发货
                                        }

                                        try {
                                            await axios.patch(`/api/orders/${order.id}/ship`);
                                            fetchMySales();
                                            alert('订单已发货！');
                                        } catch (error: any) {
                                            console.error('发货失败:', error);
                                            alert('发货失败：' + (error.response?.data?.message || '未知错误'));
                                        }
                                    }}
                                >
                                    发货
                                </Button>
                            )}
                            
                            {order.status === 'received' && !order.seller_reviewed && (
                                <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-10"
                                    onClick={() => openSellerReviewDialog(order)}
                                >
                                    评价
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {mySales.length === 0 ? '还没有订单记录' : 
                                 selectedDateFilter === 'today' ? '今日暂无订单' :
                                 selectedDateFilter === 'yesterday' ? '昨日暂无订单' :
                                 selectedDateFilter === 'before' ? '之前暂无订单' :
                                 '暂无符合条件的订单'}
                            </h3>
                            <p className="text-gray-500">
                                {mySales.length === 0 ? '买家下单购买您的房屋时会显示在这里' : '尝试调整筛选条件查看其他订单'}
                            </p>
                        </div>
                    )}
                </div>
        </div>
            
            {/* 分页 */}
            {mySalesTotalPages > 1 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            第 {mySalesPage} 页，共 {mySalesTotalPages} 页
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={mySalesPage <= 1}
                                onClick={() => setMySalesPage(prev => prev - 1)}
                            >
                                上一页
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={mySalesPage >= mySalesTotalPages}
                                onClick={() => setMySalesPage(prev => prev + 1)}
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 订单详情弹窗 */}
            <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>销售订单详情</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-lg font-semibold">订单号：#{selectedOrder.id}</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(selectedOrder.created_at).toLocaleString('zh-CN')}
                                    </div>
                                </div>
                                <Badge className={getStatusColor(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Badge>
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
                                    {selectedOrder.confirmed_at && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">确认时间</Label>
                                            <p className="text-sm">{new Date(selectedOrder.confirmed_at).toLocaleString('zh-CN')}</p>
                                        </div>
                                    )}
                                    {selectedOrder.shipped_at && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">发货时间</Label>
                                            <p className="text-sm">{new Date(selectedOrder.shipped_at).toLocaleString('zh-CN')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 订单消息时间线 */}
                            {selectedOrder.messages && selectedOrder.messages.length > 0 && (
                                <div className="mt-4">
                                    <Label className="text-sm font-medium text-gray-700 mb-3 block">订单流程记录</Label>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {selectedOrder.messages.map((message) => (
                                            <div key={message.id} className="flex gap-3">
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {message.user.name}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                                            {getActionText(message.action)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(message.created_at).toLocaleString('zh-CN')}
                                                        </span>
                                                    </div>
                                                    {message.message && (
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                            {message.message}
                                                        </p>
                                                    )}
                                                    {message.rating && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm text-gray-600">评价：</span>
                                                            <span className={`text-sm px-2 py-1 rounded ${
                                                                message.rating === '优' ? 'bg-green-100 text-green-800' :
                                                                message.rating === '良' ? 'bg-blue-100 text-blue-800' :
                                                                message.rating === '中' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {message.rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowOrderDetail(false)}
                                >
                                    关闭
                                </Button>
                                <div className="flex gap-2">
                                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const message = prompt('请输入取消原因（必填）:');
                                                if (message && message.trim()) {
                                                    handleOrderCancel(selectedOrder.id, message);
                                                    setShowOrderDetail(false);
                                                } else if (message !== null) {
                                                    alert('取消原因不能为空');
                                                }
                                            }}
                                        >
                                            取消订单
                                        </Button>
                                    )}
                                    
                                    {(selectedOrder.status === 'rejected' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'user_cancelled' || selectedOrder.status === 'seller_cancelled') && 
                                     selectedOrder.house.status !== 'available' && (
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => {
                                                handleRelistFromOrder(selectedOrder);
                                                setShowOrderDetail(false);
                                            }}
                                        >
                                            重新上架
                                        </Button>
                                    )}
                                    
                                    {selectedOrder.status === 'received' && !selectedOrder.seller_reviewed && (
                                        <Button
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                            onClick={() => {
                                                openSellerReviewDialog(selectedOrder);
                                                setShowOrderDetail(false);
                                            }}
                                        >
                                            评价买家
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 重新上架编辑弹窗 */}
            <Dialog open={showRelistDialog} onOpenChange={setShowRelistDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>重新上架房屋</DialogTitle>
                    </DialogHeader>
                    {relistingOrder && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 mb-4">
                                您可以修改房屋信息后重新上架
                            </div>
                            
                            <div>
                                <Label htmlFor="relist-title">房屋标题 *</Label>
                                <Input
                                    id="relist-title"
                                    value={editingHouse.title}
                                    onChange={(e) => setEditingHouse({...editingHouse, title: e.target.value})}
                                    placeholder="请输入房屋标题"
                                    className="mt-1"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="relist-price">价格 (元) *</Label>
                                <Input
                                    id="relist-price"
                                    type="number"
                                    value={editingHouse.price}
                                    onChange={(e) => setEditingHouse({...editingHouse, price: Number(e.target.value)})}
                                    placeholder="请输入价格"
                                    className="mt-1"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="relist-location">位置 *</Label>
                                <Input
                                    id="relist-location"
                                    value={editingHouse.location}
                                    onChange={(e) => setEditingHouse({...editingHouse, location: e.target.value})}
                                    placeholder="请输入位置"
                                    className="mt-1"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="relist-description">房屋描述</Label>
                                <Textarea
                                    id="relist-description"
                                    value={editingHouse.description}
                                    onChange={(e) => setEditingHouse({...editingHouse, description: e.target.value})}
                                    placeholder="请输入房屋描述和入住事项，支持多行输入..."
                                    className="mt-1 min-h-[100px] resize-y"
                                />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={confirmRelistHouse}
                                    className="flex-1"
                                    disabled={!editingHouse.title || !editingHouse.price || !editingHouse.location}
                                >
                                    确认重新上架
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowRelistDialog(false);
                                        setRelistingOrder(null);
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

            {/* 订单确认弹窗 */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>确认订单</DialogTitle>
                    </DialogHeader>
                    {confirmingOrder && (
                        <div className="space-y-4">
                            {/* 订单信息 */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-semibold">{confirmingOrder.house.title}</div>
                                <div className="text-sm text-gray-600">买家：{confirmingOrder.buyer.name}</div>
                                <div className="text-lg font-bold text-green-600">¥{confirmingOrder.price.toLocaleString()}</div>
                            </div>

                            <div>
                                <Label htmlFor="confirm-message">确认留言</Label>
                                <Input
                                    id="confirm-message"
                                    value={confirmMessage}
                                    onChange={(e) => setConfirmMessage(e.target.value)}
                                    placeholder={`卖家${auth?.user?.name || ''}已接受您的订单`}
                                    className="mt-1"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    留空将使用默认留言
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleOrderConfirm} className="flex-1">
                                    确认订单
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowConfirmDialog(false);
                                        setConfirmingOrder(null);
                                        setConfirmMessage('');
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

            {/* 订单拒绝弹窗 */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>拒绝订单</DialogTitle>
                    </DialogHeader>
                    {rejectingOrder && (
                        <div className="space-y-4">
                            {/* 订单信息 */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-semibold">{rejectingOrder.house.title}</div>
                                <div className="text-sm text-gray-600">买家：{rejectingOrder.buyer.name}</div>
                                <div className="text-lg font-bold text-green-600">¥{rejectingOrder.price.toLocaleString()}</div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">选择拒绝理由</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {rejectReasons.map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => setRejectReason(reason)}
                                            className={`p-2 text-sm rounded-lg border text-left transition-colors ${
                                                rejectReason === reason
                                                    ? 'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {rejectReason === '其他原因' && (
                                <div>
                                    <Label htmlFor="custom-reason">详细说明</Label>
                                    <Textarea
                                        id="custom-reason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="请详细说明拒绝原因..."
                                        className="mt-1 min-h-[80px] resize-y"
                                    />
                                </div>
                            )}
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={handleOrderReject}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={!rejectReason}
                                >
                                    确认拒绝
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowRejectDialog(false);
                                        setRejectingOrder(null);
                                        setRejectReason('');
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

            {/* 卖家评价买家弹窗 */}
            <Dialog open={showSellerReviewDialog} onOpenChange={setShowSellerReviewDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>评价买家</DialogTitle>
                    </DialogHeader>
                    {sellerReviewingOrder && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 mb-4">
                                请为买家 {sellerReviewingOrder.buyer.name} 在此次交易中的表现进行评价
                            </div>
                            
                            <div>
                                <Label htmlFor="seller-review-message">评价内容（选填）</Label>
                                <Textarea
                                    id="seller-review-message"
                                    value={sellerReviewMessage}
                                    onChange={(e) => setSellerReviewMessage(e.target.value)}
                                    placeholder="请输入对买家的评价..."
                                    className="mt-1 min-h-[80px] resize-y"
                                />
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">评价等级 *</Label>
                                <div className="flex gap-2">
                                    {(['好', '中', '差'] as const).map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setSellerReviewRating(rating)}
                                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                                sellerReviewRating === rating
                                                    ? rating === '好' 
                                                        ? 'bg-green-100 border-green-300 text-green-800'
                                                        : rating === '中'
                                                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                                                        : 'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={confirmSellerReview}
                                    className="flex-1"
                                    disabled={!sellerReviewRating}
                                >
                                    提交评价
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowSellerReviewDialog(false);
                                        setSellerReviewingOrder(null);
                                        setSellerReviewMessage('');
                                        setSellerReviewRating('');
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
        </div>
    );
}