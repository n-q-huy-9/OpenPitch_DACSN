// =========================================================
// KHO DỮ LIỆU & KẾ TOÁN THỰC TẾ HỆ THỐNG OPENPITCH
// =========================================================

function getTodayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getCurrentMonthISO() {
    return getTodayISO().slice(0, 7); // VD: "2026-11"
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

function buildDefaultData() {
    const today = getTodayISO();
    const todayIdx = getDayIndexFromISO(today);

    return {
        // Quỹ tiền mặt đầu kỳ trước khi dùng phần mềm (mặc định 0đ, chủ sân tự sửa nếu cần)
        openingCashFund: 0,

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
            { id: "SP01", name: "Nước bù khoáng Revive Chanh Muối", category: "Nước uống", unit: "Chai", costPrice: 7500, sellPrice: 12000, stock: 6, minStock: 24, icon: "bi-cup-straw" },
            { id: "SP02", name: "Nước tăng lực RedBull (Bò húc)", category: "Nước uống", unit: "Lon", costPrice: 10000, sellPrice: 15000, stock: 8, minStock: 24, icon: "bi-lightning-charge-fill" },
            { id: "SP03", name: "Nước suối Aquafina 500ml", category: "Nước uống", unit: "Chai", costPrice: 4000, sellPrice: 8000, stock: 65, minStock: 30, icon: "bi-droplet-fill" },
            { id: "SP04", name: "Trà đá ca lớn (Phục vụ tại sân)", category: "Nước uống", unit: "Ca", costPrice: 3000, sellPrice: 15000, stock: 50, minStock: 10, icon: "bi-cup-hot" },
            { id: "SP05", name: "Mì tôm trứng xúc xích", category: "Đồ ăn", unit: "Tô", costPrice: 12000, sellPrice: 25000, stock: 35, minStock: 10, icon: "bi-egg-fried" },
            { id: "SP06", name: "Bánh mì ngọt / Xúc xích nướng", category: "Đồ ăn", unit: "Cái", costPrice: 8000, sellPrice: 15000, stock: 18, minStock: 10, icon: "bi-bag-heart" },
            { id: "SP07", name: "Băng keo thể thao cuốn cổ chân", category: "Phụ kiện", unit: "Cuộn", costPrice: 8000, sellPrice: 15000, stock: 4, minStock: 10, icon: "bi-bandaid" },
            { id: "SP08", name: "Tất dệt kim chống trượt đá bóng", category: "Phụ kiện", unit: "Đôi", costPrice: 18000, sellPrice: 35000, stock: 22, minStock: 10, icon: "bi-universal-access" },
            { id: "SP09", name: "Thuê Áo Bib chia đội (10 áo/bộ)", category: "Phụ kiện", unit: "Bộ", costPrice: 0, sellPrice: 30000, stock: 12, minStock: 3, icon: "bi-person-badge" }
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
                items: [
                    { productId: "SP01", qty: 6 },
                    { productId: "SP03", qty: 4 }
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
                items: [
                    { productId: "SP02", qty: 8 },
                    { productId: "SP09", qty: 2 }
                ]
            }
        ],

        inventoryLogs: [
            { id: "NK01", date: today, time: `${today} 08:30`, productName: "Nước suối Aquafina 500ml", type: "IMPORT", qty: 48, costPrice: 4000, note: "Nhập 2 thùng từ đại lý" },
            { id: "XK01", date: today, time: `${today} 17:45`, productName: "Nước bù khoáng Revive Chanh Muối", type: "EXPORT", qty: 6, note: "Bán hàng POS: Anh Tuấn (Sân 5A)" }
        ],

        tournaments: {
            name: "Giải Bóng Đá Phong Trào Tứ Hùng Mở Rộng - 2026",
            prize: "5.000.000đ + Cúp Vô Địch",
            status: "Đang diễn ra",
            teams: [
                { id: "T01", name: "FC IT Đà Nẵng", captain: "Anh Tuấn", phone: "0905123456", played: 2, won: 2, drawn: 0, lost: 0, gd: "+4", points: 6 },
                { id: "T02", name: "FC Bình Minh", captain: "Anh Hải", phone: "0987654321", played: 2, won: 1, drawn: 0, lost: 1, gd: "+1", points: 3 },
                { id: "T03", name: "FC Ngân Hàng", captain: "Anh Nam", phone: "0912333444", played: 2, won: 1, drawn: 0, lost: 1, gd: "-1", points: 3 },
                { id: "T04", name: "FC Xây Dựng Trẻ", captain: "Anh Long", phone: "0935666777", played: 2, won: 0, drawn: 0, lost: 2, gd: "-4", points: 0 }
            ],
            matches: [
                { id: "M01", round: "Vòng 1", teamA: "FC IT Đà Nẵng", scoreA: 3, scoreB: 1, teamB: "FC Bình Minh", time: "18:00 - Sân 7A", played: true },
                { id: "M02", round: "Vòng 1", teamA: "FC Ngân Hàng", scoreA: 2, scoreB: 0, teamB: "FC Xây Dựng Trẻ", time: "19:30 - Sân 7A", played: true },
                { id: "M03", round: "Lượt cuối", teamA: "FC IT Đà Nẵng", scoreA: null, scoreB: null, teamB: "FC Xây Dựng Trẻ", time: "18:00 - Sân 7A", played: false }
            ]
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
    if (parsed.openingCashFund === undefined) parsed.openingCashFund = 0;
    if (!parsed.posOrders) parsed.posOrders = fresh.posOrders;
    if (!parsed.timeSlots || !parsed.timeSlots[0].start) parsed.timeSlots = fresh.timeSlots;
    return parsed;
}

function savePitchData(data) {
    localStorage.setItem("OPENPITCH_DB", JSON.stringify(data));
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

// Tính doanh thu & giá vốn (COGS) của từng đơn bán hàng POS
function getPosOrderTotal(db, order) {
    let total = 0;
    let cost = 0;
    let foodDrink = 0;
    let accessory = 0;
    (order.items || []).forEach(it => {
        const prod = db.products.find(p => p.id === it.productId);
        const sellPrice = prod ? Number(prod.sellPrice) : Number(it.unitPrice || 0);
        const costPrice = prod ? Number(prod.costPrice) : 0;
        const qty = Number(it.qty || 0);

        const sub = sellPrice * qty;
        total += sub;
        cost += costPrice * qty;

        if (prod && prod.category === "Phụ kiện") accessory += sub;
        else foodDrink += sub;
    });
    return { total, cost, foodDrink, accessory };
}

// Tính chi phí của 1 phiếu nhập kho
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