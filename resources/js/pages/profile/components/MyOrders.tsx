import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

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

export default function MyOrders() {
    const { auth } = usePage<any>().props;
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [myOrdersPage, setMyOrdersPage] = useState(1);
    const [myOrdersTotalPages, setMyOrdersTotalPages] = useState(1);

    // 确认收货弹窗状态
    const [showReceiveDialog, setShowReceiveDialog] = useState(false);
    const [receivingOrder, setReceivingOrder] = useState<Order | null>(null);
    const [receiveMessage, setReceiveMessage] = useState('');
    const [receiveRating, setReceiveRating] = useState<'好' | '中' | '差' | ''>('');

    // 拒收弹窗状态
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
    const [rejectMessage, setRejectMessage] = useState('');

    // 买家评价卖家弹窗状态
    const [showBuyerReviewDialog, setShowBuyerReviewDialog] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
    const [buyerReviewMessage, setBuyerReviewMessage] = useState('');
    const [buyerReviewRating, setBuyerReviewRating] = useState<'好' | '中' | '差' | ''>('');

    const itemsPerMyOrdersPage = 10;

    const fetchMyOrders = async () => {
        try {
            const response = await axios.get('/api/my-purchases', {
                params: {
                    page: myOrdersPage,
                    per_page: itemsPerMyOrdersPage,
                }
            });
            setMyOrders(response.data.data || []);
            setMyOrdersTotalPages(response.data.last_page || 1);
        } catch (error) {
            console.error('获取我的购买订单失败:', error);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, [myOrdersPage]);


    const handleOrderRejectDelivery = async (orderId: number, message: string) => {
        if (!message.trim()) {
            alert('请填写拒收原因');
            return;
        }
        
        try {
            await axios.patch(`/api/orders/${orderId}/reject-delivery`, {
                message: message
            });
            fetchMyOrders();
            alert('拒收成功！');
        } catch (error) {
            console.error('拒收失败:', error);
            alert('拒收失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const handleOrderCancel = async (orderId: number, message: string) => {
        if (!message.trim()) {
            alert('请填写取消原因');
            return;
        }
        
        try {
            await axios.patch(`/api/orders/${orderId}/cancel`, {
                message: message
            });
            fetchMyOrders();
            alert('订单取消成功！');
        } catch (error) {
            console.error('取消订单失败:', error);
            alert('取消订单失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 打开确认收货弹窗
    const openReceiveDialog = (order: Order) => {
        setReceivingOrder(order);
        setReceiveMessage('');
        setReceiveRating('');
        setShowReceiveDialog(true);
    };

    // 确认收货
    const confirmReceiveOrder = async () => {
        if (!receivingOrder || !receiveRating) {
            alert('请选择评价等级');
            return;
        }

        try {
            await axios.patch(`/api/orders/${receivingOrder.id}/receive`, {
                message: receiveMessage,
                rating: receiveRating
            });
            fetchMyOrders();
            setShowReceiveDialog(false);
            setReceivingOrder(null);
            alert('确认收房成功！');
        } catch (error) {
            console.error('确认收房失败:', error);
            alert('确认收房失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 打开拒收弹窗
    const openRejectDialog = (order: Order) => {
        setRejectingOrder(order);
        setRejectMessage('');
        setShowRejectDialog(true);
    };

    // 确认拒收
    const confirmRejectDelivery = async () => {
        if (!rejectingOrder || !rejectMessage.trim()) {
            alert('请填写拒收原因');
            return;
        }

        try {
            await axios.patch(`/api/orders/${rejectingOrder.id}/reject-delivery`, {
                message: rejectMessage
            });
            fetchMyOrders();
            setShowRejectDialog(false);
            setRejectingOrder(null);
            alert('拒收成功！');
        } catch (error) {
            console.error('拒收失败:', error);
            alert('拒收失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 打开买家评价弹窗
    const openBuyerReviewDialog = (order: Order) => {
        setReviewingOrder(order);
        setBuyerReviewMessage('');
        setBuyerReviewRating('');
        setShowBuyerReviewDialog(true);
    };

    // 确认买家评价
    const confirmBuyerReview = async () => {
        if (!reviewingOrder || !buyerReviewRating) {
            alert('请选择评价等级');
            return;
        }

        try {
            await axios.patch(`/api/orders/${reviewingOrder.id}/buyer-review`, {
                message: buyerReviewMessage,
                rating: buyerReviewRating
            });
            fetchMyOrders();
            setShowBuyerReviewDialog(false);
            setReviewingOrder(null);
            alert('评价成功！');
        } catch (error) {
            console.error('评价失败:', error);
            alert('评价失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const handleOrderReceiveWithRating = async (orderId: number, message?: string, rating?: string) => {
        if (!rating || !['优', '良', '中', '差'].includes(rating)) {
            alert('请选择有效的评价等级：优、良、中、差');
            return;
        }
        
        try {
            await axios.patch(`/api/orders/${orderId}/receive`, {
                message: message || '',
                rating: rating
            });
            fetchMyOrders();
            alert('确认收房成功！');
        } catch (error) {
            console.error('确认收房失败:', error);
            alert('确认收房失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    const getActionText = (action: string): string => {
        switch (action) {
            case 'placed_order': return '下单';
            case 'confirmed': return '确认订单';
            case 'rejected': return '拒绝订单';
            case 'cancelled': return '取消订单';
            case 'shipped': return '发货';
            case 'received': return '确认收货';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link 
                        href="/profile" 
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2"
                    >
                        ← 返回
                    </Link>
                    <h3 className="text-xl font-semibold">我的购买</h3>
                    <p className="text-gray-600">查看您的购买记录和订单状态</p>
                </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {myOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-3">
                        {/* 第一行：标题、状态 */}
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{order.house.title}</h4>
                            <Badge className={`${getStatusColor(order.status)} text-xs px-1.5 py-0.5 shrink-0`}>
                                {getStatusText(order.status)}
                            </Badge>
                        </div>
                        
                        {/* 第二行：价格、位置、卖家 */}
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-medium text-green-600">¥{order.price.toLocaleString()}</span>
                            <div className="flex items-center gap-2 text-gray-500 truncate ml-2">
                                <span className="flex items-center gap-0.5">
                                    <span>📍</span>
                                    <span className="truncate max-w-12">{order.house.location || '未填写'}</span>
                                </span>
                                <span className="truncate max-w-16">{order.seller.name}</span>
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
                            
                            {order.status === 'shipped' && (
                                <>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs h-7 px-4"
                                        onClick={() => openReceiveDialog(order)}
                                    >
                                        收房(确认完成交易)
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-300 hover:bg-red-50 flex-1 text-xs px-4 h-7"
                                        onClick={() => openRejectDialog(order)}
                                    >
                                        拒收
                                    </Button>
                                </>
                            )}
                            
                            {order.status === 'received' && !order.buyer_reviewed && (
                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-xs h-7 px-4"
                                    onClick={() => openBuyerReviewDialog(order)}
                                >
                                    评价
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                
                {myOrders.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">还没有购买记录</h3>
                        <p className="text-gray-500">浏览房屋列表，找到心仪的房屋下单购买吧！</p>
                    </div>
                )}
            </div>
            
            {/* 分页 */}
            {myOrdersTotalPages > 1 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
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
                </div>
            )}

            {/* 订单详情弹窗 */}
            <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>订单详情</DialogTitle>
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
                                
                                {/* 订单消息时间线 */}
                                {selectedOrder.messages && selectedOrder.messages.length > 0 && (
                                    <div className="mt-4">
                                        <Label className="text-sm font-medium text-gray-700 mb-3 block">订单流程记录</Label>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {selectedOrder.messages.map((message, index) => (
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
                            </div>
                            
                            <div className="flex justify-between items-center pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowOrderDetail(false)}
                                >
                                    关闭
                                </Button>
                                <div className="flex gap-2">
                                    {selectedOrder.status === 'pending' && (
                                        <span className="text-sm text-gray-500">
                                            等待卖家确认订单
                                        </span>
                                    )}
                                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                                        <>
                                            {selectedOrder.buyer.id === auth?.user?.id && (
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
                                                    买家取消订单
                                                </Button>
                                            )}
                                            {selectedOrder.seller.id === auth?.user?.id && (
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
                                                    卖家取消订单
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {selectedOrder.status === 'shipped' && (
                                        <>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => {
                                                    openReceiveDialog(selectedOrder);
                                                    setShowOrderDetail(false);
                                                }}
                                            >
                                                确认收房
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    openRejectDialog(selectedOrder);
                                                    setShowOrderDetail(false);
                                                }}
                                            >
                                                拒收
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 确认收货弹窗 */}
            <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>确认收房</DialogTitle>
                    </DialogHeader>
                    {receivingOrder && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 mb-4">
                                请对此次交易进行评价并对卖家打分
                            </div>
                            
                            {/* 房屋信息 */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="font-semibold">{receivingOrder.house.title}</div>
                                <div className="text-sm text-gray-600">位置：{receivingOrder.house.location}</div>
                                <div className="text-lg font-bold text-green-600">¥{receivingOrder.price.toLocaleString()}</div>
                            </div>

                            {/* 预设评价选项 */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">选择评价内容</Label>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {[
                                        '房屋状况良好，符合描述',
                                        '位置便利，交通方便',
                                        '商家服务周到，沟通顺畅',
                                        '性价比很高，推荐',
                                        '设施完善，居住舒适',
                                        '环境安静，适合休息'
                                    ].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setReceiveMessage(preset)}
                                            className={`p-2 text-sm rounded-lg border text-left transition-colors ${
                                                receiveMessage === preset
                                                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 自定义评价 */}
                            <div>
                                <Label htmlFor="receive-message" className="text-sm font-medium text-gray-700">自定义评价</Label>
                                <Textarea
                                    id="receive-message"
                                    value={receiveMessage}
                                    onChange={(e) => setReceiveMessage(e.target.value)}
                                    placeholder="请输入您对房屋的评价..."
                                    className="mt-1 min-h-[80px] resize-y"
                                />
                            </div>

                            {/* 评分选择 */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">评分等级 *</Label>
                                <div className="flex gap-3">
                                    {(['好', '中', '差'] as const).map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setReceiveRating(rating)}
                                            className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-colors ${
                                                receiveRating === rating
                                                    ? rating === '好' ? 'bg-green-100 border-green-300 text-green-800' :
                                                      rating === '中' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                                                      'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={confirmReceiveOrder}
                                    className="flex-1"
                                    disabled={!receiveRating}
                                >
                                    确认完成交易
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowReceiveDialog(false);
                                        setReceivingOrder(null);
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

            {/* 拒收弹窗 */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>拒收房屋</DialogTitle>
                    </DialogHeader>
                    {rejectingOrder && (
                        <div className="space-y-4">
                            {/* 警告提示 */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <div className="text-red-600 mr-3 mt-1">⚠️</div>
                                    <div>
                                        <div className="font-medium text-red-800 mb-2">重要提醒</div>
                                        <div className="text-sm text-red-700">
                                            请如实填写拒收原因。平台将核实您提供的信息，如发现虚假拒收，将扣除行政费用200元作为处理成本。
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 房屋信息 */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="font-semibold">{rejectingOrder.house.title}</div>
                                <div className="text-sm text-gray-600">位置：{rejectingOrder.house.location}</div>
                                <div className="text-lg font-bold text-green-600">¥{rejectingOrder.price.toLocaleString()}</div>
                            </div>

                            {/* 常见拒收原因 */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">选择拒收原因</Label>
                                <div className="grid grid-cols-1 gap-2 mb-3">
                                    {[
                                        '房屋状况与描述不符',
                                        '房屋存在安全隐患',
                                        '房屋卫生条件不达标',
                                        '设施设备损坏严重',
                                        '房屋位置与实际不符',
                                        '其他质量问题'
                                    ].map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => setRejectMessage(reason)}
                                            className={`p-3 text-sm rounded-lg border text-left transition-colors ${
                                                rejectMessage === reason
                                                    ? 'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 详细拒收原因 */}
                            <div>
                                <Label htmlFor="reject-message" className="text-sm font-medium text-gray-700">详细说明 *</Label>
                                <Textarea
                                    id="reject-message"
                                    value={rejectMessage}
                                    onChange={(e) => setRejectMessage(e.target.value)}
                                    placeholder="请详细说明拒收的具体原因，以便平台核实处理..."
                                    className="mt-1 min-h-[100px] resize-y"
                                    required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    请提供真实详细的拒收原因，有助于快速处理您的申请
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={confirmRejectDelivery}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={!rejectMessage.trim()}
                                >
                                    确认拒收
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowRejectDialog(false);
                                        setRejectingOrder(null);
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

            {/* 买家评价卖家弹窗 */}
            <Dialog open={showBuyerReviewDialog} onOpenChange={setShowBuyerReviewDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>评价卖家</DialogTitle>
                    </DialogHeader>
                    {reviewingOrder && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 mb-4">
                                请对卖家的服务进行评价
                            </div>
                            
                            {/* 房屋信息 */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="font-semibold">{reviewingOrder.house.title}</div>
                                <div className="text-sm text-gray-600">卖家：{reviewingOrder.seller.name}</div>
                                <div className="text-lg font-bold text-green-600">¥{reviewingOrder.price.toLocaleString()}</div>
                            </div>

                            {/* 预设评价选项 */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">选择评价内容</Label>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {[
                                        '服务态度很好，沟通顺畅',
                                        '房屋描述准确，诚信交易',
                                        '响应及时，配合度高',
                                        '专业可靠，值得推荐',
                                        '交易过程顺利，体验好',
                                        '房屋质量符合预期'
                                    ].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setBuyerReviewMessage(preset)}
                                            className={`p-2 text-sm rounded-lg border text-left transition-colors ${
                                                buyerReviewMessage === preset
                                                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 自定义评价 */}
                            <div>
                                <Label htmlFor="buyer-review-message" className="text-sm font-medium text-gray-700">自定义评价</Label>
                                <Textarea
                                    id="buyer-review-message"
                                    value={buyerReviewMessage}
                                    onChange={(e) => setBuyerReviewMessage(e.target.value)}
                                    placeholder="请输入您对卖家的评价..."
                                    className="mt-1 min-h-[80px] resize-y"
                                />
                            </div>

                            {/* 评分选择 */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">评分等级 *</Label>
                                <div className="flex gap-3">
                                    {(['好', '中', '差'] as const).map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setBuyerReviewRating(rating)}
                                            className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-colors ${
                                                buyerReviewRating === rating
                                                    ? rating === '好' ? 'bg-green-100 border-green-300 text-green-800' :
                                                      rating === '中' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                                                      'bg-red-100 border-red-300 text-red-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    onClick={confirmBuyerReview}
                                    className="flex-1"
                                    disabled={!buyerReviewRating}
                                >
                                    提交评价
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowBuyerReviewDialog(false);
                                        setReviewingOrder(null);
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