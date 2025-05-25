<script>
import AirtableForm from '../components/AirtableForm.vue';
import AirtableTable from '../components/AirtableTable.vue';

export default {
  components: {
    AirtableTable,
    AirtableForm
  },
  data() {
    return {
      showFormModal: false,
    };
  },
  methods: {
    openForm() {
      this.showFormModal = true;
    },
    closeForm() {
      this.showFormModal = false;
    }
  }
};
</script>

<template>
  <section class="bg-dark text-white min-vh-100 p-4">
    <div class="d-flex justify-content-end mb-4">
      <button class="btn btn-primary" @click="openForm">➕ Nuovo Profilo</button>
    </div>

    <AirtableTable />

    <!-- Modal Nuovo Record -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content bg-white text-dark p-4 rounded shadow">
        <button class="btn-close float-end" @click="closeForm"></button>
        <AirtableForm />
      </div>
    </div>
  </section>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
  position: relative;
}
</style>
