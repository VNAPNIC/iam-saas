// Simple replacements for Radix UI components to fix build issues
import React from 'react';

// Simple Button replacement
export const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500'
  };
  const sizeClasses: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Input replacement
export const Input = ({ className = '', ...props }: any) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Simple Label replacement
export const Label = ({ children, className = '', ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

// Simple Card replacements
export const Card = ({ children, className = '', ...props }: any) => (
  <div className={`rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Simple Select replacement
export const Select = ({ children, ...props }: any) => children;
export const SelectContent = ({ children, className = '', ...props }: any) => children;
export const SelectItem = ({ children, value, className = '', ...props }: any) => (
  <option value={value} className={className} {...props}>{children}</option>
);
export const SelectTrigger = ({ children, className = '', ...props }: any) => (
  <select className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
    {children}
  </select>
);
export const SelectValue = ({ placeholder }: any) => null;

// Simple Textarea replacement
export const Textarea = ({ className = '', ...props }: any) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Simple Switch replacement
export const Switch = ({ checked, onCheckedChange, className = '', ...props }: any) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={`h-6 w-11 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

// Simple Checkbox replacement
export const Checkbox = ({ checked, onCheckedChange, className = '', ...props }: any) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

// Simple Tabs replacements
export const Tabs = ({ children, defaultValue, value, onValueChange, className = '', ...props }: any) => (
  <div className={className} {...props}>{children}</div>
);

export const TabsList = ({ children, className = '', ...props }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`} {...props}>
    {children}
  </div>
);

export const TabsTrigger = ({ children, value, className = '', ...props }: any) => (
  <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm ${className}`} {...props}>
    {children}
  </button>
);

export const TabsContent = ({ children, value, className = '', ...props }: any) => (
  <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 ${className}`} {...props}>
    {children}
  </div>
);

// Simple Dialog replacements
export const Dialog = ({ children, open, onOpenChange }: any) => children;
export const DialogContent = ({ children, className = '', ...props }: any) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
    <div className={`bg-white rounded-lg shadow-lg max-w-lg w-full p-6 ${className}`} {...props}>
      {children}
    </div>
  </div>
);
export const DialogHeader = ({ children, className = '', ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
    {children}
  </div>
);
export const DialogTitle = ({ children, className = '', ...props }: any) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h2>
);
export const DialogTrigger = ({ children }: any) => children;

// Simple Badge replacement
export const Badge = ({ children, variant = 'default', className = '', ...props }: any) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-gray-900 text-gray-50',
    secondary: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-gray-200 text-gray-950'
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Simple Separator replacement
export const Separator = ({ orientation = 'horizontal', className = '', ...props }: any) => (
  <div 
    className={`shrink-0 bg-gray-200 ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'} ${className}`} 
    {...props} 
  />
);

// Simple Progress replacement
export const Progress = ({ value = 0, className = '', ...props }: any) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-100 ${className}`} {...props}>
    <div 
      className="h-full w-full flex-1 bg-blue-600 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);