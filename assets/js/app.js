// =========================================================
// HỆ THỐNG PHÂN QUYỀN 3 CẤP (RBAC) & TIỆN ÍCH OPENPITCH
// - Chủ web (super_admin): Toàn quyền + Phân quyền Admin khác
// - Admin (admin): Quyền chủ cửa hàng theo từng phân hệ được cấp
// - Khách hàng (customer): Đặt sân, mua hàng online, đánh giá sao
// - Khách vãng lai (guest): Xem thoải mái, yêu cầu đăng nhập khi đặt/mua
// =========================================================

const OPENPITCH_ALL_PERMISSIONS = {
    dashboard: true,
    bookings: true,
    pitches: true,
    pos: true,
    inventory: true,
    tournaments: true
};

const OPENPITCH_PERMISSION_META = [
    { key: "dashboard",   label: "Doanh thu & Sổ quỹ", href: "index.html",        icon: "bi-bar-chart-line-fill" },
    { key: "bookings",    label: "Lịch đặt sân",       href: "bookings.html",     icon: "bi-calendar2-week" },
    { key: "pitches",     label: "Sân bóng",           href: "pitches.html",      icon: "bi-grid-1x2" },
    { key: "pos",         label: "Hàng hóa (POS)",     href: "pos-products.html", icon: "bi-cup-straw" },
    { key: "inventory",   label: "Kho hàng & NCC",     href: "inventory.html",    icon: "bi-box-seam" },
    { key: "tournaments", label: "Giải đấu",           href: "tournaments.html",  icon: "bi-trophy" }
];

const OPENPITCH_DEFAULT_ACCOUNTS = [
    {
        id: "ACC_OWNER",
        fullName: "Chủ web Quốc Huy",
        username: "quochuy@openpitch.vn",
        phone: "0905123456",
        password: "123456",
        roleCode: "super_admin",
        role: "Chủ web (Super Admin)",
        tenantId: "main",
        storeName: "openPitch (Hệ thống chính)",
        active: true,
        permissions: { ...OPENPITCH_ALL_PERMISSIONS },
        createdAt: "01/01/2026"
    },
    {
        id: "ACC_ADMIN1",
        fullName: "Admin Cửa hàng",
        username: "admin@openpitch.vn",
        phone: "0912345678",
        password: "123456",
        roleCode: "admin",
        role: "Admin (Chủ cửa hàng)",
        tenantId: "store_admin1",
        storeName: "Cửa hàng Admin 01",
        active: true,
        permissions: { ...OPENPITCH_ALL_PERMISSIONS },
        createdAt: "01/01/2026"
    },
    {
        id: "ACC_CUST1",
        fullName: "Khách hàng Minh Quân",
        username: "khachhang@openpitch.vn",
        phone: "0935000111",
        password: "123456",
        roleCode: "customer",
        role: "Khách hàng",
        active: true,
        permissions: {},
        createdAt: "01/01/2026"
    }
];

function getRoleLabel(roleCode) {
    if (roleCode === "super_admin") return "Chủ web (Super Admin)";
    if (roleCode === "admin") return "Admin (Chủ cửa hàng)";
    if (roleCode === "customer") return "Khách hàng";
    return "Khách vãng lai";
}

