'use client';

import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase-client';

interface UseComponentUpdatesOptions {
  onComponentPublished?: (component: any) => void;
  onComponentUpdated?: (component: any) => void;
  onComponentDeleted?: (componentId: string) => void;
}

export function useComponentUpdates(options: UseComponentUpdatesOptions = {}) {
  const subscribeToComponents = useCallback(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('components-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'components', filter: 'is_published=eq.true' },
        (payload) => {
          const { new: newComponent } = payload;
          toast.success(`New component published: ${newComponent.name}`, {
            duration: 5000,
            icon: '🆕',
          });
          options.onComponentPublished?.(newComponent);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'components' },
        (payload) => {
          const { new: updatedComponent } = payload;
          if (updatedComponent.is_published) {
            toast(`Component specs updated: ${updatedComponent.name}`, {
              duration: 5000,
              icon: '📝',
            });
            options.onComponentUpdated?.(updatedComponent);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'components' },
        (payload) => {
          const { old: oldComponent } = payload;
          toast.error(`Component removed: ${oldComponent.name}`, {
            duration: 5000,
            icon: '🗑️',
          });
          options.onComponentDeleted?.(oldComponent.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options]);

  useEffect(() => {
    const unsubscribe = subscribeToComponents();
    return unsubscribe;
  }, [subscribeToComponents]);
}

export function useComponentLock(componentId: string | null) {
  const lockComponent = useCallback(async (userId: string) => {
    if (!componentId) return false;
    const res = await fetch('/api/components/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentId, userId, action: 'lock' }),
    });
    const data = await res.json();
    if (!data.locked) {
      toast.error(`${data.message}: ${data.lockedBy}`, { duration: 4000 });
      return false;
    }
    return true;
  }, [componentId]);

  const releaseLock = useCallback(async (userId: string) => {
    if (!componentId) return;
    await fetch('/api/components/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentId, userId, action: 'release' }),
    });
  }, [componentId]);

  const heartbeat = useCallback(async (userId: string) => {
    if (!componentId) return;
    await fetch('/api/components/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentId, userId, action: 'heartbeat' }),
    });
  }, [componentId]);

  return { lockComponent, releaseLock, heartbeat };
}
