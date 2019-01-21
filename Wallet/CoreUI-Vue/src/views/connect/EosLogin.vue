<template>
  <div class="app flex-row align-items-center Login">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form>
                  <h1>Login</h1>
                  <p class="text-muted">Sign In to your account</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text><i class="icon-user"></i></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="id" type="text" class="form-control" placeholder="Username" autocomplete="username email" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend>
                      <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="password" type="password" class="form-control" placeholder="Private key" autocomplete="current-password" />
                  </b-input-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button variant="primary" @click="SignUp()" class="px-4">Login</b-button>
                    </b-col>
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <h2>Sign up</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <b-button variant="primary" href="#/connect/register" class="active mt-3">Register Now!</b-button>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    eventBus
  } from '../../main';
  
  export default {
    name: 'Login',
    data() {
      return {
        id: eventBus.id,
        password: eventBus.password,
        balance: eventBus.balance
      }
    },
    methods: {
      async SignUp() {
        login(this.password, this.id);
        eventBus.id = this.id;
        eventBus.password = this.password;
        eventBus.balance = await getNameBalances();
        eventBus.trades = await defrex_get();
        eventBus.$emit('login');
        this.$router.push('../Dashboard');
      }
    }
  }
</script>
