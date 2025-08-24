import { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import axios from 'axios';

// 导入拆分的组件
import MyProducts from './components/MyProducts';
import MyOrders from './components/MyOrders';
import MySales from './components/MySales';
import MyReferrals from './components/MyReferrals';
import MyWallet from './components/MyWallet';
import MyProfile from './components/MyProfile';
import Settings from './components/Settings';



interface AuthUser {
    id: number;
    name: string;
    email: string;
    nickname?: string;
}

interface PageProps {
    auth: {
        user?: AuthUser;
    };
}

interface ProfileData {
    real_name?: string;
    phone?: string;
    wechat?: string;
}

export default function ProfileIndex() {
    const { auth } = usePage<PageProps>().props;
    // 从URL参数获取tab参数，默认为'mine'
    const getInitialTab = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab') as 'mine' | 'my-products' | 'my-orders' | 'my-sales' | 'my-referrals' | 'my-wallet' | 'my-profile' | 'settings';
        return tabParam && ['mine', 'my-products', 'my-orders', 'my-sales', 'my-referrals', 'my-wallet', 'my-profile', 'settings'].includes(tabParam) 
            ? tabParam 
            : 'mine';
    };
    
    const [activeTab, setActiveTab] = useState<'mine' | 'my-products' | 'my-orders' | 'my-sales' | 'my-referrals' | 'my-wallet' | 'my-profile' | 'settings'>(getInitialTab());
    const [userType, setUserType] = useState<'buyer' | 'seller' | 'pending_seller'>('buyer');
    const [isApplying, setIsApplying] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const { pendingSalesCount } = usePendingSalesCount();

    // 获取用户类型和个人资料
    useEffect(() => {
        if (auth.user) {
            // 获取用户类型
            axios.get('/api/seller/status')
                .then(response => {
                    setUserType(response.data.user_type);
                })
                .catch(error => {
                    console.error('获取用户类型失败:', error);
                    setUserType('buyer'); // 默认为买家
                });
                
            // 获取个人资料
            axios.get('/api/profile')
                .then(response => {
                    setProfileData(response.data);
                })
                .catch(error => {
                    console.error('获取个人资料失败:', error);
                });
        }
    }, [auth.user]);


    // 检查个人资料是否完整
    const checkProfileComplete = () => {
        if (!profileData) return false;
        return !!(profileData.real_name && profileData.phone && profileData.wechat);
    };

    // 申请成为卖家
    const handleSellerApplication = async () => {
        // 检查个人资料是否完整
        if (!checkProfileComplete()) {
            const missingFields = [];
            if (!profileData?.real_name) missingFields.push('真实姓名');
            if (!profileData?.phone) missingFields.push('联系电话');
            if (!profileData?.wechat) missingFields.push('微信号');
            
            alert(`请先完善个人资料：${missingFields.join('、')}`);
            setActiveTab('my-profile'); // 跳转到个人资料页面
            return;
        }

        setIsApplying(true);
        try {
            // 使用axios发送请求，它会自动处理CSRF令牌
            const response = await axios.post('/api/seller/apply');
            
            if (response.data.success) {
                setUserType('pending_seller');
                alert(response.data.message || '申请提交成功，请等待审核');
            } else {
                alert(response.data.message || '申请失败，请稍后重试');
            }
        } catch (error: any) {
            console.error('申请失败:', error);
            
            // 更详细的错误处理
            if (error.response) {
                // 服务器响应了错误状态码
                const status = error.response.status;
                if (status === 419) {
                    alert('会话已过期，请刷新页面后重试');
                } else if (status === 401) {
                    alert('请先登录后再申请');
                } else if (status === 403) {
                    alert('没有权限执行此操作');
                } else if (error.response.data?.message) {
                    alert(error.response.data.message);
                } else {
                    alert('申请失败，请稍后重试');
                }
            } else if (error.request) {
                // 请求发出但没有收到响应
                alert('网络连接失败，请检查网络后重试');
            } else {
                // 其他错误
                alert('申请失败，请稍后重试');
            }
        } finally {
            setIsApplying(false);
        }
    };

    // 渲染主要内容
    const renderMainContent = () => {
        switch (activeTab) {
            case 'mine':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">我的中心</h3>
                                <p className="text-gray-600">管理您的房屋、订单和个人信息</p>
                            </div>
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
                                </div>
                        
                                {/* 功能模块网格 - 两列豆腐块 */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        ...(userType === 'seller' ? [{ key: 'my-products', title: '房源管理', icon: '📦', desc: '管理上架房源' }] : []),
                                        ...(userType === 'seller' ? [{ key: 'my-sales', title: '销售订单管理', icon: '💼', desc: '查看房源销售记录', badge: pendingSalesCount }] : []),
                                        { key: 'my-orders', title: '我的订单', icon: '📋', desc: '查看我的购买记录' },
                                        { key: 'my-referrals', title: '我的推荐', icon: '⭐', desc: '推荐好友奖励' },
                                        { key: 'my-wallet', title: '我的钱包', icon: '💰', desc: '资金管理' },
                                        { key: 'my-profile', title: '我的资料', icon: '👤', desc: '个人信息管理' },
                                        { key: 'settings', title: '设置', icon: '⚙️', desc: '账户设置' },
                                        { key: 'customer-service', title: '在线客服', icon: '💬', desc: '联系客服支持', isExternalLink: true, url: 'https://work.weixin.qq.com/kfid/kfcdfdb02ed73c8e4d0' },
                                    ].map((item) => (
                                        <div 
                                            key={item.key}
                                            className={`${
                                                item.key === 'my-products' || item.key === 'my-sales' 
                                                    ? 'bg-blue-50 border border-blue-200' 
                                                    : item.key === 'customer-service'
                                                    ? 'bg-green-50 border border-green-200'
                                                    : 'bg-white border border-gray-200'
                                            } rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer`}
                                            onClick={() => {
                                                if (item.isExternalLink && item.url) {
                                                    window.open(item.url, '_blank');
                                                } else {
                                                    setActiveTab(item.key as typeof activeTab);
                                                }
                                            }}
                                        >
                                            <div className="text-center">
                                                <div className="relative inline-block">
                                                    <div className="text-3xl mb-2">{item.icon}</div>
                                                    {/* 红圈标注 */}
                                                    {item.badge && item.badge > 0 && (
                                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                                            {item.badge > 99 ? '99+' : item.badge}
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* 申请成为卖家按钮 */}
                                {userType === 'buyer' && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-lg font-semibold">升级为商家</h4>
                                            <Button 
                                                onClick={handleSellerApplication}
                                                disabled={isApplying || !checkProfileComplete()}
                                                className={`px-8 py-3 ${
                                                    checkProfileComplete() 
                                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                        : 'bg-gray-400 text-white cursor-not-allowed'
                                                }`}
                                            >
                                                {isApplying ? '申请中...' : 
                                                 checkProfileComplete() ? '申请成为卖家' : '请先完善资料'}
                                            </Button>
                                        </div>
                                        
                                        {/* 资料完成状态 */}
                                        {!checkProfileComplete() && profileData && (
                                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <h5 className="text-sm font-medium text-yellow-800 mb-2">请先完善以下资料：</h5>
                                                <ul className="text-sm text-yellow-700 space-y-1">
                                                    {!profileData.real_name && <li>• 真实姓名</li>}
                                                    {!profileData.phone && <li>• 联系电话</li>}
                                                    {!profileData.wechat && <li>• 微信号</li>}
                                                </ul>
                                                <button
                                                    onClick={() => setActiveTab('my-profile')}
                                                    className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                                                >
                                                    点击前往完善资料 →
                                                </button>
                                            </div>
                                        )}
                                        
                                        <p className="text-sm text-gray-600">
                                            成为商家后可以发布您的房源获得客户和收益
                                        </p>
                                    </div>
                                )}
                                
                                {/* 申请状态提示 */}
                                {userType === 'pending_seller' && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-4">
                                        <h4 className="text-lg font-semibold text-yellow-900 mb-3 text-center">申请审核中</h4>
                                        <div className="text-yellow-800">
                                            <p>您的商家申请正在审核中，请耐心等待</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 卖家状态提示 */}
                                {userType === 'seller' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
                                        <h4 className="text-lg font-semibold text-green-900 mb-3 text-center">商家账户</h4>
                                        <div className="text-green-800">
                                            <p>您已成为认证商家，可以发布商品和管理销售订单</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
                
            
            case 'my-products':
                return <MyProducts />;
            
            case 'my-orders':
                return <MyOrders />;
            
            case 'my-sales':
                return <MySales />;
            
            case 'my-referrals':
                return <MyReferrals />;
            
            case 'my-wallet':
                return <MyWallet />;
            
            case 'my-profile':
                return <MyProfile />;
            
            case 'settings':
                return <Settings />;
            
            default:
                return null;
        }
    };

    return (
        <FrontendLayout>
            <Head title="我的 - 个人中心" />
            
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* 主要内容 */}
                <div className="container mx-auto">
                    {renderMainContent()}
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>

        </FrontendLayout>
    );
}