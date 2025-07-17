// admin-frontend/src/vue-orders.js
import { createApp } from 'vue';
import OrdersTable from './components/OrdersTable.vue';

const app = createApp(OrdersTable, {
  orders: window.__INITIAL_ORDERS__ || []
});

app.mount('#vue-orders');
