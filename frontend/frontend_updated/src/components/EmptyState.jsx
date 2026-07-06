export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-meridian-100 flex items-center justify-center text-meridian-700 mb-4">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg text-paper-950 mb-1">{title}</h3>
      {description && <p className="text-paper-700 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
