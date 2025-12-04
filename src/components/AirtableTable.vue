<script>
export default {
  name: 'AirtableTable',
  data() {
    return {
      API_URL: import.meta.env.VITE_AIRTABLE_API_URL,
      API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY,
      records: [],
      loading: false,
      error: null
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch(this.API_URL + '?pageSize=100', {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`
          }
        });
        const data = await res.json();
        if (data.records) {
          this.records = data.records;
        } else {
          this.error = 'Nessun record trovato';
          console.error(this.error, data);
        }
      } catch (err) {
        this.error = err.message || 'Errore durante la richiesta';
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },
    formatNumber(raw) {
      if (!raw) return '';
      // Rimuove apostrofi, spazi, parentesi e caratteri non numerici tranne il +
      return raw.replace(/['\s()-]/g, '');
    },
    openWhatsApp(number, name, link) {
    const cleanNumber = this.formatNumber(number);
    const message = `Ciao ${name}, questo è un messaggio automatico, ecco il link che ti interessa: ${link}`;
    const url = `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    }
  }
}
</script>



<template>
  <div>
    <h2 class="mb-3">Airtable - Personale Sync</h2>

    <div v-if="loading" class="text-warning">Caricamento...</div>
    <div v-else-if="error" class="text-danger fw-semibold">Errore: {{ error }}</div>

    <div v-else class="table-responsive" style="max-height:70vh; overflow-y:auto;">
      <table class="table table-striped table-hover mb-0">
        <thead class="table-dark sticky-top">
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Mansione</th>
            <th>Numero pulito</th>
            <th>link</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>{{ record.fields['Nome (completo come da documenti)'] || record.fields['Nome'] }}</td>
            <td>{{ record.fields['Cognome'] }}</td>
            <td>{{ record.fields['Mansione'] }}</td>
            <td>{{ formatNumber(record.fields['Numero+']) }}</td>
            <td>{{ record.fields['TEST INTERAZIONE'] }}</td>
            <td>
              <button class="btn btn-success btn-sm"
                      @click="openWhatsApp(
                        record.fields['Numero+'], 
                        record.fields['Nome (completo come da documenti)'] || record.fields['Nome'],
                        record.fields['TEST INTERAZIONE'])">
                WhatsApp
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      </div>
  </div>
</template>

<style scoped>
.table-responsive {
  max-height: 70vh;
  overflow-y: auto;

}

thead.sticky-top {
  top: 0;
  z-index: 10;

}
</style>