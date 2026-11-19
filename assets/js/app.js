// =========================================================
// TIỆN ÍCH DÙNG CHUNG TOÀN HỆ THỐNG OPENPITCH
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    syncSidebarLowStockBadge();
});

// Tự động cập nhật số đỏ cảnh báo tồn kho trên Sidebar ở mọi trang
function syncSidebarLowStockBadge() {
    if (typeof getPitchData !== "function") return;
    const db = getPitchData();
    const lowCount = db.products.filter(p => p.stock <= p.minStock).length;

    const badge = document.getElementById("sidebarAlertCount") || document.getElementById("lowStockBadge");
    if (badge) {
        badge.innerText = lowCount;
        badge.style.display = lowCount > 0 ? "inline-block" : "none";
    }
}

// Hàm đăng xuất nhanh về trang đăng nhập
function logoutSystem() {
    if (confirm("Bạn có chắc muốn đăng xuất khỏi hệ thống openPitch?")) {
        window.location.href = "login.html";
    }
}