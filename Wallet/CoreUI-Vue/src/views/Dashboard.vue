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
        <div class="col-sm-3 mt-2 mb-2 text-center rounded border padding" v-for="item in balance" :key="item.element">
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
        <b-card header="Trades &amp; Decentralized Fixed Ratio Exchanger">
          <b-table class="mb-0 table-outline" responsive="sm" hover :items="tableItems" :fields="tableFields" head-variant="light">
            <div slot="idx" slot-scope="item">
              {{item.value}}
            </div>
            <div slot="user" slot-scope="item">
              <div>eoswondefrex</div>
            </div>
            <div slot="A" slot-scope="item">
              <div>
                {{item.value.reserve.split(' ')[1]}}
              </div>
              <div class="clearfix">
                <div class="float-left">
                  <strong>{{item.value.percent.toFixed(1)}}%</strong>
                </div>
                <div class="float-right">
                  {{parseFloat(item.value.reserve.split(' ')[0])}}
                </div>
              </div>
              <b-progress height={} class="progress-xs" v-model="item.value.percent" :variant="variant(item.value.percent)"></b-progress>
            </div>
            <div slot="ratio" slot-scope="item">
              <div>{{item.value}} : 1</div>
            </div>
            <div slot="B" slot-scope="item">
              <div>
                {{item.value.reserve.split(' ')[1]}}
              </div>
              <div class="clearfix">
                <div class="float-left">
                  <strong>{{item.value.percent.toFixed(1)}}%</strong>
                </div>
                <div class="float-right">
                  {{parseFloat(item.value.reserve.split(' ')[0])}}
                </div>
              </div>
              <b-progress height={} class="progress-xs" v-model="item.value.percent" :variant="variant(item.value.percent)"></b-progress>
            </div>
            <div slot="manager" slot-scope="item">
              <div class="small text-muted">{{item.value.name}}</div>
            </div>
          </b-table>
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
        selected: 'Month',
        tableItems: eventBus.trades.rows,
        tableFields: {
          idx: {
            label: 'Trade Number',
            class: 'text-center',
            sortable: true
          },
          user: {
            label: 'Trade Code'
          },
          A: {
            label: 'A',
            class: 'text-center',
            sortable: true
          },
          ratio: {
            label: 'ratio',
            class: 'text-center',
            sortable: true
          },
          B: {
            label: 'B',
            class: 'text-center',
            sortable: true
          },
          manager: {
            label: 'Manager'
          }
        }
      }
    },
    created() {
      eventBus.$on('login', function() {
        this.id = eventBus.id;
        this.password = eventBus.password;
        this.balance = eventBus.balance;
        this.trades = tradesPercentage(eventBus.trades);
        console.log(this.trades);
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
        eventBus.trades = await defrex_get();
        eventBus.trades = tradesPercentage(eventBus.trades);
        this.balance=eventBus.balance;
        this.balance.splice(99999);
        this.trades=eventBus.trades;
        this.trades.rows.splice(99999);
        this.$set(this.trades, 0, eventBus.trades);
        this.refreshing = false;
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
