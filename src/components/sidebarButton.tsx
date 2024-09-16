import { LucideIcon, Sun } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

interface SideBarButtonProps extends ButtonProps{
    icon?: LucideIcon;

}

export default function SideBarButton({ icon: Icon, className, children, ...props }: SideBarButtonProps){
    return(
        <Button variant='ghost' className={cn('gap-2 justify-start', className)} {...props}>
            {Icon && <Icon />}
            <span>{children}</span>
        </Button>
    );
}