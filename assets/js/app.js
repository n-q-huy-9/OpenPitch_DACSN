// =========================================================
// TIỆN ÍCH DÙNG CHUNG TOÀN HỆ THỐNG OPENPITCH
// (Đồng bộ Sidebar, User Session, Mobile Menu & Toast SaaS)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    syncSidebarUserSession();
    syncSidebarAlertBadge();
    initResponsiveSidebar();
});

// 1. Đồng bộ tên & vai trò tài khoản đang đăng nhập lên Sidebar tất cả các trang
function syncSidebarUserSession() {
    const session = JSON.parse(localStorage.getItem("OPENPITCH_SESSION") || "null");
    if (!session) return;
    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarUserRole");
    if (nameEl) nameEl.innerText = session.fullName || "Chủ sân Quốc Huy";
    if (roleEl) roleEl.innerText = session.role || "Đang hoạt động";
}

// 2. Đồng bộ số đỏ cảnh báo kho thống nhất 100% giữa tất cả 6 trang
function syncSidebarAlertBadge() {
    if (typeof getPitchData !== "function" || typeof getInventoryAlertSummary !== "function") return;
    const db = getPitchData();
    const summary = getInventoryAlertSummary(db);
    const badge = document.getElementById("sidebarAlertCount") || document.getElementById("lowStockBadge");
    if (badge) {
        badge.innerText = summary.totalAlerts;
        badge.style.display = summary.totalAlerts > 0 ? "inline-block" : "none";
    }
}

// 3. Tự động thêm nút mở menu cho màn hình nhỏ (Tablet / Mobile)
function initResponsiveSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const topbar = document.querySelector(".topbar");
    if (!sidebar || !topbar) return;

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

// 4. Thông báo Toast mượt mà kiểu ứng dụng thực tế (thay thế alert cứng)
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

// 5. Đăng xuất chuẩn: xóa phiên đăng nhập và quay về login.html
function logoutSystem() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống openPitch?")) {
        localStorage.removeItem("OPENPITCH_SESSION");
        window.location.href = "login.html";
    }
}