function getSystemAccounts() {
    let list = null;
    try {
        const raw = localStorage.getItem("OPENPITCH_ACCOUNTS");
        if (raw) list = JSON.parse(raw);
    } catch (e) {}

    if (!Array.isArray(list) || list.length === 0) {
        const fresh = JSON.parse(JSON.stringify(OPENPITCH_DEFAULT_ACCOUNTS));
        saveSystemAccounts(fresh);
        return fresh;
    }

    let migrated = false;
    list.forEach((acc, idx) => {
        if (!acc.id) { acc.id = "ACC_" + (idx + 1); migrated = true; }
        if (acc.active === undefined) { acc.active = true; migrated = true; }
        if (!acc.roleCode) {
            if (acc.username === "quochuy@openpitch.vn" || acc.role === "Chủ sân") {
                acc.roleCode = "super_admin";
                acc.role = getRoleLabel("super_admin");
                acc.permissions = { ...OPENPITCH_ALL_PERMISSIONS };
            } else if (acc.role && acc.role.toLowerCase().includes("nhân viên")) {
                acc.roleCode = "admin";
                acc.role = getRoleLabel("admin");
                acc.permissions = { ...OPENPITCH_ALL_PERMISSIONS };
            } else {
                acc.roleCode = "customer";
                acc.role = getRoleLabel("customer");
                acc.permissions = {};
            }
            migrated = true;
        }
        if (acc.roleCode === "super_admin") {
            acc.permissions = { ...OPENPITCH_ALL_PERMISSIONS };
            acc.active = true;
            if (!acc.tenantId) { acc.tenantId = "main"; migrated = true; }
            if (!acc.storeName) { acc.storeName = "openPitch (Hệ thống chính)"; migrated = true; }
        } else if (acc.roleCode === "admin") {
            if (!acc.permissions) { acc.permissions = { ...OPENPITCH_ALL_PERMISSIONS }; migrated = true; }
            if (!acc.tenantId || acc.tenantId === "main") {
                acc.tenantId = acc.username === "admin@openpitch.vn"
                    ? "store_admin1"
                    : ("store_" + String(acc.id || idx).toLowerCase().replace(/[^a-z0-9]/g, ""));
                migrated = true;
            }
            if (!acc.storeName) {
                acc.storeName = `Cửa hàng ${acc.fullName}`;
                migrated = true;
            }
        } else if (acc.roleCode === "customer" && !acc.permissions) {
            acc.permissions = {};
            migrated = true;
        }
        if (!acc.createdAt) { acc.createdAt = "2026"; migrated = true; }
    });

    // Đảm bảo luôn có ít nhất 1 Chủ web + 1 Admin mẫu + 1 Khách hàng mẫu để test
    if (!list.some(a => a.roleCode === "super_admin")) {
        list.unshift(JSON.parse(JSON.stringify(OPENPITCH_DEFAULT_ACCOUNTS[0])));
        migrated = true;
    }
    if (!list.some(a => a.username === "admin@openpitch.vn")) {
        list.push(JSON.parse(JSON.stringify(OPENPITCH_DEFAULT_ACCOUNTS[1])));
        migrated = true;
    }
    if (!list.some(a => a.username === "khachhang@openpitch.vn")) {
        list.push(JSON.parse(JSON.stringify(OPENPITCH_DEFAULT_ACCOUNTS[2])));
        migrated = true;
    }

    if (migrated) saveSystemAccounts(list);
    return list;
}

function saveSystemAccounts(list) {
    try {
        localStorage.setItem("OPENPITCH_ACCOUNTS", JSON.stringify(list));
    } catch (e) {}
}

// Lấy thông tin người dùng hiện tại (luôn đồng bộ quyền mới nhất từ OPENPITCH_ACCOUNTS)
function getCurrentUser() {
    let sess = null;
    try {
        sess = JSON.parse(localStorage.getItem("OPENPITCH_SESSION") || "null");
    } catch (e) {}
    if (!sess || !sess.username) return null;

    const accounts = getSystemAccounts();
    const live = accounts.find(a => a.username.toLowerCase() === String(sess.username).toLowerCase());
    if (!live) {
        try { localStorage.removeItem("OPENPITCH_SESSION"); } catch (e) {}
        return null;
    }
    if (live.active === false) {
        try { localStorage.removeItem("OPENPITCH_SESSION"); } catch (e) {}
        if (!window.location.pathname.endsWith("login.html")) {
            window.location.href = "login.html?locked=1";
        }
        return null;
    }
    return live;
}

function setUserSession(account) {
    try {
        localStorage.setItem("OPENPITCH_SESSION", JSON.stringify({
            id: account.id,
            fullName: account.fullName,
            username: account.username,
            phone: account.phone || "",
            roleCode: account.roleCode,
            role: getRoleLabel(account.roleCode),
            tenantId: account.tenantId || (account.roleCode === "super_admin" ? "main" : ""),
            storeName: account.storeName || "",
            loggedInAt: new Date().toLocaleString("vi-VN")
        }));
        // Đồng bộ cửa hàng đang xem theo vai trò vừa đăng nhập
        if (account.roleCode === "admin" && account.tenantId) {
            localStorage.setItem("OPENPITCH_SELECTED_TENANT", account.tenantId);
        } else if (account.roleCode === "super_admin") {
            localStorage.setItem("OPENPITCH_SELECTED_TENANT", "main");
        }
        window.__OPENPITCH_MEM_DBS = {};
    } catch (e) {}
}

// ==================== ĐA CỬA HÀNG / MULTI-TENANT ====================
function getAllStores() {
    const accounts = getSystemAccounts();
    const stores = [
        {
            tenantId: "main",
            name: "openPitch (Hệ thống chính)",
            ownerName: "Chủ web Quốc Huy",
            active: true,
            isMain: true
        }
    ];
    accounts.forEach(acc => {
        if (acc.roleCode === "admin" && acc.tenantId && acc.tenantId !== "main") {
            stores.push({
                tenantId: acc.tenantId,
                name: acc.storeName || `Cửa hàng ${acc.fullName}`,
                ownerName: acc.fullName,
                active: acc.active !== false,
                isMain: false
            });
        }
    });
    return stores;
}

