<template>
  <div class="animated fadeIn dashboard">
  
    <b-card>
      <b-row>
        <b-col>
          <h4 id="traffic" class="card-title mb-0">{{id?'Tokens':'Hi, Please connect your account'}}</h4>
          <div class="small text-muted">{{id}}</div>
        </b-col>
        <i class="icon-refresh icons font-3xl d-block mt-2" @click="refresh()"></i>
      </b-row>
      <div class="row">
        <div class="col-sm-3 mt-2 mb-2 text-center rounded border padding" v-for="item in balance">
          <div class="sub-title">{{item.balance.split(' ')[1]}}</div>
          <div class="small text-muted">{{item.element}}</div>
          <strong>{{item.balance}}</strong>
        </div>
      </div>
      <div slot="footer">
        <b-row class="text-center">
          <b-col class="mb-sm-2 mb-0 d-md-down-none">
            <div class="text-muted">Tx fee</div>
            <strong>0.0001 COF</strong>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">CPU</div>
            <strong>78.706 ms (60%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="warning" :value="60"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">NET</div>
            <strong>22.123 kbytes (80%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="danger" :value="80"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0 d-md-down-none">
            <div class="text-muted">RAM</div>
            <strong>32.312 kbytes (40.15%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" :value="40"></b-progress>
          </b-col>
        </b-row>
      </div>
    </b-card>
    <b-row>
      <b-col md="12">
        <b-card header="Transfer Token">
          <b-row>
            <b-col sm="6">
              <b-form-group>
                <label for="code">Token Code</label>
                <b-form-input type="text" id="code" v-model="code" placeholder="Token code, ex) eoswontoken1"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group>
                <label for="to">To</label>
                <b-form-input type="text" id="to" v-model="to" placeholder="Receiver"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="6">
              <b-form-group>
                <label for="Quantity">Quantity</label>
                <b-form-input type="text" id="Quantity" v-model="quantity" placeholder="0.0000"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group>
                <label for="symbol">Symbol</label>
                <b-form-input type="text" id="symbol" v-model="symbol" placeholder="COF"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="12">
              <b-form-group>
                <label for="memo">Memo</label>
                <b-form-input type="text" id="memo" v-model="memo" placeholder="MEMO"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <div slot="footer">
            <b-button type="submit" v-on:click="transfer()" :variant="Submitvariant"><i class="fa fa-dot-circle-o"></i> Submit</b-button>
            <b-button type="reset" v-on:click="reset()" class="float-right" variant="danger"><i class="fa fa-ban"></i> Reset</b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import CardLine1ChartExample from './dashboard/CardLine1ChartExample'
  import CardLine2ChartExample from './dashboard/CardLine2ChartExample'
  import CardLine3ChartExample from './dashboard/CardLine3ChartExample'
  import CardBarChartExample from './dashboard/CardBarChartExample'
  import MainChartExample from './dashboard/MainChartExample'
  import SocialBoxChartExample from './dashboard/SocialBoxChartExample'
  import CalloutChartExample from './dashboard/CalloutChartExample'
  import {
    Callout
  } from '@coreui/vue'
  import {
    eventBus
  } from '../main';
  
  export default {
    name: 'dashboard',
    components: {
      Callout,
      CardLine1ChartExample,
      CardLine2ChartExample,
      CardLine3ChartExample,
      CardBarChartExample,
      MainChartExample,
      SocialBoxChartExample,
      CalloutChartExample
    },
    data: function() {
      return {
        id: eventBus.id,
        password: eventBus.password,
        balance: eventBus.balance,
        refreshing: false,
        code: eventBus.code,
        quantity: '0.0000',
        to: eventBus.to,
        symbol: eventBus.symbol,
        memo: eventBus.memo,
        Submitvariant: 'primary'
      }
    },
    created() {
      eventBus.$on('login', function() {
        this.id = eventBus.id;
        this.password = eventBus.password;
        this.balance = eventBus.balance;
      });
      eventBus.$on('transferInput', async function() {
        this.code = eventBus.code,
          this.to = eventBus.to,
          this.symbol = eventBus.symbol,
          this.memo = eventBus.memo
      });
    },
    methods: {
      variant(value) {
        let $variant
        if (value <= 25) {
          $variant = 'info'
        } else if (value > 25 && value <= 50) {
          $variant = 'success'
        } else if (value > 50 && value <= 75) {
          $variant = 'warning'
        } else if (value > 75 && value <= 100) {
          $variant = 'danger'
        }
        return $variant
      },
      async refresh() {
        if (this.refreshing) return;
        this.refreshing = true;
        eventBus.balance = await getNameBalances();
        this.balance=eventBus.balance;
        this.balance.splice(99999);
        this.refreshing = false;
        this.Submitvariant="primary";
      },
      transfer() {
        this.Submitvariant="secondary";
        transfer(this.to, this.quantity + "" + this.symbol, this.code, this.memo);
        this.to=this.quantity=this.symbol=this.code=this.memo='';
        this.refresh();
      },
      reset() {
  
      }
    }
  }
</script>

<style>
  /* IE fix */
  
  #card-chart-01,
  #card-chart-02 {
    width: 100% !important;
  }
</style>
