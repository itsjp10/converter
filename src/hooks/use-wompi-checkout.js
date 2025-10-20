import { useEffect, useState } from "react";

const WOMPI_WIDGET_SRC = "https://cdn.wompi.co/widget.js";
const SCRIPT_ID = "wompi-widget-script";

export function useWompiCheckout() {
    const [ready, setReady] = useState(false);
    const [attempted, setAttempted] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let script = document.getElementById(SCRIPT_ID);
        if (!script) {
            script = document.createElement("script");
            script.id = SCRIPT_ID;
            script.src = WOMPI_WIDGET_SRC;
            script.async = true;
            script.onload = () => {
                script.setAttribute("data-loaded", "true");
                setReady(true);
            };
            script.onerror = () => setReady(false);
            document.body.appendChild(script);
        } else if (script.getAttribute("data-loaded") === "true") {
            setReady(true);
        }

        const handleLoad = () => {
            script?.setAttribute("data-loaded", "true");
            setReady(true);
        };

        script?.addEventListener("load", handleLoad);
        script?.addEventListener("error", () => setReady(false));

        // If the widget has already been defined we can mark ready right away.
        if (window.WidgetCheckout) {
            setReady(true);
        }

        const checkInterval = window.setInterval(() => {
            if (window.WidgetCheckout) {
                setReady(true);
                window.clearInterval(checkInterval);
            }
        }, 300);

        setAttempted(true);

        return () => {
            script?.removeEventListener("load", handleLoad);
            script?.removeEventListener("error", () => setReady(false));
            window.clearInterval(checkInterval);
        };
    }, []);

    return ready || (typeof window !== "undefined" && window.WidgetCheckout ? true : attempted && ready);
}