function getActiveTenantId() {
    const user = getCurrentUser();
    // Admin luôn bị khóa cứng vào đúng cửa hàng độc lập của mình
    if (user && user.roleCode === "admin") {
        return user.tenantId || "store_admin1";
    }
    // Chủ web & Khách hàng có thể chọn xem Web chính hoặc cửa hàng của bất kỳ Admin nào
    let selected = "main";
    try {
        selected = localStorage.getItem("OPENPITCH_SELECTED_TENANT") || "main";
    } catch (e) {}
    const stores = getAllStores();
    const found = stores.find(s => s.tenantId === selected && (isSuperAdmin() || s.active));
    return found ? found.tenantId : "main";
}

function getActiveStoreInfo(forceTenantId = null) {
    const tid = forceTenantId || getActiveTenantId();
    const stores = getAllStores();
    return stores.find(s => s.tenantId === tid) || stores[0];
}

function switchActiveTenant(tenantId, redirectUrl = null) {
    if (getCurrentRole() === "admin") return; // Admin không thể chuyển sang kho dữ liệu của người khác
    try {
        localStorage.setItem("OPENPITCH_SELECTED_TENANT", tenantId || "main");
    } catch (e) {}
    window.__OPENPITCH_MEM_DBS = {};
    if (redirectUrl) {
        window.location.href = redirectUrl;
    } else {
        window.location.reload();
    }
}

function getCurrentRole() {
    const u = getCurrentUser();
    return u ? u.roleCode : "guest";
}

function isSuperAdmin() {
    return getCurrentRole() === "super_admin";
}

function isStaff() {
    const r = getCurrentRole();
    return r === "super_admin" || r === "admin";
}

function canManage(moduleKey) {
    const u = getCurrentUser();
    if (!u) return false;
    if (u.roleCode === "super_admin") return true;
    if (u.roleCode === "admin") {
        if (moduleKey === "users") return false;
        return Boolean(u.permissions && u.permissions[moduleKey]);
    }
    return false;
}

function getDefaultHomeForUser(user) {
    if (!user || user.roleCode === "customer") return "bookings.html";
    if (user.roleCode === "super_admin") return "index.html";
    if (user.roleCode === "admin") {
        for (const m of OPENPITCH_PERMISSION_META) {
            if (user.permissions && user.permissions[m.key]) return m.href;
        }
        return "bookings.html";
    }
    return "bookings.html";
}

// Tự động bảo vệ các trang nội bộ (index.html, inventory.html, users.html) ngay lập tức
(function runEarlyAccessGuard() {
    const path = (window.location.pathname || "").toLowerCase();
    const file = path.split("/").pop() || "index.html";
    if (file === "login.html") return;

    const user = getCurrentUser();

    if (file === "users.html") {
        if (!user || user.roleCode !== "super_admin") {
            window.location.replace(getDefaultHomeForUser(user));
        }
        return;
    }

    if (file === "index.html" || file === "") {
        if (!canManage("dashboard")) {
            window.location.replace(getDefaultHomeForUser(user));
        }
        return;
    }

    if (file === "inventory.html") {
        if (!canManage("inventory")) {
            window.location.replace(getDefaultHomeForUser(user));
        }
        return;
    }
})();

// =========================================================
// MODAL ĐĂNG NHẬP / ĐĂNG KÝ NHANH KHI KHÁCH VÃNG LAI BẤM ĐẶT / MUA
// =========================================================
let _pendingAuthAction = null;

