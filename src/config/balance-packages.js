export const MINUTE_PACKAGES = [
    {
        id: "starter-30",
        minutes: 30,
        amountInCents: 360000, // COP
        title: "Starter",
        description: "Ideal for trying out longer audios.",
    },
    {
        id: "creator-90",
        minutes: 90,
        amountInCents: 900000,
        title: "Creator",
        description: "Best value for frequent transcribers.",
    },
    {
        id: "studio-180",
        minutes: 180,
        amountInCents: 1620000,
        title: "Studio",
        description: "Designed for teams and power users.",
    },
];

export const getPackageById = (packageId) =>
    MINUTE_PACKAGES.find((pkg) => pkg.id === packageId);
