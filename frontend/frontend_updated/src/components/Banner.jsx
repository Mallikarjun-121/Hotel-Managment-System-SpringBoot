import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
  error: { wrap: 'bg-red-50 text-red-800 border-red-200', icon: AlertCircle },
  success: { wrap: 'bg-meridian-50 text-meridian-800 border-meridian-200', icon: CheckCircle2 },
  info: { wrap: 'bg-brass-100 text-brass-700 border-brass-200', icon: Info },
};

export default function Banner({ variant, children }) {
  const { wrap, icon: Icon } = STYLES[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${wrap}`} role="alert">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}
