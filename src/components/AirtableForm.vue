<script>
export default {
    data() {
        return {
            API_URL: import.meta.env.VITE_AIRTABLE_API_URL,
            API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY,
            form: {
                "Azienda o Persona": "",
                "Nome (completo come da documenti)": "",
                "Cognome": "",
                "Codice fiscale": "",
                "Data di nascita (dd/mm/aa)": "",
                "Mail": "",
                "IBAN": ""
            },
            attachments: {
                "Carta d'identità fronte": [],
                "Carta d'identità retro": []
            },
            success: false,
            error: null
        }
    },
    methods: {
        async handleFileUpload(event, fieldName) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('https://upload.airtable.com/v0/upload', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`
                    },
                    body: formData
                });

                const data = await res.json();
                if (data && data.url) {
                    this.attachments[fieldName] = [{ url: data.url }];
                }
            } catch (err) {
                this.error = "Errore durante l'upload del file.";
            }
        },
        async handleSubmit() {
            this.success = false;
            this.error = null;

            const fieldsToSend = {
                ...this.form,
                "Carta d'identità fronte": this.attachments["Carta d'identità fronte"],
                "Carta d'identità retro": this.attachments["Carta d'identità retro"]
            };

            try {
                const res = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ records: [{ fields: fieldsToSend }] })
                });

                const result = await res.json();
                if (result.records) {
                    this.success = true;
                    this.form = {
                        "Azienda o Persona": "",
                        "Nome (completo come da documenti)": "",
                        "Cognome": "",
                        "Codice fiscale": "",
                        "Data di nascita (dd/mm/aa)": "",
                        "Mail": "",
                        "IBAN": ""
                    };
                    this.attachments = {
                        "Carta d'identità fronte": [],
                        "Carta d'identità retro": []
                    };
                } else {
                    this.error = 'Errore durante l\'invio dei dati.';
                }
            } catch (err) {
                this.error = err.message || 'Errore sconosciuto.';
            }
        }
    }
}
</script>


<template>
    <div class="p-4">
        <h2 class="mb-4 fw-bold">Inserisci Nuovo Profilo</h2>

        <form @submit.prevent="handleSubmit" class="form-grid">
            <!-- Azienda o Persona -->
            <div class="form-item">
                <label class="form-label">Azienda o Persona</label>
                <select v-model="form['Azienda o Persona']" class="form-control" required>
                    <option disabled value="">Seleziona</option>
                    <option>Persona (Citizen)</option>
                    <option>Azienda (Company)</option>
                </select>
            </div>

            <!-- Nome -->
            <div class="form-item">
                <label class="form-label">Nome</label>
                <input v-model="form['Nome (completo come da documenti)']" class="form-control" required />
            </div>

            <!-- Cognome -->
            <div class="form-item">
                <label class="form-label">Cognome</label>
                <input v-model="form['Cognome']" class="form-control" required />
            </div>

            <!-- Codice Fiscale -->
            <div class="form-item">
                <label class="form-label">Codice Fiscale</label>
                <input v-model="form['Codice fiscale']" class="form-control" required />
            </div>

            <!-- Data di nascita -->
            <div class="form-item">
                <label class="form-label">Data di Nascita</label>
                <input type="date" v-model="form['Data di nascita (dd/mm/aa)']" class="form-control" required />
            </div>

            <!-- Email -->
            <div class="form-item">
                <label class="form-label">Email</label>
                <input type="email" v-model="form['Mail']" class="form-control" />
            </div>

            <!-- IBAN -->
            <div class="form-item">
                <label class="form-label">IBAN</label>
                <input v-model="form['IBAN']" class="form-control" />
            </div>

            <!-- Carta identità fronte -->
            <div class="form-item">
                <label class="form-label">Carta d'identità - Fronte</label>
                <input type="file" @change="handleFileUpload($event, 'Carta d\'identità fronte')"
                    class="form-control" />
            </div>

            <!-- Carta identità retro -->
            <div class="form-item">
                <label class="form-label">Carta d'identità - Retro</label>
                <input type="file" @change="handleFileUpload($event, 'Carta d\'identità retro')" class="form-control" />
            </div>

            <!-- Submit -->
            <div class="form-item full-width">
                <button type="submit" class="btn btn-primary">Invia</button>
            </div>

            <!-- Success/Error -->
            <div v-if="success" class="text-success full-width">✅ Record inserito con successo!</div>
            <div v-if="error" class="text-danger full-width">❌ Errore: {{ error }}</div>
        </form>
    </div>
</template>

<style scoped>
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    max-width: 1000px;
}

.form-item {
    display: flex;
    flex-direction: column;
}

.full-width {
    grid-column: 1 / -1;
}

.form-control {
    padding: 8px;
    font-size: 1rem;
}
</style>
