<script>
export default {
  name: 'RecordEditor',
  data() {
    return {
      API_URL: import.meta.env.VITE_AIRTABLE_API_URL,
      API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY,
      recordId: null,
      formFields: {},
      loading: true,
      error: null,
      saving: false,
      timeRemaining: 300,
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
      const seconds = (this.timeRemaining % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
  },
  mounted() {
    console.log('componente montato');

    // Timer countdown visuale
    this.startCountdown();

    this.recordId = this.$route.query.recordId;
    if (this.recordId) {
      this.fetchRecord(this.recordId);
    } else {
      this.error = 'Nessun record selezionato';
      this.loading = false;
    }
  },
  methods: {
    startCountdown() {
      const countdown = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(countdown);
          this.expired = true;
          this.error = 'Il tempo per modificare il record è scaduto.';
        }
      }, 1000);
    },
    async fetchRecord(id) {
      try {
        const res = await fetch(`${this.API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${this.API_KEY}` }
        });
        const data = await res.json();
        if (data.fields) {
          this.formFields = data.fields;
        } else {
          this.error = 'Record non trovato';
        }
      } catch (err) {
        this.error = err.message || 'Errore caricamento record';
      } finally {
        this.loading = false;
      }
    },
    getWritableFields(fields) {
      // stessa lista campi non modificabili di AirtableTable
      const nonWritable = [
        'PROFILATI',
        'CAP',
        'CAP (from Residenza (CAP))', 
        'COD.FISCALE+',
        'IBAN+',
        'Numero+',
        'Double Check',
        'Residenza 1line',
        'Luogo di nascita 1line',
        'Via e civico Residenza',
        'MAat+Cod+Aliq',
        'Regime P.iva CARBONE',
        'Mansione solo italiano',
        'Inq.Lucia',
        'Permesso 1line',
        'p.ivaAlkemy',
        'Cittadinanza e permesso',
        'Città e provincia Residenza',
        'Tipologia Lavoratore'
      ];
      const filtered = {};
      for (const key in fields) {
          if (!nonWritable.includes(key)) {
              filtered[key] = fields[key];
          }
      }
      return filtered;
    },
    async saveChanges() {
      console.log('cliccato');
      this.saving = true;
      try {
        const writableFields = this.getWritableFields(this.formFields);
        console.log('WILL SAVE FIELDS:', writableFields);
        const response = await fetch(`${this.API_URL}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [
              {
                id: this.recordId,
                fields: writableFields
              }
            ]
          }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Errore durante il salvataggio');
        }
        alert('Salvataggio avvenuto con successo!');
      } catch (error) {
        alert(error.message);
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="p-4 text-white">
      <div v-if="!expired" class="mt-3 text-warning">
        Tempo rimanente: {{ formattedTime }}
      </div>
      <h2 class="mb-4">Modifica Record</h2>
  
      <div v-if="loading" class="fs-5">Caricamento record...</div>
      <div v-else-if="error" class="text-danger fs-5">{{ error }}</div>
      <div v-else>
        <div class="row g-3">
          <div 
            v-for="(value, key) in formFields" 
            :key="key" 
            class="col-md-6 d-flex flex-column"
          >
            <label :for="key" class="form-label fw-semibold text-light">
              {{ key }}
            </label>
            <input
              type="text"
              class="form-control form-control-sm shadow-sm"
              v-model="formFields[key]"
              :id="key"
              :disabled="expired"
            />
          </div>
        </div>
  
        <button 
          class="btn btn-primary mt-4 px-4" 
          @click="saveChanges" 
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salva modifiche' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sfondo leggermente trasparente per input */
input.form-control {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #555;
  color: white;
  transition: border-color 0.3s ease;
}

input.form-control:focus {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #0d6efd; /* colore bootstrap primary */
  box-shadow: 0 0 5px rgba(13, 110, 253, 0.5);
  color: white;
}

/* Label un po’ più leggibili */
label.form-label {
  text-transform: capitalize;
}

/* Pulsante più grande e con ombra */
button.btn-primary {
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.5);
}
</style>

