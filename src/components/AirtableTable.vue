<script>
export default {
    name: 'AirtableTable',
    data() {
        return {
            API_URL: import.meta.env.VITE_AIRTABLE_API_URL,
            API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY,
            records: [],
            headers: [],
            loading: false,
            error: null,
            currentOffset: null,
            nextOffset: null,
            previousOffsets: [],
            pageIndex: 0,

            showModal: false,
            recordToEdit: null,
            formFields: {},
            saving: false,
            showLinkModal: false,
            linkToShare: '',
        }
    },

    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData(offset = null) {
            this.loading = true;
            this.error = null;
            try {
                let url = new URL(this.API_URL);
                url.searchParams.append('pageSize', 100);
                if (offset) {
                    url.searchParams.append('offset', offset);
                }

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`
                    }
                });

                const data = await res.json();

                if (data.records) {
                    this.records = data.records;

                    if (!this.headers.length && data.records.length) {
                        this.headers = Object.keys(data.records[0]?.fields || {});
                    }

                    // Salva offset
                    if (offset && this.currentOffset) {
                        this.previousOffsets.push(this.currentOffset);
                    }
                    this.currentOffset = offset;
                    this.nextOffset = data.offset || null;
                } else {
                    this.error = 'Nessun record trovato';
                }
            } catch (err) {
                this.error = err.message || 'Errore durante la richiesta';
            } finally {
                this.loading = false;
            }
        },
        async deleteRecord(recordId) {
            if (!confirm('Sei sicuro di voler eliminare questo record?')) return;

            try {
                const response = await fetch(`${this.API_URL}/${recordId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`
                    }
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error?.message || 'Errore durante la cancellazione');
                }

                // Ricarica la lista dei dati
                await this.fetchData(this.currentOffset);
            } catch (error) {
                alert(error.message);
            }
        },
        goNext() {
            if (this.nextOffset) {
                this.pageIndex += 1;
                this.fetchData(this.nextOffset);
            }
        },
        goPrevious() {
            const prevOffset = this.previousOffsets.pop();
            if (prevOffset !== undefined) {
                this.pageIndex -= 1;
                this.fetchData(prevOffset);
            }
        },
        isImageField(value) {
            return Array.isArray(value) && value[0]?.thumbnails?.large?.url;
        },
        getTextValue(value) {
            if (Array.isArray(value)) {
                return value.map(v =>
                    typeof v === 'object' ? JSON.stringify(v) : v
                ).join(', ');
            }
            return value || '-';
        },
          editRecord(record) {
            this.recordToEdit = record;
            this.formFields = { ...record.fields };
            this.showModal = true;
        },
        getWritableFields(fields) {
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
        if (!this.recordToEdit) return;

        this.saving = true;
        try {
            const writableFields = this.getWritableFields(this.formFields);

            const response = await fetch(`${this.API_URL}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [
                {
                    id: this.recordToEdit.id,
                    fields: writableFields
                }
                ]
            }),
            });

            if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Errore durante il salvataggio');
            }

            this.showModal = false;
            await this.fetchData(this.currentOffset);
        } catch (error) {
            alert(error.message);
        } finally {
            this.saving = false;
        }
        },
            generateEditLink(record) {
            // Ottieni l'origine completa tipo "http://localhost:5173"
            const baseUrl = window.location.origin;
            console.log(window.location.origin)
            
            // Costruisci il link completo (history mode)
            const link = `${baseUrl}/edit-record?recordId=${record.id}`;

            // Copia negli appunti
            navigator.clipboard.writeText(link).then(() => {
                console.log('link generato correttamente')
            }).catch(() => {
                alert('Impossibile copiare il link negli appunti. Ecco il link:\n' + link);
            });

            this.linkToShare = link;
            this.showLinkModal = true;
            },

        closeModal() {
            this.showModal = false;
        },

        openWhatsApp() {
        const message = encodeURIComponent(`Ciao! Ecco il link per modificare il record: \n${this.linkToShare}`);
        const whatsappUrl = `https://web.whatsapp.com/send?text=${message}`;
        window.open(whatsappUrl, '_blank');
        this.showLinkModal = false;
        }
    }
}
</script>



