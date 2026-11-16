// =========================================================
// KHO DỮ LIỆU MẪU HỆ THỐNG OPENPITCH (FULL 6 CHỨC NĂNG)
// =========================================================

const DEFAULT_DATA = {
    // 1. Danh sách sân bóng
    pitches: [
        { id: "S5A", name: "Sân 5A", type: "Sân 5 người", normalPrice: 250000, peakPrice: 350000, status: "active", note: "Cỏ nhân tạo mới thay T9/2026" },
        { id: "S5B", name: "Sân 5B", type: "Sân 5 người", normalPrice: 250000, peakPrice: 350000, status: "active", note: "Gần căng-tin, đèn LED mới" },
        { id: "S5C", name: "Sân 5C", type: "Sân 5 người", normalPrice: 230000, peakPrice: 320000, status: "maintenance", note: "Đang bảo trì lưới chắn bóng" },
        { id: "S7A", name: "Sân 7A (Sân chính)", type: "Sân 7 người", normalPrice: 500000, peakPrice: 650000, status: "active", note: "Có khán đài mini tổ chức giải" }
    ],

    // 2. Các khung giờ hoạt động
    timeSlots: [
        { id: "T1", label: "15:00 - 16:30", isPeak: false },
        { id: "T2", label: "16:30 - 18:00", isPeak: true },
        { id: "T3", label: "18:00 - 19:30", isPeak: true },
        { id: "T4", label: "19:30 - 21:00", isPeak: true },
        { id: "T5", label: "21:00 - 22:30", isPeak: false }
    ],

    // 3. Lịch đặt sân
    bookings: [
        { id: "BK01", pitchId: "S5A", slotId: "T2", customer: "Anh Tuấn (FC IT)", phone: "0905123456", status: "playing", deposit: 100000, note: "Khách quen thứ 2-4-6" },
        { id: "BK02", pitchId: "S5A", slotId: "T3", customer: "Anh Khoa", phone: "0918888999", status: "booked", deposit: 150000, note: "Mượn 10 áo Bib" },
        { id: "BK03", pitchId: "S5B", slotId: "T3", customer: "FC Bình Minh", phone: "0987654321", status: "playing", deposit: 0, note: "Thu tiền sau trận" },
        { id: "BK04", pitchId: "S7A", slotId: "T4", customer: "Giải Tứ Hùng (Bán kết)", phone: "0933111222", status: "tournament", deposit: 650000, note: "Trận bán kết 1" }
    ],

    // 4. Hàng hóa & Tồn kho (Nước uống, Đồ ăn, Phụ kiện bóng đá)
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

    // 5. Lịch sử Nhập / Xuất kho
    inventoryLogs: [
        { id: "NK01", time: "16/11/2026 08:30", productName: "Nước suối Aquafina 500ml", type: "IMPORT", qty: 48, note: "Nhập 2 thùng từ đại lý Minh Phát" },
        { id: "XK01", time: "16/11/2026 17:45", productName: "Nước bù khoáng Revive Chanh Muối", type: "EXPORT", qty: 12, note: "Xuất bán Sân 5A (Anh Tuấn)" },
        { id: "XK02", time: "16/11/2026 18:15", productName: "Băng keo thể thao cuốn cổ chân", type: "EXPORT", qty: 4, note: "Xuất bán lẻ tại quầy" }
    ],

    // 6. Dữ liệu Giải đấu phong trào
    tournaments: {
        name: "Giải Bóng Đá Phong Trào Tứ Hùng Mở Rộng - Cup Hiệp Phát 2026",
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
            { id: "M03", round: "Vòng 2", teamA: "FC IT Đà Nẵng", scoreA: 2, scoreB: 0, teamB: "FC Ngân Hàng", time: "18:00 - Sân 7A", played: true },
            { id: "M04", round: "Vòng 2", teamA: "FC Bình Minh", scoreA: 4, scoreB: 1, teamB: "FC Xây Dựng Trẻ", time: "19:30 - Sân 7A", played: true },
            { id: "M05", round: "Lượt cuối", teamA: "FC IT Đà Nẵng", scoreA: null, scoreB: null, teamB: "FC Xây Dựng Trẻ", time: "18:00 (18/11) - Sân 7A", played: false },
            { id: "M06", round: "Lượt cuối", teamA: "FC Bình Minh", scoreA: null, scoreB: null, teamB: "FC Ngân Hàng", time: "19:30 (18/11) - Sân 7A", played: false }
        ]
    }
};

function getPitchData() {
    const raw = localStorage.getItem("OPENPITCH_DB");
    if (!raw) {
        localStorage.setItem("OPENPITCH_DB", JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    // Tự động bổ sung nếu bản cũ chưa có products hoặc tournaments
    if (!parsed.products) {
        parsed.products = DEFAULT_DATA.products;
        parsed.inventoryLogs = DEFAULT_DATA.inventoryLogs;
        parsed.tournaments = DEFAULT_DATA.tournaments;
        localStorage.setItem("OPENPITCH_DB", JSON.stringify(parsed));
    }
    return parsed;
}

function savePitchData(data) {
    localStorage.setItem("OPENPITCH_DB", JSON.stringify(data));
}

function formatVND(amount) {
    return Number(amount).toLocaleString("vi-VN") + "đ";
}

function resetDemoData() {
    if (confirm("Khôi phục toàn bộ dữ liệu mẫu ban đầu của hệ thống openPitch?")) {
        localStorage.setItem("OPENPITCH_DB", JSON.stringify(DEFAULT_DATA));
        location.reload();
    }
}