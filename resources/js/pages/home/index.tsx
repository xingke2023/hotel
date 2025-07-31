import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* 主要内容 */}
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-center h-96 text-gray-500">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">欢迎来到澳门房屋交易平台</h3>
                            <p>发现优质房源，开启美好生活</p>
                        </div>
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}