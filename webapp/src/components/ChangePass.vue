<template>
  <div>
    <v-dialog v-model="openDialog" max-width="480">
      <v-card class="mx-auto">
        <v-card-title>Redefinir Senha</v-card-title>
        <v-card-actions>
          <v-container fluid>
            <v-row>
              <v-col cols="12">
                <v-form
                  ref="form"
                  v-model="valid"
                  lazy-validation
                >
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    label="E-mail"
                    required
                  ></v-text-field>
                  <div class="d-flex">
                    <v-spacer></v-spacer>
                    <v-btn text color="red darken-1" @click="openDialog = false">Cancelar</v-btn>
                    <v-btn 
                      text 
                      color="green darken-1" 
                      @click="validate"
                      :disabled="loadingButton"
                      :loading="loadingButton"
                    >Redefinir Senha</v-btn>
                  </div>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'changePass',
  props: {
    value: Boolean,
  },
  computed:{
    openDialog: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
        if(!value) this.reset();
      }
    }
  },
  data() {
    return {
      valid: true,
      email: '',
      emailRules: [
        v => !!v || 'Campo Obrigatório',
        v => /.+@.+/.test(v) || 'E-mail em formato inválido'
      ],
      loadingButton: false
    }
  },
  methods: {
    reset() {
      this.email = ''
    },
    validate () {
      if (this.$refs.form.validate()) {
        this.loadingButton = true;
        this.$store.dispatch('changePassword', this.email)
        .then(()=>{
          this.$store.commit("setSnackOn",{color: "success", text: "E-mail de redefinição de senha enviado!"})
          this.openDialog = false;
        }).catch((error)=>{
          if(error.code == "auth/user-not-found") {
            this.$store.commit("setSnackOn",{color: "orange", text: "E-mail não encontrado!"});
          } else {
            this.$store.commit("setSnackOn",{color: "red", text: "Houve um erro ao solicitar a redefinição de senha!"});
          }
        }).finally(()=>{
          this.loadingButton = false;
        })
      }
    },
  }
}
</script>