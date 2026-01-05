export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F7] p-4 md:p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
         {/* Optional: Add a subtle logo or home link here if desired */}
        {children}
      </div>
    </div>
  )
}
