import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';

interface ReferralData {
    referral_code: string;
    referral_link: string;
    commission_rate: number;
    referred_users: any[];
}

export default function MyReferrals() {
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [selectedReferredUser, setSelectedReferredUser] = useState<any>(null);
    const [showReferredUserDetails, setShowReferredUserDetails] = useState(false);

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

    useEffect(() => {
        fetchReferralData();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('已复制到剪贴板！');
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold">我的推荐</h3>
                    <p className="text-gray-600">推荐好友注册，获得丰厚佣金奖励</p>
                </div>
            </div>

            {referralData ? (
                <>
                    {/* 推荐码和链接 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">我的推荐信息</h4>
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
                            <p>• 复制您的推荐链接给好友</p>
                            <p>• 好友通过链接注册并完成交易后，您将获得 <span className="font-semibold">{referralData.commission_rate}%</span> 的佣金奖励</p>
                            <p>• 佣金实时计算，推荐的好友完成交易后自动结算到您的账户</p>
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
}