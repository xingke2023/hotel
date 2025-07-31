import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

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

export function usePendingSalesCount() {
    const { auth } = usePage<PageProps>().props;
    const [pendingSalesCount, setPendingSalesCount] = useState(0);

    // 获取等待处理销售订单数量
    const fetchPendingSalesCount = useCallback(async () => {
        if (!auth.user) {
            setPendingSalesCount(0);
            return;
        }

        try {
            const response = await axios.get('/api/pending-sales-count');
            const pendingCount = response.data.pending_count || 0;
            setPendingSalesCount(pendingCount);
        } catch (error) {
            console.error('获取待处理订单数量失败:', error);
            setPendingSalesCount(0);
        }
    }, [auth.user]);

    // 获取待处理订单数量
    useEffect(() => {
        if (auth.user) {
            fetchPendingSalesCount();
            
            // 每30秒更新一次待处理订单数量
            const interval = setInterval(() => {
                fetchPendingSalesCount();
            }, 30000);
            
            return () => clearInterval(interval);
        } else {
            setPendingSalesCount(0);
        }
    }, [auth.user, fetchPendingSalesCount]);

    return {
        pendingSalesCount,
        refreshPendingSalesCount: fetchPendingSalesCount
    };
}