function ensureQuickAuthModal() {
    if (document.getElementById("quickAuthModal")) return;
    const modalHtml = `
    <div class="modal fade" id="quickAuthModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg overflow-hidden">
                <div class="modal-header text-white" style="background: linear-gradient(135deg, #065F46, #0F172A);">
                    <div>
                        <h6 class="modal-title fw-bold mb-0"><i class="bi bi-person-lock text-warning me-2"></i>Đăng nhập để tiếp tục</h6>
                        <small class="opacity-75" id="quickAuthReason">Vui lòng đăng nhập hoặc tạo tài khoản Khách hàng</small>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <ul class="nav nav-pills nav-fill mb-3 small" role="tablist">
                        <li class="nav-item">
                            <button type="button" class="nav-link active fw-semibold py-2" data-bs-toggle="pill" data-bs-target="#qaLoginPane">Đăng nhập</button>
                        </li>
                        <li class="nav-item">
                            <button type="button" class="nav-link fw-semibold py-2" data-bs-toggle="pill" data-bs-target="#qaRegPane">Đăng ký Khách hàng</button>
                        </li>
                    </ul>

                    <div id="qaAlert" class="alert d-none py-2 px-3 small mb-3"></div>

                    <div class="tab-content">
                        <!-- TAB ĐĂNG NHẬP -->
                        <div class="tab-pane fade show active" id="qaLoginPane">
                            <form onsubmit="handleQuickLogin(event)">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Email hoặc Số điện thoại</label>
                                    <input type="text" id="qaLoginUser" class="form-control form-control-sm" placeholder="khachhang@openpitch.vn" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Mật khẩu</label>
                                    <input type="password" id="qaLoginPwd" class="form-control form-control-sm" placeholder="Nhập mật khẩu..." required>
                                </div>
                                <button type="submit" class="btn btn-pitch w-100 py-2 fw-semibold mb-2">
                                    <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập ngay
                                </button>
                            </form>
                            <div class="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top small">
                                <span class="text-muted" style="font-size: 0.74rem;">Thử nhanh:</span>
                                <div class="d-flex gap-1">
                                    <button type="button" class="btn btn-outline-success btn-sm py-0 px-2" style="font-size: 0.72rem;" onclick="quickFillAuth('khachhang@openpitch.vn','123456')">Khách hàng</button>
                                    <button type="button" class="btn btn-outline-primary btn-sm py-0 px-2" style="font-size: 0.72rem;" onclick="quickFillAuth('admin@openpitch.vn','123456')">Admin</button>
                                    <button type="button" class="btn btn-outline-dark btn-sm py-0 px-2" style="font-size: 0.72rem;" onclick="quickFillAuth('quochuy@openpitch.vn','123456')">Chủ web</button>
                                </div>
                            </div>
                        </div>

                        <!-- TAB ĐĂNG KÝ KHÁCH HÀNG -->
                        <div class="tab-pane fade" id="qaRegPane">
                            <form onsubmit="handleQuickRegister(event)">
                                <div class="mb-2">
                                    <label class="form-label small fw-semibold">Họ và tên</label>
                                    <input type="text" id="qaRegName" class="form-control form-control-sm" placeholder="VD: Nguyễn Văn Nam" required>
                                </div>
                                <div class="row g-2 mb-2">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Số điện thoại</label>
                                        <input type="text" id="qaRegPhone" class="form-control form-control-sm" placeholder="0905xxxxxx" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Email đăng nhập</label>
                                        <input type="text" id="qaRegUser" class="form-control form-control-sm" placeholder="nam@gmail.com" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Mật khẩu (tối thiểu 6 ký tự)</label>
                                    <input type="password" id="qaRegPwd" class="form-control form-control-sm" minlength="6" required>
                                </div>
                                <button type="submit" class="btn btn-pitch w-100 py-2 fw-semibold">
                                    <i class="bi bi-person-plus-fill me-1"></i> Tạo tài khoản &amp; Tiếp tục
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function quickFillAuth(u, p) {
    document.getElementById("qaLoginUser").value = u;
    document.getElementById("qaLoginPwd").value = p;
}

function showQuickAuthAlert(msg, type = "danger") {
    const el = document.getElementById("qaAlert");
    if (!el) return;
    el.className = `alert alert-${type} py-2 px-3 small mb-3`;
    el.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-1"></i>${msg}`;
}

function openQuickLoginModal(reasonText = "Đăng nhập để đặt sân, mua hàng và đánh giá sản phẩm", onSuccess = null) {
    ensureQuickAuthModal();
    _pendingAuthAction = typeof onSuccess === "function" ? onSuccess : null;
    const reasonEl = document.getElementById("quickAuthReason");
    if (reasonEl) reasonEl.innerText = reasonText;
    const alertEl = document.getElementById("qaAlert");
    if (alertEl) alertEl.className = "alert d-none";
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("quickAuthModal"));
    modal.show();
}

// Cổng kiểm tra đăng nhập cho các hành động tương tác của Khách (Đặt sân, Mua hàng, Đánh giá)
function requireLoginForAction(actionLabel, callback) {
    const user = getCurrentUser();
    if (user) {
        if (typeof callback === "function") callback(user);
        return true;
    }
    openQuickLoginModal(`Vui lòng đăng nhập hoặc đăng ký để ${actionLabel}`, callback);
    return false;
}

function finishQuickAuth(account) {
    setUserSession(account);
    const modalEl = document.getElementById("quickAuthModal");
    if (modalEl) {
        const inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
    }
    const prevTenant = window.__LAST_TENANT_ID || "main";
    const nextTenant = getActiveTenantId();
    window.__LAST_TENANT_ID = nextTenant;
    if (prevTenant !== nextTenant && !_pendingAuthAction) {
        window.location.href = getDefaultHomeForUser(account);
        return;
    }
    applyRoleBasedSidebar();
    syncSidebarUserSession();
    syncSidebarAlertBadge();
    if (typeof window.onAuthStateChanged === "function") {
        window.onAuthStateChanged(account);
    }
    showToast(`Xin chào ${account.fullName} (${getRoleLabel(account.roleCode)})!`, "success");

    const cb = _pendingAuthAction;
    _pendingAuthAction = null;
    if (typeof cb === "function") {
        setTimeout(() => cb(account), 180);
    }
}

