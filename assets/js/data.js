// =========================================================
// KHO DỮ LIỆU & NGHIỆP VỤ KINH DOANH HỆ THỐNG OPENPITCH
// (Nhà cung cấp, Kho FEFO/HSD đồ ăn báo trước 1 ngày,
//  Khuyến mãi chọn món & Voucher, Doanh thu, Lợi nhuận, Sổ quỹ)
// =========================================================

function getTodayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function addDaysISO(days) {
    const dt = new Date();
    dt.setDate(dt.getDate() + days);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDateVN(isoDate) {
    if (!isoDate || typeof isoDate !== "string") return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getCurrentMonthISO() {
    return getTodayISO().slice(0, 7);
}

function getDayIndexFromISO(isoDate) {
    if (!isoDate) return getTodayDayIndex();
    const [y, m, d] = isoDate.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return day === 0 ? 6 : day - 1;
}

function getTodayDayIndex() {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
}

function timeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function getDaysUntil(isoDate) {
    if (!isoDate) return null;
    const today = new Date(getTodayISO() + "T00:00:00");
    const target = new Date(isoDate + "T00:00:00");
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function getDaysSince(isoDate) {
    if (!isoDate) return 0;
    const today = new Date(getTodayISO() + "T00:00:00");
    const past = new Date(isoDate + "T00:00:00");
    return Math.max(0, Math.round((today - past) / (1000 * 60 * 60 * 24)));
}

// Đánh giá 3 cấp độ cảnh báo tồn kho:
// - Đồ ăn: cảnh báo trước 1 ngày hết hạn (daysToExpiry <= 1)
// - Nước uống / hàng khác có HSD: cảnh báo trước 15 ngày (daysToExpiry <= 15)
// - Hàng tồn lâu / sắp lỗi thời: >= 30 ngày không phát sinh lượt bán
function getProductStatus(product) {
    const stock = Number(product.stock || 0);
    const isFood = product.category === "Đồ ăn";
    const isLowStock = stock <= Number(product.minStock || 0);
    const daysToExpiry = getDaysUntil(product.expiryDate);
    const expiryThreshold = isFood ? 1 : 15;

    const isExpired = daysToExpiry !== null && daysToExpiry < 0 && stock > 0;
    const isNearExpiry = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= expiryThreshold && stock > 0;
    const isFoodUrgent = isFood && (isNearExpiry || isExpired);

    const daysSinceSold = getDaysSince(product.lastSoldDate);
    const isSlowMoving = daysSinceSold >= 30 && stock > 0;

    let expiryStatusText = "";
    if (daysToExpiry !== null) {
        if (daysToExpiry < 0) expiryStatusText = `Đã hết hạn ${Math.abs(daysToExpiry)} ngày!`;
        else if (daysToExpiry === 0) expiryStatusText = "Hết hạn hôm nay!";
        else if (daysToExpiry === 1) expiryStatusText = "Hết hạn ngày mai (còn 1 ngày)!";
        else expiryStatusText = `Còn ${daysToExpiry} ngày`;
    }

    return {
        isFood,
        isLowStock,
        isExpired,
        isNearExpiry,
        isFoodUrgent,
        isSlowMoving,
        daysToExpiry,
        daysSinceSold,
        expiryStatusText,
        needsPromo: isNearExpiry || isSlowMoving || isExpired
    };
}

// Tổng hợp cảnh báo kho dùng chung cho toàn bộ 6 trang (đảm bảo badge Sidebar khớp 100%)
function getInventoryAlertSummary(db) {
    const enriched = (db.products || []).map(p => ({ p, st: getProductStatus(p) }));
    const lowItems = enriched.filter(x => x.st.isLowStock);
    const expiryItems = enriched.filter(x => x.st.isNearExpiry || x.st.isExpired);
    const foodUrgentItems = enriched.filter(x => x.st.isFoodUrgent);
    const slowItems = enriched.filter(x => x.st.isSlowMoving);
    const alertItems = enriched.filter(x => x.st.isLowStock || x.st.needsPromo);

    return {
        totalAlerts: alertItems.length,
        lowCount: lowItems.length,
        expiryCount: expiryItems.length,
        foodUrgentCount: foodUrgentItems.length,
        slowCount: slowItems.length,
        foodUrgentItems,
        alertItems
    };
}

function getEffectiveSellPrice(product) {
    const base = Number(product.sellPrice || 0);
    const disc = Math.min(100, Math.max(0, Number(product.discountPercent || 0)));
    return Math.round(base * (1 - disc / 100));
}

function getSupplierName(db, supplierId) {
    if (!supplierId || !db.suppliers) return "Chưa rõ NCC";
    const s = db.suppliers.find(x => x.id === supplierId);
    return s ? s.name : "Chưa rõ NCC";
}

function buildDefaultData() {
    const today = getTodayISO();
    const todayIdx = getDayIndexFromISO(today);

    return {
        openingCashFund: 0,

        categories: ["Nước uống", "Đồ ăn", "Phụ kiện"],

        suppliers: [
            { id: "NCC01", name: "NPP Nước giải khát Miền Trung", phone: "0236 388 1122", category: "Nước uống", address: "KCN Hòa Khánh, Đà Nẵng" },
            { id: "NCC02", name: "Cơ sở Thực phẩm Nhanh Hòa Phát", phone: "0236 399 4455", category: "Đồ ăn", address: "Quận Hải Châu, Đà Nẵng" },
            { id: "NCC03", name: "Xưởng Phụ kiện Thể thao SportVN", phone: "0905 778 899", category: "Phụ kiện", address: "Quận Thanh Khê, Đà Nẵng" }
        ],

        promotions: [
            { id: "KM01", code: "KHUNGVANG10", name: "Giảm 10% đơn POS khung giờ vàng", type: "percent", value: 10, minOrder: 100000, active: true },
            { id: "KM02", code: "XAKHO20K", name: "Giảm 20.000đ đơn từ 150.000đ", type: "fixed", value: 20000, minOrder: 150000, active: true }
        ],

        pitches: [
            { id: "S5A", name: "Sân 5A", type: "Sân 5 người", normalPrice: 250000, peakPrice: 350000, status: "active", note: "Cỏ nhân tạo mới thay" },
            { id: "S5B", name: "Sân 5B", type: "Sân 5 người", normalPrice: 250000, peakPrice: 350000, status: "active", note: "Gần căng-tin, đèn LED mới" },
            { id: "S5C", name: "Sân 5C", type: "Sân 5 người", normalPrice: 230000, peakPrice: 320000, status: "active", note: "Lưới chắn mới thay" },
            { id: "S7A", name: "Sân 7A (Sân chính)", type: "Sân 7 người", normalPrice: 500000, peakPrice: 650000, status: "active", note: "Có khán đài mini tổ chức giải" }
        ],

        timeSlots: [
            { id: "H04", start: "04:00", end: "05:00", label: "04:00 - 05:00", isPeak: false, period: "morning" },
            { id: "H05", start: "05:00", end: "06:00", label: "05:00 - 06:00", isPeak: false, period: "morning" },
            { id: "H06", start: "06:00", end: "07:00", label: "06:00 - 07:00", isPeak: false, period: "morning" },
            { id: "H07", start: "07:00", end: "08:00", label: "07:00 - 08:00", isPeak: false, period: "morning" },
            { id: "H08", start: "08:00", end: "09:00", label: "08:00 - 09:00", isPeak: false, period: "morning" },
            { id: "H09", start: "09:00", end: "10:00", label: "09:00 - 10:00", isPeak: false, period: "morning" },
            { id: "H10", start: "10:00", end: "11:00", label: "10:00 - 11:00", isPeak: false, period: "morning" },
            { id: "H11", start: "11:00", end: "12:00", label: "11:00 - 12:00", isPeak: false, period: "morning" },
            { id: "H12", start: "12:00", end: "13:00", label: "12:00 - 13:00", isPeak: false, period: "afternoon" },
            { id: "H13", start: "13:00", end: "14:00", label: "13:00 - 14:00", isPeak: false, period: "afternoon" },
            { id: "H14", start: "14:00", end: "15:00", label: "14:00 - 15:00", isPeak: false, period: "afternoon" },
            { id: "H15", start: "15:00", end: "16:00", label: "15:00 - 16:00", isPeak: false, period: "afternoon" },
            { id: "H16", start: "16:00", end: "17:00", label: "16:00 - 17:00", isPeak: false, period: "afternoon" },
            { id: "H17", start: "17:00", end: "18:00", label: "17:00 - 18:00", isPeak: true,  period: "evening" },
            { id: "H18", start: "18:00", end: "19:00", label: "18:00 - 19:00", isPeak: true,  period: "evening" },
            { id: "H19", start: "19:00", end: "20:00", label: "19:00 - 20:00", isPeak: true,  period: "evening" },
            { id: "H20", start: "20:00", end: "21:00", label: "20:00 - 21:00", isPeak: true,  period: "evening" },
            { id: "H21", start: "21:00", end: "22:00", label: "21:00 - 22:00", isPeak: false, period: "evening" },
            { id: "H22", start: "22:00", end: "23:00", label: "22:00 - 23:00", isPeak: false, period: "evening" }
        ],

        bookings: [
            { id: "HD108", date: today, pitchId: "S5A", startTime: "17:00", endTime: "18:00", customer: "Anh Tuấn (FC IT)", phone: "0905123456", status: "playing", paid: true, dayIndex: todayIdx, deposit: 100000, note: "Khách quen" },
            { id: "HD107", date: today, pitchId: "S5C", startTime: "17:00", endTime: "18:00", customer: "HuyFC", phone: "0987654321", status: "booked", paid: false, dayIndex: todayIdx, deposit: 100000, note: "10 áo Bib" },
            { id: "HD106", date: today, pitchId: "S5B", startTime: "18:00", endTime: "19:00", customer: "Anh Hoàng", phone: "0918888999", status: "playing", paid: false, dayIndex: todayIdx, deposit: 0, note: "Thu tiền sau trận" },
            { id: "HD105", date: today, pitchId: "S7A", startTime: "19:00", endTime: "20:00", customer: "FC Bình Minh", phone: "0987654321", status: "tournament", paid: true, dayIndex: todayIdx, deposit: 650000, note: "Giải Tứ Hùng" }
        ],

        products: [
            { id: "SP01", name: "Nước bù khoáng Revive Chanh Muối", category: "Nước uống", unit: "Chai", supplierId: "NCC01", costPrice: 7500, sellPrice: 12000, stock: 6, minStock: 24, expiryDate: addDaysISO(65), lastSoldDate: today, discountPercent: 0, promoLabel: "", image: "assets/img/sp01.jpg", images: ["assets/img/sp01.jpg"], sizeType: "none", sizes: [], icon: "bi-cup-straw" },
            { id: "SP02", name: "Nước tăng lực RedBull (Bò húc)", category: "Nước uống", unit: "Lon", supplierId: "NCC01", costPrice: 10000, sellPrice: 15000, stock: 8, minStock: 24, expiryDate: addDaysISO(12), lastSoldDate: today, discountPercent: 0, promoLabel: "", image: "assets/img/sp02.jpg", images: ["assets/img/sp02.jpg"], sizeType: "none", sizes: [], icon: "bi-lightning-charge-fill" },
            { id: "SP03", name: "Nước suối Aquafina 500ml", category: "Nước uống", unit: "Chai", supplierId: "NCC01", costPrice: 4000, sellPrice: 8000, stock: 65, minStock: 30, expiryDate: addDaysISO(120), lastSoldDate: today, discountPercent: 0, promoLabel: "", image: "assets/img/sp03.jpg", images: ["assets/img/sp03.jpg"], sizeType: "none", sizes: [], icon: "bi-droplet-fill" },
            { id: "SP04", name: "Trà đá ca lớn (Phục vụ tại sân)", category: "Nước uống", unit: "Ca", supplierId: "NCC01", costPrice: 3000, sellPrice: 15000, stock: 50, minStock: 10, expiryDate: "", lastSoldDate: today, discountPercent: 0, promoLabel: "", image: "assets/img/sp04.jpg", images: ["assets/img/sp04.jpg"], sizeType: "none", sizes: [], icon: "bi-cup-hot" },
            { id: "SP05", name: "Mì tôm trứng xúc xích", category: "Đồ ăn", unit: "Tô", supplierId: "NCC02", costPrice: 12000, sellPrice: 25000, stock: 35, minStock: 10, expiryDate: addDaysISO(10), lastSoldDate: addDaysISO(-2), discountPercent: 0, promoLabel: "", image: "assets/img/sp05.jpg", images: ["assets/img/sp05.jpg"], sizeType: "none", sizes: [], icon: "bi-egg-fried" },
            { id: "SP06", name: "Bánh mì ngọt / Xúc xích nướng", category: "Đồ ăn", unit: "Cái", supplierId: "NCC02", costPrice: 8000, sellPrice: 15000, stock: 18, minStock: 10, expiryDate: addDaysISO(1), lastSoldDate: addDaysISO(-1), discountPercent: 30, promoLabel: "Xả đồ ăn cận HSD", image: "assets/img/sp06.jpg", images: ["assets/img/sp06.jpg"], sizeType: "none", sizes: [], icon: "bi-bag-heart" },
            { id: "SP07", name: "Băng keo thể thao cuốn cổ chân", category: "Phụ kiện", unit: "Cuộn", supplierId: "NCC03", costPrice: 8000, sellPrice: 15000, stock: 4, minStock: 10, expiryDate: "", lastSoldDate: addDaysISO(-3), discountPercent: 0, promoLabel: "", image: "assets/img/sp07.jpg", images: ["assets/img/sp07.jpg"], sizeType: "none", sizes: [], icon: "bi-bandaid" },
            { id: "SP08", name: "Tất dệt kim chống trượt (Mẫu 2025)", category: "Phụ kiện", unit: "Đôi", supplierId: "NCC03", costPrice: 18000, sellPrice: 35000, stock: 22, minStock: 10, expiryDate: "", lastSoldDate: addDaysISO(-45), discountPercent: 20, promoLabel: "Xả mẫu cũ tồn kho", image: "assets/img/sp08.jpg", images: ["assets/img/sp08.jpg"], sizeType: "none", sizes: [], icon: "bi-universal-access" },
            { id: "SP09", name: "Thuê Áo Bib chia đội (10 áo/bộ)", category: "Phụ kiện", unit: "Bộ", supplierId: "NCC03", costPrice: 0, sellPrice: 30000, stock: 12, minStock: 3, expiryDate: "", lastSoldDate: today, discountPercent: 0, promoLabel: "", image: "assets/img/sp09.jpg", images: ["assets/img/sp09.jpg"], sizeType: "none", sizes: [], icon: "bi-person-badge" }
        ],

        posOrders: [
            {
                id: "POS01",
                date: today,
                customer: "Anh Tuấn (Sân 5A)",
                bookingId: "HD108",
                dayIndex: todayIdx,
                paid: true,
                time: `${today} 17:45`,
                voucherCode: "",
                voucherDiscount: 0,
                items: [
                    { productId: "SP01", qty: 6, originalPrice: 12000, unitPrice: 12000 },
                    { productId: "SP03", qty: 4, originalPrice: 8000, unitPrice: 8000 }
                ]
            },
            {
                id: "POS02",
                date: today,
                customer: "FC Bình Minh (Sân 7A)",
                bookingId: "HD105",
                dayIndex: todayIdx,
                paid: true,
                time: `${today} 19:30`,
                voucherCode: "KHUNGVANG10",
                voucherDiscount: 18000,
                items: [
                    { productId: "SP02", qty: 8, originalPrice: 15000, unitPrice: 15000 },
                    { productId: "SP09", qty: 2, originalPrice: 30000, unitPrice: 30000 }
                ]
            }
        ],

        inventoryLogs: [
            { id: "NK01", date: today, time: `${today} 08:30`, productName: "Nước suối Aquafina 500ml", supplierName: "NPP Nước giải khát Miền Trung", expiryDate: addDaysISO(120), type: "IMPORT", qty: 48, costPrice: 4000, note: "Nhập 2 thùng từ nhà cung cấp" },
            { id: "XK01", date: today, time: `${today} 17:45`, productName: "Nước bù khoáng Revive Chanh Muối", type: "EXPORT", qty: 6, note: "Bán hàng POS: Anh Tuấn (Sân 5A)" }
        ],

        tournaments: {
            name: "Giải Bóng Đá Phong Trào Tứ Hùng Mở Rộng - 2026",
            prize: "5.000.000đ + Cúp Vô Địch",
            location: "Cụm sân bóng openPitch (Sân 7A)",
            status: "Đang diễn ra",
            teams: [
                { id: "T01", name: "FC IT Đà Nẵng", captain: "Anh Tuấn", phone: "0905123456", group: "A" },
                { id: "T02", name: "FC Bình Minh", captain: "Anh Hải", phone: "0987654321", group: "A" },
                { id: "T03", name: "FC Ngân Hàng", captain: "Anh Nam", phone: "0912333444", group: "A" },
                { id: "T04", name: "FC Xây Dựng Trẻ", captain: "Anh Long", phone: "0935666777", group: "A" }
            ],
            matches: []
        }
    };
}

function getPitchData() {
    const raw = localStorage.getItem("OPENPITCH_DB");
    if (!raw) {
        const fresh = buildDefaultData();
        localStorage.setItem("OPENPITCH_DB", JSON.stringify(fresh));
        return fresh;
    }
    const parsed = JSON.parse(raw);
    const fresh = buildDefaultData();
    let migrated = false;

    if (parsed.openingCashFund === undefined) { parsed.openingCashFund = 0; migrated = true; }
    if (!parsed.pitches || parsed.pitches.length === 0) { parsed.pitches = fresh.pitches; migrated = true; }
    if (!parsed.categories || parsed.categories.length === 0) { parsed.categories = [...fresh.categories]; migrated = true; }
    if (!parsed.suppliers || parsed.suppliers.length === 0) { parsed.suppliers = fresh.suppliers; migrated = true; }
    if (!parsed.promotions) { parsed.promotions = fresh.promotions; migrated = true; }
    if (!parsed.posOrders) { parsed.posOrders = fresh.posOrders; migrated = true; }
    if (!parsed.timeSlots || !parsed.timeSlots[0].start) { parsed.timeSlots = fresh.timeSlots; migrated = true; }

    (parsed.products || []).forEach(p => {
        const ref = fresh.products.find(x => x.id === p.id);
        if (p.supplierId === undefined) { p.supplierId = ref ? ref.supplierId : "NCC01"; migrated = true; }
        if (p.expiryDate === undefined) { p.expiryDate = ref ? ref.expiryDate : ""; migrated = true; }
        if (p.lastSoldDate === undefined) { p.lastSoldDate = ref ? ref.lastSoldDate : getTodayISO(); migrated = true; }
        if (p.discountPercent === undefined) { p.discountPercent = ref ? ref.discountPercent : 0; migrated = true; }
        if (p.promoLabel === undefined) { p.promoLabel = ref ? ref.promoLabel : ""; migrated = true; }
        if (!p.image) { p.image = ref ? ref.image : ""; migrated = true; }
        if (!Array.isArray(p.images)) {
            p.images = p.image ? [p.image] : [];
            migrated = true;
        } else if (p.image && !p.images.includes(p.image)) {
            p.images.unshift(p.image);
            migrated = true;
        }
        if (!p.image && p.images.length > 0) { p.image = p.images[0]; migrated = true; }
        if (!Array.isArray(p.sizes)) { p.sizes = []; migrated = true; }
        if (!p.sizeType) { p.sizeType = p.sizes.length > 0 ? "custom" : "none"; migrated = true; }
        if (p.category && !parsed.categories.includes(p.category)) {
            parsed.categories.push(p.category);
            migrated = true;
        }
    });

    if (migrated) localStorage.setItem("OPENPITCH_DB", JSON.stringify(parsed));
    return parsed;
}

function savePitchData(data) {
    try {
        localStorage.setItem("OPENPITCH_DB", JSON.stringify(data));
        return true;
    } catch (err) {
        if (typeof showToast === "function") {
            showToast("Bộ nhớ trình duyệt đã đầy do quá nhiều ảnh lớn. Hãy xóa bớt ảnh cũ trong album!", "danger");
        } else {
            alert("Bộ nhớ trình duyệt đã đầy. Hãy xóa bớt ảnh cũ trong album!");
        }
        return false;
    }
}

function getBookingPrice(db, booking) {
    const pitch = db.pitches.find(p => p.id === booking.pitchId);
    if (!pitch) return 0;

    if (booking.startTime && booking.endTime) {
        const startMin = timeToMinutes(booking.startTime);
        const endMin = timeToMinutes(booking.endTime);
        const durationHours = Math.max(0.5, (endMin - startMin) / 60);
        const isPeak = startMin >= 17 * 60 && startMin < 21 * 60;
        const hourlyRate = isPeak ? Number(pitch.peakPrice) : Number(pitch.normalPrice);
        return Math.round(hourlyRate * durationHours);
    }

    const slot = db.timeSlots.find(s => s.id === booking.slotId);
    return (slot && slot.isPeak) ? Number(pitch.peakPrice) : Number(pitch.normalPrice);
}

function getBookingTimeLabel(db, booking) {
    if (booking.startTime && booking.endTime) {
        return `${booking.startTime} - ${booking.endTime}`;
    }
    const slot = db.timeSlots.find(s => s.id === booking.slotId);
    return slot ? slot.label : "";
}

// Tính doanh thu thực thu, giá vốn (COGS), khuyến mãi và phân bổ Voucher chuẩn 100% cho biểu đồ
function getPosOrderTotal(db, order) {
    let grossTotal = 0;
    let netItemsTotal = 0;
    let cost = 0;
    let rawFoodDrink = 0;
    let rawAccessory = 0;

    (order.items || []).forEach(it => {
        const prod = db.products.find(p => p.id === it.productId);
        const origPrice = it.originalPrice !== undefined
            ? Number(it.originalPrice)
            : (prod ? Number(prod.sellPrice) : Number(it.unitPrice || 0));
        const finalPrice = it.unitPrice !== undefined
            ? Number(it.unitPrice)
            : (prod ? getEffectiveSellPrice(prod) : origPrice);
        const costPrice = it.costPrice !== undefined
            ? Number(it.costPrice)
            : (prod ? Number(prod.costPrice) : 0);
        const qty = Number(it.qty || 0);

        grossTotal += origPrice * qty;
        const subNet = finalPrice * qty;
        netItemsTotal += subNet;
        cost += costPrice * qty;

        if (prod && (prod.category === "Nước uống" || prod.category === "Đồ ăn")) rawFoodDrink += subNet;
        else rawAccessory += subNet;
    });

    const productDiscount = Math.max(0, grossTotal - netItemsTotal);
    const voucherDiscount = Math.min(netItemsTotal, Number(order.voucherDiscount || 0));
    const total = Math.max(0, netItemsTotal - voucherDiscount);
    const totalDiscount = productDiscount + voucherDiscount;

    // Phân bổ voucherDiscount theo đúng tỷ lệ vào foodDrink và accessory để tổng luôn khớp 100%
    let foodDrink = rawFoodDrink;
    let accessory = rawAccessory;
    if (voucherDiscount > 0 && netItemsTotal > 0) {
        const fdVoucher = Math.round(voucherDiscount * (rawFoodDrink / netItemsTotal));
        const accVoucher = voucherDiscount - fdVoucher;
        foodDrink = Math.max(0, rawFoodDrink - fdVoucher);
        accessory = Math.max(0, rawAccessory - accVoucher);
    }

    return { grossTotal, productDiscount, voucherDiscount, totalDiscount, total, cost, foodDrink, accessory };
}

function getImportLogCost(db, log) {
    if (log.type !== "IMPORT") return 0;
    const prod = db.products.find(p => p.name === log.productName);
    const unitCost = log.costPrice !== undefined
        ? Number(log.costPrice)
        : (prod ? Number(prod.costPrice) : 0);
    return unitCost * Number(log.qty || 0);
}

function formatVND(amount) {
    return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

function resetDemoData() {
    if (confirm("Khôi phục lại dữ liệu gốc ban đầu của hệ thống?")) {
        localStorage.setItem("OPENPITCH_DB", JSON.stringify(buildDefaultData()));
        location.reload();
    }
}