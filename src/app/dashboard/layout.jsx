import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import {
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardBannerProvider } from "@/components/dashboard-banner-provider"

export default function RootLayout({ children }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <DashboardBannerProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <main className="w-full min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
                        <SidebarTrigger />
                        <ModeToggle />
                        {children}
                    </main>
                </SidebarProvider>
            </DashboardBannerProvider>
        </ThemeProvider>

    )
}