function handleQuickLogin(e) {
    e.preventDefault();
    const u = document.getElementById("qaLoginUser").value.trim().toLowerCase();
    const p = document.getElementById("qaLoginPwd").value;
    const accounts = getSystemAccounts();
    const found = accounts.find(a =>
        (a.username.toLowerCase() === u || (a.phone && a.phone === u)) && a.password === p
    );
    if (!found) {
        showQuickAuthAlert("Sai tài khoản hoặc mật khẩu. Bạn có thể bấm nút Thử nhanh bên dưới.");
        return;
    }
    if (found.active === false) {
        showQuickAuthAlert("Tài khoản này đã bị Chủ web tạm khóa.");
        return;
    }
    finishQuickAuth(found);
}

function handleQuickRegister(e) {
    e.preventDefault();
    const accounts = getSystemAccounts();
    const fullName = document.getElementById("qaRegName").value.trim();
    const phone = document.getElementById("qaRegPhone").value.trim();
    const username = document.getElementById("qaRegUser").value.trim().toLowerCase();
    const password = document.getElementById("qaRegPwd").value;

    if (accounts.some(a => a.username.toLowerCase() === username || (phone && a.phone === phone))) {
        showQuickAuthAlert("Email hoặc Số điện thoại này đã được đăng ký!");
        return;
    }

    const newCust = {
        id: "ACC_" + Date.now().toString().slice(-5),
        fullName,
        username,
        phone,
        password,
        roleCode: "customer",
        role: getRoleLabel("customer"),
        active: true,
        permissions: {},
        createdAt: new Date().toLocaleDateString("vi-VN")
    };
    accounts.push(newCust);
    saveSystemAccounts(accounts);
    e.target.reset();
    finishQuickAuth(newCust);
}

