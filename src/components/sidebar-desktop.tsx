'use client';

import { SidebarButton } from './sidebar-button';
import { SidebarItems } from '@/types';
import { useRouter } from 'next/navigation';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut, MoreHorizontal, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserButton } from "@clerk/nextjs";

interface SidebarDesktopProps {
  sidebarItems: SidebarItems;
  loading: boolean;
}

export function SidebarDesktop({ sidebarItems, loading }: SidebarDesktopProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (href: string) => {
    if (loading) return; // Prevent navigation if loading
    router.push(href);
  };

  return (
    <aside className='w-[220px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r'>
      <div className='h-full px-3 py-4'>
        <h3 className='mx-3 text-lg font-semibold text-foreground'>FIFO</h3>
        <p className='mx-3 text-xs font-semibold text-foreground'>First In First Out</p>
        <div className='mt-5'>
          <div className='flex flex-col gap-1 w-full'>
            {sidebarItems.links.map((link, index) => (
              <div key={index} onClick={() => handleClick(link.href)}>
                <SidebarButton
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  icon={link.icon}
                  className='w-full'
                >
                  {link.label}
                </SidebarButton>
              </div>
            ))}
            {sidebarItems.extras}
          </div>
          <div className='absolute left-0 bottom-3 w-full px-3'>
            <Separator className='absolute -top-3 left-0 w-full' />
            <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: "h-10 w-10",
                  userButtonOuterIdentifier: "text-sm font-semibold text-white",
                },
              }} 
              showName={true}
            />
          </div>
        </div>
        {loading && (
          <div className='fixed inset-0 flex items-center justify-center bg-white z-50'>
            <div className='w-16 h-16 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin'></div>
          </div>
        )}
      </div>
    </aside>
  );
}

// 'use client';

// import { SidebarButton } from './sidebar-button';
// import { SidebarItems } from '@/types';
// import Link from 'next/link';
// import { Separator } from './ui/separator';
// import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
// import { Button } from './ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { LogOut, MoreHorizontal, Settings } from 'lucide-react';
// import { usePathname } from 'next/navigation';
// import { UserButton } from "@clerk/nextjs";

// interface SidebarDesktopProps {
//   sidebarItems: SidebarItems;
// }

// export function SidebarDesktop(props: SidebarDesktopProps) {
//   const pathname = usePathname();
  
//   return (
//     <aside className='w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r'>
//       <div className='h-full px-3 py-4'>
//         <h3 className='mx-3 text-lg font-semibold text-foreground'>FIFO</h3>
//         <p className='mx-3 text-xs font-semibold text-foreground'>First In First Out</p>
//         <div className='mt-5'>
//           <div className='flex flex-col gap-1 w-full'>
//             {props.sidebarItems.links.map((link, index) => (
//               <Link key={index} href={link.href}>
//                 <SidebarButton
//                   variant={pathname === link.href ? 'secondary' : 'ghost'}
//                   icon={link.icon}
//                   className='w-full'
//                 >
//                   {link.label}
//                 </SidebarButton>
//               </Link>
//             ))}
//             {props.sidebarItems.extras}
//           </div>
//           <div className='absolute left-0 bottom-3 w-full px-3'>
//             <Separator className='absolute -top-3 left-0 w-full' />
//             <UserButton appearance={{
//                 elements: {
//                   userButtonAvatarBox: "h-10 w-10",
//                   userButtonOuterIdentifier: "text-sm font-semibold text-white",
//                 },
//               }} 
//               showName={true}
//             />
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }
