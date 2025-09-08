import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import axios from 'axios';

// 导入供求信息组件
import SupplyDemand from './components/SupplyDemand';

interface House {
    id: number;
    title: string;
    price: number;
    location: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    images?: string[];
    user: {
        id: number;
        name: string;
        nickname?: string;
        rating?: number;
        transaction_count?: number;
    };
}

interface PageProps {
    auth: {
        user?: {
            id: number;
            name: string;
            nickname?: string;
        };
    };
}

export default function HousesIndex() {
    const { auth } = usePage<PageProps>().props;
    const { pendingSalesCount } = usePendingSalesCount();
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
    const [customerMessage, setCustomerMessage] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    
    // 默认图片数组
    const defaultImages = [
        "https://assets.sandsresortsmacao.cn/content/venetianmacao/hotel/suite/2020/royale-deluxe/vm_royale-deluxe-suite_banner_800x480.jpg",
        "https://assets.sandsresortsmacao.cn/content/venetianmacao/hotel/suite/2020/bella-deluxe/vm_bella-deluxe-suite_banner_800x480.jpg",
        "https://assets.sandsresortsmacao.cn/content/venetianmacao/hotel/suite/2020/royale-deluxe/vm_royale-deluxe-suite_banner_800x480.jpg",
    ];
    
    // 获取当前图片数组
    const currentImages = selectedHouse?.images || defaultImages;
    
    // 上一张图片
    const previousImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? currentImages.length - 1 : prev - 1
        );
    };
    
    // 下一张图片
    const nextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === currentImages.length - 1 ? 0 : prev + 1
        );
    };
    
    // 触摸滑动处理
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };
    
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;
        
        if (isLeftSwipe && currentImages.length > 1) {
            nextImage();
        }
        if (isRightSwipe && currentImages.length > 1) {
            previousImage();
        }
    };


    // 处理房屋购买
    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHouse) return;

        // 显示确认对话框
        const confirmed = window.confirm(
            `确认购买 ${selectedHouse.title}？\n价格：¥${selectedHouse.price.toLocaleString()}\n\n确认后将向卖家发送购买申请。`
        );
        
        if (!confirmed) {
            return; // 用户取消购买
        }

        try {
            await axios.post('/api/orders', {
                house_id: selectedHouse.id,
                customer_message: customerMessage,
            });
            setShowPurchaseDialog(false);
            setSelectedHouse(null);
            setCustomerMessage('');
            
            // 显示成功提示并跳转到订单页面
            const shouldRedirect = window.confirm('下单成功！等待卖家确认。\n\n是否前往查看我的订单？');
            if (shouldRedirect) {
                router.visit('/profile?tab=my-orders');
            }
        } catch (error: any) {
            console.error('下单失败:', error);
            
            // 检查是否是资料不完善的错误
            if (error.response?.status === 422 && error.response?.data?.redirect) {
                const shouldRedirect = window.confirm(
                    `${error.response.data.error}\n\n${error.response.data.message}\n\n是否前往完善资料？`
                );
                
                if (shouldRedirect) {
                    // 使用 Inertia 导航到个人资料页面
                    window.location.href = error.response.data.redirect;
                }
            } else {
                alert(error.response?.data?.error || '下单失败');
            }
        }
    };

    // 当前页面是供求信息页面，直接渲染供求信息组件
    return (
        <FrontendLayout>
            <Head title="供求信息 - 房源交易" />
            
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* 主要内容 */}
                <div className="w-full max-w-7xl mx-auto px-4 py-0">
                    <SupplyDemand onPurchase={(house) => { 
                        setSelectedHouse(house); 
                        // 设置默认购买留言
                        const buyerNickname = auth.user?.nickname || auth.user?.name || '买家';
                        const sellerNickname = house.user.nickname || house.user.name || '卖家';
                        const defaultMessage = `${buyerNickname}请求下单购买${sellerNickname}发布的房源`;
                        setCustomerMessage(defaultMessage);
                        setShowPurchaseDialog(true); 
                    }} />
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>

            {/* 购买对话框 */}
            <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>房源详情</DialogTitle>
                    </DialogHeader>
                    {selectedHouse && (
                        <div className="space-y-6">
                            {/* 酒店轮播图 */}
                            <div className="relative">
                                <div 
                                    className="aspect-[5/3] bg-gray-200 rounded-lg overflow-hidden relative group"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <img 
                                        src={currentImages[currentImageIndex]} 
                                        alt={selectedHouse.title}
                                        className="w-full h-full object-cover cursor-pointer transition-all duration-300"
                                        onClick={() => setShowImageModal(true)}
                                    />
                                    
                                    {/* 左箭头 */}
                                    {currentImages.length > 1 && (
                                        <button
                                            onClick={previousImage}
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            ‹
                                        </button>
                                    )}
                                    
                                    {/* 右箭头 */}
                                    {currentImages.length > 1 && (
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            ›
                                        </button>
                                    )}
                                    
                                    {/* 图片计数器 */}
                                    {currentImages.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                                            {currentImageIndex + 1} / {currentImages.length}
                                        </div>
                                    )}
                                </div>
                                
                                {/* 图片导航点 */}
                                {currentImages.length > 1 && (
                                    <div className="flex justify-center mt-3 space-x-2">
                                        {currentImages.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`w-3 h-3 rounded-full transition-colors ${
                                                    index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                                                }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* 卖家信息 */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">卖家信息</h3>
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {selectedHouse.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{selectedHouse.user.nickname || selectedHouse.user.name}</div>
                                            <div className="text-sm text-gray-500">认证卖家</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">交易次数:</span>
                                            <span className="font-medium">{selectedHouse.user.transaction_count || 0}次</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">卖家星级:</span>
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span 
                                                        key={star} 
                                                        className={`text-lg ${
                                                            star <= (selectedHouse.user.rating || 5) ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                                <span className="ml-1 text-sm text-gray-600">({selectedHouse.user.rating || 5.0})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 房间信息 */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">房间信息</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="font-medium text-lg">{selectedHouse.title}</div>
                                            <div className="text-sm text-gray-600">{selectedHouse.location}</div>
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">¥{selectedHouse.price.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {selectedHouse.description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 购买留言区域 */}
                            <form onSubmit={handlePurchase} className="space-y-4">
                                <div>
                                    <Label htmlFor="message">购买留言</Label>
                                    <Textarea
                                        id="message"
                                        value={customerMessage}
                                        onChange={(e) => setCustomerMessage(e.target.value)}
                                        placeholder="向卖家说点什么..."
                                        rows={2}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                                        确认购买 ¥{selectedHouse.price.toLocaleString()}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowPurchaseDialog(false)} className="flex-1">
                                        取消
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 图片放大模态框 */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                <DialogContent className="max-w-5xl max-h-[90vh] p-0">
                    <div 
                        className="relative group"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img 
                            src={currentImages[currentImageIndex]} 
                            alt={selectedHouse?.title}
                            className="w-full h-auto max-h-[85vh] object-contain"
                        />
                        
                        {/* 放大模态框中的左右箭头 */}
                        {currentImages.length > 1 && (
                            <>
                                <button
                                    onClick={previousImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 text-2xl"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 text-2xl"
                                >
                                    ›
                                </button>
                            </>
                        )}
                        
                        <button 
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 text-xl"
                        >
                            ×
                        </button>
                        
                        {/* 放大模态框中的图片计数器 */}
                        {currentImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                                {currentImageIndex + 1} / {currentImages.length}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </FrontendLayout>
    );
}