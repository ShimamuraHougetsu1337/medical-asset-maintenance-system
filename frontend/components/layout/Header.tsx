import { User } from 'lucide-react';

interface HeaderProps {
  userRole?: string;
  userName?: string;
}

export function Header({ userRole = 'Staff', userName = 'John Doe' }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <h1 className="text-lg font-semibold text-gray-800">Hospital Asset Management</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{userRole}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 border text-gray-600">
          <User className="h-6 w-6" />
        </div>
      </div>
    </header>
  );
}