// =========================================================
// LOGO, SIDEBAR ĐỘNG THEO VAI TRÒ & MOBILE MENU
// =========================================================
const OPENPITCH_DEFAULT_SVG_LOGO = `
<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="openPitch Logo">
  <defs>
    <linearGradient id="opBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#opBg)"/>
  <rect x="9" y="13" width="46" height="38" rx="5" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-opacity="0.92"/>
  <line x1="32" y1="13" x2="32" y2="51" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity="0.85"/>
  <path d="M9 24 H16 V40 H9" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity="0.85"/>
  <path d="M55 24 H48 V40 H55" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity="0.85"/>
  <circle cx="32" cy="32" r="9.5" fill="#064E3B" stroke="#FFFFFF" stroke-width="2.5"/>
  <polygon points="32,26 37,29.6 35.1,35.4 28.9,35.4 27,29.6" fill="#FFFFFF"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    window.__LAST_TENANT_ID = getActiveTenantId();
    try { initResponsiveSidebar(); } catch (e) {}
    try { applyRoleBasedSidebar(); } catch (e) {}
    try { syncBrandLogo(); } catch (e) {}
    try { syncSidebarUserSession(); } catch (e) {}
    try { syncSidebarAlertBadge(); } catch (e) {}
    try { initUniversalHorizontalScroll(); } catch (e) {}
});

function applyRoleBasedSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const user = getCurrentUser();
    const role = user ? user.roleCode : "guest";
    const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    // Đổi link logo theo vai trò
    const brandLink = sidebar.querySelector(":scope > a");
    if (brandLink) {
        brandLink.setAttribute("href", getDefaultHomeForUser(user));
    }

    const navList = sidebar.querySelector("ul.nav");
    if (navList) {
        const items = [];
        if (role === "super_admin" || role === "admin") {
            if (canManage("dashboard")) {
                items.push({ href: "index.html", icon: "bi-bar-chart-line-fill", label: "Quản lý doanh thu" });
            }
            if (canManage("bookings")) {
                items.push({ href: "bookings.html", icon: "bi-calendar2-week", label: "Quản lý lịch đặt sân" });
            }
            if (canManage("pitches")) {
                items.push({ href: "pitches.html", icon: "bi-grid-1x2", label: "Quản lý sân bóng" });
            }
            if (canManage("pos")) {
                items.push({ href: "pos-products.html", icon: "bi-cup-straw", label: "Quản lý hàng hóa (POS)" });
            }
            if (canManage("inventory")) {
                items.push({ href: "inventory.html", icon: "bi-box-seam", label: "Quản lý kho hàng", hasBadge: true });
            }
            if (canManage("tournaments")) {
                items.push({ href: "tournaments.html", icon: "bi-trophy", label: "Quản lý giải đấu" });
            }
            if (role === "super_admin") {
                items.push({ href: "users.html", icon: "bi-shield-lock-fill", label: "Phân quyền & Tài khoản" });
            }
        } else {
            // Menu sạch & thân thiện dành riêng cho Khách hàng & Khách vãng lai
            items.push({ href: "bookings.html", icon: "bi-calendar2-check", label: "Xem & Đặt lịch sân" });
            items.push({ href: "pitches.html", icon: "bi-grid-1x2", label: "Danh sách sân bóng" });
            items.push({ href: "pos-products.html", icon: "bi-bag-heart-fill", label: "Cửa hàng (Mua sắm)" });
            items.push({ href: "tournaments.html", icon: "bi-trophy", label: "Giải đấu phong trào" });
        }

    // Hiển thị hộp Cửa hàng / Bộ chuyển cửa hàng trên Sidebar
    const existingStoreBox = sidebar.querySelector("#sidebarStoreBox");
    if (existingStoreBox) existingStoreBox.remove();

    const activeStore = getActiveStoreInfo();
    const allStores = getAllStores();
    const storeBox = document.createElement("div");
    storeBox.id = "sidebarStoreBox";
    storeBox.className = "px-2 py-2 mb-3 rounded-3";
    storeBox.style.cssText = "background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);";

    if (role === "admin") {
        storeBox.innerHTML = `
            <div class="text-secondary" style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px;">
                <i class="bi bi-shop text-success me-1"></i>Cửa hàng của bạn (Dữ liệu riêng)
            </div>
            <div class="text-white fw-bold small text-truncate mt-1" title="${activeStore.name}">${activeStore.name}</div>
        `;
    } else {
        const visibleStores = role === "super_admin" ? allStores : allStores.filter(s => s.active);
        const labelTxt = role === "super_admin" ? "Không gian dữ liệu đang xem" : "Chọn Cụm sân / Cửa hàng";
        storeBox.innerHTML = `
            <label class="text-secondary d-block mb-1" style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px;">
                <i class="bi bi-buildings text-success me-1"></i>${labelTxt}
            </label>
            <select class="form-select form-select-sm bg-dark text-white border-secondary" style="font-size: 0.78rem;" onchange="switchActiveTenant(this.value)">
                ${visibleStores.map(s => `<option value="${s.tenantId}" ${s.tenantId === activeStore.tenantId ? 'selected' : ''}>${s.isMain ? '★ ' : '🏪 '}${s.name}${!s.active ? ' (Đã khóa)' : ''}</option>`).join("")}
            </select>
        `;
    }

    if (brandLink && brandLink.parentNode === sidebar) {
        brandLink.insertAdjacentElement("afterend", storeBox);
    }

        navList.innerHTML = items.map(it => {
            const act = currentFile === it.href ? " active" : "";
            if (it.hasBadge) {
                return `
                    <li class="nav-item">
                        <a href="${it.href}" class="nav-link${act} d-flex justify-content-between align-items-center">
                            <span><i class="bi ${it.icon} me-2"></i> ${it.label}</span>
                            <span class="badge bg-danger rounded-pill" id="sidebarAlertCount">0</span>
                        </a>
                    </li>`;
            }
            return `<li class="nav-item"><a href="${it.href}" class="nav-link${act}"><i class="bi ${it.icon}"></i> ${it.label}</a></li>`;
        }).join("");
    }

    // Cập nhật nút Đăng nhập / Đăng xuất ở chân Sidebar
    const existingAuthBtn = sidebar.querySelector("button[onclick*='logoutSystem'], button[onclick*='openQuickLoginModal'], a[href='login.html'].btn");
    if (existingAuthBtn) {
        if (!user) {
            const loginBtn = document.createElement("button");
            loginBtn.type = "button";
            loginBtn.className = "btn btn-pitch btn-sm w-100";
            loginBtn.innerHTML = `<i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập / Đăng ký`;
            loginBtn.setAttribute("onclick", "openQuickLoginModal()");
            existingAuthBtn.replaceWith(loginBtn);
        } else {
            const logoutBtn = document.createElement("button");
            logoutBtn.type = "button";
            logoutBtn.className = "btn btn-outline-danger btn-sm w-100";
            logoutBtn.innerHTML = `<i class="bi bi-box-arrow-right me-1"></i> Đăng xuất`;
            logoutBtn.setAttribute("onclick", "logoutSystem()");
            existingAuthBtn.replaceWith(logoutBtn);
        }
    }
}

function syncBrandLogo() {
    const brandLinks = document.querySelectorAll(".sidebar > a");
    const customLogo = localStorage.getItem("OPENPITCH_CUSTOM_LOGO");

    brandLinks.forEach(link => {
        const iconBox = link.querySelector(".bg-success, .brand-logo-box");
        if (!iconBox) return;

        link.classList.add("brand-logo-wrap");
        iconBox.className = "brand-logo-box";
        iconBox.innerHTML = "";

        const img = document.createElement("img");
        img.alt = "openPitch Logo";

        if (customLogo) {
            img.src = customLogo;
            img.onerror = () => { iconBox.innerHTML = OPENPITCH_DEFAULT_SVG_LOGO; };
        } else {
            img.src = "assets/img/logo.jpg";
            img.dataset.triedPng = "0";
            img.onerror = function () {
                if (this.dataset.triedPng === "0") {
                    this.dataset.triedPng = "1";
                    this.src = "assets/img/logo.png";
                } else {
                    iconBox.innerHTML = OPENPITCH_DEFAULT_SVG_LOGO;
                }
            };
        }
        iconBox.appendChild(img);

        // Chỉ Chủ web (super_admin) mới được bấm đổi logo hệ thống
        if (isSuperAdmin() && !link.querySelector(".brand-logo-edit-btn")) {
            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "brand-logo-edit-btn";
            editBtn.title = "Đổi logo openPitch";
            editBtn.innerHTML = `<i class="bi bi-camera-fill"></i>`;
            editBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                openLogoUploader();
            });
            iconBox.appendChild(editBtn);
        }
    });
}

function openLogoUploader() {
    if (!isSuperAdmin()) return;
    let input = document.getElementById("openPitchLogoInput");
    if (!input) {
        input = document.createElement("input");
        input.type = "file";
        input.id = "openPitchLogoInput";
        input.accept = "image/*";
        input.style.display = "none";
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            compressImageToDataURL(file, 256, 0.88, (dataUrl) => {
                localStorage.setItem("OPENPITCH_CUSTOM_LOGO", dataUrl);
                syncBrandLogo();
                showToast("Đã cập nhật logo openPitch mới cho toàn bộ hệ thống!", "success");
            });
            e.target.value = "";
        });
        document.body.appendChild(input);
    }
    input.click();
}

function handleProductImgError(imgEl, iconClass, isThumb = false) {
    const src = imgEl.getAttribute("src") || "";
    if (!imgEl.dataset.triedPng && src.endsWith(".jpg")) {
        imgEl.dataset.triedPng = "1";
        imgEl.src = src.replace(/\.jpg$/, ".png");
        return;
    }
    const fallback = document.createElement("div");
    fallback.className = isThumb ? "inv-thumb-fallback" : "product-img-fallback";
    fallback.innerHTML = `<i class="bi ${iconClass || 'bi-box-seam'}"></i>`;
    imgEl.replaceWith(fallback);
}

function compressImageToDataURL(file, maxWidth = 480, quality = 0.82, callback) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
                h = Math.round((h * maxWidth) / w);
                w = maxWidth;
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function syncSidebarUserSession() {
    const user = getCurrentUser();
    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarUserRole");
    if (!user) {
        if (nameEl) nameEl.innerText = "Khách vãng lai";
        if (roleEl) roleEl.innerText = "Chế độ xem tự do";
        return;
    }
    if (nameEl) nameEl.innerText = user.fullName;
    if (roleEl) roleEl.innerText = getRoleLabel(user.roleCode);
}

function syncSidebarAlertBadge() {
    if (!canManage("inventory")) return;
    if (typeof getPitchData !== "function" || typeof getInventoryAlertSummary !== "function") return;
    const db = getPitchData();
    const summary = getInventoryAlertSummary(db);
    const badge = document.getElementById("sidebarAlertCount") || document.getElementById("lowStockBadge");
    if (badge) {
        badge.innerText = summary.totalAlerts;
        badge.style.display = summary.totalAlerts > 0 ? "inline-block" : "none";
    }
}

function initResponsiveSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const topbar = document.querySelector(".topbar");
    if (!sidebar || !topbar) return;
    if (topbar.querySelector(".btn-mobile-menu")) return;

    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.addEventListener("click", () => {
        sidebar.classList.remove("show");
        backdrop.classList.remove("show");
    });
    document.body.appendChild(backdrop);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-secondary btn-sm btn-mobile-menu me-2";
    btn.title = "Mở menu điều hướng";
    btn.innerHTML = `<i class="bi bi-list fs-5"></i>`;
    btn.addEventListener("click", () => {
        sidebar.classList.toggle("show");
        backdrop.classList.toggle("show");
    });

    const firstChild = topbar.firstElementChild;
    if (firstChild) {
        const wrapper = document.createElement("div");
        wrapper.className = "d-flex align-items-center";
        topbar.insertBefore(wrapper, firstChild);
        wrapper.appendChild(btn);
        wrapper.appendChild(firstChild);
    }
}

function showToast(message, type = "success") {
    let container = document.getElementById("openPitchToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "openPitchToastContainer";
        document.body.appendChild(container);
    }

    const styles = {
        success: { bg: "#15803D", icon: "bi-check-circle-fill" },
        danger:  { bg: "#DC2626", icon: "bi-exclamation-octagon-fill" },
        warning: { bg: "#D97706", icon: "bi-exclamation-triangle-fill" },
        info:    { bg: "#0284C7", icon: "bi-info-circle-fill" }
    };
    const cfg = styles[type] || styles.info;

    const toast = document.createElement("div");
    toast.className = "op-toast";
    toast.style.backgroundColor = cfg.bg;
    toast.innerHTML = `<i class="bi ${cfg.icon} fs-5"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 260);
    }, 3200);
}

