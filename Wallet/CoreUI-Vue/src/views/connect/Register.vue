<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6" sm="8">
          <b-card no-body class="mx-4">
            <b-card-body class="p-4">
              <b-form>
                <h1>Register</h1>
                <p class="text-muted">Create your account</p>
                <b-input-group class="mb-3">
                  <b-input-group-prepend>
                    <b-input-group-text><i class="icon-user"></i></b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input type="text" class="form-control" v-model="publicKey" placeholder="Public Key" autocomplete="username" />
                </b-input-group>
  
                <b-input-group class="mb-3">
                  <b-input-group-prepend>
                    <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input type="text" class="form-control" v-model="privateKey" placeholder="Private Key" autocomplete="new-password" />
                </b-input-group>
  
                <b-button variant="success" v-on:click="Saved()" block>OK, I Saved my Private key</b-button>
              </b-form>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Register',
    data: function() {
      return {
        publicKey: undefined,
        privateKey: undefined
      }
    },
    methods: {
      Saved() {
        this.$router.push('./login');
      }
    },
    async mounted() {
      await makeKey();
      this.publicKey = publicKey;
      this.privateKey = privateKey;
    }
  }
</script>
