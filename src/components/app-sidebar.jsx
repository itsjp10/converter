"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Wallet } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { AddBalanceSheet } from "@/components/add-balance-sheet";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";

const navSections = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Wallet,
    },
];

export function AppSidebar(props) {
    const { isSignedIn, user, isLoaded } = useUser();
    const [credits, setCredits] = useState(null);

    const fetchCredits = useCallback(async () => {
        if (!isSignedIn) {
            setCredits(null);
            return;
        }
        try {
            const response = await fetch("/api/user");
            if (!response.ok) throw new Error(`User fetch failed: ${response.status}`);
            const data = await response.json();
            setCredits(data?.user?.credits ?? null);
        } catch (error) {
            console.error("Unable to load user credits", error);
        }
    }, [isSignedIn]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);


    useEffect(() => {
        const handler = (event) => {
            const detail = event.detail || {};
            const { status, credits: newestCredits } = detail;
            if (status === "APPROVED" && typeof newestCredits === "number") {
                setCredits(newestCredits);
            } else if (status === "PENDING") {
                fetchCredits();
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('dashboard:payment', handler);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('dashboard:payment', handler);
            }
        };
    }, [fetchCredits]);

    const handlePaymentCompleted = useCallback(
        ({ status, credits: latestCredits }) => {
            if (status === "APPROVED" && typeof latestCredits === "number") {
                setCredits(latestCredits);
            }
        },
        [],
    );

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent>
                <NavMain items={navSections} />
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="space-y-4 px-3 pb-4">
                {isLoaded && isSignedIn && (
                    <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/15 p-3 text-xs text-indigo-100">
                        <p className="flex items-center justify-between text-[11px] uppercase tracking-wide text-indigo-200/80">
                            <span>Available Minutes</span>
                            <Wallet className="h-3 w-3" />
                        </p>
                        <p className="mt-2 flex items-baseline gap-1 text-2xl font-semibold text-indigo-50">
                            {typeof credits === "number" ? credits : "--"}
                            <span className="text-xs font-normal text-indigo-100/80">min</span>
                        </p>
                    </div>
                )}

                <AddBalanceSheet triggerLabel="Add balance" variant="sidebar" onPaymentCompleted={handlePaymentCompleted} />

                {isLoaded && isSignedIn && user ? (
                    <NavUser
                        user={{
                            name: user.fullName,
                            email: user.emailAddresses[0]?.emailAddress,
                            avatar: user.imageUrl,
                        }}
                    />
                ) : (
                    <NavUser />
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
