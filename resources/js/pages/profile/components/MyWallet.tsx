import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from '@/lib/axios';

interface House {
    id: number;
    title: string;
    price: number;
    location: string;
    description: string;
    status: string;
}

interface WalletData {
    balance: number;
    sales_earnings: number;
    pending_earnings: number;
    referral_earnings: number;
    earnings: any[];
}

export default function MyWallet() {
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [myHousesForSale, setMyHousesForSale] = useState<House[]>([]);
    const [showSellToPlatformDialog, setShowSellToPlatformDialog] = useState(false);
    const [selectedHouseForSale, setSelectedHouseForSale] = useState<House | null>(null);

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
            await axios.post('/api/wallet/sell-to-platform', { house_id: house.id });
            setShowSellToPlatformDialog(false);
            setSelectedHouseForSale(null);
            fetchWalletData();
            fetchMyHousesForSale();
            alert('房屋出售成功！');
        } catch (error) {
            console.error('出售房屋失败:', error);
            alert('出售房屋失败');
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                            <div className="text-2xl font-bold">¥{walletData.balance || 0}</div>
                            <div className="text-sm opacity-90">账户余额</div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                            <div className="text-2xl font-bold">¥{walletData.sales_earnings || 0}</div>
                            <div className="text-sm opacity-90">销售收益</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                            <div className="text-2xl font-bold">¥{walletData.referral_earnings || 0}</div>
                            <div className="text-sm opacity-90">推荐好友收益</div>
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
                            <p>• 您可以将自己的房间直接出售给平台</p>
                            <p>• 平台收购价格为房屋标价的 <span className="font-semibold">80%</span></p>
                            <p>• 出售后会有工作人员与您联系</p>
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
                            {walletData.earnings && walletData.earnings.length > 0 ? (
                                walletData.earnings.map((earning: any) => (
                                    <div key={earning.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center font-medium text-gray-900">
                                                    {earning.type === 'sale' && <span className="mr-2">🏠</span>}
                                                    {earning.type === 'referral' && <span className="mr-2">👥</span>}
                                                    {earning.type === 'platform_sale' && <span className="mr-2">🏢</span>}
                                                    {earning.type !== 'sale' && earning.type !== 'referral' && earning.type !== 'platform_sale' && <span className="mr-2">💰</span>}
                                                    {earning.type === 'sale' ? '房屋销售' : 
                                                     earning.type === 'referral' ? '推荐好友收益' : 
                                                     earning.type === 'platform_sale' ? '平台回购' : '其他收益'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {earning.description || '暂无描述'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(earning.created_at).toLocaleString('zh-CN')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-semibold ${
                                                    earning.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {earning.amount >= 0 ? '+' : ''}¥{earning.amount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {earning.status === 'completed' ? '已完成' : '待结算'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">💰</div>
                                    <div>暂无收益记录</div>
                                    <div className="text-sm">完成房屋交易后将显示收益明细</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 出售房屋给平台对话框 */}
                    <Dialog open={showSellToPlatformDialog} onOpenChange={setShowSellToPlatformDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>选择要出售的房屋</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {myHousesForSale.length > 0 ? (
                                    myHousesForSale.map((house) => (
                                        <div
                                            key={house.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                selectedHouseForSale?.id === house.id 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
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
                                    ))
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
}