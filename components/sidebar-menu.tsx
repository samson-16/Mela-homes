"use client";

import * as React from "react";
import { 
  Home, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut, 
  User,
  LayoutList
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogClose,
  DialogTitle,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarMenuProps {
  onPostListing?: () => void;
}

export default function SidebarMenu({ onPostListing }: SidebarMenuProps) {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const menuItems = [
    {
      label: "የሚከራይ ይለጥፉ", // Post for rent
      icon: <Home className="w-5 h-5" />,
      onClick: () => {
        setOpen(false);
        if (onPostListing) {
          onPostListing();
        } else {
          // If not provided (like on detail page), navigate home and trigger
          router.push("/?action=post");
        }
      },
      active: false,
    },
    {
      label: "የእኔ ልጥፎች", // My listings
      icon: <LayoutList className="w-5 h-5" />,
      onClick: () => {
        setOpen(false);
        router.push("/profile");
      },
      active: false,
    },
    {
      label: "የሚከራዩ ንብረቶች", // Properties for rent
      icon: <LayoutList className="w-5 h-5" />,
      onClick: () => {
        setOpen(false);
        router.push("/");
      },
      active: true,
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground">
          <Menu className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        side="right" 
        className="p-0 gap-0 w-[280px] sm:w-[320px]"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-1">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-amharic">ያለ ደላላ</span>
            </div>
            <DialogClose asChild>
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </DialogClose>
          </div>

          <DialogHeader className="sr-only">
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                  item.active 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <span className={cn(
                  item.active ? "text-blue-600" : "text-muted-foreground"
                )}>
                  {item.icon}
                </span>
                <span className="font-amharic text-base">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer / User Info */}
          <div className="p-6 border-t border-border mt-auto">
            {token && user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{user.username}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                onClick={() => {
                  setOpen(false);
                  router.push("/?auth=login");
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
