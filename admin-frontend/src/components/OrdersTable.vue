<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="text-primary fw-bold mb-0">
        <i class="bi bi-bag-check-fill me-2 text-primary"></i>Orders
      </h2>
    </div>

    <!-- Orders Card -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-center">
            <thead class="table-light">
              <tr>
                <th>#Order ID</th>
                <th>Customer</th>
                <th>Total (₹)</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" class="align-middle">
                <td class="fw-medium text-secondary">#{{ order.id }}</td>
                <td>
                  <div class="fw-semibold">{{ order.user?.name }}</div>
                  <div class="text-muted small">{{ order.user?.email }}</div>
                </td>
                <td class="fw-bold text-success">₹{{ order.total.toLocaleString('en-IN') }}</td>
                <td>{{ order.items?.length }}</td>
                <td>
                  <span
                    class="badge text-capitalize px-3 py-1 rounded-pill fs-6"
                    :class="{
                      'bg-success': order.status === 'completed',
                      'bg-warning text-dark': order.status === 'pending',
                      'bg-danger': order.status === 'cancelled',
                      'bg-secondary': !['completed', 'pending', 'cancelled'].includes(order.status)
                    }"
                  >
                    {{ order.status }}
                  </span>
                </td>
                <td class="text-muted">{{ formatDate(order.createdAt) }}</td>
                <td>
                  <button class="btn btn-outline-primary btn-sm" @click="openModal(order)">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="orders.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-3 mb-2"></i><br />
                  No orders available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Order Modal -->
    <div v-if="showModal">
      <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-receipt me-2"></i>Order #{{ selected.id }}
              </h5>
              <button class="btn-close btn-close-white" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <strong>Customer:</strong> {{ selected.user?.name }} ({{ selected.user?.email }})
              </div>
              <div class="mb-3">
                <strong>Status:</strong>
                <span
                  class="badge text-capitalize px-3 py-1 rounded-pill"
                  :class="{
                    'bg-success': selected.status === 'completed',
                    'bg-warning text-dark': selected.status === 'pending',
                    'bg-danger': selected.status === 'cancelled',
                    'bg-secondary': !['completed', 'pending', 'cancelled'].includes(selected.status)
                  }"
                >
                  {{ selected.status }}
                </span>
              </div>
              <div class="mb-3">
                <strong>Total:</strong> ₹{{ selected.total.toLocaleString('en-IN') }}
              </div>

              <hr class="my-3" />
              <h6 class="text-muted mb-2"><i class="bi bi-list-check me-2"></i>Item List</h6>

              <ul class="list-group">
                <li
                  v-for="item in selected.items"
                  :key="item.id"
                  class="list-group-item d-flex justify-content-between fw-medium"
                >
                  <span>{{ item.product?.name }}</span>
                  <span class="text-success">
                    ₹{{ item.price }} × {{ item.quantity }}
                  </span>
                </li>
              </ul>
            </div>
            <div class="modal-footer bg-light">
              <button class="btn btn-secondary" @click="closeModal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';

const props = defineProps({
  orders: Array
});

const orders = ref(props.orders);
const showModal = ref(false);
const selected = ref({});

function openModal(order) {
  selected.value = order;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
</script>


<style scoped>
.modal-backdrop {
  z-index: 1040;
}
.modal {
  z-index: 1050;
}
.table td,
.table th {
  vertical-align: middle;
}
</style>
