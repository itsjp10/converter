import { useEffect, useState } from "react";

const WOMPI_WIDGET_SRC = "https://checkout.wompi.co/widget.js";
const SCRIPT_ID = "wompi-widget-script";
const LOAD_TIMEOUT_MS = 7000;

export function useWompiCheckout() {
    const [status, setStatus] = useState("idle"); // idle | loading | ready | error

    useEffect(() => {
        if (typeof window === "undefined") return;

        const resolveWidget = () => {
            if (window.WidgetCheckout) {
                setStatus("ready");
                return true;
            }
            return false;
        };

        if (resolveWidget()) return;

        let script = document.getElementById(SCRIPT_ID);
        let timeoutId;

        const handleLoad = () => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            if (resolveWidget()) {
                script?.setAttribute("data-loaded", "true");
            } else {
                // Wait a little longer for the global to appear.
                const pollStart = Date.now();
                const poll = window.setInterval(() => {
                    if (resolveWidget()) {
                        window.clearInterval(poll);
                    } else if (Date.now() - pollStart > 2000) {
                        window.clearInterval(poll);
                        setStatus((prev) => (prev === "ready" ? prev : "error"));
                        console.warn("[Wompi] Widget script loaded but global object not found.");
                    }
                }, 200);
            }
        };

        const handleError = () => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            setStatus("error");
            console.error("[Wompi] Failed to load widget script.");
        };

        const triggerTimeoutError = () => {
            if (resolveWidget()) return;
            console.warn("[Wompi] Widget script load timed out. Check network connectivity.");
            setStatus((prev) => (prev === "ready" ? prev : "error"));
        };

        if (!script) {
            script = document.createElement("script");
            script.id = SCRIPT_ID;
            script.src = WOMPI_WIDGET_SRC;
            script.async = true;
            setStatus("loading");
            script.addEventListener("load", handleLoad, { once: true });
            script.addEventListener("error", handleError, { once: true });
            document.body.appendChild(script);
        } else {
            setStatus("loading");
            const alreadyLoaded = script.getAttribute("data-loaded") === "true";
            script.addEventListener("load", handleLoad, { once: true });
            script.addEventListener("error", handleError, { once: true });
            if (alreadyLoaded) {
                // Run in next tick to allow event listeners to be registered first.
                window.setTimeout(handleLoad, 0);
            }
        }

        timeoutId = window.setTimeout(() => {
            triggerTimeoutError();
        }, LOAD_TIMEOUT_MS);

        return () => {
            script?.removeEventListener("load", handleLoad);
            script?.removeEventListener("error", handleError);
            window.clearTimeout(timeoutId);
        };
    }, []);

    return { ready: status === "ready" || (typeof window !== "undefined" && !!window.WidgetCheckout), status };
}
