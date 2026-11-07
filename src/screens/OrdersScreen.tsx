import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "../components/StatusBadge";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getOrdersByUser } from "../services/orderService";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useAuth, useCart } from "../store/hooks";
import { formatDateTime } from "../utils/format";
import { showMessage } from "../utils/dialog";
import { RootScreenProps } from "../navigation/types";
import { Order, OrderStatus } from "../types";
import { colors, formatPrice, radius } from "../theme";

export const PAYMENT_LABEL = { cod: "Thanh toán khi nhận hàng (COD)", bank: "Chuyển khoản ngân hàng" } as const;
const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Tất cả", value: "all" }, { label: "Chờ xác nhận", value: "pending" },
  { label: "Đang giao", value: "shipping" }, { label: "Hoàn tất", value: "completed" },
  { label: "Đã huỷ", value: "cancelled" },
];

export function OrdersScreen({ navigation }: RootScreenProps<"Orders">) {
  const { user, isLoggedIn } = useAuth();
  const { items: cartItems, add, setQty } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const visibleOrders = useMemo(() => filter === "all" ? orders : orders.filter(o => o.status === filter), [orders, filter]);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const list = await getOrdersByUser(user.id);
      setOrders([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [user?.id]);
  useEffect(() => { load(); }, [load]);

  const reorder = async (order: Order) => {
    try {
      const books = await getBooks();
      const added = new Map<number, number>();
      for (const item of order.items) {
        const book = books.find(b => b.id === item.bookId);
        if (!book) continue;
        const current = cartItems.find(c => c.bookId === item.bookId)?.quantity ?? 0;
        const alreadyAdded = added.get(item.bookId) ?? 0;
        const available = Math.max(0, book.stock - current - alreadyAdded);
        const count = Math.min(item.quantity, available);
        if (count <= 0) continue;
        if (current + alreadyAdded > 0) {
          setQty(item.bookId, current + alreadyAdded + count);
        } else {
          add({ bookId: book.id, title: book.title, price: book.price, emoji: book.emoji, color: book.color, stock: book.stock });
          if (count > 1) setQty(book.id, count);
        }
        added.set(item.bookId, alreadyAdded + count);
      }
      if (added.size) navigation.navigate("Tabs", { screen: "Cart" });
      else showMessage("Không thể mua lại", "Các sản phẩm trong đơn hiện đã hết hàng.");
    } catch (e) { showMessage("Không thể mua lại", getErrorMessage(e)); }
  };

  if (!isLoggedIn) return <EmptyState emoji="🔒" title="Bạn cần đăng nhập" actionLabel="Đăng nhập" onAction={() => navigation.navigate("Login")} />;
  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      <View style={{ height: 46 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: "center" }}>
          {FILTERS.map(f => <Pressable key={f.value} onPress={() => setFilter(f.value)} style={[styles.chip, filter === f.value && styles.selected]}>
            <Text style={{ color: filter === f.value ? "#fff" : colors.navy, fontWeight: "700" }}>{f.label}</Text>
          </Pressable>)}
        </ScrollView>
      </View>
      <FlatList data={visibleOrders} keyExtractor={o => String(o.id)} contentContainerStyle={{ gap: 10, paddingBottom: 32 }}
        ListEmptyComponent={<EmptyState emoji="🧾" title={filter === "all" ? "Bạn chưa có đơn hàng nào" : "Không có đơn ở trạng thái này"} actionLabel="Mua sắm ngay" onAction={() => navigation.navigate("Tabs", { screen: "Home" })} />}
        renderItem={({ item: o }) => {
          const open = openId === o.id;
          return <View style={styles.card}>
            <Pressable onPress={() => setOpenId(open ? null : o.id)} style={styles.heading}>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={styles.title}>Đơn #{o.id}</Text>
                <Text style={styles.muted}>{formatDateTime(o.createdAt)}</Text>
                <Text style={styles.price}>{formatPrice(o.total)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 10 }}>
                <StatusBadge status={o.status} />
                <Text style={styles.muted}>Chi tiết {open ? "▲" : "▼"}</Text>
              </View>
            </Pressable>
            {open && <View style={styles.detail}>
              <Text style={styles.title}>Sản phẩm</Text>
              {o.items.map((i, index) => <View key={`${i.bookId}-${index}`} style={styles.line}>
                <Text style={{ flex: 1, color: colors.text }}>{i.title} × {i.quantity}</Text>
                <Text style={{ color: colors.text }}>{formatPrice(i.price * i.quantity)}</Text>
              </View>)}
              <Text style={styles.title}>Giao đến</Text>
              <Text style={styles.muted}>{o.address.name} · {o.address.phone}</Text>
              <Text style={styles.muted}>{o.address.address}</Text>
              <Text style={styles.title}>Thanh toán</Text>
              <Text style={styles.muted}>{PAYMENT_LABEL[o.paymentMethod]}</Text>
              {o.status === "completed" && <PrimaryButton title="Mua lại" variant="outline" onPress={() => reorder(o)} />}
            </View>}
          </View>;
        }} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 12 },
  card: { backgroundColor: "#fff", borderRadius: radius.md, padding: 14 },
  heading: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  title: { color: colors.navy, fontWeight: "800", fontSize: 15 },
  muted: { color: colors.muted, fontSize: 13 },
  price: { color: colors.indigo, fontWeight: "800" },
  detail: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 12, paddingTop: 12, gap: 8 },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: "#fff" },
  selected: { backgroundColor: colors.indigo, borderColor: colors.indigo },
});
