export const ROLE_HOME = {
    admin: "/admin",
    mechanic: "/mechanic",
    user: "/dashboard"
};

export const ROLE_LABEL = {
    admin: "Administrator",
    mechanic: "Mechanic",
    user: "Vehicle Owner"
};

export function roleHome(role) {
    return ROLE_HOME[role] || ROLE_HOME.user;
}

export function roleLabel(role) {
    return ROLE_LABEL[role] || "User";
}
