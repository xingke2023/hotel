import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';

interface SettingsData {
    stats: {
        houses_count: number;
        orders_count: number;
        earnings_count: number;
        total_earnings: number;
    };
}

export default function Settings() {
    const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

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
        
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            alert('新密码和确认密码不匹配');
            return;
        }

        try {
            await axios.post('/api/settings/change-password', passwordForm);
            setShowChangePassword(false);
            setPasswordForm({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
            alert('密码修改成功！');
        } catch (error) {
            console.error('修改密码失败:', error);
            alert('修改密码失败');
        }
    };

    const handleLogout = async () => {
        if (!confirm('确定要退出登录吗？')) return;
        
        try {
            await axios.post('/api/settings/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('退出登录失败:', error);
            alert('退出登录失败');
        }
    };

    useEffect(() => {
        fetchSettingsData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold">设置</h3>
                    <p className="text-gray-600">管理您的账户设置和偏好</p>
                </div>
            </div>

            {settingsData ? (
                <>
                    {/* 账户概览 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">账户概览</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                <div className="text-sm text-green-800">完成订单数</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    ¥{settingsData.stats.total_earnings}
                                </div>
                                <div className="text-sm text-purple-800">累计收益</div>
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

                    {/* 通知设置 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">通知设置</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">订单通知</div>
                                    <div className="text-sm text-gray-600">接收订单状态变更通知</div>
                                </div>
                                <div className="text-sm text-gray-500">即将开放</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">推荐奖励通知</div>
                                    <div className="text-sm text-gray-600">接收推荐佣金到账通知</div>
                                </div>
                                <div className="text-sm text-gray-500">即将开放</div>
                            </div>
                        </div>
                    </div>

                    {/* 隐私设置 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">隐私设置</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">个人信息可见性</div>
                                    <div className="text-sm text-gray-600">控制其他用户能看到的个人信息</div>
                                </div>
                                <div className="text-sm text-gray-500">即将开放</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">交易记录隐私</div>
                                    <div className="text-sm text-gray-600">设置交易记录的隐私级别</div>
                                </div>
                                <div className="text-sm text-gray-500">即将开放</div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <div>正在加载设置数据...</div>
                    </div>
                </div>
            )}

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
        </div>
    );
}