function logoutSystem() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống openPitch?")) {
        localStorage.removeItem("OPENPITCH_SESSION");
        window.location.href = "login.html";
    }
}

// =========================================================
// THANH KÉO SANG NGANG ĐỒNG BỘ CHO MỌI TRANG
// =========================================================
const _opScrollRegistry = new Set();

function attachHorizontalScrollBar(targetEl) {
    if (!targetEl || targetEl.dataset.opHscrollBound === "1") return;
    targetEl.dataset.opHscrollBound = "1";

    const isDark = targetEl.classList.contains("ucl-arena") || Boolean(targetEl.closest(".ucl-arena"));

    const bar = document.createElement("div");
    bar.className = "op-hscroll-bar" + (isDark ? " op-hscroll-dark" : "");
    bar.innerHTML = `
        <button type="button" class="op-hscroll-btn op-hscroll-left" title="Kéo sang trái">
            <i class="bi bi-chevron-left"></i>
        </button>
        <div class="op-hscroll-track">
            <div class="op-hscroll-spacer"></div>
        </div>
        <button type="button" class="op-hscroll-btn op-hscroll-right" title="Kéo sang phải">
            <i class="bi bi-chevron-right"></i>
        </button>
        <span class="op-hscroll-hint d-none d-sm-inline">Kéo ngang để xem hết</span>
    `;

    targetEl.parentNode.insertBefore(bar, targetEl);

    const track = bar.querySelector(".op-hscroll-track");
    const spacer = bar.querySelector(".op-hscroll-spacer");
    const btnLeft = bar.querySelector(".op-hscroll-left");
    const btnRight = bar.querySelector(".op-hscroll-right");

    let syncingFromTrack = false;
    let syncingFromTarget = false;

    const refresh = () => {
        const sw = targetEl.scrollWidth;
        const cw = targetEl.clientWidth;
        const needsScroll = sw > cw + 3;
        bar.classList.toggle("is-visible", needsScroll);
        if (needsScroll) {
            const trackWidth = track.clientWidth || cw;
            spacer.style.width = Math.max(trackWidth + 20, Math.round((sw / Math.max(1, cw)) * trackWidth)) + "px";
            const maxTarget = Math.max(1, sw - cw);
            const maxTrack = Math.max(1, track.scrollWidth - track.clientWidth);
            track.scrollLeft = Math.round((targetEl.scrollLeft / maxTarget) * maxTrack);
        }
    };

    track.addEventListener("scroll", () => {
        if (syncingFromTarget) return;
        syncingFromTrack = true;
        const maxTrack = Math.max(1, track.scrollWidth - track.clientWidth);
        const maxTarget = Math.max(1, targetEl.scrollWidth - targetEl.clientWidth);
        targetEl.scrollLeft = Math.round((track.scrollLeft / maxTrack) * maxTarget);
        requestAnimationFrame(() => { syncingFromTrack = false; });
    });

    targetEl.addEventListener("scroll", () => {
        if (syncingFromTrack) return;
        syncingFromTarget = true;
        const maxTarget = Math.max(1, targetEl.scrollWidth - targetEl.clientWidth);
        const maxTrack = Math.max(1, track.scrollWidth - track.clientWidth);
        track.scrollLeft = Math.round((targetEl.scrollLeft / maxTarget) * maxTrack);
        requestAnimationFrame(() => { syncingFromTarget = false; });
    });

    btnLeft.addEventListener("click", () => targetEl.scrollBy({ left: -260, behavior: "smooth" }));
    btnRight.addEventListener("click", () => targetEl.scrollBy({ left: 260, behavior: "smooth" }));

    targetEl.addEventListener("wheel", (e) => {
        if (e.shiftKey && targetEl.scrollWidth > targetEl.clientWidth + 3) {
            e.preventDefault();
            targetEl.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    if (typeof ResizeObserver === "function") {
        const ro = new ResizeObserver(refresh);
        ro.observe(targetEl);
        if (targetEl.firstElementChild) ro.observe(targetEl.firstElementChild);
    }

    _opScrollRegistry.add(refresh);
    refresh();
}

function refreshAllHorizontalScrollBars() {
    document.querySelectorAll(".table-responsive, .ucl-arena").forEach(el => {
        attachHorizontalScrollBar(el);
    });
    _opScrollRegistry.forEach(fn => fn());
}

function initUniversalHorizontalScroll() {
    refreshAllHorizontalScrollBars();

    let timer = null;
    const scheduleRefresh = () => {
        clearTimeout(timer);
        timer = setTimeout(refreshAllHorizontalScrollBars, 80);
    };

    window.addEventListener("resize", scheduleRefresh);
    document.addEventListener("shown.bs.tab", scheduleRefresh);
    document.addEventListener("shown.bs.modal", scheduleRefresh);

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, { childList: true, subtree: true });
}