<template>
    <div class="p-4 bg-dark">
        <h2 class="mb-4 fw-bold text-white">Dati di Inquadramento Aziendale</h2>
        <div class="mt-3 mb-3 text-start d-flex gap-2">
            <button class="btn btn-secondary" @click="goPrevious" :disabled="!previousOffsets.length || loading">
                Precedente
            </button>
            <button class="btn btn-primary" @click="goNext" :disabled="!nextOffset || loading">
                {{ loading ? 'Caricamento...' : 'Avanti' }}
            </button>
        </div>


        <div v-if="loading" class="text-warning">Caricamento dati...</div>
        <div v-else-if="error" class="text-danger fw-semibold">Errore: {{ error }}</div>
        <div class="data-container bg-dark" v-else
            style="height: 700px; overflow-x: auto; overflow-y: auto; border-radius: 0.25rem;">
            <!-- Intestazioni -->
            <div class="headers d-flex border-bottom">
                <div class="header-item text-start px-3 py-2 fw-semibold text-white bg-dark" style="min-width: 60px;">
                    #
                </div>
                <div v-for="header in headers" :key="header"
                    class="header-item flex-grow-1 text-start px-3 py-2 fw-semibold text-white bg-dark">
                    {{ header }}
                </div>
            </div>
            <!-- Records -->
            <div class="records">
                <div v-for="(record, index) in records" :key="record.id"
                    class="record-item d-flex border-bottom align-items-center">

                    <!-- Numero progressivo -->
                    <div class="record-field px-3 py-2" style="min-width: 60px;">
                         {{ index + 1 + (pageIndex * 100) }}
                    </div>
                    <!-- Icona edit -->
                    <div style="width: 40px; cursor: pointer; color: #0d6efd;" @click="editRecord(record)" title="Modifica record" class="me-3">
                        <font-awesome-icon icon="laptop-code" />
                    </div>
                    <!-- Icona elimina -->
                    <div style="width: 40px; cursor: pointer; color: red;" @click="deleteRecord(record.id)" title="Elimina record" class="me-3">
                        <font-awesome-icon icon="trash" />
                    </div>
                    <!-- genera link -->
                    <div style="width: 40px; cursor: pointer; color: green;" 
                        @click="generateEditLink(record)" 
                        title="Genera link modifica">
                        <font-awesome-icon icon="link" />
                    </div>

                    <div v-for="header in headers" :key="header" class="record-field flex-grow-1 px-3 py-2"
                        :title="getTextValue(record.fields[header])">

                        <!-- Se è un campo immagine -->
                        <div v-if="isImageField(record.fields[header])">
                            <img :src="record.fields[header][0].thumbnails.large.url" :alt="header"
                                class="img-fluid rounded" style="max-width: 100px; max-height: 100px;" />
                        </div>

                        <!-- Altrimenti mostra il contenuto testuale -->
                        <div v-else>
                            {{ getTextValue(record.fields[header]) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal modifica -->
        <div v-if="showModal" class="modal-backdrop">
            <div class="modal-dialog text-dark ">
                <div class="modal-content p-3 bg-white rounded d-flex flex-column" style="max-height: 900px; width: 600px;">
                <h5>Modifica Record</h5>

                <div class="modal-body flex-grow-1 overflow-auto">
                    <div class="row">
                    <div v-for="(value, key) in formFields" :key="key" class="col-md-6 mb-3">
                        <label :for="key" class="form-label fw-semibold">{{ key }}</label>
                        <input type="text" class="form-control" v-model="formFields[key]" :id="key" />
                    </div>
                    </div>
                </div>

                <div class="modal-footer d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                    <button class="btn btn-secondary" @click="closeModal" :disabled="saving">Annulla</button>
                    <button class="btn btn-primary" @click="saveChanges" :disabled="saving">
                    {{ saving ? 'Salvando...' : 'Salva' }}
                    </button>
                </div>
                </div>
            </div>
        </div>

        <!-- Modal Link WhatsApp -->
        <div v-if="showLinkModal" class="modal-backdrop">
        <div class="modal-dialog text-dark" style="max-width: 400px; padding: 1rem;">
            <div class="modal-content p-3 bg-white rounded d-flex flex-column align-items-center">
            <h5 class="mb-3">Link di modifica</h5>
            
            <input 
                type="text" 
                class="form-control mb-3 text-center" 
                :value="linkToShare" 
                readonly 
                @click="$event.target.select()" 
                style="cursor: pointer; user-select: all;"
            />

            <button 
                class="btn btn-success d-flex align-items-center gap-2"
                @click="openWhatsApp"
                title="Apri WhatsApp Web con il link"
            >
                <font-awesome-icon icon="whatsapp" style="font-size: 1.5rem;" />
                Apri WhatsApp Web
            </button>

            <button 
                class="btn btn-secondary mt-3" 
                @click="showLinkModal = false"
            >
                Chiudi
            </button>
            </div>
        </div>
        </div>


    </div>
</template>

<style lang="scss" scoped>
.data-container {
    border: 1px solid #dee2e6;
    background: #fff;
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.05);
}

/* Intestazioni */
.headers {
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    background-color: #b6daff;
    color: white;
}

.header-item {
    min-width: 330px;
    white-space: nowrap;
}

/* Record */
.record-item {
    min-height: 48px;
    border-color: #ccc;
    color: white;
    cursor: default;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #f8f9fa;
        color: #484848;
    }
}

.record-field {
    min-width: 330px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}


.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
  overflow: auto; /* consente scroll se finestra più piccola */
}

.modal-dialog {
  background: white;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15);
  max-height: 700px;
  width: 600px;
  display: flex;
  flex-direction: column;
}



.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5rem; /* spazio per scroll */
}

/* opzionale: rendi il label un po' più leggibile */
.form-label {
  font-weight: 600;
}

</style>
