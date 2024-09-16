'use client';

import {
  Bell,
  Bookmark,
  Boxes,
  CogIcon,
  Group,
  Home,
  LineChartIcon,
  List,
  ListOrderedIcon,
  LogOut,
  Mail,
  MoreHorizontal,
  Package,
  Package2,
  PackageOpen,
  Settings,
  Soup,
  TimerReset,
  User,
  Users,
} from 'lucide-react';
import { SidebarDesktop } from './sidebar-desktop';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { SidebarItems } from '@/types';
import { SidebarButton } from './sidebar-button';
import { useMediaQuery } from 'usehooks-ts';
import { SidebarMobile } from './sidebar-mobile';

const sidebarItems: SidebarItems = {
  links: [
    { label: 'Dashboard', href: '/home', icon: LineChartIcon },
    { label: 'Storage Stocks', href: '/storage', icon: Package },
    { label: 'Lounge Stocks', href: '/lounge', icon: PackageOpen },
    { label: 'Order', href: '/order', icon: ListOrderedIcon },
    {
      href: '/history',
      icon: TimerReset,
      label: 'Transaction History',
    },
  ],
  extras: (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='w-full justify-start'>
          <div className='flex justify-between items-center w-full'>
            <div className='flex gap-2'>
              <span><Settings /></span>
              <span>Settings</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='mb-2 w-56 p-3 rounded-[1rem]'>
        <div className='space-y-1'>
          <Link href='/setting/sku'>
            <SidebarButton size='sm' icon={Group} className='w-full'>
                Category Master
            </SidebarButton>
          </Link>
          <Link href='/setting/stocks'>
            <SidebarButton size='sm' icon={Boxes} className='w-full'>
                Item Master
            </SidebarButton>
          </Link>
          <Link href='/setting/account'>
            <SidebarButton size='sm' icon={Settings} className='w-full'>
              Account Settings
            </SidebarButton>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
};

export function Sidebar() {
  const isDesktop = useMediaQuery('(min-width: 640px)', {
    initializeWithValue: false,
  });

  if (isDesktop) {
    return <SidebarDesktop sidebarItems={sidebarItems} />;
  }

  return <SidebarMobile sidebarItems={sidebarItems} />;
}