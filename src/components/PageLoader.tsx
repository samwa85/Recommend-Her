export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
    <div className="flex flex-col items-center gap-4">
      <div 
        className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin" 
        style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} 
      />
      <p style={{ color: 'hsl(var(--muted-foreground))' }} className="font-sans text-sm">
        Loading...
      </p>
    </div>
  </div>
);
