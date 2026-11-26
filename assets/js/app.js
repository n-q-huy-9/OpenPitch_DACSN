// =========================================================
// TIỆN ÍCH DÙNG CHUNG TOÀN HỆ THỐNG OPENPITCH
// (Brand Logo, Sidebar, User Session, Mobile Menu, Image & Toast)
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
    try { initResponsiveSidebar(); } catch (e) {}
    try { syncBrandLogo(); } catch (e) {}
    try { syncSidebarUserSession(); } catch (e) {}
    try { syncSidebarAlertBadge(); } catch (e) {}
    try { initUniversalHorizontalScroll(); } catch (e) {}
});

// 1. Tự động nâng cấp Logo openPitch đồng bộ trên tất cả các trang
// Ưu tiên: Ảnh người dùng tải lên (localStorage) -> assets/img/logo.jpg -> assets/img/logo.png -> SVG sân bóng sắc nét
function syncBrandLogo() {
    const brandLinks = document.querySelectorAll(".sidebar > a");
    const customLogo = localStorage.getItem("OPENPITCH_CUSTOM_LOGO");

    brandLinks.forEach(link => {
        const iconBox = link.querySelector(".bg-success");
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

        // Nút nhỏ cho phép chủ sân bấm đổi logo ngay trên giao diện
        if (!link.querySelector(".brand-logo-edit-btn")) {
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

// 2. Xử lý dự phòng khi ảnh sản phẩm chưa được chép vào assets/img/ (.jpg -> .png -> icon đẹp)
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

// 3. Nén ảnh upload xuống kích thước gọn nhẹ để lưu bền vững trong localStorage
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

// 4. Đồng bộ tên & vai trò tài khoản đang đăng nhập lên Sidebar
function syncSidebarUserSession() {
    const session = JSON.parse(localStorage.getItem("OPENPITCH_SESSION") || "null");
    if (!session) return;
    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarUserRole");
    if (nameEl) nameEl.innerText = session.fullName || "Chủ sân Quốc Huy";
    if (roleEl) roleEl.innerText = session.role || "Đang hoạt động";
}

// 5. Đồng bộ số đỏ cảnh báo kho thống nhất 100% giữa tất cả 6 trang
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

// 6. Tự động thêm nút mở menu cho màn hình nhỏ (Tablet / Mobile)
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

// 7. Thông báo Toast mượt mà kiểu ứng dụng thực tế
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

// 8. Đăng xuất chuẩn
function logoutSystem() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống openPitch?")) {
        localStorage.removeItem("OPENPITCH_SESSION");
        window.location.href = "login.html";
    }
}

// 9. Tự động gắn thanh kéo sang ngang (đồng bộ phía trên + nút trái/phải + Shift+Cuộn)
// cho TẤT CẢ bảng và vùng tràn ngang trên mọi trang của openPitch
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

    // Chèn thanh kéo ngang ngay phía trên vùng cuộn
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
            // Tỷ lệ chiều rộng thanh trượt khớp 1:1 với nội dung thật
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

    btnLeft.addEventListener("click", () => {
        targetEl.scrollBy({ left: -260, behavior: "smooth" });
    });

    btnRight.addEventListener("click", () => {
        targetEl.scrollBy({ left: 260, behavior: "smooth" });
    });

    // Hỗ trợ giữ Shift + lăn chuột để kéo ngang mượt
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

    // Tự động cập nhật mỗi khi nội dung bảng/tab thay đổi động (VD: thêm sân, đổi tab, đổi bộ lọc)
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