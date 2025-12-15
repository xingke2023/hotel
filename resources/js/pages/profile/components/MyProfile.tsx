import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    created_at: string;
    real_name?: string;
    birth_date?: string;
    gender?: string;
    wechat?: string;
    whatsapp?: string;
    bio?: string;
    stats: {
        houses_count: number;
        orders_count: number;
        total_earnings: number;
    };
}

export default function MyProfile() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [phoneRegion, setPhoneRegion] = useState<string>('86'); // 默认选择大陆
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('/api/profile');
            setProfileData(response.data);
            
            // 解析电话号码
            if (response.data.phone) {
                const phone = response.data.phone;
                if (phone.startsWith('+86-')) {
                    setPhoneRegion('86');
                    setPhoneNumber(phone.substring(4));
                } else if (phone.startsWith('+853-')) {
                    setPhoneRegion('853');
                    setPhoneNumber(phone.substring(5));
                } else if (phone.startsWith('+852-')) {
                    setPhoneRegion('852');
                    setPhoneNumber(phone.substring(5));
                } else {
                    // 兼容旧格式
                    setPhoneRegion('86');
                    setPhoneNumber(phone);
                }
            }
        } catch (error) {
            console.error('获取个人资料失败:', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileData) return;

        try {
            // 组合完整的电话号码
            const fullPhone = phoneNumber ? `+${phoneRegion}-${phoneNumber}` : '';
            
            await axios.put('/api/profile', {
                name: profileData.name,
                phone: fullPhone,
                real_name: profileData.real_name,
                birth_date: profileData.birth_date,
                gender: profileData.gender,
                wechat: profileData.wechat,
                whatsapp: profileData.whatsapp,
                bio: profileData.bio,
            });

            setShowEditProfile(false);
            fetchProfileData();
            alert('个人资料更新成功！');
        } catch (error) {
            console.error('更新个人资料失败:', error);
            if ((error as any).response?.data?.errors) {
                console.error('验证错误:', (error as any).response.data.errors);
                alert('验证失败：' + Object.values((error as any).response.data.errors).flat().join(', '));
            } else {
                alert('更新个人资料失败: ' + ((error as any).response?.data?.message || (error as any).message));
            }
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            await axios.post('/api/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAvatarFile(null);
            setAvatarPreview(null);
            fetchProfileData();
            alert('头像更新成功！');
        } catch (error) {
            console.error('更新头像失败:', error);
            alert('更新头像失败');
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

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
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    {/* 重要提示 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <span className="text-yellow-600 text-lg mr-2">⚠️</span>
                            <p className="text-yellow-800 text-sm">
                                <strong>请输入真实入住姓名以备工作人员协助酒店入住。</strong>虚假信息不能办理入住。
                            </p>
                        </div>
                    </div>

                    {/* 优雅的个人信息布局 */}
                    <div className="space-y-8">
                        {/* 头像和基本信息区域 */}
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {/* 头像区域 - 左上角 */}
                            <div className="relative group shrink-0">
                                {profileData.avatar ? (
                                    <img
                                        src={`/storage/${profileData.avatar}`}
                                        alt="头像"
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-blue-100 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    />
                                ) : (
                                    <div 
                                        className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    >
                                        <span className="text-white text-2xl md:text-4xl font-bold">
                                            {profileData.real_name ? profileData.real_name.charAt(0) : profileData.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                
                                {/* 头像更换按钮 */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                                     onClick={() => document.getElementById('avatar-upload')?.click()}>
                                    <span className="text-white text-sm font-medium">更换头像</span>
                                </div>
                                
                                {/* 隐藏的文件输入 */}
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                
                                {avatarPreview && (
                                    <div className="absolute -top-4 -right-4 z-20">
                                        <div className="bg-white rounded-xl p-3 shadow-xl border-2 border-blue-200">
                                            <img
                                                src={avatarPreview}
                                                alt="预览"
                                                className="w-16 h-16 rounded-xl object-cover"
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={handleAvatarUpload}
                                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                                                >
                                                    保存
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAvatarPreview(null);
                                                        setAvatarFile(null);
                                                    }}
                                                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 基本信息摘要 */}
                            <div className="flex-1 min-w-0">
                                <div className="mb-4">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        {profileData.real_name || profileData.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">{profileData.email}</p>
                                </div>

                                {profileData.bio && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700 text-sm leading-relaxed">{profileData.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 详细信息卡片网格 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* 基本信息卡片 */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    基本信息
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">账户名</span>
                                        <span className="text-sm font-medium text-gray-900">{profileData.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">真实入住姓名</span>
                                        <span className="text-sm font-medium text-gray-900">{profileData.real_name || '未填写'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">性别</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {profileData.gender === 'male' ? '男' : 
                                             profileData.gender === 'female' ? '女' : '未填写'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">出生日期</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {profileData.birth_date ? new Date(profileData.birth_date).toLocaleDateString('zh-CN') : '未填写'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 联系方式卡片 */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                    联系方式
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">手机号码</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {profileData.phone ? (
                                                profileData.phone.includes('+') ? profileData.phone : `+86-${profileData.phone}`
                                            ) : '未填写'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">微信号</span>
                                        <span className="text-sm font-medium text-gray-900">{profileData.wechat || '未填写'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">WhatsApp</span>
                                        <span className="text-sm font-medium text-gray-900">{profileData.whatsapp || '未填写'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 账户统计卡片 */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                    账户统计
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">发布房屋</span>
                                        <span className="text-lg font-bold text-purple-600">{profileData.stats?.houses_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">完成交易</span>
                                        <span className="text-lg font-bold text-green-600">{profileData.stats?.orders_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">累计收益</span>
                                        <span className="text-lg font-bold text-orange-600">¥{profileData.stats?.total_earnings || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <div>正在加载个人资料...</div>
                    </div>
                </div>
            )}

            {/* 编辑资料对话框 */}
            <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>编辑个人资料</DialogTitle>
                    </DialogHeader>
                    {profileData && (
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* 重要提示 */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-yellow-800 text-sm">
                                    <strong>请填写真实入住信息</strong>，以便工作人员协助您完成酒店入住手续。
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-name">账户名 *</Label>
                                    <Input
                                        id="edit-name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-real-name">真实入住姓名 *</Label>
                                    <Input
                                        id="edit-real-name"
                                        value={profileData.real_name || ''}
                                        onChange={(e) => setProfileData({...profileData, real_name: e.target.value})}
                                        placeholder="请输入真实入住姓名"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-birth-date">出生年月日</Label>
                                    <Input
                                        id="edit-birth-date"
                                        type="date"
                                        value={profileData.birth_date ? new Date(profileData.birth_date).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-gender">性别</Label>
                                    <Select 
                                        value={profileData.gender || ''} 
                                        onValueChange={(value) => setProfileData({...profileData, gender: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="请选择性别" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">男</SelectItem>
                                            <SelectItem value="female">女</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-phone">联系电话 *</Label>
                                    <div className="flex gap-2">
                                        <Select value={phoneRegion} onValueChange={setPhoneRegion}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="86">+86 大陆</SelectItem>
                                                <SelectItem value="853">+853 澳门</SelectItem>
                                                <SelectItem value="852">+852 香港</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            id="edit-phone"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="请输入手机号码"
                                            required
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="edit-wechat">微信号</Label>
                                    <Input
                                        id="edit-wechat"
                                        value={profileData.wechat || ''}
                                        onChange={(e) => setProfileData({...profileData, wechat: e.target.value})}
                                        placeholder="请输入微信号"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                                    <Input
                                        id="edit-whatsapp"
                                        value={profileData.whatsapp || ''}
                                        onChange={(e) => setProfileData({...profileData, whatsapp: e.target.value})}
                                        placeholder="请输入WhatsApp号码"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-bio">个人简介</Label>
                                <textarea
                                    id="edit-bio"
                                    value={profileData.bio || ''}
                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                    placeholder="介绍一下自己..."
                                    rows={4}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                                />
                            </div>


                            <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditProfile(false);
                                        fetchProfileData(); // 重置数据
                                    }}
                                >
                                    取消
                                </Button>
                                <Button type="submit">保存资料</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}