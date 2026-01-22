import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({ trigger, children, align = 'left', className, onOpenChange }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => handleToggle(false)}
        />
      )}
      <div className={cn('relative', className)} ref={dropdownRef}>
        <div onClick={() => handleToggle(!isOpen)}>
          {trigger}
        </div>
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-2 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  onClick: () => {
                    child.props.onClick?.();
                    handleToggle(false);
                  },
                });
              }
              return child;
            })}
          </div>
        )}
      </div>
    </>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function DropdownMenuItem({ children, onClick, className, active }: DropdownMenuItemProps) {
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        active && 'bg-accent text-accent-foreground font-medium',
        className
      )}
      onClick={() => {
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}
